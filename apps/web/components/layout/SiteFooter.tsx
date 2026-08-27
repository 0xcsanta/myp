import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { GradientBackdrop } from "@/components/brand/GradientBackdrop";
import { Mascotte } from "@/components/brand/Mascotte";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";

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
export function SiteFooter({ langue }: { langue: Langue }) {
  const T = textes(langue).pied;
  return (
    <footer className="relative">
      <GradientBackdrop />

      <div className="relative px-[clamp(0px,1.4vw,28px)] pt-[clamp(28px,3.6vw,64px)]">
        <div className="rounded-t-[clamp(20px,2vw,34px)] bg-surface-2/95 backdrop-blur-sm">
          <div className="shell pt-[clamp(36px,4vw,64px)]">
            {/* les colonnes */}
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <Colonne titre={T.projet}>
                <Lien href={L.repo}>{T.codeSource}</Lien>
                <Lien href={`${L.repo}/blob/main/docs/SOURCES.md`}>
                  {T.provenance}
                </Lien>
                <Lien href={`${L.repo}/blob/main/docs/LEGAL.md`}>
                  {T.cadreLegal}
                </Lien>
                <Lien href={L.omniscient}>Omniscient</Lien>
              </Colonne>

              <Colonne titre={T.documents}>
                <Lien href={L.plans}>{T.plansEtReglements}</Lien>
                <Lien href={L.master}>{T.horairesSyllabus}</Lien>
                <Lien href={L.catalogue}>{T.catalogue}</Lien>
                <Lien href={L.moodle}>Moodle</Lien>
              </Colonne>

              <Colonne titre={T.questionAcademique}>
                <Lien href="mailto:HECmaster@unil.ch" externe={false}>
                  HECmaster@unil.ch
                </Lien>
                <li className="tnum text-ink-2">+41 21 692 36 68</li>
                <Lien href={L.contacts}>{T.tousLesContacts}</Lien>
                <li className="text-muted">{T.reception}</li>
              </Colonne>

              <Colonne titre={T.anneeDeReference}>
                <li className="text-ink-2">{T.planPublie("2025-2026")}</li>
                <li className="text-muted">{T.horairesReleves}</li>
              </Colonne>
            </div>

            {/* la mise au point, en pleine largeur sous les colonnes */}
            <div className="mt-14 max-w-[76ch]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink">
                {T.ceQueCeNestPas}
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                <strong className="font-semibold text-ink-2">{T.miseAuPointFort}</strong>
                {T.miseAuPoint1}
                <a
                  href={L.plans}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
                >
                  {T.miseAuPointLien}
                </a>
                {T.miseAuPoint2}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {T.miseAJour}
              </p>
            </div>

            {/* la barre de signature */}
            <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-line/70 py-8">
              <div className="flex items-center gap-4">
                <Mascotte
                  taille={92}
                  titre={T.mascotte}
                  className="text-unil-400"
                />
                <Wordmark size="clamp(30px, 2.6vw, 40px)" href={`/${langue}#vague-descend`} />
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
