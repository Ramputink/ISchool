"use client";
// DUEÑO: Fernando (diseño). Tarjeta de personaje para el Bloque 2.
import type { Character } from "@/lib/characters";

export default function CharacterCard({
  character,
  onSelect,
}: {
  character: Character;
  onSelect?: (c: Character) => void;
}) {
  return (
    <button
      onClick={() => onSelect?.(character)}
      className="group glass-panel rounded-xl p-md flex items-center gap-md w-full text-left hover:scale-[0.99] transition-all active:scale-95"
    >
      <div
        className="w-16 h-16 rounded-full overflow-hidden border-2 shrink-0"
        style={{ borderColor: character.accent }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.avatar}
          alt={character.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
        />
      </div>
      <div className="min-w-0">
        <p className="text-on-surface font-headline-md text-body-md font-semibold truncate">
          {character.name}
        </p>
        <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wide">
          {character.title}
        </p>
        <p className="text-on-surface-variant text-body-md mt-1 line-clamp-2">
          {character.tagline}
        </p>
      </div>
    </button>
  );
}
