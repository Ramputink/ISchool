// ============================================================================
// Personas del neuro-tutor — SpaceForEdu (MVP Fase 0)
// Cada persona = un preset (voz + manner + look) mapeado a un agente de
// ElevenLabs. Para el MVP, si no hay agentId propio, se reutiliza el agente
// Coach (orquestador) ya configurado. El prompt socrático vive en
// agentes/tutor-socratico.md.
//
// "Boys vs girls" y la edad SOLO reordenan/preseleccionan; el niño puede
// elegir cualquier persona (inclusivo por diseño).
// ============================================================================
import type { Gender, TutorManner } from "./profile";
import { ELEVENLABS } from "./elevenlabs";

export type AgeBand = "younger" | "middle" | "teen"; // 6-9 / 10-13 / 14-17

export type TutorPersona = {
  id: string;
  name: string; // nombre por defecto (el niño puede renombrar)
  title: string; // rol / gancho
  tagline: string;
  manner: TutorManner;
  accent: string; // color de acento (hex)
  avatar: string; // url del avatar
  agentId: string; // ElevenLabs agent-id (fallback: coach)
  voiceId?: string; // voz ElevenLabs (opcional en MVP)
  /** Sesgo de recomendación por género (no restringe; solo ordena). */
  leans?: Gender;
};

const env = (k: string, fallback: string) =>
  (typeof process !== "undefined" && process.env?.[k]) || fallback;

// Fallback al agente Coach/orquestador ya configurado en el hackathon.
const FALLBACK_AGENT = ELEVENLABS.coachAgentId;

export const TUTORS: TutorPersona[] = [
  {
    id: "luna",
    name: "Luna",
    title: "La profe curiosa",
    tagline: "Le encanta preguntar '¿y por qué?' y descubrir cómo funciona todo.",
    manner: "warm",
    accent: "#c0c1ff",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_TUTOR_LUNA_AGENT_ID", FALLBACK_AGENT),
    voiceId: env("NEXT_PUBLIC_EL_TUTOR_LUNA_VOICE_ID", ""),
    leans: "girl",
  },
  {
    id: "max",
    name: "Max",
    title: "El profe entrenador",
    tagline: "Te reta con energía: cada ejercicio es un partido que puedes ganar.",
    manner: "coach",
    accent: "#4cd7f6",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_TUTOR_MAX_AGENT_ID", FALLBACK_AGENT),
    voiceId: env("NEXT_PUBLIC_EL_TUTOR_MAX_VOICE_ID", ""),
    leans: "boy",
  },
  {
    id: "sol",
    name: "Sol",
    title: "La profe que cuenta historias",
    tagline: "Convierte cualquier tema en una historia que se te queda para siempre.",
    manner: "playful",
    accent: "#ffb783",
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_TUTOR_SOL_AGENT_ID", FALLBACK_AGENT),
    voiceId: env("NEXT_PUBLIC_EL_TUTOR_SOL_VOICE_ID", ""),
    leans: "unspecified",
  },
  {
    id: "nova",
    name: "Nova",
    title: "El profe tranquilo",
    tagline: "Sereno y claro: va paso a paso y nunca te mete prisa.",
    manner: "calm",
    accent: "#8083ff",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_TUTOR_NOVA_AGENT_ID", FALLBACK_AGENT),
    voiceId: env("NEXT_PUBLIC_EL_TUTOR_NOVA_VOICE_ID", ""),
    leans: "unspecified",
  },
];

export function getTutor(id: string): TutorPersona | undefined {
  return TUTORS.find((t) => t.id === id);
}

export function ageBand(age?: number): AgeBand {
  if (!age || age <= 9) return "younger";
  if (age <= 13) return "middle";
  return "teen";
}

/**
 * Reordena las personas para preseleccionar según edad y género.
 * NO filtra: todas las personas siguen disponibles para cualquier niño.
 */
export function suggestTutors(age?: number, gender?: Gender): TutorPersona[] {
  const band = ageBand(age);
  const scored = TUTORS.map((t) => {
    let score = 0;
    // Sesgo suave por género (solo ordena la sugerencia inicial).
    if (gender && gender !== "unspecified" && t.leans === gender) score += 2;
    // Ajuste por edad: coach para mayores, playful para pequeños.
    if (band === "younger" && (t.manner === "playful" || t.manner === "warm")) score += 1;
    if (band === "teen" && (t.manner === "coach" || t.manner === "calm")) score += 1;
    return { t, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.t);
}

export const MANNER_LABEL: Record<TutorManner, { label: string; emoji: string }> = {
  playful: { label: "Divertido", emoji: "🎈" },
  warm: { label: "Cercano", emoji: "🤗" },
  coach: { label: "Motivador", emoji: "🔥" },
  calm: { label: "Tranquilo", emoji: "🌙" },
};
