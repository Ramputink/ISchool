// ============================================================================
// CONTRATO COMPARTIDO — Quriuos
// Los 3 bloques (coach / personajes / vocacional) leen y escriben este objeto.
// NO cambiar la forma de StudentProfile sin avisar a todo el equipo.
// ============================================================================

export type InterestCategory =
  | "deporte"
  | "ciencia"
  | "tecnología"
  | "arte"
  | "música"
  | "negocios"
  | "lectura"
  | "otro";

export type Interest = {
  topic: string; // "baloncesto", "astrofísica", "emprender"
  category: InterestCategory;
  strength: number; // 1-5, cuánto le interesa
  source: "coach" | "personaje";
};

export type CharacterChat = {
  characterId: string; // id de lib/characters.ts
  character: string; // nombre mostrado
  topic: string;
  summary: string; // resumen corto de lo que se habló
};

export type Msg = {
  role: "user" | "ai";
  text: string;
  speaker?: string; // nombre del hablante (Quriuos, Hawking, ...)
  ts: string;
};

export type StudentProfile = {
  name: string;
  interests: Interest[];
  chats: CharacterChat[];
  vocationalNotes: string[]; // lo que rellena el bloque 3
  transcript: Msg[]; // memoria de todo lo hablado
  updatedAt: string;
};

const KEY = "quriuos_profile";

export function emptyProfile(): StudentProfile {
  return {
    name: "",
    interests: [],
    chats: [],
    vocationalNotes: [],
    transcript: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadProfile(): StudentProfile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyProfile(), ...JSON.parse(raw) } : emptyProfile();
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(p: StudentProfile): void {
  if (typeof window === "undefined") return;
  p.updatedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(p));
  // Notifica a otras pestañas/componentes que el perfil cambió.
  window.dispatchEvent(new Event("quriuos:profile-updated"));
}

export function setName(name: string): StudentProfile {
  const p = loadProfile();
  p.name = name;
  saveProfile(p);
  return p;
}

export function addInterest(i: Interest): StudentProfile {
  const p = loadProfile();
  const existing = p.interests.find(
    (x) => x.topic.toLowerCase() === i.topic.toLowerCase(),
  );
  if (existing) {
    existing.strength = Math.max(existing.strength, i.strength);
  } else {
    p.interests.push(i);
  }
  saveProfile(p);
  return p;
}

export function removeInterest(topic: string): StudentProfile {
  const p = loadProfile();
  p.interests = p.interests.filter(
    (x) => x.topic.toLowerCase() !== topic.toLowerCase(),
  );
  saveProfile(p);
  return p;
}

export function addChat(c: CharacterChat): StudentProfile {
  const p = loadProfile();
  p.chats.push(c);
  saveProfile(p);
  return p;
}

export function addVocationalNote(note: string): StudentProfile {
  const p = loadProfile();
  p.vocationalNotes.push(note);
  saveProfile(p);
  return p;
}

// ---- Memoria de la conversación ----
export function addMessage(m: Omit<Msg, "ts">): StudentProfile {
  const p = loadProfile();
  p.transcript.push({ ...m, ts: new Date().toISOString() });
  // Cap para no llenar localStorage en exceso.
  if (p.transcript.length > 200) p.transcript = p.transcript.slice(-200);
  saveProfile(p);
  return p;
}

// Resumen compacto para dar "memoria" al agente vía variables dinámicas.
export function buildRecap(p: StudentProfile = loadProfile()): string {
  const parts: string[] = [];
  if (p.name) parts.push(`El estudiante se llama ${p.name}.`);
  if (p.interests.length)
    parts.push(`Intereses detectados: ${p.interests.map((i) => i.topic).join(", ")}.`);
  if (p.chats.length)
    parts.push(`Ya ha conversado con: ${p.chats.map((c) => c.character).join(", ")}.`);
  const last = p.transcript
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Estudiante" : m.speaker || "Quriuos"}: ${m.text}`)
    .join(" / ");
  if (last) parts.push(`Últimos mensajes: ${last}`);
  return parts.join(" ") || "Es la primera conversación; aún no hay contexto previo.";
}

export function resetProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("quriuos:profile-updated"));
}
