// ============================================================================
// Configuración de ElevenLabs Conversational AI — Quriuos
//
// Cada experiencia de voz usa un "agent" del dashboard de ElevenLabs.
// Rellenar los agentId reales aquí (o vía variables de entorno NEXT_PUBLIC_*).
// El widget se embebe con el custom element <elevenlabs-convai agent-id="...">
// (el script está cargado en app/layout.tsx).
// ============================================================================

export const ELEVENLABS = {
  // Bloque 1 — Coach personal inspiracional (Álvaro)
  coachAgentId:
    process.env.NEXT_PUBLIC_EL_COACH_AGENT_ID || "REEMPLAZAR_COACH_AGENT_ID",

  // Bloque 3 — Coach vocacional / orientador (Mateo)
  vocationalAgentId:
    process.env.NEXT_PUBLIC_EL_VOCATIONAL_AGENT_ID ||
    "REEMPLAZAR_VOCATIONAL_AGENT_ID",
};
