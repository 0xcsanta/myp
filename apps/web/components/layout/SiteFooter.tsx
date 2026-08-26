import { MadeByPill } from "@/components/brand/MadeByPill";

const CONTACT =
  "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/contact.html";
const PLANS =
  "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html";

/**
 * Le pied de page. Il porte trois choses que le site doit dire partout :
 * qui l'a fait, d'ou viennent les donnees, et vers qui se tourner pour une
 * vraie question academique.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="max-w-[62ch] text-[13px] leading-relaxed text-muted">
            <strong className="font-semibold text-ink-2">
              MYP est un projet indépendant d&apos;Omniscient.
            </strong>{" "}
            Il n&apos;est ni affilié à l&apos;Université de Lausanne, ni
            approuvé, ni relu par elle. Les informations proviennent des{" "}
            <a
              href={PLANS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
            >
              plans d&apos;études officiels 2025-2026
            </a>{" "}
            de HEC Lausanne et peuvent contenir des erreurs. Seuls le plan
            d&apos;études et le règlement officiels font foi.
          </p>

          <div className="mt-6 lg:hidden">
            <MadeByPill />
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
            Une question sur ton plan d&apos;études
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            MYP ne répond à aucune question académique. Adresse toi à
            l&apos;administration des cursus de Master de HEC.
          </p>
          <ul className="mt-4 grid gap-1.5 text-[13px]">
            <li>
              <a
                href="mailto:HECmaster@unil.ch"
                className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
              >
                HECmaster@unil.ch
              </a>
            </li>
            <li className="tnum text-muted">+41 21 692 36 68</li>
            <li>
              <a
                href={CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
              >
                Tous les contacts HEC
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
