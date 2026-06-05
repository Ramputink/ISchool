"use client";
// DUEÑO: Álvaro (Bloque 1 — Coach personal inspiracional).
import AppShell from "@/components/AppShell";
import VoiceSession from "@/components/VoiceSession";
import { ELEVENLABS } from "@/lib/elevenlabs";

export default function CoachPage() {
  return (
    <AppShell live>
      <VoiceSession
        agentId={ELEVENLABS.coachAgentId}
        name="Tu Coach"
        title="Coach personal · Quriuos"
        avatar="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop"
        quote="Hola, cuéntame: ¿qué te gusta hacer cuando no estás en clase?"
        accent="#c0c1ff"
      />
    </AppShell>
  );
}
