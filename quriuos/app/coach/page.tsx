"use client";
// DUEÑO: Álvaro (Bloque 1 — Coach personal inspiracional).
import { useState } from "react";
import AppShell from "@/components/AppShell";
import VoiceSession from "@/components/VoiceSession";
import { ELEVENLABS } from "@/lib/elevenlabs";
import { addInterest, setName, loadProfile } from "@/lib/profile";
import type { InterestCategory } from "@/lib/profile";

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

export default function CoachPage() {
  const [selected, setSelected] = useState<Set<string>>(() => {
    // Pre-selecciona los intereses ya guardados en perfil
    if (typeof window === "undefined") return new Set();
    const profile = loadProfile();
    return new Set(profile.interests.map((i) => i.topic));
  });
  const [saved, setSaved] = useState(false);
  const [nameInput, setNameInput] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return loadProfile().name || "";
  });
  const [nameSaved, setNameSaved] = useState(false);

  const toggleChip = (chip: (typeof INTEREST_CHIPS)[number]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(chip.topic)) {
        next.delete(chip.topic);
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
          Tu coach personal
        </h1>
        <p className="text-on-surface-variant text-body-md mt-xs leading-relaxed">
          Habla con tu coach de voz y cuéntale qué te gusta. También puedes
          elegir tus intereses aquí abajo para que te sugeramos los mejores
          referentes.
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

      {/* Sesión de voz con el coach */}
      <VoiceSession
        agentId={ELEVENLABS.coachAgentId}
        name="Tu Coach"
        title="Coach personal · Quriuos"
        avatar="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop"
        quote="Hola, cuéntame: ¿qué te gusta hacer cuando no estás en clase?"
        accent="#c0c1ff"
      />

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
