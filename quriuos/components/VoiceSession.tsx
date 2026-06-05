"use client";
// DUEÑO: Álvaro (bloques 1 y 2). Experiencia de voz inmersiva con el SDK de ElevenLabs.
// Integración real vía @elevenlabs/react (useConversation dentro de ConversationProvider):
//   - el visualizador reacciona al audio REAL del agente
//   - la transcripción sale de eventos onMessage reales
//   - los botones mute / terminar controlan la conversación de verdad
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import VoiceVisualizer from "./VoiceVisualizer";

/** Identidad mostrable; usada para cambiar avatar/nombre cuando el orquestador transfiere. */
export type Speaker = {
  id: string;
  name: string;
  title?: string;
  avatar: string;
  accent?: string;
  /** Palabras (en minúscula) que, si aparecen en lo que dice el agente, activan a este hablante. */
  match: string[];
};

export type VoiceSessionProps = {
  agentId: string;
  name: string;
  title?: string;
  avatar: string;
  quote?: string;
  accent?: string;
  /** Variables dinámicas que se inyectan en el prompt del agente ({{student_name}}, {{interests}}, ...) */
  dynamicVariables?: Record<string, string | number | boolean>;
  /** Si se provee, el avatar/nombre cambia automáticamente al detectar transferencias por el contenido. */
  speakers?: Speaker[];
  onEnd?: () => void;
};

type Line = { role: "user" | "ai"; text: string };

export default function VoiceSession(props: VoiceSessionProps) {
  // useConversation debe vivir dentro de un ConversationProvider.
  return (
    <ConversationProvider>
      <VoiceSessionInner {...props} />
    </ConversationProvider>
  );
}

