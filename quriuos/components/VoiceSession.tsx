"use client";
// Chatbot de voz único de Quriuos (SDK @elevenlabs/react).
//  - una sola conversación; el avatar/nombre cambia solo al transferir a un referente
//  - el visualizador reacciona al audio real
//  - log de chat con memoria persistente (localStorage) de todo lo hablado
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import VoiceVisualizer from "./VoiceVisualizer";
import { addMessage, loadProfile } from "@/lib/profile";

export type Speaker = {
  id: string;
  name: string;
  title?: string;
  avatar: string;
  accent?: string;
  /** Palabras (minúscula) que, si aparecen en lo que dice el agente, activan a este hablante. */
  match: string[];
};

export type VoiceSessionProps = {
  agentId: string;
  name: string;
  title?: string;
  avatar: string;
  quote?: string;
  accent?: string;
  dynamicVariables?: Record<string, string | number | boolean>;
  speakers?: Speaker[];
  /** Persistir la conversación en localStorage y sembrar el historial al cargar. */
  persist?: boolean;
  onEnd?: () => void;
};

type ChatMsg = { role: "user" | "ai"; text: string; speaker?: string };

export default function VoiceSession(props: VoiceSessionProps) {
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
  persist = false,
  onEnd,
}: VoiceSessionProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const speakersRef = useRef<Speaker[] | undefined>(speakers);
  speakersRef.current = speakers;
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const persistRef = useRef(persist);
  persistRef.current = persist;

  const missingAgent = !agentId || agentId.startsWith("REEMPLAZAR");

  // Sembrar historial persistido (en efecto → sin mismatch de hidratación).
  useEffect(() => {
    if (persist) {
      const t = loadProfile().transcript;
      if (t.length)
        setMessages(t.map((m) => ({ role: m.role, text: m.text, speaker: m.speaker })));
    }
  }, [persist]);

  const conv = useConversation({
    onMessage: ({ message, source }) => {
      let speaker: string | undefined;
      if (source === "ai") {
        const list = speakersRef.current;
        const hit = list?.find((s) => s.match.some((m) => message.toLowerCase().includes(m)));
        if (hit) {
          setActiveId((prev) => (prev === hit.id ? prev : hit.id));
          speaker = hit.name;
        } else {
          speaker = list?.find((s) => s.id === activeIdRef.current)?.name ?? name;
        }
      }
      setMessages((prev) => [...prev, { role: source, text: message, speaker }]);
      if (persistRef.current) addMessage({ role: source, text: message, speaker });
    },
    onError: (m) => setError(typeof m === "string" ? m : "Error de conexión"),
    onDisconnect: () => setActiveId(null),
  });

  const status = conv.status;
  const connected = status === "connected";
  const connecting = status === "connecting";

  // Identidad mostrada (hablante activo o agente base).
  const active = speakers?.find((s) => s.id === activeId);
  const display = {
    name: active?.name ?? name,
    title: active?.title ?? title,
    avatar: active?.avatar ?? avatar,
    accent: active?.accent ?? accent,
  };

  // Auto-scroll al último mensaje.
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cerrar sesión al desmontar.
  const convRef = useRef(conv);
  convRef.current = conv;
  useEffect(() => () => {
    try {
      convRef.current.endSession();
    } catch {
      /* noop */
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (missingAgent) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Necesito permiso de micrófono para poder hablar contigo.");
      return;
    }
    try {
      const res = await fetch(`/api/elevenlabs-token?agentId=${encodeURIComponent(agentId)}`);
      if (!res.ok) throw new Error("token");
      const { token } = await res.json();
      conv.startSession({ conversationToken: token, connectionType: "webrtc", dynamicVariables });
    } catch {
      setError("No se pudo iniciar la conversación. Inténtalo de nuevo.");
    }
  }, [agentId, conv, dynamicVariables, missingAgent]);

  const stop = useCallback(() => {
    conv.endSession();
    onEnd?.();
  }, [conv, onEnd]);

  return (
    <section className="flex flex-col h-full gap-md px-gutter pt-md pb-md">
      {/* Hero: hablante activo + visualizador */}
      <div className="flex flex-col items-center gap-sm shrink-0">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30 transition-colors duration-500"
            style={{ backgroundColor: display.accent }}
          />
          <div
            className={`absolute inset-[-5px] rounded-full border-2 transition-opacity duration-700 ${
              connected ? "opacity-100 animate-pulse" : "opacity-0"
            }`}
            style={{ borderColor: `${display.accent}88` }}
          />
          <div
            className="relative w-28 h-28 rounded-full border-2 p-1 glow-avatar overflow-hidden transition-colors duration-500"
            style={{ borderColor: `${display.accent}66` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={display.avatar}
              src={display.avatar}
              alt={display.name}
              className={`w-full h-full object-cover rounded-full animate-fade-in transition-all duration-700 ${
                connected ? "grayscale-0" : "grayscale"
              }`}
            />
          </div>
        </div>
        <div className="text-center">
          <p
            key={display.name}
            className="font-headline-md text-body-md font-semibold tracking-wide animate-fade-in"
            style={{ color: display.accent }}
          >
            {display.name}
          </p>
          {connected ? (
            <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-widest flex items-center justify-center gap-xs mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                {conv.isSpeaking ? "graphic_eq" : "hearing"}
              </span>
              {conv.isSpeaking ? "Hablando…" : "Escuchando…"}
            </p>
          ) : (
            display.title && (
              <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-widest mt-0.5">
                {connecting ? "Conectando…" : display.title}
              </p>
            )
          )}
        </div>
        <VoiceVisualizer
          active={connected}
          bars={32}
          getFrequency={connected ? conv.getOutputByteFrequencyData : undefined}
        />
      </div>

      {/* Log de chat con memoria */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-sm py-sm scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="m-auto text-center max-w-xs glass-panel rounded-xl p-md">
            <p className="text-on-surface font-body-lg text-body-md italic opacity-90 leading-relaxed">
              {quote ? `"${quote}"` : "Pulsa el micrófono para empezar a hablar."}
            </p>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="self-end max-w-[80%] animate-fade-up">
              <div className="bg-primary-container/90 text-on-primary-container rounded-2xl rounded-br-sm px-md py-sm text-body-md">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="self-start max-w-[85%] animate-fade-up">
              {m.speaker && (
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-0.5 ml-1">
                  {m.speaker}
                </p>
              )}
              <div className="glass-panel rounded-2xl rounded-bl-sm px-md py-sm text-on-surface text-body-md">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Avisos */}
      {missingAgent && (
        <div className="glass-panel rounded-xl p-sm flex items-start gap-sm text-sm text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-tertiary shrink-0" aria-hidden>
            warning
          </span>
          <span>
            Falta configurar el agent-id de ElevenLabs. Revisa{" "}
            <code className="text-primary text-xs">.env.local</code> (ver GUIA_ELEVENLABS.md).
          </span>
        </div>
      )}
      {error && !missingAgent && (
        <div className="glass-panel rounded-xl p-sm flex items-start gap-sm text-sm text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-error shrink-0" aria-hidden>
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-center gap-md shrink-0">
        {connected && (
          <button
            onClick={() => conv.setMuted(!conv.isMuted)}
            aria-label={conv.isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-white/10 text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">
              {conv.isMuted ? "mic_off" : "mic"}
            </span>
          </button>
        )}
        <button
          onClick={connected ? stop : start}
          disabled={connecting || missingAgent}
          className={`flex items-center gap-sm px-xl py-md rounded-full font-headline-md text-body-md font-bold transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-50 ${
            connected ? "bg-error text-on-error" : "bg-primary-container text-on-primary-container"
          }`}
          style={connected ? {} : { boxShadow: `0 8px 32px ${display.accent}40` }}
        >
          <span className="material-symbols-outlined text-xl">
            {connected ? "call_end" : connecting ? "sync" : "mic"}
          </span>
          <span>{connected ? "Terminar" : connecting ? "Conectando…" : "Empezar a hablar"}</span>
        </button>
      </div>
    </section>
  );
}
