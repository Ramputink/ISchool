"use client";
// TutorSession — sesión de voz del neuro-tutor (SpaceForEdu).
//  - usa AvatarStage (máquina de estados idle/listening/thinking/talking)
//  - modo Charla / Deberes (el modo Deberes NUNCA da la respuesta)
//  - chips "explícalo distinto" que inyectan un turno de usuario
//  - memoria persistente en localStorage (transcript + recap)
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import AvatarStage, { type AvatarState } from "./AvatarStage";
import { addMessage, loadProfile } from "@/lib/profile";

export type TutorMode = "charla" | "deberes";

export type TutorSessionProps = {
  agentId: string;
  tutorName: string; // nombre mostrado del tutor (displayName)
  accent?: string;
  avatar: string;
  mode: TutorMode;
  onModeChange: (m: TutorMode) => void;
  dynamicVariables?: Record<string, string | number | boolean>;
  quote?: string;
};

type ChatMsg = { role: "user" | "ai"; text: string };

export default function TutorSession(props: TutorSessionProps) {
  return (
    <ConversationProvider>
      <TutorSessionInner {...props} />
    </ConversationProvider>
  );
}

// Frases canned para los chips "explícalo distinto".
function chipsFor(mode: TutorMode): { label: string; icon: string; say: string }[] {
  const base = [
    { label: "Otra vez", icon: "replay", say: "¿Puedes repetírmelo?" },
    { label: "Más despacio", icon: "slow_motion_video", say: "Explícamelo más despacio y más fácil, por favor." },
    { label: "Con un ejemplo", icon: "lightbulb", say: "¿Me lo explicas con un ejemplo?" },
    { label: "No lo pillo", icon: "help", say: "No lo he entendido, explícamelo de otra forma." },
  ];
  if (mode === "deberes") {
    base.push({ label: "Dame una pista", icon: "tips_and_updates", say: "Dame una pista para el siguiente paso, pero no me des la respuesta." });
  }
  return base;
}

function TutorSessionInner({
  agentId,
  tutorName,
  accent = "#c0c1ff",
  avatar,
  mode,
  onModeChange,
  dynamicVariables,
  quote,
}: TutorSessionProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [error, setError] = useState<string | null>(null);

  const missingAgent = !agentId || agentId.startsWith("REEMPLAZAR");

  // Sembrar historial persistido (en efecto → sin mismatch de hidratación).
  useEffect(() => {
    const t = loadProfile().transcript;
    if (t.length) setMessages(t.map((m) => ({ role: m.role, text: m.text })));
  }, []);

  const conv = useConversation({
    onMessage: ({ message, source }) => {
      setMessages((prev) => [...prev, { role: source, text: message }]);
      addMessage({ role: source, text: message, speaker: source === "ai" ? tutorName : undefined });
    },
    onError: (m) => setError(typeof m === "string" ? m : "Error de conexión"),
  });

  const status = conv.status;
  const connected = status === "connected";
  const connecting = status === "connecting";

  // Máquina de estados del avatar.
  const avatarState: AvatarState = connecting
    ? "thinking"
    : connected
    ? conv.isSpeaking
      ? "talking"
      : "listening"
    : "idle";

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
      setError("Necesito permiso de micrófono para poder ayudarte a hablar.");
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

  const stop = useCallback(() => conv.endSession(), [conv]);

  const say = useCallback(
    (text: string) => {
      if (connected) conv.sendUserMessage(text);
    },
    [conv, connected],
  );

  // Cambiar de modo: informa al agente por contextual update (el prompt lee {{mode}}
  // al arrancar; a mitad de sesión lo reforzamos con un aviso de contexto).
  const switchMode = useCallback(
    (m: TutorMode) => {
      onModeChange(m);
      if (connected) {
        conv.sendContextualUpdate(
          m === "deberes"
            ? "El estudiante entra en MODO DEBERES. Recuerda: guía con pistas, nunca des la respuesta final; que la resuelva él."
            : "El estudiante vuelve al MODO CHARLA. Conversa y repasa con naturalidad.",
        );
      }
    },
    [conv, connected, onModeChange],
  );

  return (
    <section className="flex flex-col h-full gap-md px-gutter pt-md pb-md">
      {/* Selector de modo */}
      <div className="flex items-center justify-center gap-xs shrink-0">
        {(["charla", "deberes"] as TutorMode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex items-center gap-xs px-md py-1.5 rounded-full text-label-sm font-label-sm uppercase tracking-wide transition-all active:scale-95 ${
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "glass-panel text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                {m === "charla" ? "forum" : "edit_note"}
              </span>
              {m === "charla" ? "Charla" : "Deberes"}
            </button>
          );
        })}
      </div>

      {/* Insignia diferenciadora en modo Deberes */}
      {mode === "deberes" && (
        <div className="flex items-center justify-center gap-xs shrink-0 -mt-1">
          <span
            className="flex items-center gap-xs px-md py-1 rounded-full text-[11px] font-semibold"
            style={{ background: "rgba(255,183,131,0.14)", color: "#ffb783", border: "1px solid rgba(255,183,131,0.25)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
              verified
            </span>
            {tutorName} te guía, no te da la respuesta
          </span>
        </div>
      )}

      {/* Avatar con máquina de estados */}
      <div className="shrink-0 flex justify-center">
        <AvatarStage
          state={avatarState}
          avatar={avatar}
          name={tutorName}
          accent={accent}
          getFrequency={connected ? conv.getOutputByteFrequencyData : undefined}
        />
      </div>

      {/* Subtítulos / log con memoria */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-sm py-sm scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="m-auto text-center max-w-xs glass-panel rounded-xl p-md">
            <p className="text-on-surface font-body-lg text-body-md italic opacity-90 leading-relaxed">
              {quote ? `"${quote}"` : "Pulsa el micrófono y empieza a hablar con tu profe."}
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
              <p className="text-label-sm font-label-sm text-on-surface-variant mb-0.5 ml-1">
                {tutorName}
              </p>
              <div className="glass-panel rounded-2xl rounded-bl-sm px-md py-sm text-on-surface text-body-md">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Chips "explícalo distinto" */}
      {connected && (
        <div className="flex flex-wrap gap-xs justify-center shrink-0">
          {chipsFor(mode).map((c) => (
            <button
              key={c.label}
              onClick={() => say(c.say)}
              className="flex items-center gap-xs px-md py-1.5 rounded-full glass-panel text-on-surface-variant text-label-sm font-label-sm active:scale-95 hover:text-on-surface transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                {c.icon}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Avisos */}
      {missingAgent && (
        <div className="glass-panel rounded-xl p-sm flex items-start gap-sm text-sm text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-tertiary shrink-0" aria-hidden>
            warning
          </span>
          <span>
            Falta configurar el agent-id de ElevenLabs. Revisa{" "}
            <code className="text-primary text-xs">.env.local</code>.
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
          style={connected ? {} : { boxShadow: `0 8px 32px ${accent}40` }}
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
