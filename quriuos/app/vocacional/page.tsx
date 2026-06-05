"use client";
// DUEÑO: Mateo (Bloque 3 — Coach vocacional / orientación profesional).
import AppShell from "@/components/AppShell";
import ProfileSummary from "@/components/ProfileSummary";
import VoiceSession from "@/components/VoiceSession";
import { ELEVENLABS } from "@/lib/elevenlabs";

export default function VocacionalPage() {
  return (
    <AppShell live>
      <div className="px-gutter py-xl space-y-md">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
          Tu perfil evolutivo
        </h1>
        <ProfileSummary />
      </div>
      <VoiceSession
        agentId={ELEVENLABS.vocationalAgentId}
        name="Orientador"
        title="Coach vocacional · Quriuos"
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop"
        quote="Con lo que hemos hablado, exploremos qué caminos encajan contigo."
        accent="#ffb783"
      />
    </AppShell>
  );
}
