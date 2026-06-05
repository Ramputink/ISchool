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

export type StudentProfile = {
  name: string;
  interests: Interest[];
  chats: CharacterChat[];
  vocationalNotes: string[]; // lo que rellena el bloque 3
  updatedAt: string;
};

const KEY = "quriuos_profile";

export function emptyProfile(): StudentProfile {
  return {
    name: "",
    interests: [],
    chats: [],
    vocationalNotes: [],
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

export function resetProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("quriuos:profile-updated"));
}
