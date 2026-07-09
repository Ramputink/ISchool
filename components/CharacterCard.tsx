"use client";
// DUEÑO: Fernando (diseño). Tarjeta de personaje para el Bloque 2.
import type { Character } from "@/lib/characters";

// Mapa de categoría → chip de color
const CATEGORY_CHIP: Record<string, { label: string; cls: string }> = {
  ciencia:    { label: "Ciencia",    cls: "chip chip-secondary" },
  tecnología: { label: "Tecnología", cls: "chip chip-primary"   },
  deporte:    { label: "Deporte",    cls: "chip chip-tertiary"  },
  música:     { label: "Música",     cls: "chip chip-tertiary"  },
  arte:       { label: "Arte",       cls: "chip chip-secondary" },
  negocios:   { label: "Negocios",   cls: "chip chip-primary"   },
  lectura:    { label: "Lectura",    cls: "chip chip-secondary" },
  otro:       { label: "Otro",       cls: "chip chip-primary"   },
};

export default function CharacterCard({
  character,
  onSelect,
}: {
  character: Character;
  onSelect?: (c: Character) => void;
}) {
  const chip = CATEGORY_CHIP[character.category] ?? { label: character.category, cls: "chip chip-primary" };

  return (
    <button
      onClick={() => onSelect?.(character)}
      className={[
        "group relative glass-panel rounded-2xl p-md",
        "flex items-center gap-md w-full text-left",
        "transition-all duration-200",
        "hover:border-white/20 active:scale-[0.98]",
        "focus-visible:outline-2 focus-visible:outline-primary",
      ].join(" ")}
      style={{
        // Glow lateral con el color de acento del personaje al hover
        "--hover-glow": `${character.accent}33`,
      } as React.CSSProperties}
    >
      {/* Glow de acento en el borde izquierdo */}
      <span
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: character.accent }}
        aria-hidden
      />

      {/* Avatar circular con glow-avatar */}
      <div className="relative shrink-0">
        {/* Halo de glow detrás del avatar */}
        <span
          className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: character.accent }}
          aria-hidden
        />
        <div
          className="relative w-[68px] h-[68px] rounded-full overflow-hidden glow-avatar"
          style={{
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: `${character.accent}55`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
        </div>
      </div>

      {/* Texto */}
      <div className="min-w-0 flex-1 space-y-[5px]">
        {/* Fila: nombre + chip de categoría */}
        <div className="flex items-center gap-sm flex-wrap">
          <p className="text-on-surface font-semibold text-body-md leading-tight truncate">
            {character.name}
          </p>
          <span className={chip.cls}>{chip.label}</span>
        </div>

        {/* Título / rol */}
        <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest leading-none">
          {character.title}
        </p>

        {/* Tagline */}
        <p className="text-on-surface-variant text-[13px] leading-snug line-clamp-2 mt-[2px]">
          {character.tagline}
        </p>
      </div>

      {/* Chevron de acción */}
      <span
        className="material-symbols-outlined shrink-0 text-on-surface-variant opacity-30 group-hover:opacity-80 transition-all duration-200 group-hover:translate-x-0.5"
        style={{ fontSize: "18px" }}
        aria-hidden
      >
        chevron_right
      </span>
    </button>
  );
}
