"use client";

import { useEffect, useRef, useState } from "react";

import { Mascotte } from "@/components/brand/Mascotte";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";

/**
 * Mipmip, en bas a droite.
 *
 * Le bouton est discret par choix : le planificateur est l'outil, la mascotte
 * est un secours. Quelqu'un qui sait lire une grille horaire ne doit pas avoir
 * a la contourner.
 *
 * Ce composant ne connait ni clef ni modele. Il envoie une question a
 * /api/mipmip et affiche ce qui revient. Toute la logique qui compte, le
 * contexte, la consigne et la verification des cours cites, est cote serveur,
 * la ou le navigateur ne peut pas la reecrire.
 */

type Tour = {
  de: "toi" | "mipmip";
  texte: string;
  cours?: { titre: string; source: string | null }[];
};

export function Mipmip({ master, langue }: { master: string; langue: Langue }) {
  const T = textes(langue).mipmip;
  const [ouvert, setOuvert] = useState(false);
  const [question, setQuestion] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [attend, setAttend] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ouvert) champ.current?.focus();
  }, [ouvert]);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [tours, attend]);

  // Echap ferme le panneau : un panneau qui se pose par dessus la page doit
  // toujours pouvoir se refermer sans viser une croix a la souris.
  useEffect(() => {
    if (!ouvert) return;
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, [ouvert]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || attend) return;
    setTours((t) => [...t, { de: "toi", texte: q }]);
    setQuestion("");
    setAttend(true);
    try {
      const r = await fetch("/api/mipmip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master, langue, question: q }),
      });
      const j = await r.json();
      setTours((t) => [
        ...t,
        r.status === 429
          ? { de: "mipmip", texte: T.tropVite }
          : j.reponse
            ? { de: "mipmip", texte: j.reponse, cours: j.cours }
            : { de: "mipmip", texte: T.panne },
      ]);
    } catch {
      setTours((t) => [...t, { de: "mipmip", texte: T.panne }]);
    } finally {
      setAttend(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border
          border-line bg-white py-2.5 pl-3 pr-4 text-[13.5px] font-semibold text-ink
          shadow-[0_6px_24px_rgba(10,31,48,0.14)] transition
          hover:border-line-2 hover:shadow-[0_8px_28px_rgba(10,31,48,0.2)]
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-[var(--color-unil-400)]"
      >
        <Mascotte taille={30} epaisseur={20} className="text-[var(--color-unil-400)]" />
        {ouvert ? T.fermer : T.bouton}
      </button>

      {ouvert ? (
        <div
          role="dialog"
          aria-label={T.bouton}
          className="fixed bottom-20 right-5 z-40 flex max-h-[min(560px,75dvh)] w-[min(380px,calc(100vw-2.5rem))]
            flex-col overflow-hidden rounded-2xl border border-line bg-white
            shadow-[0_18px_50px_rgba(10,31,48,0.22)]"
        >
          <div className="flex items-start gap-3 border-b border-line px-4 py-3">
            <Mascotte taille={34} epaisseur={20} className="mt-0.5 shrink-0 text-[var(--color-unil-400)]" />
            <p className="text-[12.5px] leading-relaxed text-muted">{T.cadre}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {tours.length === 0 ? (
              <div className="space-y-2">
                <p className="text-[13px] leading-relaxed text-ink">{T.accueil}</p>
                <ul className="space-y-1.5">
                  {T.exemples.map((x) => (
                    <li key={x}>
                      <button
                        type="button"
                        onClick={() => setQuestion(x)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5
                          text-left text-[12.5px] text-ink-2 transition hover:border-line-2"
                      >
                        {x}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tours.map((t, i) => (
              <div key={i} className={t.de === "toi" ? "flex justify-end" : ""}>
                <div
                  className={
                    t.de === "toi"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--color-unil-400)] px-3 py-2 text-[13px] text-white"
                      : "max-w-[92%] rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-ink"
                  }
                >
                  {t.texte}
                  {t.cours?.length ? (
                    <span className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
                      {t.cours.map((c) =>
                        c.source ? (
                          <a
                            key={c.titre}
                            href={c.source}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-[11.5px] font-semibold text-[var(--color-unil-500)] underline
                              decoration-line-2 underline-offset-2"
                          >
                            {T.fiche} {c.titre} ↗
                          </a>
                        ) : (
                          <span key={c.titre} className="text-[11.5px] text-muted">
                            {c.titre}
                          </span>
                        ),
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            {attend ? <p className="text-[12.5px] text-muted">{T.reflechit}</p> : null}
            <div ref={fin} />
          </div>

          <form onSubmit={envoyer} className="flex gap-2 border-t border-line px-3 py-3">
            <input
              ref={champ}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={400}
              placeholder={T.invite}
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2
                text-[13px] text-ink outline-none placeholder:text-muted
                focus:border-[var(--color-unil-400)]"
            />
            <button
              type="submit"
              disabled={attend || !question.trim()}
              className="rounded-lg bg-[var(--color-unil-400)] px-3 py-2 text-[13px] font-semibold
                text-white transition disabled:opacity-40"
            >
              {T.envoyer}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
