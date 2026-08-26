/**
 * Client UNIL.
 *
 * applicationspub.unil.ch est protege par F5 Shape. Deux consequences :
 *   1. une requete sans execution de JavaScript recoit « Request Rejected »
 *      ou une page de challenge, donc il faut un vrai navigateur ;
 *   2. au dela d'une vingtaine d'appels rapproches le cookie de session est
 *      mis sur liste noire, donc il faut espacer les appels et savoir purger
 *      les cookies pour repartir sur une session propre.
 *
 * Ce module encapsule les deux. Le reste du scraper ne voit qu'un `get(url)`.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

export const BASE = 'https://applicationspub.unil.ch/interpub/noauth/php/Ud';
export const HEC = '173';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const REJECTED = /requested URL was rejected|Request Rejected/i;
const CHALLENGE = /window\["bobcmn"\]|<APM_DO_NOT_TOUCH>/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Points d'entree interdits a tous les agents par le robots.txt du domaine,
 * verifie le 26 aout 2026. Voir docs/LEGAL.md.
 *
 * Ce module refuse de les appeler. Le contournement n'est possible qu'avec une
 * autorisation ecrite de l'UNIL, et alors le drapeau doit etre passe
 * explicitement, en connaissance de cause.
 */
const DISALLOWED = [
  'agenda.php', 'agendaPdf.php', 'agendaType.php', 'agendaTypePdf.php',
  'catalogueCours.php', 'catalogueCoursPdfComplet.php', 'ficheCours.php',
  'ficheEpreuve.php', 'ficheFbmElm.php', 'getFile.php', 'listeCours.php',
  'recherche.php', 'redirectHEC.php', 'structureCours.php',
  'structureCoursPdf.php', 'UdAgendaEtu.php', 'UdAgendaPer.php',
  'UdCDMLanceur.php',
];

export function isDisallowed(target) {
  const file = String(target).split('?')[0].split('/').pop();
  return DISALLOWED.includes(file);
}

export async function openUnil(opts = {}) {
  const {
    headless = true,
    minDelayMs = 2500, // espacement minimal entre deux appels
    maxRetries = 4,
    userDataDir = null,
    // n'activer QUE sur autorisation ecrite de l'UNIL, voir docs/LEGAL.md
    allowDisallowed = false,
    log = (m) => console.log(m),
  } = opts;

  /*
   * Trois choix comptent ici, tous appris a la dure contre F5 Shape.
   *
   * 1. Le Chrome du systeme, pas le « headless shell » de Playwright, qui est
   *    reconnu des la premiere requete.
   * 2. Aucun `userAgent` force. Surcharger l'user agent sans surcharger les
   *    Client Hints cree une incoherence que la protection detecte tout de
   *    suite. On laisse Chrome annoncer sa vraie identite.
   * 3. Un profil persistant. Le cookie de challenge survit d'une execution a
   *    l'autre, ce qui evite de repasser le challenge a chaque lancement et
   *    fait ressembler le robot a un visiteur qui revient.
   */
  const profileDir = userDataDir ?? path.join(os.tmpdir(), 'unil-scraper-profile');
  fs.mkdirSync(profileDir, { recursive: true });

  const launchOpts = {
    headless,
    locale: 'fr-CH',
    timezoneId: 'Europe/Zurich',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  };

  let context = null;
  for (const channel of ['chrome', 'msedge', null]) {
    try {
      context = await chromium.launchPersistentContext(profileDir, {
        ...launchOpts,
        ...(channel ? { channel } : {}),
      });
      log(`  navigateur : ${channel ?? 'chromium'}${headless ? ' (headless)' : ''}`);
      break;
    } catch {
      /* canal suivant */
    }
  }
  if (!context) throw new Error('Aucun navigateur lancable sur cette machine');

  // seul masquage conserve : les faux `plugins` ou fausses `languages` sont
  // eux memes des signaux de robot, on ne touche qu'au drapeau webdriver.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = context.pages()[0] ?? (await context.newPage());

  let lastCall = 0;
  let calls = 0;

  async function warmUp() {
    // une vraie navigation resout le challenge et depose le cookie TSPD
    for (let attempt = 1; attempt <= 5; attempt++) {
      await page
        .goto(`${BASE}/index.php?v_langue=fr&v_isinterne=`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        })
        .catch(() => {});
      // le challenge s'execute puis recharge la page tout seul
      await page.waitForTimeout(4000 + attempt * 1500);
      const html = await page.content();
      if (!REJECTED.test(html) && !CHALLENGE.test(html)) {
        calls = 0;
        return;
      }
      log(`  mise en route refusee, essai ${attempt} sur 5`);
      await context.clearCookies();
      await sleep(4000 * attempt);
    }
    throw new Error(
      'Le pare feu refuse la mise en route. Relancer avec --headed pour observer.'
    );
  }

  async function resetSession() {
    log('  session bloquee, purge des cookies et remise en route');
    await context.clearCookies();
    await sleep(5000);
    await warmUp();
  }

  async function pace() {
    const wait = minDelayMs - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
  }

  /** Recupere le HTML brut d'une URL du domaine, en gerant le pare feu. */
  async function get(url) {
    if (isDisallowed(url) && !allowDisallowed) {
      throw new Error(
        `Interdit par le robots.txt de l'UNIL : ${String(url).split('/').pop().split('?')[0]}\n` +
        `  Le projet s'y conforme. Source de remplacement : les plans d'etudes PDF,\n` +
        `  voir docs/SOURCES.md. Detail de la decision : docs/LEGAL.md.`
      );
    }
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await pace();

      // 1er essai : fetch depuis la page, rapide et sans rechargement
      let html = await page
        .evaluate(
          (u) => fetch(u, { credentials: 'include' }).then((r) => r.text()),
          url
        )
        .catch(() => '');

      // 2e essai : vraie navigation, plus lente mais elle repasse le challenge
      if (!html || REJECTED.test(html) || CHALLENGE.test(html)) {
        await page
          .goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
          .catch(() => {});
        await page.waitForTimeout(1200);
        html = await page.content();
      }

      if (html && !REJECTED.test(html) && !CHALLENGE.test(html)) {
        calls++;
        // on reprend une session fraiche avant de se faire blacklister
        if (calls >= 18) await resetSession();
        return html;
      }

      await resetSession();
    }
    throw new Error(`Impossible de recuperer ${url} apres ${maxRetries} essais`);
  }

  await warmUp();

  return {
    get,
    page,
    async close() {
      await context.close();
    },
  };
}

/* ------------------------------------------------------------------ URLs */

export const url = {
  faculties: (lang = 'fr') => `${BASE}/index.php?v_langue=${lang}&v_isinterne=`,

  programmes: (ueid, lang = 'fr') =>
    `${BASE}/index.php?v_ueid=${ueid}&v_langue=${lang}&v_isinterne=`,

  courseList: (ueid, etapeid, lang = 'fr') =>
    `${BASE}/listeCours.php?v_ueid=${ueid}&v_etapeid1=${etapeid}` +
    `&v_semposselected=-1&v_langue=${lang}&v_isinterne=`,

  course: (enstyid, ueid, etapeid, lang = 'fr') =>
    `${BASE}/ficheCours.php?v_enstyid=${enstyid}&v_ueid=${ueid}` +
    `&v_etapeid1=${etapeid}&v_langue=${lang}&v_isinterne=`,

  agenda: (ueid, etapeid, sempos, lang = 'fr') =>
    `${BASE}/agendaType.php?v_ueid=${ueid}&v_etapeid1=${etapeid}` +
    `&v_semposselected=${sempos}&v_langue=${lang}&v_isinterne=`,
};
