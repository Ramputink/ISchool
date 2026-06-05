// ============================================================================
// Personajes de Quriuos (Bloque 2)
// Cada personaje = un clon de voz / agente conversacional de ElevenLabs.
// Rellenar agentId con el id real del dashboard (o NEXT_PUBLIC_* en .env.local).
// ============================================================================
import type { InterestCategory } from "./profile";

export type Character = {
  id: string;
  name: string;
  title: string; // rol / por qué es un referente
  category: InterestCategory;
  tagline: string; // frase de gancho mostrada en la tarjeta
  quote: string; // cita de ejemplo para la transcripción inicial
  accent: string; // color de acento (hex) para la UI
  avatar: string; // url de imagen del avatar
  agentId: string; // ElevenLabs agent-id
  matchInterests: string[]; // intereses que activan a este personaje
};

const env = (k: string, fallback: string) =>
  (typeof process !== "undefined" && process.env?.[k]) || fallback;

export const CHARACTERS: Character[] = [
  {
    id: "hawking",
    name: "Stephen Hawking",
    title: "Físico teórico y divulgador",
    category: "ciencia",
    tagline: "El universo, los agujeros negros y el poder de hacerse preguntas.",
    quote:
      "Recuerda mirar a las estrellas y no a tus pies. Intenta darle sentido a lo que ves.",
    accent: "#4cd7f6",
    avatar:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_HAWKING_AGENT_ID", "REEMPLAZAR_HAWKING_AGENT_ID"),
    matchInterests: ["ciencia", "física", "astronomía", "espacio", "matemáticas"],
  },
  {
    id: "jobs",
    name: "Steve Jobs",
    title: "Cofundador de Apple",
    category: "tecnología",
    tagline: "Diseño, producto y atreverse a pensar diferente.",
    quote:
      "Tu tiempo es limitado, no lo malgastes viviendo la vida de otro. Stay hungry, stay foolish.",
    accent: "#c0c1ff",
    avatar:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_JOBS_AGENT_ID", "REEMPLAZAR_JOBS_AGENT_ID"),
    matchInterests: ["tecnología", "diseño", "negocios", "emprender", "innovación"],
  },
  {
    id: "musk",
    name: "Elon Musk",
    title: "Fundador de Tesla y SpaceX",
    category: "tecnología",
    tagline: "Cohetes, coches eléctricos y pensar a lo grande.",
    quote:
      "Cuando algo es lo bastante importante, lo haces aunque las probabilidades no estén a tu favor.",
    accent: "#ffb783",
    avatar:
      "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_MUSK_AGENT_ID", "REEMPLAZAR_MUSK_AGENT_ID"),
    matchInterests: ["tecnología", "espacio", "ingeniería", "negocios", "coches"],
  },
  {
    id: "cr7",
    name: "Cristiano Ronaldo",
    title: "Futbolista de élite",
    category: "deporte",
    tagline: "Disciplina, hambre de ganar y trabajo duro cada día.",
    quote:
      "El talento sin trabajo no es nada. Tu dedicación define hasta dónde llegas.",
    accent: "#4cd7f6",
    avatar:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_CR7_AGENT_ID", "REEMPLAZAR_CR7_AGENT_ID"),
    matchInterests: ["deporte", "fútbol", "disciplina", "fitness", "motivación"],
  },
  {
    id: "messi",
    name: "Lionel Messi",
    title: "Futbolista de élite",
    category: "deporte",
    tagline: "Talento, humildad y disfrutar del juego.",
    quote:
      "Empecé pequeño y soñando. Hay que luchar por lo que uno quiere, paso a paso.",
    accent: "#c0c1ff",
    avatar:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_MESSI_AGENT_ID", "REEMPLAZAR_MESSI_AGENT_ID"),
    matchInterests: ["deporte", "fútbol", "constancia", "motivación"],
  },
  {
    id: "taylor",
    name: "Taylor Swift",
    title: "Cantante y compositora",
    category: "música",
    tagline: "Componer, crear desde lo que sientes y construir tu camino.",
    quote:
      "Si quieres escribir tu historia, no dejes que nadie más sostenga el bolígrafo.",
    accent: "#ffb783",
    avatar:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_TAYLOR_AGENT_ID", "REEMPLAZAR_TAYLOR_AGENT_ID"),
    matchInterests: ["música", "arte", "escribir", "creatividad", "negocios"],
  },
  {
    id: "ibai",
    name: "Ibai Llanos",
    title: "Creador de contenido y streamer",
    category: "arte",
    tagline: "Comunicación, creatividad digital y conectar con la gente.",
    quote:
      "Haz lo que te apasione de verdad y hazlo con todo. Lo demás llega solo.",
    accent: "#4cd7f6",
    avatar:
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=640&auto=format&fit=crop",
    agentId: env("NEXT_PUBLIC_EL_IBAI_AGENT_ID", "REEMPLAZAR_IBAI_AGENT_ID"),
    matchInterests: ["arte", "comunicación", "videojuegos", "creatividad", "negocios"],
  },
];

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

// Sugiere personajes según los intereses del estudiante (Bloque 2).
export function suggestCharacters(
  interests: { topic: string; category: string }[],
): Character[] {
  if (!interests.length) return CHARACTERS;
  const terms = new Set(
    interests.flatMap((i) => [i.topic.toLowerCase(), i.category.toLowerCase()]),
  );
  const scored = CHARACTERS.map((c) => {
    const score =
      (terms.has(c.category) ? 2 : 0) +
      c.matchInterests.filter((m) => terms.has(m.toLowerCase())).length;
    return { c, score };
  });
  const matches = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  return (matches.length ? matches : scored).map((s) => s.c);
}
