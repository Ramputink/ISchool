"use client";
// DUEÑO: Fernando (diseño). Resumen del perfil evolutivo.
// Lee loadProfile() y escucha quriuos:profile-updated / storage.
import { useEffect, useState } from "react";
import { loadProfile, type StudentProfile, type Interest } from "@/lib/profile";

// ── Subcomponentes ────────────────────────────────────────────────────────────

/** Pips de fuerza de interés (1-5) */
function StrengthPips({ value }: { value: number }) {
  return (
    <span className="strength-bar" aria-label={`Nivel ${value} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`strength-pip ${i < value ? "strength-pip-filled" : "strength-pip-empty"}`}
        />
      ))}
    </span>
  );
}

/** Chip individual de interés con su nivel */
function InterestChip({ interest }: { interest: Interest }) {
  // Color del chip según categoría
  const chipCls =
    interest.category === "ciencia" || interest.category === "arte" || interest.category === "lectura"
      ? "chip chip-secondary"
      : interest.category === "deporte" || interest.category === "música"
      ? "chip chip-tertiary"
      : "chip chip-primary";

  return (
    <div
      className="flex items-center gap-[6px] px-sm py-[5px] rounded-xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span className={chipCls}>{interest.topic}</span>
      <StrengthPips value={interest.strength} />
    </div>
  );
}

/** Sección con título + contenido */
function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-sm">
      <div className="flex items-center gap-xs">
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: "15px" }}
          aria-hidden
        >
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProfileSummary() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const sync = () => setProfile(loadProfile());
    sync();
    window.addEventListener("quriuos:profile-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("quriuos:profile-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Estado de carga inicial
  if (!profile) {
    return (
      <div className="glass-panel rounded-2xl p-md space-y-sm">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 rounded-lg shimmer" style={{ width: `${60 + i * 10}%` }} />
        ))}
      </div>
    );
  }

  const hasInterests = profile.interests.length > 0;
  const hasChats     = profile.chats.length > 0;
  const hasName      = !!profile.name;

  // Perfil completamente vacío
  if (!hasInterests && !hasChats && !hasName) {
    return (
      <div className="glass-panel rounded-2xl p-md flex items-center gap-md">
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: "28px" }}
          aria-hidden
        >
          person_outline
        </span>
        <div>
          <p className="text-on-surface text-body-md font-semibold">Tu perfil está vacío</p>
          <p className="text-on-surface-variant text-[13px] mt-[2px]">
            Habla con el coach primero para construir tu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-md space-y-md animate-fade-up">

      {/* Nombre del estudiante si existe */}
      {hasName && (
        <div className="flex items-center gap-sm">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary font-bold text-body-md"
            style={{ background: "rgba(192,193,255,0.12)", border: "1px solid rgba(192,193,255,0.2)" }}
            aria-hidden
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-on-surface font-semibold text-body-md leading-tight">{profile.name}</p>
            <p className="text-on-surface-variant text-[11px]">Perfil en construcción</p>
          </div>
        </div>
      )}

      {/* Intereses */}
      {hasInterests ? (
        <Section icon="interests" title={`Intereses detectados (${profile.interests.length})`}>
          <div className="flex flex-wrap gap-[6px] stagger">
            {profile.interests
              .slice()
              .sort((a, b) => b.strength - a.strength)
              .map((i) => (
                <InterestChip key={i.topic} interest={i} />
              ))}
          </div>
        </Section>
      ) : (
        <Section icon="interests" title="Intereses detectados">
          <p className="text-on-surface-variant text-[13px]">
            Aún ninguno — habla con el coach primero.
          </p>
        </Section>
      )}

      {/* Conversaciones con personajes */}
      {hasChats && (
        <Section icon="forum" title={`Conversaciones (${profile.chats.length})`}>
          <div className="flex flex-wrap gap-[6px] stagger">
            {profile.chats.map((c, idx) => (
              <span
                key={`${c.characterId}-${idx}`}
                className="chip chip-secondary"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "11px" }}
                  aria-hidden
                >
                  chat_bubble
                </span>
                {c.character}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Notas vocacionales */}
      {profile.vocationalNotes?.length > 0 && (
        <Section icon="lightbulb" title={`Insights vocacionales (${profile.vocationalNotes.length})`}>
          <ul className="space-y-[6px]">
            {profile.vocationalNotes.slice(-3).map((note, idx) => (
              <li
                key={idx}
                className="flex items-start gap-xs text-on-surface-variant text-[13px] leading-snug"
              >
                <span
                  className="mt-[2px] w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ background: "#ffb783", marginTop: "6px" }}
                  aria-hidden
                />
                {note}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
