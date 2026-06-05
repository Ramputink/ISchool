"use client";
// DUEÑO: Fernando (diseño). Resumen del perfil evolutivo (chips de intereses + chats).
import { useEffect, useState } from "react";
import { loadProfile, type StudentProfile } from "@/lib/profile";

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

  if (!profile) return null;

  return (
    <div className="glass-panel rounded-xl p-md space-y-md">
      <div>
        <p className="text-label-sm font-label-sm uppercase text-on-surface-variant">
          Intereses detectados
        </p>
        <div className="flex flex-wrap gap-xs mt-sm">
          {profile.interests.length ? (
            profile.interests.map((i) => (
              <span
                key={i.topic}
                className="px-md py-1 rounded-full bg-primary/15 text-primary text-label-sm font-label-sm"
              >
                {i.topic}
              </span>
            ))
          ) : (
            <span className="text-on-surface-variant text-body-md">
              Aún ninguno — habla con el coach primero.
            </span>
          )}
        </div>
      </div>

      {profile.chats.length > 0 && (
        <div>
          <p className="text-label-sm font-label-sm uppercase text-on-surface-variant">
            Conversaciones
          </p>
          <div className="flex flex-wrap gap-xs mt-sm">
            {profile.chats.map((c, idx) => (
              <span
                key={`${c.characterId}-${idx}`}
                className="px-md py-1 rounded-full bg-secondary/15 text-secondary text-label-sm font-label-sm"
              >
                {c.character}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
