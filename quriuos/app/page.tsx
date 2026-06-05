"use client";
// Quriuos — chatbot único. Una sola conversación que, según la pregunta, transfiere
// automáticamente al referente o al orientador, con memoria persistente.
import { useEffect, useState } from "react";
import ParticleField from "@/components/ParticleField";
import ProfileSummary from "@/components/ProfileSummary";
import VoiceSession, { type Speaker } from "@/components/VoiceSession";
import { CHARACTERS } from "@/lib/characters";
import { ELEVENLABS } from "@/lib/elevenlabs";
import {
  buildRecap,
  loadProfile,
  resetProfile,
  setName,
  type StudentProfile,
} from "@/lib/profile";
import { suggestCareers, type CareerSuggestion } from "@/lib/careers";

const GUIDE_AVATAR =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop";
const ORIENTADOR_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop";

const ALIASES: Record<string, string[]> = {
  hawking: ["hawking", "stephen"],
  jobs: ["steve jobs", "jobs"],
  musk: ["elon", "musk"],
  cr7: ["cristiano", "ronaldo", "cr7"],
  messi: ["messi", "lionel", "leo messi"],
  taylor: ["taylor", "swift"],
  ibai: ["ibai"],
};

const SPEAKERS: Speaker[] = [
  { id: "quriuos", name: "Quriuos", title: "Tu guía", avatar: GUIDE_AVATAR, accent: "#c0c1ff", match: ["quriuos"] },
  ...CHARACTERS.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    avatar: c.avatar,
    accent: c.accent,
    match: ALIASES[c.id] ?? [c.name.toLowerCase()],
  })),
  { id: "orientador", name: "Orientador", title: "Coach vocacional", avatar: ORIENTADOR_AVATAR, accent: "#ffb783", match: ["orientador", "orientación", "vocacional"] },
];

export default function Home() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [careers, setCareers] = useState<CareerSuggestion[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const sync = () => {
      const p = loadProfile();
      setProfile(p);
      setCareers(suggestCareers(p));
    };
    sync();
    window.addEventListener("quriuos:profile-updated", sync);
    return () => window.removeEventListener("quriuos:profile-updated", sync);
  }, []);

  const needsName = profile !== null && !profile.name;

  const dynamicVariables = {
    student_name: profile?.name || "estudiante",
    interests: profile?.interests.map((i) => i.topic).join(", ") || "aún sin definir",
    characters_talked: profile?.chats.map((c) => c.character).join(", ") || "ninguno todavía",
    suggested_areas: careers.map((c) => c.area).join(", ") || "por explorar",
    recap: profile ? buildRecap(profile) : "Primera conversación.",
  };

  return (
    <div className="phone-frame mesh-gradient h-[100dvh] flex flex-col relative overflow-hidden">
      <ParticleField count={16} />

      {/* Header mínimo */}
      <header className="sticky top-0 z-40 glass-panel-solid border-b border-white/[0.07] shrink-0">
        <div className="flex items-center justify-between px-gutter h-14">
          <div className="flex items-center gap-sm">
            <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
              Quriuos
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
              tu voz, tu camino
            </span>
          </div>
          <button
            onClick={() => setDrawer(true)}
            className="flex items-center gap-xs px-md py-1 rounded-full bg-tertiary/15 text-tertiary text-label-sm font-label-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              explore
            </span>
            Mi futuro
          </button>
        </div>
      </header>

      {/* Captura de nombre (solo la primera vez) */}
      {needsName && (
        <div className="px-gutter pt-sm shrink-0 relative z-10">
          <div className="glass-panel rounded-xl p-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
              waving_hand
            </span>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && nameInput.trim() && setName(nameInput.trim())}
              placeholder="¿Cómo te llamas?"
              className="flex-1 bg-transparent text-on-surface text-body-md outline-none placeholder:text-on-surface-variant"
            />
            {nameInput.trim() && (
              <button
                onClick={() => setName(nameInput.trim())}
                className="text-label-sm font-label-sm uppercase text-primary px-sm py-xs rounded-lg hover:bg-primary/10 active:scale-95"
              >
                Listo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chatbot único */}
      <main className="flex-1 min-h-0 relative z-10">
        <VoiceSession
          agentId={ELEVENLABS.coachAgentId}
          name="Quriuos"
          title="Cuéntame qué te gusta"
          avatar={GUIDE_AVATAR}
          quote="¡Hola! Soy Quriuos. Cuéntame: ¿qué es eso que harías durante horas sin aburrirte?"
          accent="#c0c1ff"
          speakers={SPEAKERS}
          persist
          dynamicVariables={dynamicVariables}
        />
      </main>

      {/* Drawer "Mi futuro": perfil evolutivo + carreras */}
      {drawer && (
        <div
          className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
          onClick={() => setDrawer(false)}
        >
          <div
            className="glass-panel-solid rounded-t-2xl max-h-[85%] overflow-y-auto p-gutter space-y-md animate-fade-up scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-headline-md font-headline-md text-on-surface">Tu futuro</h2>
              <button
                onClick={() => setDrawer(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full glass-panel text-on-surface-variant active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <ProfileSummary />

            {careers.length > 0 && (
              <div className="space-y-sm">
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-tertiary">
                  Áreas que encajan contigo
                </p>
                {careers.map((c) => (
                  <div key={c.area} className="glass-panel rounded-xl p-md">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-tertiary">{c.icon}</span>
                      <p className="text-on-surface font-semibold text-body-md">{c.area}</p>
                    </div>
                    <p className="text-on-surface-variant text-body-md mt-xs leading-snug">{c.why}</p>
                    <div className="flex flex-wrap gap-xs mt-sm">
                      {c.careers.map((x) => (
                        <span
                          key={x}
                          className="px-md py-1 rounded-full bg-tertiary/15 text-tertiary text-label-sm font-label-sm"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                if (confirm("¿Borrar tu perfil y la conversación guardada?")) {
                  resetProfile();
                  setDrawer(false);
                }
              }}
              className="text-label-sm font-label-sm text-on-surface-variant underline underline-offset-2 opacity-70"
            >
              Reiniciar mi perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
