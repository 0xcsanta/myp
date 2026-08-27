"use client";

import { useEffect, useRef, useState } from "react";

/**
 * La surface liquide du bouton principal.
 *
 * Un plan d'eau qui remplit le bouton, ondule tout seul, s'incline sous le
 * curseur, et s'enfonce d'un coup au clic. Tout tient dans un fragment shader
 * pose sur un canevas en fond : aucune bibliotheque, aucun iframe, et le lien
 * qui l'entoure reste une ancre ordinaire, donc il navigue, il se focalise au
 * clavier et il s'ouvre dans un nouvel onglet comme n'importe quel lien.
 *
 * Les couleurs sont celles de la marque, pas le cyan de la demonstration dont
 * l'effet est tire : le meme mouvement, dans le bleu du logotype.
 *
 * Trois precautions qui comptent plus que l'effet lui meme.
 *
 * Sans WebGL, le canevas ne s'affiche pas et le degrade CSS du bouton reste
 * visible dessous : le bouton ne devient jamais un rectangle noir.
 *
 * L'animation s'arrete des que le bouton quitte l'ecran ou que l'onglet passe
 * en arriere plan. Une boucle de rendu permanente pour un bouton d'en-tete
 * viderait la batterie d'un telephone pour rien.
 *
 * Qui demande moins d'animations obtient une surface calme et figee, pas une
 * absence de surface.
 */

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FS = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_level;
uniform float u_tilt;
uniform float u_slosh;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.04+vec2(11.3,7.1); a*=0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float ar = u_res.x / u_res.y;
  float x = uv.x * ar;
  float t = u_time;

  /* trois sinusoides de periodes incommensurables : la surface ne se repete
     jamais a l'oeil, la ou une seule donnerait un balancement mecanique */
  float amp = 0.010 + u_slosh * 0.040;
  float surf = u_level
    + u_tilt * (uv.x - 0.5) * 0.30
    + amp * sin(x * 5.1 + t * 4.6)
    + amp * 0.62 * sin(x * 9.7 - t * 6.8 + 1.7)
    + amp * 0.38 * sin(x * 14.3 + t * 8.9 + 4.2);

  float d = surf - uv.y;

  /* au dessus de la ligne d'eau : le bleu profond du logotype, presque noir */
  vec3 col = mix(vec3(0.004,0.020,0.086), vec3(0.010,0.043,0.157), uv.y);

  float inside = smoothstep(0.0, 0.014, d);
  float depth = clamp(d / max(u_level, 0.001), 0.0, 1.0);

  /* dans l'eau : du bleu UNIL en surface vers le bleu profond au fond */
  vec3 liq = mix(vec3(0.267,0.549,1.0), vec3(0.0,0.122,0.522), depth);
  float caust = fbm(vec2(x * 4.2, (uv.y + t * 0.14) * 4.2));
  liq *= 0.84 + 0.34 * caust;
  liq += vec3(0.05,0.20,0.45) * pow(max(0.0, d * 3.0), 1.5) * u_slosh;

  col = mix(col, liq, inside);

  /* l'ecume : un lisere lumineux exactement sur la ligne d'eau */
  col += vec3(0.55,0.80,1.0) * exp(-abs(d) * 70.0) * 0.80;
  col += vec3(1.0) * exp(-abs(d) * 200.0) * 0.45;

  gl_FragColor = vec4(col, 1.0);
}`;

function compiler(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function SurfaceLiquide({ cible }: { cible: React.RefObject<HTMLElement | null> }) {
  const canevas = useRef<HTMLCanvasElement | null>(null);
  const [actif, setActif] = useState(false);
  /*
   * Un contexte WebGL peut etre repris par le systeme : onglet longtemps en
   * arriere plan, pilote qui redemarre, memoire graphique sous tension. Sans
   * traitement, le canevas resterait opaque et noir par dessus le bouton.
   * On revient au degrade, et on remonte l'effet des que le contexte revient.
   */
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const cv = canevas.current;
    const zone = cible.current;
    if (!cv || !zone) return;

    const surPerte = (e: Event) => {
      e.preventDefault(); // sans quoi le contexte ne sera jamais restaure
      setActif(false);
    };
    const surRetour = () => setGeneration((g) => g + 1);
    cv.addEventListener("webglcontextlost", surPerte);
    cv.addEventListener("webglcontextrestored", surRetour);
    const detacherContexte = () => {
      cv.removeEventListener("webglcontextlost", surPerte);
      cv.removeEventListener("webglcontextrestored", surRetour);
    };

    /*
     * Un effet qui ne demarre pas doit dire pourquoi. Sans message, il est
     * indistinguable d'un effet casse, et le degrade de repli est assez
     * presentable pour que personne ne remarque la difference.
     */
    const renoncer = (raison: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[MYP] surface liquide inactive : ${raison}`);
      }
      return detacherContexte;
    };

    const gl = cv.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return renoncer("ce navigateur n'expose pas WebGL");
    if (gl.isContextLost()) return renoncer("le contexte WebGL est perdu");

    const prog = gl.createProgram();
    const vs = compiler(gl, gl.VERTEX_SHADER, VS);
    const fs = compiler(gl, gl.FRAGMENT_SHADER, FS);
    if (!prog || !vs || !fs) return renoncer("shader non cree");
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      return renoncer(`sommet : ${gl.getShaderInfoLog(vs)}`);
    }
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      return renoncer(`fragment : ${gl.getShaderInfoLog(fs)}`);
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      return renoncer(`edition de liens : ${gl.getProgramInfoLog(prog)}`);
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const locP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uLevel = gl.getUniformLocation(prog, "u_level");
    const uTilt = gl.getUniformLocation(prog, "u_tilt");
    const uSlosh = gl.getUniformLocation(prog, "u_slosh");

    setActif(true);

    const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NIVEAU = 0.58;
    let niveau = NIVEAU;
    let gorgee = 0;
    let remous = 0.35;
    let pente = 0;
    let penteVoulue = 0;
    let dernierX: number | null = null;
    let precedent = performance.now();
    let boucle = 0;
    let visible = true;
    let aLEcran = true;

    const redimensionner = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(cv.clientWidth * dpr));
      const h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const image = (maintenant: number) => {
      const dt = Math.min(0.05, (maintenant - precedent) / 1000);
      precedent = maintenant;
      remous *= Math.exp(-1.5 * dt);
      gorgee *= Math.exp(-1.1 * dt);
      pente += (penteVoulue - pente) * Math.min(1, dt * 5);
      const voulu = NIVEAU - 0.34 * gorgee;
      niveau += (voulu - niveau) * Math.min(1, dt * 5.5);

      redimensionner();
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform1f(uTime, calme ? 2 : maintenant / 1000);
      gl.uniform1f(uLevel, niveau);
      gl.uniform1f(uTilt, calme ? 0 : pente);
      gl.uniform1f(uSlosh, calme ? 0.18 : remous);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (calme) return; // une seule image suffit, la surface est figee
      boucle = requestAnimationFrame(image);
    };

    const relancer = () => {
      cancelAnimationFrame(boucle);
      if (!visible || !aLEcran) return;
      precedent = performance.now();
      boucle = requestAnimationFrame(image);
    };

    const surDeplacement = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left) / Math.max(1, r.width);
      if (dernierX !== null) remous = Math.min(1.4, remous + Math.abs(x - dernierX) * 2.6);
      dernierX = x;
      penteVoulue = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    };
    const surSortie = () => {
      dernierX = null;
      penteVoulue = 0;
    };
    const surFocus = () => {
      remous = Math.min(1.4, remous + 0.5);
    };
    const surClic = () => {
      gorgee = 1;
      remous = Math.min(1.4, remous + 0.7);
    };

    zone.addEventListener("pointermove", surDeplacement);
    zone.addEventListener("pointerleave", surSortie);
    zone.addEventListener("focus", surFocus);
    zone.addEventListener("click", surClic);

    const surVisibilite = () => {
      visible = document.visibilityState === "visible";
      relancer();
    };
    document.addEventListener("visibilitychange", surVisibilite);

    const observateur =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([e]) => {
            aLEcran = e.isIntersecting;
            relancer();
          });
    observateur?.observe(zone);

    relancer();

    return () => {
      cancelAnimationFrame(boucle);
      detacherContexte();
      zone.removeEventListener("pointermove", surDeplacement);
      zone.removeEventListener("pointerleave", surSortie);
      zone.removeEventListener("focus", surFocus);
      zone.removeEventListener("click", surClic);
      document.removeEventListener("visibilitychange", surVisibilite);
      observateur?.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [cible, generation]);

  return (
    <canvas
      ref={canevas}
      aria-hidden="true"
      /*
       * Opaque seulement une fois le contexte obtenu : sans WebGL, le canevas
       * reste transparent et le degrade du bouton s'affiche a travers.
       */
      className={`pointer-events-none absolute inset-0 block size-full
        transition-opacity duration-500 ${actif ? "opacity-100" : "opacity-0"}`}
    />
  );
}
