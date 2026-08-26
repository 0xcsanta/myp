/**
 * Analyseurs des pages UNIL.
 *
 * Aucune dependance : les pages sont du HTML serveur simple et stable.
 * On travaille sur deux representations, selon ce qui est le plus solide :
 *   - `htmlToText` pour les fiches de cours, ou le contenu est redactionnel ;
 *   - `tableRows`  pour les horaires, ou la structure du tableau porte le sens.
 */

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à',
  '&ccedil;': 'ç', '&ecirc;': 'ê', '&icirc;': 'î', '&ocirc;': 'ô',
  '&ucirc;': 'û', '&euml;': 'ë', '&iuml;': 'ï', '&uuml;': 'ü', '&deg;': '°',
  '&rsquo;': '’', '&laquo;': '«', '&raquo;': '»', '&hellip;': '…',
};

export function decode(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

/** HTML vers texte, en gardant les sauts de ligne des elements de bloc. */
export function htmlToText(html) {
  let t = strip(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|td|th|table|ul|ol)>/gi, '\n')
    .replace(/<(p|div|tr|li|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decode(t)
    .replace(/\r/g, '')
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

/** Lignes d'un tableau HTML, sous forme de tableaux de cellules texte. */
export function tableRows(html) {
  const rows = [];
  for (const [, tr] of strip(html).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      decode(m[1].replace(/<[^>]+>/g, ' '))
        .replace(/[\s ]+/g, ' ')
        .trim()
    );
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/* ------------------------------------------------------------- facultes */

export function parseFaculties(html) {
  const out = [];
  for (const [, href, label] of strip(html).matchAll(
    /<a[^>]+href="([^"]*v_ueid=\d+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  )) {
    const ueid = href.match(/v_ueid=(\d+)/)?.[1];
    const name = decode(label.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (ueid && name && !out.some((f) => f.ueid === ueid)) out.push({ ueid, name });
  }
  return out;
}

/* ------------------------------------------------------------ programmes */

/**
 * Les programmes d'une faculte, avec les semestres disponibles.
 * Chaque ligne du tableau porte un `v_etapeid1` et un ou deux `v_semposselected`.
 */
export function parseProgrammes(html) {
  const clean = strip(html);

  /*
   * Les semestres ne peuvent pas etre lus ligne par ligne : les tableaux sont
   * imbriques, donc une expression `<tr>...</tr>` non gourmande se ferme trop
   * tot et n'en voit qu'un. On les collecte donc globalement, depuis les URL
   * elles memes, qui portent les deux parametres a la fois.
   */
  const semByEtape = new Map();
  for (const [, href] of clean.matchAll(/(?:href|onclick)="[^"]*?(v_[^"]*)"/gi)) {
    const etape = href.match(/v_etapeid1=(\d+)/)?.[1];
    const sem = href.match(/v_semposselected=(\d+)/)?.[1];
    if (!etape || !sem) continue;
    if (!semByEtape.has(etape)) semByEtape.set(etape, new Set());
    semByEtape.get(etape).add(sem);
  }

  const out = [];
  for (const [, tr] of clean.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const links = [...tr.matchAll(/v_etapeid1=(\d+)/g)].map((m) => m[1]);
    if (!links.length) continue;
    const etapeid = links[0];
    const sempos = [...(semByEtape.get(etapeid) ?? [])].sort();
    const text = decode(tr.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    // le libelle s'arrete au premier nom de semestre
    const name = text.split(/\s*(?:Printemps|Automne|Spring|Autumn)\s+\d{4}/)[0].trim();
    if (!name || out.some((p) => p.etapeid === etapeid)) continue;
    out.push({ etapeid, name, sempos });
  }
  return out;
}

/* ---------------------------------------------------------- liste cours */

/**
 * Les cours d'un programme. Attention : les liens ne sont pas dans `href`
 * mais dans un `onclick` qui appelle `window.open('ficheCours.php?...')`.
 */
export function parseCourseList(html) {
  const out = [];
  for (const [, attrs, label] of strip(html).matchAll(
    /<a([^>]*onclick="[^"]*ficheCours\.php[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi
  )) {
    const enstyid = attrs.match(/v_enstyid=(\d+)/)?.[1];
    if (!enstyid) continue;
    const name = decode(label.replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*\[[^\]]*\]\s*$/, '')
      .trim();
    out.push({ enstyid, name });
  }
  return out;
}

/* --------------------------------------------------------- fiche de cours */

const SECTIONS = {
  fr: {
    objective: 'Objectif',
    content: 'Contenu',
    evaluation: 'Evaluation',
    bibliography: 'Bibliographie',
    prereq: "Exigences du cursus d'études",
    extra: 'Informations supplémentaires',
  },
  en: {
    objective: 'Objective',
    content: 'Content',
    evaluation: 'Evaluation',
    bibliography: 'Bibliography',
    prereq: 'Programme requirements',
    extra: 'Additional information',
  },
};

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  return m ? +m[1] * 60 + +m[2] : null;
};

export function parseCourse(html, lang = 'fr') {
  // la page commence par la navigation du site ; la fiche demarre au marqueur
  const full = htmlToText(html);
  const head = full.search(/^(?:Fiche de cours|Card-index course)$/m);
  const text = head >= 0 ? full.slice(full.indexOf('\n', head) + 1) : full;
  const S = SECTIONS[lang] ?? SECTIONS.fr;
  const labels = Object.values(S).concat(['Utilisation', 'Use context', 'Partenaires', 'Partners']);

  const section = (label) => {
    const start = text.indexOf(`\n${label}\n`);
    if (start < 0) return '';
    const from = start + label.length + 2;
    let end = text.length;
    for (const other of labels) {
      if (other === label) continue;
      const i = text.indexOf(`\n${other}\n`, from);
      if (i >= 0 && i < end) end = i;
    }
    return text.slice(from, end).trim();
  };

  const lines = text.split('\n');
  const after = (re) => lines.find((l) => re.test(l))?.replace(re, '').trim() ?? '';

  // creneaux : « 2025/2026 : Lundi 08:30-12:00 (Hebdomadaire) »
  const slots = [];
  const dayRe = new RegExp(`(${[...DAYS_FR, ...DAYS_EN].join('|')})`, 'i');
  const ROOM = /(?:Salle\s+)?((?:Internef|Anthropole|Amphipôle|Amphimax|Géopolis|Batochime|Unithèque|Genopode)\s*\/?\s*\d+[A-Za-z]?)/;
  lines.forEach((line, idx) => {
    const m = /(\d{4})\/(\d{4})\s*:\s*(.+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/.exec(line);
    if (!m) return;
    const day = dayRe.exec(m[3])?.[1];
    if (!day) return;
    // la salle est parfois sur la meme ligne, parfois sur l'une des suivantes
    const room =
      lines.slice(idx, idx + 3).map((l) => ROOM.exec(l)?.[1]).find(Boolean) ?? '';
    slots.push({
      year: `${m[1]}-${m[2]}`,
      weekday: day,
      start: m[4],
      end: m[5],
      startMin: toMinutes(m[4]),
      endMin: toMinutes(m[5]),
      room: room.replace(/\s+/g, ''),
      cadence: /Hebdo|Weekly/i.test(line) ? 'weekly' : 'other',
    });
  });

  const title = lines.slice(0, 3).find((l) => l && !/Faculté|Faculty/i.test(l)) ?? '';

  return {
    lang,
    title,
    teachers: (after(/^Responsable\(s\)\s*:\s*/) || after(/^Teacher\(s\)\s*:\s*/))
      .split(/\s*,\s*/)
      .filter(Boolean),
    validity: after(/^(?:Période de validité|Validity)\s*:\s*/),
    semester: /Semestre d'automne|Autumn semester/i.test(text)
      ? 'autumn'
      : /Semestre de printemps|Spring semester/i.test(text)
        ? 'spring'
        : null,
    hoursPerWeek: parseFloat(after(/^(\d+(?:\.\d+)?) heures? par semaine$/)) ||
      parseFloat(text.match(/(\d+(?:\.\d+)?) (?:heures? par semaine|hours per week)/)?.[1]) || null,
    language: after(/^Langue\(s\) d'enseignement\s*:\s*/) || after(/^Teaching language\(s\)\s*:\s*/),
    credits: (() => {
      const raw = after(/^(?:Crédits|Credits)\s*:\s*/);
      const nums = raw.split(/\s*,\s*/).map(Number).filter((n) => n > 0);
      return nums.length ? nums : null;
    })(),
    slots,
    objective: section(S.objective),
    content: section(S.content),
    evaluation: section(S.evaluation),
    bibliography: section(S.bibliography),
    prereq: section(S.prereq),
    moodle: html.match(/moodle\.unil\.ch\/course\/view\.php\?id=\d+/)?.[0]
      ? `https://${html.match(/moodle\.unil\.ch\/course\/view\.php\?id=\d+/)[0]}`
      : null,
  };
}

/* --------------------------------------------------------- horaire type */

/**
 * L'horaire type officiel. C'est la source la plus riche : elle porte le
 * rattachement au module, que la fiche de cours ne donne pas.
 * Format des lignes utiles : [debut, fin, cadence, "Titre - Module X [Details]",
 * intervenant, type, salle].
 */
export function parseAgenda(html, lang = 'fr') {
  const days = lang === 'en' ? DAYS_EN : DAYS_FR;
  const dayOf = (cell) => days.find((d) => cell.trim().toLowerCase() === d.toLowerCase());

  const out = [];
  let current = null;

  for (const cells of tableRows(html)) {
    const day = cells.length && dayOf(cells[0]);
    if (day) {
      current = day;
      continue;
    }
    if (!current) continue;

    const start = cells.find((c) => /^\d{1,2}:\d{2}$/.test(c));
    if (!start) continue;
    const i = cells.indexOf(start);
    const end = cells[i + 1];
    if (!/^\d{1,2}:\d{2}$/.test(end ?? '')) continue;

    const rest = cells.slice(i + 2);
    const titleCell = rest.find((c) => /\[/.test(c)) ?? rest[1] ?? '';
    const cleaned = titleCell.replace(/\s*\[[^\]]*\]\s*$/, '').trim();
    const mod = cleaned.match(/\s-\s((?:Sous-?module|Module)\s*[\d.]+)\s*$/i);

    out.push({
      weekday: current,
      start,
      end,
      startMin: toMinutes(start),
      endMin: toMinutes(end),
      cadence: rest.some((c) => /Hebdo|Weekly/i.test(c)) ? 'weekly' : 'other',
      title: mod ? cleaned.slice(0, mod.index).trim() : cleaned,
      module: mod ? mod[1].replace(/\s+/g, ' ').trim() : null,
      teacher: rest.find((c) => /^[A-ZÀ-Ý][\wÀ-ÿ'-]+ [A-ZÀ-Ý]/.test(c) && !/\[/.test(c)) ?? '',
      room: rest.find((c) => /\/\d+|Internef|Anthropole|Amphi/i.test(c)) ?? '',
    });
  }
  return out;
}
