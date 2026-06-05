"use client";
// DUEÑO: Álvaro (bloques 1 y 2). Experiencia de voz inmersiva con el widget de ElevenLabs.
// Porta la referencia: avatar con glow, visualizador, transcripción y controles.
import { useState } from "react";
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
  const missingAgent = !agentId || agentId.startsWith("REEMPLAZAR");

  return (
    <section className="flex flex-col items-center justify-center gap-xl px-gutter py-xl">
      {/* Avatar con glow */}
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
        <div
          className="relative w-40 h-40 rounded-full border-2 p-2 glow-avatar overflow-hidden"
          style={{ borderColor: `${accent}66` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass-panel px-lg py-1 rounded-full">
          <span className="text-primary font-headline-md text-body-md tracking-wide whitespace-nowrap">
            {name}
          </span>
        </div>
      </div>
      {title && (
        <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wide -mt-md">
          {title}
        </p>
      )}

      {/* Visualizador */}
      <VoiceVisualizer active={started} />

      {/* Transcripción / cita inicial */}
      <div className="w-full glass-panel rounded-xl p-lg min-h-[100px] flex items-center justify-center text-center">
        <p className="text-on-surface font-body-lg text-body-lg italic opacity-80 leading-relaxed">
          {quote ? `"${quote}"` : "Pulsa para empezar a hablar…"}
        </p>
      </div>

      {/* Widget de ElevenLabs o aviso de configuración */}
      {missingAgent ? (
        <div className="glass-panel rounded-xl p-md text-center text-on-surface-variant text-body-md">
          ⚠️ Falta el <code className="text-primary">agent-id</code> de ElevenLabs
          para <strong>{name}</strong>. Configúralo en{" "}
          <code className="text-primary">lib/characters.ts</code> /{" "}
          <code className="text-primary">lib/elevenlabs.ts</code>.
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <elevenlabs-convai agent-id={agentId} />
        </div>
      )}

      {/* Controles */}
      <button
        onClick={() => {
          if (!started) setStarted(true);
          else onEnd?.();
        }}
        className={`px-xl py-md flex items-center gap-md rounded-full font-headline-md text-body-md font-bold transition-all active:scale-95 ${
          started
            ? "bg-error text-on-error"
            : "bg-primary-container text-on-primary-container"
        }`}
      >
        <span className="material-symbols-outlined">
          {started ? "call_end" : "mic"}
        </span>
        <span>{started ? "Terminar sesión" : "Empezar a hablar"}</span>
      </button>
    </section>
  );
}
