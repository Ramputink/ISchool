"use client";
// DUEÑO: Álvaro (Bloque 2 — Conversaciones con personajes).
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import CharacterCard from "@/components/CharacterCard";
import VoiceSession from "@/components/VoiceSession";
import { CHARACTERS, suggestCharacters, type Character } from "@/lib/characters";
import { addChat, loadProfile } from "@/lib/profile";

export default function PersonajesPage() {
  const [active, setActive] = useState<Character | null>(null);
  const [list, setList] = useState<Character[]>(CHARACTERS);

  useEffect(() => {
    setList(suggestCharacters(loadProfile().interests));
  }, []);

  if (active) {
    return (
      <AppShell live>
        <VoiceSession
          agentId={active.agentId}
          name={active.name}
          title={active.title}
          avatar={active.avatar}
          quote={active.quote}
          accent={active.accent}
          onEnd={() => {
            addChat({
              characterId: active.id,
              character: active.name,
              topic: active.category,
              summary: `Conversación con ${active.name}`,
            });
            setActive(null);
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-gutter py-xl space-y-md">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
          Habla con un referente
        </h1>
        <p className="text-on-surface-variant text-body-md">
          Elegidos según tus intereses.
        </p>
        <div className="space-y-md mt-md">
          {list.map((c) => (
            <CharacterCard key={c.id} character={c} onSelect={setActive} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
