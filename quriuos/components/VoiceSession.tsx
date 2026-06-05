"use client";
// DUEÑO: Álvaro (bloques 1 y 2). Experiencia de voz inmersiva con el widget de ElevenLabs.
// Porta la referencia: avatar con glow, visualizador, transcripción y controles.
import { useState, useEffect, useRef } from "react";
import VoiceVisualizer from "./VoiceVisualizer";

export type VoiceSessionProps = {
  agentId: string;
  name: string;
  title?: string;
  avatar: string;
  quote?: string;
  accent?: string;
  onEnd?: () => void;
};

// Frases de demo que rotan en la transcripcion mientras la sesion esta activa
const DEMO_PHRASES = [
  "Cuentame mas sobre eso, me parece muy interesante...",
  "Desde cuando te apasiona esto?",
  "Eso dice mucho de ti — sigue explorando.",
  "Lo que describes suena a una fortaleza real.",
  "Que harias si supieras que no puedes fallar?",
  "Tus respuestas me dicen que tienes mucho potencial.",
  "Vamos por buen camino. Confia en el proceso.",
];

const IDLE_LABEL = "Pulsa Empezar a hablar para comenzar la sesion...";

function wrapQuote(text: string): string {
  return '"' + text + '"';
}

export default function VoiceSession({
  agentId,
  name,
  title,
  avatar,
  quote,
  accent = "#c0c1ff",
  onEnd,
}: VoiceSessionProps) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [transcriptLine, setTranscriptLine] = useState<string>(
    quote ? wrapQuote(quote) : IDLE_LABEL,
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const missingAgent = !agentId || agentId.startsWith("REEMPLAZAR");

  // Rota frases de demo cuando la sesion esta activa
  useEffect(() => {
    if (started) {
      intervalRef.current = setInterval(() => {
        setPhraseIdx((prev) => {
          const next = (prev + 1) % DEMO_PHRASES.length;
          setTranscriptLine(wrapQuote(DEMO_PHRASES[next]));
          return next;
        });
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTranscriptLine(quote ? wrapQuote(quote) : IDLE_LABEL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, quote]);

  const handleStart = () => {
    setStarted(true);
    setTranscriptLine(wrapQuote(DEMO_PHRASES[0]));
  };

  const handleEnd = () => {
    setStarted(false);
    onEnd?.();
  };

  return (
    <section className="flex flex-col items-center justify-center gap-xl px-gutter py-xl">
      {/* Avatar con glow */}
      <div className="relative group mt-md">
        {/* Halo de fondo */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: accent }}
        />
        {/* Anillo animado cuando activo */}
        <div
          className={`absolute inset-[-6px] rounded-full border-2 transition-opacity duration-700 ${
            started ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
          style={{ borderColor: `${accent}88` }}
        />
        <div
          className="relative w-40 h-40 rounded-full border-2 p-1 glow-avatar overflow-hidden"
          style={{ borderColor: `${accent}66` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={name}
            className={`w-full h-full object-cover rounded-full transition-all duration-700 ${
              started ? "grayscale-0 scale-105" : "grayscale"
            }`}
          />
        </div>
        {/* Etiqueta de nombre */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-panel px-lg py-1 rounded-full whitespace-nowrap z-10">
          <span
            className="font-headline-md text-body-md font-semibold tracking-wide"
            style={{ color: accent }}
          >
            {name}
          </span>
        </div>
      </div>

      {/* Titulo / rol */}
      {title && (
        <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-widest mt-xs">
          {title}
        </p>
      )}

      {/* Visualizador de barras */}
      <VoiceVisualizer active={started && !muted} />

      {/* Panel de transcripcion */}
      <div className="w-full glass-panel rounded-xl p-lg min-h-[96px] flex items-center justify-center text-center relative overflow-hidden">
        {/* Acento de color en el borde superior */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
        <p className="text-on-surface font-body-lg text-body-md italic opacity-90 leading-relaxed transition-all duration-500">
          {transcriptLine}
        </p>
      </div>

      {/* Widget de ElevenLabs o aviso de configuracion */}
      {missingAgent ? (
        <div className="w-full glass-panel rounded-xl p-md flex items-start gap-sm">
          <span className="material-symbols-outlined text-tertiary shrink-0 mt-0.5">
            warning
          </span>
          <div className="text-sm text-on-surface-variant leading-relaxed">
            <span className="text-on-surface font-semibold">
              Falta el agent-id de ElevenLabs
            </span>{" "}
            para <span className="text-primary font-medium">{name}</span>.{" "}
            Configuralo en{" "}
            <code className="text-primary text-xs bg-surface-container px-1 py-0.5 rounded">
              lib/characters.ts
            </code>{" "}
            /{" "}
            <code className="text-primary text-xs bg-surface-container px-1 py-0.5 rounded">
              lib/elevenlabs.ts
            </code>{" "}
            para activar la voz real.
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <elevenlabs-convai agent-id={agentId} />
        </div>
      )}

      {/* Barra de controles */}
      <div className="flex items-center justify-center gap-md w-full">
        {/* Boton mute (solo visible cuando la sesion esta activa) */}
        {started && (
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Activar microfono" : "Silenciar microfono"}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">
              {muted ? "mic_off" : "mic"}
            </span>
          </button>
        )}

        {/* Boton principal: Empezar / Terminar sesion */}
        <button
          onClick={started ? handleEnd : handleStart}
          className={`flex items-center gap-sm px-xl py-md rounded-full font-headline-md text-body-md font-bold transition-all duration-300 active:scale-95 shadow-lg ${
            started
              ? "bg-error text-on-error shadow-error/20"
              : "bg-primary-container text-on-primary-container shadow-primary/20"
          }`}
          style={
            started ? {} : { boxShadow: `0 8px 32px ${accent}40` }
          }
        >
          <span className="material-symbols-outlined text-xl">
            {started ? "call_end" : "mic"}
          </span>
          <span>{started ? "Terminar sesion" : "Empezar a hablar"}</span>
        </button>

        {/* Boton de ajustes (espacio visual) */}
        {started && (
          <button
            aria-label="Ajustes de sesion"
            className="w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
          </button>
        )}
      </div>
    </section>
  );
}
