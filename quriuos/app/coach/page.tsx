"use client";
// DUEÑO: Álvaro (Bloque 1 — Coach personal inspiracional).
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import VoiceSession, { type Speaker } from "@/components/VoiceSession";
import { ELEVENLABS } from "@/lib/elevenlabs";
import { addInterest, removeInterest, setName, loadProfile } from "@/lib/profile";
import type { InterestCategory } from "@/lib/profile";
import { CHARACTERS } from "@/lib/characters";

// Chips de intereses rápidos para alimentar el perfil aunque la voz no esté lista
const INTEREST_CHIPS: { label: string; topic: string; category: InterestCategory; emoji: string }[] = [
  { label: "Deporte", topic: "deporte", category: "deporte", emoji: "⚽" },
  { label: "Música", topic: "música", category: "música", emoji: "🎵" },
  { label: "Tecnología", topic: "tecnología", category: "tecnología", emoji: "💻" },
  { label: "Ciencia", topic: "ciencia", category: "ciencia", emoji: "🔬" },
  { label: "Arte", topic: "arte", category: "arte", emoji: "🎨" },
  { label: "Negocios", topic: "negocios", category: "negocios", emoji: "💼" },
  { label: "Lectura", topic: "lectura", category: "lectura", emoji: "📚" },
  { label: "Videojuegos", topic: "videojuegos", category: "tecnología", emoji: "🎮" },
  { label: "Fútbol", topic: "fútbol", category: "deporte", emoji: "🏆" },
  { label: "Astronomía", topic: "astronomía", category: "ciencia", emoji: "🌌" },
  { label: "Emprender", topic: "emprender", category: "negocios", emoji: "🚀" },
  { label: "Creatividad", topic: "creatividad", category: "arte", emoji: "✨" },
];

// Avatar del guía Quriuos y del orientador (mismos que en sus páginas).
const GUIDE_AVATAR =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop";
const ORIENTADOR_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop";

// Alias por personaje para detectar la transferencia desde lo que dice el agente.
const ALIASES: Record<string, string[]> = {
  hawking: ["hawking", "stephen"],
  jobs: ["steve jobs", "jobs"],
  musk: ["elon", "musk"],
  cr7: ["cristiano", "ronaldo", "cr7"],
  messi: ["messi", "lionel", "leo messi"],
  taylor: ["taylor", "swift"],
  ibai: ["ibai"],
};

// Hablantes posibles en la conversación única (orquestador + referentes + orientador).
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

export default function CoachPage() {
  // Inicializa vacío y carga el perfil en useEffect para evitar mismatch de hidratación.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    setSelected(new Set(profile.interests.map((i) => i.topic)));
    setNameInput(profile.name || "");
  }, []);

  const toggleChip = (chip: (typeof INTEREST_CHIPS)[number]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(chip.topic)) {
        next.delete(chip.topic);
        // Deseleccionar también elimina el interés del perfil.
        removeInterest(chip.topic);
      } else {
        next.add(chip.topic);
        // Guarda inmediatamente en el perfil
        addInterest({
          topic: chip.topic,
          category: chip.category,
          strength: 3,
          source: "coach",
        });
      }
      return next;
    });
    setSaved(false);
  };

  const handleSaveInterests = () => {
    // Persiste todos los seleccionados (addInterest es idempotente)
    INTEREST_CHIPS.filter((c) => selected.has(c.topic)).forEach((c) => {
      addInterest({ topic: c.topic, category: c.category, strength: 4, source: "coach" });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <AppShell live>
      {/* Cabecera de sección */}
      <div className="px-gutter pt-xl pb-md">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
          Habla con Quriuos
        </h1>
        <p className="text-on-surface-variant text-body-md mt-xs leading-relaxed">
          Una sola conversación. Cuéntale qué te gusta y, según de lo que hables,
          se irán uniendo referentes que te inspiran — y al final, tu orientación
          de futuro. Todo con tu voz.
        </p>
      </div>

      {/* Input de nombre */}
      <div className="px-gutter mb-md">
        <div className="glass-panel rounded-xl p-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">badge</span>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => { setNameInput(e.target.value); setNameSaved(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            placeholder="¿Cómo te llamas?"
            className="flex-1 bg-transparent text-on-surface text-body-md outline-none placeholder:text-on-surface-variant"
          />
          {nameInput.trim() && (
            <button
              onClick={handleSaveName}
              className="text-label-sm font-label-sm uppercase tracking-wide text-primary px-sm py-xs rounded-lg hover:bg-primary/10 transition-colors active:scale-95"
            >
              {nameSaved ? "✓ Guardado" : "Guardar"}
            </button>
          )}
        </div>
      </div>

      {/* Sesión de voz unificada — el orquestador Quriuos */}
      <VoiceSession
        agentId={ELEVENLABS.coachAgentId}
        name="Quriuos"
        title="Tu guía · los referentes se unen solos"
        avatar={GUIDE_AVATAR}
        quote="¡Hola! Cuéntame, ¿qué es eso que harías durante horas sin aburrirte?"
        accent="#c0c1ff"
        speakers={SPEAKERS}
        dynamicVariables={{
          student_name: nameInput.trim() || "estudiante",
          interests: Array.from(selected).join(", ") || "aún sin definir",
        }}
      />

      {/* Referentes que pueden unirse a la charla */}
      <div className="px-gutter pt-md">
        <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant mb-sm text-center">
          Pueden unirse según de lo que hables
        </p>
        <div className="flex gap-sm overflow-x-auto scrollbar-hide justify-center pb-xs">
          {CHARACTERS.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-2 opacity-70"
                style={{ borderColor: `${c.accent}66` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover grayscale" />
              </div>
              <span className="text-[10px] text-on-surface-variant text-center leading-tight truncate w-full">
                {c.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div className="px-gutter">
        <div className="border-t border-white/10 my-md" />
        <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant mb-md">
          También puedes elegir aquí tus intereses
        </p>
      </div>

      {/* Grid de chips de intereses */}
      <div className="px-gutter pb-xl">
        <div className="flex flex-wrap gap-sm">
          {INTEREST_CHIPS.map((chip) => {
            const active = selected.has(chip.topic);
            return (
              <button
                key={chip.topic}
                onClick={() => toggleChip(chip)}
                className={`flex items-center gap-xs px-md py-sm rounded-full text-body-md font-semibold transition-all duration-200 active:scale-90 border ${
                  active
                    ? "bg-primary/20 border-primary text-primary"
                    : "glass-panel border-white/10 text-on-surface-variant hover:border-white/20 hover:text-on-surface"
                }`}
              >
                <span className="text-base leading-none">{chip.emoji}</span>
                <span className="text-sm">{chip.label}</span>
                {active && (
                  <span className="material-symbols-outlined text-sm leading-none">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón guardar selección */}
        {selected.size > 0 && (
          <button
            onClick={handleSaveInterests}
            className={`mt-lg w-full flex items-center justify-center gap-sm py-md rounded-xl font-headline-md text-body-md font-bold transition-all duration-300 active:scale-95 ${
              saved
                ? "bg-secondary/20 text-secondary border border-secondary/30"
                : "bg-primary-container text-on-primary-container"
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {saved ? "check_circle" : "save"}
            </span>
            <span>
              {saved
                ? `¡Guardados! (${selected.size} intereses)`
                : `Guardar mis intereses (${selected.size})`}
            </span>
          </button>
        )}

        {selected.size === 0 && (
          <p className="text-on-surface-variant text-label-sm text-center mt-md opacity-60">
            Toca los chips que te representen
          </p>
        )}
      </div>
    </AppShell>
  );
}
