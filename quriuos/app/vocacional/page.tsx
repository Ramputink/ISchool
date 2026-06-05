"use client";
// DUEÑO: Mateo (Bloque 3 — Coach vocacional / orientación profesional).
// Muestra el perfil evolutivo, carreras sugeridas y la sesión de voz con el Orientador.
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import ProfileSummary from "@/components/ProfileSummary";
import VoiceSession from "@/components/VoiceSession";
import { ELEVENLABS } from "@/lib/elevenlabs";
import { loadProfile, type StudentProfile } from "@/lib/profile";
import { suggestCareers, type CareerSuggestion } from "@/lib/careers";

export default function VocacionalPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [careers, setCareers] = useState<CareerSuggestion[]>([]);

  useEffect(() => {
    const sync = () => {
      const p = loadProfile();
      setProfile(p);
      setCareers(suggestCareers(p));
    };
    sync();
    window.addEventListener("quriuos:profile-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("quriuos:profile-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const userName = profile?.name ? `, ${profile.name}` : "";

  return (
    <AppShell live>
      {/* ── Cabecera ── */}
      <div className="px-gutter pt-xl pb-md">
        <p className="text-label-sm font-label-sm uppercase text-tertiary tracking-widest mb-xs">
          Bloque 3 · Tu futuro
        </p>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
          Tu perfil evolutivo{userName && (
            <span className="text-primary">{userName}</span>
          )}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Lo que hemos descubierto juntos a lo largo del recorrido.
        </p>
      </div>

      {/* ── Resumen de intereses y chats ── */}
      <div className="px-gutter pb-xl">
        <ProfileSummary />
      </div>

      {/* ── Carreras sugeridas ── */}
      {careers.length > 0 && (
        <section className="px-gutter pb-xl space-y-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary">
              route
            </span>
            <h2 className="text-headline-md font-headline-md text-on-surface">
              Áreas que encajan contigo
            </h2>
          </div>
          <div className="space-y-sm">
            {careers.map((suggestion) => (
              <CareerCard key={suggestion.area} suggestion={suggestion} />
            ))}
          </div>
        </section>
      )}

      {/* ── Sesión de voz con el Orientador ── */}
      <section className="pb-xxl">
        <div className="px-gutter pb-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary">
              record_voice_over
            </span>
            <h2 className="text-headline-md font-headline-md text-on-surface">
              Habla con el Orientador
            </h2>
          </div>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tu sesión de orientación profesional personalizada.
          </p>
        </div>
        <VoiceSession
          agentId={ELEVENLABS.vocationalAgentId}
          name="Orientador"
          title="Coach vocacional · Quriuos"
          avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop"
          quote="Con todo lo que hemos descubierto, exploremos qué caminos encajan realmente contigo."
          accent="#ffb783"
        />
      </section>
    </AppShell>
  );
}

// ── Componente auxiliar: tarjeta de sugerencia de carrera ──────────────────
function CareerCard({ suggestion }: { suggestion: CareerSuggestion }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Cabecera colapsable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-md py-md text-left transition-colors hover:bg-white/5 active:bg-white/10"
        aria-expanded={open}
      >
        <div className="flex items-center gap-md">
          <span
            className="material-symbols-outlined text-tertiary"
            aria-hidden="true"
          >
            {suggestion.icon}
          </span>
          <span className="text-body-md font-body-md font-semibold text-on-surface">
            {suggestion.area}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Contenido expandible */}
      {open && (
        <div className="px-md pb-md space-y-sm border-t border-white/8">
          <p className="text-body-md text-on-surface-variant pt-sm leading-relaxed">
            {suggestion.why}
          </p>
          <div className="flex flex-wrap gap-xs pt-xs">
            {suggestion.careers.map((career) => (
              <span
                key={career}
                className="px-md py-1 rounded-full bg-tertiary/15 text-tertiary text-label-sm font-label-sm"
              >
                {career}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
