import { NextResponse } from "next/server";

import { estLangue, type Langue } from "@/lib/langues";
import {
  CONSIGNE,
  contexteDuMaster,
  detailsDesCours,
  filtrerReponse,
  titresDuMaster,
} from "@/lib/mipmip";

/**
 * La route qui fait parler Mipmip.
 *
 * C'est le seul endroit du site qui appelle un service payant, et le seul qui
 * connaisse la clef. Elle est lue dans l'environnement du serveur, jamais
 * prefixee NEXT_PUBLIC_, donc le navigateur ne la voit pas et le paquet
 * client ne la contient pas.
 *
 * Le compte qui la porte est plafonne chez le fournisseur. C'est la seule
 * protection qui ne depende pas de ce fichier, et donc la seule sur laquelle
 * on puisse vraiment compter : ce qui suit la complete, ne la remplace pas.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODELE = process.env.MIPMIP_MODELE || "google/gemini-3.1-flash-lite";
const QUESTION_MAX = 400;

/*
 * Un seau par adresse, vide a intervalle regulier. Vercel donne a chaque
 * instance sa propre memoire, donc ce compteur est partiel : il ralentit une
 * curiosite, il n'arrete pas une attaque. Ce qui arrete une attaque, c'est le
 * plafond de depense pose sur la clef.
 */
const SEAUX = new Map<string, { jetons: number; vu: number }>();
const PAR_MINUTE = 8;
const FENETRE = 60_000;

function trop_vite(ip: string): boolean {
  const now = Date.now();
  const seau = SEAUX.get(ip);
  if (!seau || now - seau.vu > FENETRE) {
    SEAUX.set(ip, { jetons: 1, vu: now });
    if (SEAUX.size > 5000) SEAUX.clear(); // pas de fuite en memoire
    return false;
  }
  seau.jetons += 1;
  return seau.jetons > PAR_MINUTE;
}

export async function POST(req: Request) {
  const cle = process.env.OPENROUTER_API_KEY;
  if (!cle) {
    return NextResponse.json({ erreur: "indisponible" }, { status: 503 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "inconnu";
  if (trop_vite(ip)) {
    return NextResponse.json({ erreur: "trop-de-questions" }, { status: 429 });
  }

  let corps: { master?: string; langue?: string; question?: string };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "requete-illisible" }, { status: 400 });
  }

  const langue: Langue = estLangue(corps.langue ?? "") ? (corps.langue as Langue) : "fr";
  const slug = String(corps.master ?? "");
  const question = String(corps.question ?? "").trim().slice(0, QUESTION_MAX);
  if (!question) {
    return NextResponse.json({ erreur: "question-vide" }, { status: 400 });
  }

  const contexte = contexteDuMaster(slug, langue);
  if (!contexte) {
    return NextResponse.json({ erreur: "master-inconnu" }, { status: 400 });
  }

  let brut: string;
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://myphec.vercel.app",
        "X-Title": "MYP",
      },
      body: JSON.stringify({
        model: MODELE,
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${CONSIGNE[langue]}\n\n${contexte}` },
          /*
           * La question de l'etudiant reste dans un tour utilisateur, seule et
           * entiere. On ne la recolle jamais a la consigne : ce serait lui
           * donner le meme rang qu'elle.
           */
          { role: "user", content: question },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) {
      return NextResponse.json({ erreur: "service-indisponible" }, { status: 502 });
    }
    const json = await r.json();
    brut = json?.choices?.[0]?.message?.content ?? "";
  } catch {
    return NextResponse.json({ erreur: "service-indisponible" }, { status: 502 });
  }

  const { reponse, cours } = filtrerReponse(brut, titresDuMaster(slug, langue), langue);
  const details = detailsDesCours();
  return NextResponse.json({
    reponse,
    cours: cours.map((titre) => ({ titre, source: details[titre]?.source ?? null })),
  });
}
