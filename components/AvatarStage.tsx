"use client";
// AvatarStage — capa de presentación del neuro-tutor (SpaceForEdu).
// Avatar 2D con máquina de estados idle / listening / thinking / talking,
// alimentado por la amplitud del audio real (bytes 0-255 del SDK ElevenLabs).
// Sin dependencias externas: aura reactiva + anillos + puntos de "pensando".
// El motor de vídeo (Simli/TalkingHead/etc.) se enchufaría detrás de esta
// misma interfaz {state, accent, avatar, getFrequency} sin tocar la sesión.
import { useEffect, useRef, useState } from "react";

export type AvatarState = "idle" | "listening" | "thinking" | "talking";

export type AvatarStageProps = {
  state: AvatarState;
  avatar: string;
  name: string;
  accent?: string;
  /** Devuelve los bytes de frecuencia del audio del agente (para la boca/aura). */
  getFrequency?: () => Uint8Array;
  size?: number; // px del avatar
};

const CAPTION: Record<AvatarState, { text: string; icon: string }> = {
  idle: { text: "", icon: "" },
  listening: { text: "Te escucho…", icon: "hearing" },
  thinking: { text: "Pensando…", icon: "more_horiz" },
  talking: { text: "Hablando…", icon: "graphic_eq" },
};

export default function AvatarStage({
  state,
  avatar,
  name,
  accent = "#c0c1ff",
  getFrequency,
  size = 132,
}: AvatarStageProps) {
  const auraRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const freqRef = useRef<typeof getFrequency>(getFrequency);
  freqRef.current = getFrequency;
  const stateRef = useRef<AvatarState>(state);
  stateRef.current = state;

  // Amplitud suavizada expuesta para el borde/aura.
  const [, force] = useState(0);
  const ampRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const active = stateRef.current === "talking";
      let target = 0;
      const freq = active ? freqRef.current?.() : undefined;
      if (freq && freq.length) {
        // Media de la zona grave-media → intensidad de la "voz".
        const usable = Math.max(1, Math.floor(freq.length * 0.5));
        let sum = 0;
        for (let i = 0; i < usable; i++) sum += freq[i];
        target = sum / usable / 255; // 0..1
      } else if (stateRef.current === "listening") {
        target = 0.12; // respiración suave al escuchar
      }
      // Suavizado
      ampRef.current += (target - ampRef.current) * 0.25;
      const a = ampRef.current;

      if (auraRef.current) {
        auraRef.current.style.transform = `scale(${1 + a * 0.9})`;
        auraRef.current.style.opacity = `${0.25 + a * 0.55}`;
      }
      if (mouthRef.current) {
        // Boca simple: se abre con la amplitud (proxy de lip-sync barato).
        const open = active ? 3 + a * 22 : 3;
        mouthRef.current.style.height = `${open}px`;
        mouthRef.current.style.opacity = active ? "0.9" : "0.35";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cap = CAPTION[state];
  const connected = state !== "idle";

  return (
    <div className="flex flex-col items-center gap-sm select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Aura reactiva al audio */}
        <div
          ref={auraRef}
          className="absolute inset-0 rounded-full blur-2xl transition-none"
          style={{ backgroundColor: accent, opacity: 0.25 }}
          aria-hidden
        />

        {/* Anillo "escuchando": pulso concéntrico */}
        {state === "listening" && (
          <span
            className="absolute inset-[-6px] rounded-full border-2 animate-ping"
            style={{ borderColor: `${accent}66`, animationDuration: "1.8s" }}
            aria-hidden
          />
        )}

        {/* Borde del avatar */}
        <div
          className="relative w-full h-full rounded-full border-2 p-1 glow-avatar overflow-hidden transition-colors duration-500"
          style={{ borderColor: `${accent}${connected ? "88" : "44"}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={avatar}
            src={avatar}
            alt={name}
            className={`w-full h-full object-cover rounded-full animate-fade-in transition-all duration-700 ${
              connected ? "grayscale-0" : "grayscale"
            }`}
          />

          {/* Boca proxy (lip-sync barato) sobre el tercio inferior */}
          <div
            ref={mouthRef}
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              bottom: "22%",
              width: "26%",
              height: 3,
              background: "rgba(10,8,20,0.55)",
              boxShadow: `0 0 8px ${accent}55`,
            }}
            aria-hidden
          />
        </div>

        {/* Puntos de "pensando" */}
        {state === "thinking" && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1"
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-breathe"
                style={{
                  background: accent,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "0.9s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nombre + estado */}
      <div className="text-center">
        <p
          className="font-headline-md text-body-md font-semibold tracking-wide"
          style={{ color: accent }}
        >
          {name}
        </p>
        {cap.text && (
          <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-widest flex items-center justify-center gap-xs mt-0.5">
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
              {cap.icon}
            </span>
            {cap.text}
          </p>
        )}
      </div>
    </div>
  );
}
