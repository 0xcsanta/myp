import type { Metadata } from "next";
import { Crimson_Text, DM_Sans, DynaPuff, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-dynapuff",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MYP, Master Your Plan",
  description:
    "Compose ton master à l'UNIL : crédits ECTS comptés en direct, minimums par module vérifiés, chevauchements d'horaire signalés.",
  applicationName: "MYP",
  authors: [{ name: "Omniscient", url: "https://omniscient.swiss" }],
  openGraph: {
    title: "MYP, Master Your Plan",
    description:
      "Compose ton master à l'UNIL, module par module, sans rouvrir un PDF.",
    siteName: "MYP",
    locale: "fr_CH",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${crimson.variable} ${dmSans.variable} ${dynaPuff.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
