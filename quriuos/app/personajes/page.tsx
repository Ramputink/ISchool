"use client";
// DUEÑO: Álvaro (Bloque 2 — Conversaciones con personajes).
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import CharacterCard from "@/components/CharacterCard";
import VoiceSession from "@/components/VoiceSession";
import { CHARACTERS, suggestCharacters, type Character } from "@/lib/characters";
import { addChat, loadProfile } from "@/lib/profile";

type CategoryFilter = "todos" | string;

const CATEGORY_LABELS: Record<string, string> = {
  deporte: "Deporte",
  ciencia: "Ciencia",
  tecnología: "Tecnología",
  arte: "Arte",
  música: "Música",
  negocios: "Negocios",
};

export default function PersonajesPage() {
  const [active, setActive] = useState<Character | null>(null);
  const [list, setList] = useState<Character[]>(CHARACTERS);
  const [filter, setFilter] = useState<CategoryFilter>("todos");
  const [hasInterests, setHasInterests] = useState(false);

  // Recalcula la lista al montar y cuando cambia el perfil
  const refreshList = useCallback(() => {
    const profile = loadProfile();
    const suggested = suggestCharacters(profile.interests);
    setList(suggested);
    setHasInterests(profile.interests.length > 0);
  }, []);

  useEffect(() => {
    refreshList();
    window.addEventListener("quriuos:profile-updated", refreshList);
    return () => window.removeEventListener("quriuos:profile-updated", refreshList);
  }, [refreshList]);

  // Personajes filtrados por categoría
  const displayed = filter === "todos"
    ? list
    : list.filter((c) => c.category === filter);

  // Categorías únicas presentes en la lista
  const categories = Array.from(new Set(list.map((c) => c.category)));

  // --- Vista de sesión activa ---
  if (active) {
    return (
      <AppShell live>
        {/* Cabecera con botón "volver" */}
        <div className="px-gutter pt-md pb-xs flex items-center gap-sm">
          <button
            onClick={() => {
              addChat({
                characterId: active.id,
                character: active.name,
                topic: active.category,
                summary: `Conversación con ${active.name}`,
              });
              setActive(null);
            }}
            className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface text-body-md transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm">Volver</span>
          </button>
        </div>

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

  // --- Vista de lista de personajes ---
  return (
    <AppShell>
      <div className="px-gutter py-xl space-y-md">
        {/* Cabecera */}
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
            Habla con un referente
          </h1>
          <p className="text-on-surface-variant text-body-md mt-xs leading-relaxed">
            {hasInterests
              ? "Ordenados según tus intereses. Elige a quién quieres conocer hoy."
              : "Elige a quién quieres conocer hoy. Cuanto más uses el coach, mejor te los sugerimos."}
          </p>
        </div>

        {/* Aviso si no hay intereses guardados */}
        {!hasInterests && (
          <div className="glass-panel rounded-xl p-md flex items-start gap-sm">
            <span className="material-symbols-outlined text-tertiary shrink-0 mt-0.5">
              tips_and_updates
            </span>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              <span className="text-on-surface font-semibold">Tip:</span> Ve al{" "}
              <a href="/coach" className="text-primary underline underline-offset-2">
                Coach
              </a>{" "}
              y elige tus intereses para ver los personajes más afines a ti primero.
            </p>
          </div>
        )}

        {/* Filtros de categoría */}
        {categories.length > 1 && (
          <div className="flex gap-xs overflow-x-auto pb-xs scrollbar-hide -mx-gutter px-gutter">
            <button
              onClick={() => setFilter("todos")}
              className={`shrink-0 px-md py-xs rounded-full text-sm font-semibold transition-all active:scale-90 border ${
                filter === "todos"
                  ? "bg-primary/20 border-primary text-primary"
                  : "glass-panel border-white/10 text-on-surface-variant"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat === filter ? "todos" : cat)}
                className={`shrink-0 px-md py-xs rounded-full text-sm font-semibold transition-all active:scale-90 border ${
                  filter === cat
                    ? "bg-primary/20 border-primary text-primary"
                    : "glass-panel border-white/10 text-on-surface-variant"
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        {/* Contador */}
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
          {displayed.length}{" "}
          {displayed.length === 1 ? "personaje" : "personajes"}
          {filter !== "todos" && ` en ${CATEGORY_LABELS[filter] ?? filter}`}
        </p>

        {/* Lista de tarjetas */}
        <div className="space-y-md">
          {displayed.length > 0 ? (
            displayed.map((c, idx) => (
              <div
                key={c.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <CharacterCard character={c} onSelect={setActive} />
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-xl p-lg text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-sm opacity-40">
                search_off
              </span>
              <p className="text-body-md">
                No hay personajes en esta categoría todavía.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
