"use client";
// Neuro-tutor (SpaceForEdu) — flujo MVP Fase 0.
// Un solo click-path: consentimiento → básicos → asignaturas → creador de
// personaje → sesión (charla/deberes) → Mi Semana → Parent peek.
import { useEffect, useMemo, useState } from "react";
import ParticleField from "@/components/ParticleField";
import TutorSession, { type TutorMode } from "@/components/TutorSession";
import {
  addWin,
  buildRecap,
  loadProfile,
  resetProfile,
  setBasics,
  setParentConsent,
  setSubjects,
  setTutor,
  strongSubjects,
  weakSubjects,
  type Gender,
  type StudentProfile,
  type Subject,
  type TutorManner,
} from "@/lib/profile";
import {
  getTutor,
  MANNER_LABEL,
  suggestTutors,
  type TutorPersona,
} from "@/lib/tutors";

type Screen =
  | "consent"
  | "basics"
  | "subjects"
  | "creator"
  | "session"
  | "week"
  | "parent";

const SUBJECT_POOL = [
  "Matemáticas", "Lengua", "Inglés", "Ciencias",
  "Historia", "Física", "Química", "Arte", "Ed. Física",
];

const GRADES = [
  "5º Primaria", "6º Primaria", "1º ESO", "2º ESO",
  "3º ESO", "4º ESO", "1º Bach.", "2º Bach.",
];

export default function TutorApp() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [screen, setScreen] = useState<Screen>("consent");
  const [mode, setMode] = useState<TutorMode>("charla");

  const refresh = () => setProfile(loadProfile());

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    // Punto de entrada según lo ya rellenado (permite retomar la demo).
    if (!p.parent?.consentAt) setScreen("consent");
    else if (!p.name) setScreen("basics");
    else if (!p.tutor) setScreen("creator");
    else setScreen("session");
    const sync = () => refresh();
    window.addEventListener("quriuos:profile-updated", sync);
    return () => window.removeEventListener("quriuos:profile-updated", sync);
  }, []);

  if (!profile) return null;

  return (
    <div className="phone-frame mesh-gradient h-[100dvh] flex flex-col relative overflow-hidden">
      <ParticleField count={14} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-solid border-b border-white/[0.07] shrink-0">
        <div className="flex items-center justify-between px-gutter h-14">
          <div className="flex items-center gap-sm">
            <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
              Nuri
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
              tu profe-amigo
            </span>
          </div>
          {profile.tutor && (
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setScreen(screen === "week" ? "session" : "week")}
                className="flex items-center gap-xs px-md py-1 rounded-full bg-secondary/15 text-secondary text-label-sm font-label-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_month</span>
                Mi Semana
              </button>
              <button
                onClick={() => setScreen(screen === "parent" ? "session" : "parent")}
                className="flex items-center gap-xs px-md py-1 rounded-full bg-tertiary/15 text-tertiary text-label-sm font-label-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>family_restroom</span>
                Padres
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 relative z-10">
        {screen === "consent" && <ConsentScreen onDone={() => setScreen("basics")} />}
        {screen === "basics" && (
          <BasicsScreen profile={profile} onDone={() => { refresh(); setScreen("subjects"); }} />
        )}
        {screen === "subjects" && (
          <SubjectsScreen profile={profile} onDone={() => { refresh(); setScreen("creator"); }} />
        )}
        {screen === "creator" && (
          <CreatorScreen profile={profile} onDone={() => { refresh(); setScreen("session"); }} />
        )}
        {screen === "session" && profile.tutor && (
          <SessionScreen profile={profile} mode={mode} onModeChange={setMode} />
        )}
        {screen === "week" && <WeekScreen profile={profile} onBack={() => setScreen("session")} />}
        {screen === "parent" && <ParentScreen profile={profile} onBack={() => setScreen("session")} />}
      </main>
    </div>
  );
}

