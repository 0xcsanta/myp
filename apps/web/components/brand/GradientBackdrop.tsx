"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * Le degrade anime du pied de page.
 *
 * Trois precautions, parce qu'un shader WebGL n'est pas gratuit :
 *
 * 1. Chargement differe et sans rendu serveur. Le module tire son propre
 *    moteur 3D, c'est le plus gros paquet du site : il ne doit jamais
 *    retarder l'affichage du haut de page.
 * 2. Il ne s'allume qu'une fois le pied de page approche, pas au chargement.
 * 3. `prefers-reduced-motion` le coupe net, et un degrade CSS statique prend
 *    le relais. Meme chose si WebGL manque ou si le module tombe.
 *
 * Le degrade CSS de repli reprend les trois couleurs du shader, donc la page
 * reste juste meme quand l'animation ne se lance pas.
 */

const Canvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false },
);
const Gradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false },
);

const C1 = "#0037EB";
const C2 = "#0000c2";
const C3 = "#6a88eb";

const FALLBACK = `radial-gradient(120% 90% at 18% 78%, #ffffff 0%, ${C3} 28%, ${C1} 58%, ${C2} 100%)`;

export function GradientBackdrop() {
  const [actif, setActif] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // pas de WebGL, pas de shader
    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) return;
    } catch {
      return;
    }

    const el = document.getElementById("degrade-pied");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActif(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id="degrade-pied"
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ background: FALLBACK }}
    >
      {actif && (
        <Canvas
          className="size-full"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          pointerEvents="none"
          fov={45}
          pixelDensity={1}
          lazyLoad
          rootMargin="300px"
          powerPreference="low-power"
        >
          <Gradient
            control="props"
            animate="on"
            type="plane"
            shader="defaults"
            color1={C1}
            color2={C2}
            color3={C3}
            brightness={1.2}
            cAzimuthAngle={180}
            cDistance={3.6}
            cPolarAngle={90}
            cameraZoom={1}
            envPreset="city"
            grain="on"
            lightType="3d"
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            reflection={0.1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            uAmplitude={1}
            uDensity={1.3}
            uFrequency={5.5}
            uSpeed={0.4}
            uStrength={4}
            uTime={0}
            wireframe={false}
            zoomOut
          />
        </Canvas>
      )}
    </div>
  );
}
