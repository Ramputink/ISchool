// Endpoint de servidor que genera un "conversation token" de ElevenLabs (WebRTC).
// Usa la API key SOLO en el servidor → los agentes pueden ser privados y la key
// nunca llega al navegador.
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "Falta agentId" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Servidor sin ELEVENLABS_API_KEY configurada" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey }, cache: "no-store" },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "No se pudo obtener el token de ElevenLabs" },
      { status: 502 },
    );
  }

  const data = await res.json();
  return NextResponse.json({ token: data.token });
}