// ── Consentimiento parental (gate obligatorio) ──────────────────────────────
function ConsentScreen({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email) && checked;
  return (
    <ScreenShell icon="shield_person" title="Un adulto, por favor" subtitle="Nuri es para menores: necesitamos el consentimiento de un padre o madre antes de activar el micrófono.">
      <div className="glass-panel rounded-xl p-md space-y-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email del padre/madre"
          className="w-full bg-surface-container-low rounded-lg px-md py-sm text-on-surface text-body-md outline-none border border-white/10 focus:border-primary/50"
        />
        <label className="flex items-start gap-sm text-on-surface-variant text-[13px] leading-snug cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-[#c0c1ff]" />
          <span>Doy mi consentimiento para el tratamiento de datos de mi hijo/a conforme a la política de privacidad. Los datos se guardan en este dispositivo, no se venden y puedo borrarlos cuando quiera.</span>
        </label>
      </div>
      <PrimaryButton
        disabled={!valid}
        onClick={() => { setParentConsent(email.trim()); onDone(); }}
        icon="check"
      >
        Doy mi consentimiento
      </PrimaryButton>
    </ScreenShell>
  );
}

// ── Datos básicos ───────────────────────────────────────────────────────────
function BasicsScreen({ profile, onDone }: { profile: StudentProfile; onDone: () => void }) {
  const [name, setName] = useState(profile.name || "");
  const [age, setAge] = useState<number | "">(profile.age ?? "");
  const [gender, setGender] = useState<Gender>(profile.gender ?? "unspecified");
  const [grade, setGrade] = useState(profile.gradeLevel ?? "");
  const valid = name.trim() && typeof age === "number" && grade;
  return (
    <ScreenShell icon="waving_hand" title="¡Hola! ¿Quién eres?" subtitle="Así tu profe te conocerá por tu nombre y se adaptará a ti.">
      <div className="space-y-md">
        <Field label="¿Cómo te llamas?">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
            className="w-full bg-surface-container-low rounded-lg px-md py-sm text-on-surface text-body-md outline-none border border-white/10 focus:border-primary/50" />
        </Field>
        <div className="grid grid-cols-2 gap-md">
          <Field label="Edad">
            <input type="number" min={6} max={17} value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              placeholder="12"
              className="w-full bg-surface-container-low rounded-lg px-md py-sm text-on-surface text-body-md outline-none border border-white/10 focus:border-primary/50" />
          </Field>
          <Field label="Curso">
            <select value={grade} onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-surface-container-low rounded-lg px-md py-sm text-on-surface text-body-md outline-none border border-white/10 focus:border-primary/50">
              <option value="">Elige…</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Eres…">
          <div className="flex gap-xs">
            {([["girl", "Chica"], ["boy", "Chico"], ["unspecified", "Prefiero no decir"]] as [Gender, string][]).map(([g, label]) => (
              <button key={g} onClick={() => setGender(g)}
                className={`flex-1 px-sm py-sm rounded-lg text-label-sm font-label-sm transition-all active:scale-95 ${gender === g ? "bg-primary-container text-on-primary-container" : "glass-panel text-on-surface-variant"}`}>
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <PrimaryButton disabled={!valid}
        onClick={() => { setBasics({ name: name.trim(), age: Number(age), gender, gradeLevel: grade }); onDone(); }}
        icon="arrow_forward">
        Siguiente
      </PrimaryButton>
    </ScreenShell>
  );
}

// ── Asignaturas (fuertes/flojas) ────────────────────────────────────────────
const STRENGTH_CYCLE: Record<number, number> = { 0: 4, 4: 2, 2: 0 }; // no elegido → fuerte → flojo → no
function SubjectsScreen({ profile, onDone }: { profile: StudentProfile; onDone: () => void }) {
  const init: Record<string, number> = {};
  (profile.subjects ?? []).forEach((s) => { init[s.name] = s.strength; });
  const [levels, setLevels] = useState<Record<string, number>>(init);
  const chosen = Object.values(levels).some((v) => v > 0);

  const cycle = (name: string) =>
    setLevels((prev) => ({ ...prev, [name]: STRENGTH_CYCLE[(prev[name] ?? 0)] ?? 4 }));

  const save = () => {
    const subjects: Subject[] = Object.entries(levels)
      .filter(([, v]) => v > 0)
      .map(([name, v]) => ({ name, strength: v as Subject["strength"] }));
    setSubjects(subjects);
    onDone();
  };

  return (
    <ScreenShell icon="school" title="¿Qué se te da bien… y qué no?" subtitle="Toca una asignatura: 💪 se me da bien · 😅 me cuesta. Tu profe te apoyará más donde lo necesites.">
      <div className="flex flex-wrap gap-sm">
        {SUBJECT_POOL.map((name) => {
          const lvl = levels[name] ?? 0;
          const cls = lvl >= 4
            ? "bg-secondary/20 text-secondary border-secondary/40"
            : lvl === 2
            ? "bg-tertiary/20 text-tertiary border-tertiary/40"
            : "glass-panel text-on-surface-variant border-white/10";
          return (
            <button key={name} onClick={() => cycle(name)}
              className={`flex items-center gap-xs px-md py-sm rounded-full border text-body-md transition-all active:scale-95 ${cls}`}>
              {lvl >= 4 && <span>💪</span>}
              {lvl === 2 && <span>😅</span>}
              {name}
            </button>
          );
        })}
      </div>
      <PrimaryButton disabled={!chosen} onClick={save} icon="arrow_forward">Siguiente</PrimaryButton>
    </ScreenShell>
  );
}

// ── Creador de personaje (hero) ─────────────────────────────────────────────
function CreatorScreen({ profile, onDone }: { profile: StudentProfile; onDone: () => void }) {
  const suggestions = useMemo(
    () => suggestTutors(profile.age, profile.gender),
    [profile.age, profile.gender],
  );
  const [selId, setSelId] = useState(suggestions[0]?.id);
  const sel = suggestions.find((t) => t.id === selId) ?? suggestions[0];
  const [displayName, setDisplayName] = useState(sel?.name ?? "");
  const [manner, setManner] = useState<TutorManner>(sel?.manner ?? "warm");

  // Al cambiar de persona, propone su nombre y manner por defecto.
  const pick = (t: TutorPersona) => {
    setSelId(t.id);
    setDisplayName(t.name);
    setManner(t.manner);
  };

  const confirm = () => {
    if (!sel) return;
    setTutor({
      personaId: sel.id,
      voiceId: sel.voiceId || undefined,
      manner,
      displayName: displayName.trim() || sel.name,
      accent: sel.accent,
      avatar: sel.avatar,
    });
    onDone();
  };

  if (!sel) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-gutter py-md flex flex-col gap-md">
      <div className="text-center space-y-1">
        <h1 className="text-headline-md font-headline-md text-on-surface">Elige tu profe</h1>
        <p className="text-on-surface-variant text-[13px]">Puedes cambiar su nombre y su forma de ser. Será tuyo.</p>
      </div>

      {/* Preview grande */}
      <div className="flex flex-col items-center gap-sm">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ backgroundColor: sel.accent }} />
          <div className="relative w-full h-full rounded-full border-2 p-1 glow-avatar overflow-hidden" style={{ borderColor: `${sel.accent}88` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={sel.avatar} src={sel.avatar} alt={sel.name} className="w-full h-full object-cover rounded-full animate-fade-in" />
          </div>
        </div>
        <p className="text-body-md font-semibold" style={{ color: sel.accent }}>{sel.title}</p>
        <p className="text-on-surface-variant text-[13px] text-center max-w-[15rem] leading-snug">{sel.tagline}</p>
      </div>

      {/* Carrusel de personas */}
      <div className="flex gap-sm overflow-x-auto scrollbar-hide pb-1 stagger">
        {suggestions.map((t) => (
          <button key={t.id} onClick={() => pick(t)}
            className={`shrink-0 w-16 flex flex-col items-center gap-xs transition-all ${t.id === selId ? "" : "opacity-55"}`}>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: t.id === selId ? t.accent : "transparent" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <span className="text-[11px] text-on-surface-variant">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Nombra a tu profe */}
      <Field label="¿Cómo quieres llamarle?">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={sel.name}
          className="w-full bg-surface-container-low rounded-lg px-md py-sm text-on-surface text-body-md outline-none border border-white/10 focus:border-primary/50" />
      </Field>

      {/* Manner */}
      <Field label="¿Cómo prefieres que sea?">
        <div className="grid grid-cols-2 gap-xs">
          {(Object.keys(MANNER_LABEL) as TutorManner[]).map((m) => (
            <button key={m} onClick={() => setManner(m)}
              className={`flex items-center gap-xs px-md py-sm rounded-lg text-body-md transition-all active:scale-95 ${manner === m ? "bg-primary-container text-on-primary-container" : "glass-panel text-on-surface-variant"}`}>
              <span>{MANNER_LABEL[m].emoji}</span>{MANNER_LABEL[m].label}
            </button>
          ))}
        </div>
      </Field>

      <PrimaryButton onClick={confirm} icon="favorite">¡Este es mi profe!</PrimaryButton>
    </div>
  );
}

// ── Sesión ──────────────────────────────────────────────────────────────────
function SessionScreen({
  profile, mode, onModeChange,
}: { profile: StudentProfile; mode: TutorMode; onModeChange: (m: TutorMode) => void }) {
  const t = profile.tutor!;
  const dynamicVariables = {
    student_name: profile.name || "estudiante",
    age: profile.age ?? "",
    grade: profile.gradeLevel ?? "",
    weak_subjects: weakSubjects(profile).join(", ") || "ninguna en concreto",
    strong_subjects: strongSubjects(profile).join(", ") || "por descubrir",
    recap: buildRecap(profile),
    tutor_name: t.displayName,
    manner: t.manner,
    mode,
  };
  const agentId = getTutor(t.personaId)?.agentId ?? "";
  return (
    <TutorSession
      agentId={agentId}
      tutorName={t.displayName}
      accent={t.accent}
      avatar={t.avatar ?? ""}
      mode={mode}
      onModeChange={onModeChange}
      dynamicVariables={dynamicVariables}
      quote={`¡Hola ${profile.name}! Soy ${t.displayName}. ¿Qué tal el cole hoy?`}
    />
  );
}

// ── Mi Semana ───────────────────────────────────────────────────────────────
function WeekScreen({ profile, onBack }: { profile: StudentProfile; onBack: () => void }) {
  const wins = profile.wins ?? [];
  const topics = (profile.interests ?? []).map((i) => i.topic);
  const talkedDays = new Set(profile.transcript.map((m) => m.ts.slice(0, 10))).size;
  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-gutter py-md space-y-md">
      <BackHeader title={`¡Buena semana, ${profile.name || "crack"}!`} onBack={onBack} />
      <div className="glass-panel rounded-2xl p-md flex items-center gap-md">
        <div className="text-center">
          <p className="text-headline-md font-headline-md text-primary">{talkedDays}</p>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-widest">días con tu profe</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <p className="text-on-surface-variant text-[13px] leading-snug">
          Cada día que hablas con tu profe, tu racha crece. ¡Sigue así! 🔥
        </p>
      </div>

      <Section title={`Logros (${wins.length})`} icon="emoji_events">
        {wins.length ? (
          <div className="flex flex-wrap gap-xs stagger">
            {wins.slice(-8).map((w, i) => (
              <span key={i} className="chip chip-tertiary">{w}</span>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant text-[13px]">Aún no hay logros — ¡habla con tu profe para conseguir el primero!</p>
        )}
      </Section>

      {topics.length > 0 && (
        <Section title="De lo que hablasteis" icon="chat">
          <div className="flex flex-wrap gap-xs stagger">
            {topics.map((tp) => <span key={tp} className="chip chip-secondary">{tp}</span>)}
          </div>
        </Section>
      )}

      {weakSubjects(profile).length > 0 && (
        <Section title="En lo que estáis trabajando juntos" icon="fitness_center">
          <div className="flex flex-wrap gap-xs">
            {weakSubjects(profile).map((s) => <span key={s} className="chip chip-primary">{s}</span>)}
          </div>
        </Section>
      )}

      {/* Demo helper: añade un logro de ejemplo */}
      <button onClick={() => addWin("Resolviste una fracción tú solo/a")}
        className="text-label-sm font-label-sm text-on-surface-variant underline underline-offset-2 opacity-60">
        + añadir logro de ejemplo (demo)
      </button>
    </div>
  );
}

// ── Parent peek ─────────────────────────────────────────────────────────────
function ParentScreen({ profile, onBack }: { profile: StudentProfile; onBack: () => void }) {
  const needsHuman = profile.flags?.needsHumanTutor ?? [];
  const isBach = (profile.gradeLevel ?? "").includes("Bach");
  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-gutter py-md space-y-md">
      <BackHeader title="Espacio para padres" onBack={onBack} />

      {/* Seguridad / transparencia */}
      <Section title="Seguridad y transparencia" icon="verified_user">
        <div className="glass-panel rounded-xl p-md space-y-sm">
          <Row icon="check_circle" ok text="Nuri guía, nunca da la respuesta de los deberes." />
          <Row icon="check_circle" ok text="Los datos se guardan en este dispositivo. No se venden." />
          <Row icon="visibility" ok text={`Puedes leer todo lo que habla (${profile.transcript.length} mensajes).`} />
        </div>
      </Section>

      {/* Upsell a tutoría humana (T2) — se activa con la señal del tutor */}
      {needsHuman.length > 0 ? (
        <UpsellCard
          icon="person_raised_hand"
          title={`${profile.name} sigue atascado/a en ${needsHuman.join(", ")}`}
          body="Nuri lo ha detectado. Un profe humano de SpaceForEdu puede desbloquearlo en una clase."
          cta="Reservar diagnóstico gratis"
        />
      ) : (
        <UpsellCard
          icon="person_raised_hand"
          title="Tutoría particular humana"
          body="Cuando tu hijo/a necesite un empujón extra, nuestros profes de SpaceForEdu le acompañan 1 a 1."
          cta="Ver profesores"
        />
      )}

      {/* Upsell universidad (T3) */}
      {isBach && (
        <UpsellCard
          icon="school"
          title="Camino a la universidad en España"
          body={`${profile.name} está en Bachillerato. Preparamos la EvAU/PCE y el acceso a universidades españolas.`}
          cta="Conocer el programa"
        />
      )}

      {/* Transcript solo lectura */}
      <Section title="Conversaciones" icon="forum">
        <div className="glass-panel rounded-xl p-md max-h-56 overflow-y-auto scrollbar-hide space-y-sm">
          {profile.transcript.length ? profile.transcript.slice(-20).map((m, i) => (
            <p key={i} className="text-[13px] leading-snug">
              <span className="text-on-surface-variant font-semibold">{m.role === "user" ? profile.name || "Alumno" : m.speaker || "Profe"}: </span>
              <span className="text-on-surface">{m.text}</span>
            </p>
          )) : <p className="text-on-surface-variant text-[13px]">Aún no hay conversaciones.</p>}
        </div>
      </Section>

      <button onClick={() => { if (confirm("¿Borrar todos los datos de tu hijo/a?")) { resetProfile(); location.reload(); } }}
        className="text-label-sm font-label-sm text-error/80 underline underline-offset-2">
        Borrar todos los datos
      </button>
    </div>
  );
}

// ── UI helpers ──────────────────────────────────────────────────────────────
function ScreenShell({ icon, title, subtitle, children }: { icon: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-gutter py-md flex flex-col gap-md">
      <div className="flex flex-col items-center text-center gap-sm pt-md">
        <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>{icon}</span>
        </div>
        <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
        <p className="text-on-surface-variant text-[13px] max-w-[18rem] leading-snug">{subtitle}</p>
      </div>
      <div className="flex-1 space-y-md">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-xs">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-sm">
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "15px" }}>{icon}</span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{title}</p>
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, icon }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; icon?: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-sm px-xl py-md rounded-full bg-primary-container text-on-primary-container font-headline-md text-body-md font-bold transition-all active:scale-95 shadow-lg disabled:opacity-40 disabled:pointer-events-none mt-auto">
      {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
      {children}
    </button>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-sm">
      <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full glass-panel text-on-surface-variant active:scale-90">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h2 className="text-headline-md font-headline-md text-on-surface">{title}</h2>
    </div>
  );
}

function Row({ icon, text, ok }: { icon: string; text: string; ok?: boolean }) {
  return (
    <div className="flex items-start gap-sm">
      <span className={`material-symbols-outlined shrink-0 ${ok ? "text-secondary" : "text-on-surface-variant"}`} style={{ fontSize: "18px" }}>{icon}</span>
      <span className="text-on-surface text-[13px] leading-snug">{text}</span>
    </div>
  );
}

function UpsellCard({ icon, title, body, cta }: { icon: string; title: string; body: string; cta: string }) {
  return (
    <div className="rounded-2xl p-md space-y-sm" style={{ background: "rgba(255,183,131,0.10)", border: "1px solid rgba(255,183,131,0.22)" }}>
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-tertiary">{icon}</span>
        <p className="text-on-surface font-semibold text-body-md">{title}</p>
      </div>
      <p className="text-on-surface-variant text-[13px] leading-snug">{body}</p>
      <button className="flex items-center gap-xs px-md py-sm rounded-full bg-tertiary/20 text-tertiary text-label-sm font-label-sm active:scale-95">
        {cta}
        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>arrow_forward</span>
      </button>
    </div>
  );
}
