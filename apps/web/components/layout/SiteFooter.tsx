import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { GradientBackdrop } from "@/components/brand/GradientBackdrop";
import { Mascotte } from "@/components/brand/Mascotte";

const L = {
  contacts:
    "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/contact.html",
  plans:
    "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html",
  master:
    "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master.html",
  catalogue:
    "https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr",
  moodle: "https://moodle.unil.ch",
  repo: "https://github.com/0xcsanta/organizemyMaster",
  omniscient: "https://omniscient.swiss",
};

function Colonne({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink">
        {titre}
      </h2>
      <ul className="mt-4 grid gap-2.5 text-[13.5px]">{children}</ul>
    </div>
  );
}

function Lien({
  href,
  children,
  externe = true,
}: {
  href: string;
  children: React.ReactNode;
  externe?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)] hover:text-unil-400"
      >
        {children}
      </a>
    </li>
  );
}

/**
 * Le pied de page.
 *
 * Structure reprise de la reference : un degrade pleine largeur en fond, et
 * par dessus un panneau clair aux angles superieurs arrondis qui descend
 * jusqu'au bas de la fenetre. Les colonnes de liens en haut, une barre de
 * signature en bas.
 */
export function SiteFooter() {
  return (
    <footer className="relative">
      <GradientBackdrop />

      <div className="relative px-[clamp(0px,1.4vw,28px)] pt-[clamp(28px,3.6vw,64px)]">
        <div className="rounded-t-[clamp(20px,2vw,34px)] bg-surface-2/95 backdrop-blur-sm">
          <div className="shell pt-[clamp(36px,4vw,64px)]">
            {/* les colonnes */}
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <Colonne titre="Le projet">
                <Lien href={L.repo}>Code source</Lien>
                <Lien href={`${L.repo}/blob/main/docs/SOURCES.md`}>
                  D&apos;où viennent les données
                </Lien>
                <Lien href={`${L.repo}/blob/main/docs/LEGAL.md`}>
                  Cadre légal et non affiliation
                </Lien>
                <Lien href={L.omniscient}>Omniscient</Lien>
              </Colonne>

              <Colonne titre="Les documents officiels">
                <Lien href={L.plans}>Plans d&apos;études et règlements</Lien>
                <Lien href={L.master}>Horaires, syllabus, Moodle</Lien>
                <Lien href={L.catalogue}>Catalogue des enseignements</Lien>
                <Lien href={L.moodle}>Moodle</Lien>
              </Colonne>

              <Colonne titre="Une question académique">
                <Lien href="mailto:HECmaster@unil.ch" externe={false}>
                  HECmaster@unil.ch
                </Lien>
                <li className="tnum text-ink-2">+41 21 692 36 68</li>
                <Lien href={L.contacts}>Tous les contacts HEC</Lien>
                <li className="text-muted">Réception NEF 261, 14h à 16h</li>
              </Colonne>

              <Colonne titre="Année de référence">
                <li className="text-ink-2">
                  Plan d&apos;études 2025-2026, le dernier publié par HEC
                </li>
                <li className="text-muted">
                  Les horaires ne sont pas encore intégrés
                </li>
              </Colonne>
            </div>

            {/* la mise au point, en pleine largeur sous les colonnes */}
            <div className="mt-14 max-w-[76ch]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink">
                Ce que MYP n&apos;est pas
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                <strong className="font-semibold text-ink-2">
                  MYP est un projet indépendant d&apos;Omniscient.
                </strong>{" "}
                Il n&apos;est ni affilié à l&apos;Université de Lausanne, ni
                approuvé, ni relu par elle. Les informations proviennent des{" "}
                <a
                  href={L.plans}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
                >
                  plans d&apos;études officiels
                </a>{" "}
                de HEC Lausanne et peuvent contenir des erreurs. Seuls le plan
                d&apos;études et le règlement officiels font foi. MYP ne répond
                à aucune question académique : pour ça, écris à
                l&apos;administration des cursus de Master.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                Quand HEC publiera le plan d&apos;études 2026-2027, il y aura
                peut-être une mise à jour. Si j&apos;ai le temps.
              </p>
            </div>

            {/* la barre de signature */}
            <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-line/70 py-8">
              <div className="flex items-center gap-4">
                <Mascotte
                  taille={92}
                  titre="La mascotte de MYP, qui se dessine toute seule"
                  className="text-unil-400"
                />
                <Wordmark size="clamp(30px, 2.6vw, 40px)" />
              </div>
              <p className="order-3 w-full text-center text-[12.5px] text-muted sm:order-2 sm:w-auto">
                © 2026 Omniscient · Lausanne
              </p>
              <div className="order-2 sm:order-3">
                <MadeByPill />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