function VoiceSessionInner({
  agentId,
  name,
  title,
  avatar,
  quote,
  accent = "#c0c1ff",
  dynamicVariables,
  speakers,
  onEnd,
}: VoiceSessionProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Hablante activo detectado por las transferencias (null = el agente base).
  const [activeId, setActiveId] = useState<string | null>(null);
  const speakersRef = useRef<Speaker[] | undefined>(speakers);
  speakersRef.current = speakers;
  const missingAgent = !agentId || agentId.startsWith("REEMPLAZAR");

  const conv = useConversation({
    onMessage: ({ message, source }) => {
      setLines((prev) => [...prev.slice(-7), { role: source, text: message }]);
      // Detecta quién habla ahora a partir de lo que dice el agente.
      const list = speakersRef.current;
      if (source === "ai" && list?.length) {
        const text = message.toLowerCase();
        const hit = list.find((s) => s.match.some((m) => text.includes(m)));
        if (hit) setActiveId((prev) => (prev === hit.id ? prev : hit.id));
      }
    },
    onError: (m) => setError(typeof m === "string" ? m : "Error de conexión"),
    onDisconnect: () => {
      setLines([]);
      setActiveId(null);
    },
  });

  // Identidad mostrada: el hablante activo, o el agente base.
  const active = speakers?.find((s) => s.id === activeId);
  const display = {
    name: active?.name ?? name,
    title: active?.title ?? title,
    avatar: active?.avatar ?? avatar,
    accent: active?.accent ?? accent,
  };

  const status = conv.status; // "disconnected" | "connecting" | "connected" | "error"
  const connected = status === "connected";
  const connecting = status === "connecting";

  // Cierra la sesión si el componente se desmonta (cambiar de personaje, navegar).
  const convRef = useRef(conv);
  convRef.current = conv;
  useEffect(() => {
    return () => {
      try {
        convRef.current.endSession();
      } catch {
        /* noop */
      }
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (missingAgent) return;
    try {
      // Pide permiso de micrófono antes de conectar (mejor UX en el error).
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Necesito permiso de micrófono para poder hablar contigo.");
      return;
    }
    try {
      // Pide un token de conversación al servidor (la API key nunca sale al cliente).
      const res = await fetch(
        `/api/elevenlabs-token?agentId=${encodeURIComponent(agentId)}`,
      );
      if (!res.ok) throw new Error("token");
      const { token } = await res.json();
      conv.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        dynamicVariables,
      });
    } catch {
      setError("No se pudo iniciar la conversación. Inténtalo de nuevo.");
    }
  }, [agentId, conv, dynamicVariables, missingAgent]);

  const stop = useCallback(() => {
    conv.endSession();
    onEnd?.();
  }, [conv, onEnd]);

  // Texto de la transcripción: última línea real, o la cita inicial.
  const lastLine = lines[lines.length - 1];
  const transcript = lastLine
    ? lastLine.text
    : quote
      ? `"${quote}"`
      : "Pulsa «Empezar a hablar» para comenzar la sesión.";

  return (
    <section className="flex flex-col items-center justify-center gap-xl px-gutter py-xl">
      {/* Avatar con glow — cambia automáticamente al transferir a otro hablante */}
      <div className="relative group mt-md">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-500"
          style={{ backgroundColor: display.accent }}
        />
        <div
          className={`absolute inset-[-6px] rounded-full border-2 transition-opacity duration-700 ${
            connected ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
          style={{ borderColor: `${display.accent}88` }}
        />
        <div
          className="relative w-40 h-40 rounded-full border-2 p-1 glow-avatar overflow-hidden transition-colors duration-500"
          style={{ borderColor: `${display.accent}66` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={display.avatar}
            src={display.avatar}
            alt={display.name}
            className={`w-full h-full object-cover rounded-full animate-fade-in transition-all duration-700 ${
              connected ? "grayscale-0 scale-105" : "grayscale"
            }`}
          />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-panel px-lg py-1 rounded-full whitespace-nowrap z-10">
          <span
            key={display.name}
            className="font-headline-md text-body-md font-semibold tracking-wide animate-fade-in"
            style={{ color: display.accent }}
          >
            {display.name}
          </span>
        </div>
      </div>

      {display.title && (
        <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-widest mt-xs">
          {display.title}
        </p>
      )}

      {/* Estado de la conexión */}
      {connecting && (
        <p className="text-primary text-label-sm font-label-sm uppercase tracking-widest animate-pulse">
          Conectando…
        </p>
      )}
      {connected && (
        <p className="text-secondary text-label-sm font-label-sm uppercase tracking-widest flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            {conv.isSpeaking ? "graphic_eq" : "hearing"}
          </span>
          {conv.isSpeaking ? "Hablando…" : "Escuchando…"}
        </p>
      )}

      {/* Visualizador alimentado con el audio real del agente */}
      <VoiceVisualizer
        active={connected}
        getFrequency={connected ? conv.getOutputByteFrequencyData : undefined}
      />

      {/* Transcripción real */}
      <div className="w-full glass-panel rounded-xl p-lg min-h-[96px] flex items-center justify-center text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${display.accent}, transparent)`,
          }}
        />
        <p
          className={`font-body-lg text-body-md leading-relaxed transition-all duration-300 ${
            lastLine?.role === "user"
              ? "text-on-surface-variant"
              : "text-on-surface italic opacity-90"
          }`}
        >
          {lastLine?.role === "user" ? `Tú: ${transcript}` : transcript}
        </p>
      </div>

      {/* Aviso si falta configurar el agente */}
      {missingAgent && (
        <div className="w-full glass-panel rounded-xl p-md flex items-start gap-sm">
          <span
            className="material-symbols-outlined text-tertiary shrink-0 mt-0.5"
            aria-hidden
          >
            warning
          </span>
          <div className="text-sm text-on-surface-variant leading-relaxed">
            <span className="text-on-surface font-semibold">
              Falta el agent-id de ElevenLabs
            </span>{" "}
            para <span className="text-primary font-medium">{name}</span>. Créalo
            en el dashboard y añádelo a{" "}
            <code className="text-primary text-xs bg-surface-container px-1 py-0.5 rounded">
              .env.local
            </code>{" "}
            (ver <code className="text-primary text-xs">GUIA_ELEVENLABS.md</code>).
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !missingAgent && (
        <div className="w-full glass-panel rounded-xl p-md flex items-start gap-sm">
          <span className="material-symbols-outlined text-error shrink-0 mt-0.5" aria-hidden>
            error
          </span>
          <p className="text-sm text-on-surface-variant leading-relaxed">{error}</p>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-center gap-md w-full">
        {connected && (
          <button
            onClick={() => conv.setMuted(!conv.isMuted)}
            aria-label={conv.isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">
              {conv.isMuted ? "mic_off" : "mic"}
            </span>
          </button>
        )}

        <button
          onClick={connected ? stop : start}
          disabled={connecting || missingAgent}
          className={`flex items-center gap-sm px-xl py-md rounded-full font-headline-md text-body-md font-bold transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-50 disabled:active:scale-100 ${
            connected
              ? "bg-error text-on-error"
              : "bg-primary-container text-on-primary-container"
          }`}
          style={connected ? {} : { boxShadow: `0 8px 32px ${display.accent}40` }}
        >
          <span className="material-symbols-outlined text-xl">
            {connected ? "call_end" : connecting ? "sync" : "mic"}
          </span>
          <span>
            {connected
              ? "Terminar sesión"
              : connecting
                ? "Conectando…"
                : "Empezar a hablar"}
          </span>
        </button>
      </div>
    </section>
  );
}
