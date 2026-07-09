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

// ── Neuro-tutor (SpaceForEdu) — superset del perfil ────────────────────────
// Ver plan: se extiende StudentProfile con campos opcionales para no romper
// el flujo Quriuos existente. La forma sobrevive la migración localStorage→DB.

export type Gender = "boy" | "girl" | "unspecified";

export type Subject = {
  name: string; // "Matemáticas", "Lengua", ...
  strength: 1 | 2 | 3 | 4 | 5; // 1 = flojo, 5 = fuerte
};

export type TutorManner = "playful" | "warm" | "coach" | "calm";

export type TutorConfig = {
  personaId: string; // id de lib/tutors.ts
  voiceId?: string; // voz ElevenLabs asignada
  manner: TutorManner;
  displayName: string; // el niño puede nombrar a su profe
  accent?: string; // color de acento para la UI
  avatar?: string; // url del avatar elegido
};

export type ParentConsent = {
  email: string;
  consentAt: string; // ISO — el micro no se activa sin esto
};

export type StudentProfile = {
  name: string;
  interests: Interest[];
  chats: CharacterChat[];
  vocationalNotes: string[]; // lo que rellena el bloque 3
  transcript: Msg[]; // memoria de todo lo hablado
  updatedAt: string;

  // ── Campos neuro-tutor (opcionales, MVP SpaceForEdu) ──
  age?: number;
  gender?: Gender;
  gradeLevel?: string; // "5º Primaria", "1º Bachillerato"
  subjects?: Subject[]; // fuertes y débiles
  tutor?: TutorConfig; // persona/voz/manner elegidos
  weekRecap?: string; // resumen semanal generado
  wins?: string[]; // logros para "Mi Semana"
  flags?: {
    needsHumanTutor?: string[]; // asignaturas atascadas → puente a T2
    safetyEvent?: boolean;
  };
  parent?: ParentConsent;
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
    subjects: [],
    wins: [],
    flags: {},
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
  if (p.name) {
    const bits = [p.name];
    if (p.age) bits.push(`${p.age} años`);
    if (p.gradeLevel) bits.push(p.gradeLevel);
    parts.push(`El estudiante se llama ${bits.join(", ")}.`);
  }
  const weak = weakSubjects(p);
  const strong = strongSubjects(p);
  if (strong.length) parts.push(`Se le da bien: ${strong.join(", ")}.`);
  if (weak.length) parts.push(`Le cuesta más: ${weak.join(", ")} (ahí necesita más apoyo).`);
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

// ── Helpers y setters del neuro-tutor (SpaceForEdu) ─────────────────────────

export function weakSubjects(p: StudentProfile = loadProfile()): string[] {
  return (p.subjects ?? []).filter((s) => s.strength <= 2).map((s) => s.name);
}

export function strongSubjects(p: StudentProfile = loadProfile()): string[] {
  return (p.subjects ?? []).filter((s) => s.strength >= 4).map((s) => s.name);
}

/** Consentimiento parental: el micro no debe activarse sin esto. */
export function hasConsent(p: StudentProfile = loadProfile()): boolean {
  return !!p.parent?.consentAt;
}

export function setParentConsent(email: string): StudentProfile {
  const p = loadProfile();
  p.parent = { email, consentAt: new Date().toISOString() };
  saveProfile(p);
  return p;
}

/** Datos básicos del onboarding. */
export function setBasics(basics: {
  name?: string;
  age?: number;
  gender?: Gender;
  gradeLevel?: string;
}): StudentProfile {
  const p = loadProfile();
  if (basics.name !== undefined) p.name = basics.name;
  if (basics.age !== undefined) p.age = basics.age;
  if (basics.gender !== undefined) p.gender = basics.gender;
  if (basics.gradeLevel !== undefined) p.gradeLevel = basics.gradeLevel;
  saveProfile(p);
  return p;
}

export function setSubjects(subjects: Subject[]): StudentProfile {
  const p = loadProfile();
  p.subjects = subjects;
  saveProfile(p);
  return p;
}

export function setTutor(tutor: TutorConfig): StudentProfile {
  const p = loadProfile();
  p.tutor = tutor;
  saveProfile(p);
  return p;
}

/** Marca una asignatura como atascada → alimenta el puente a tutoría humana (T2). */
export function flagNeedsHuman(subject: string): StudentProfile {
  const p = loadProfile();
  p.flags = p.flags ?? {};
  const list = new Set(p.flags.needsHumanTutor ?? []);
  list.add(subject);
  p.flags.needsHumanTutor = [...list];
  saveProfile(p);
  return p;
}

/** Registra un "logro" para la pantalla Mi Semana. */
export function addWin(win: string): StudentProfile {
  const p = loadProfile();
  p.wins = p.wins ?? [];
  p.wins.push(win);
  if (p.wins.length > 30) p.wins = p.wins.slice(-30);
  saveProfile(p);
  return p;
}

export function resetProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("quriuos:profile-updated"));
}
