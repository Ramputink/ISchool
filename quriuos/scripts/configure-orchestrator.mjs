// ============================================================================
// Convierte el agente Coach en el ORQUESTADOR "Quriuos" y configura la
// transferencia automática de agentes (transfer_to_agent) hacia los personajes
// y el orientador, según el tipo de tema. También configura la transferencia de
// vuelta de cada personaje/orientador al orquestador para que el flujo continúe.
//
//   node scripts/configure-orchestrator.mjs
//
// Lee agent-ids + ELEVENLABS_API_KEY de .env.local. No contiene secretos.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const AGENTS_DIR = path.join(ROOT, "agentes");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function block(md, heading) {
  const re = new RegExp("## " + heading + "\\s*```[a-z]*\\n([\\s\\S]*?)```");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

const env = loadEnv();
const API = env.ELEVENLABS_API_KEY;
const ORCH = env.NEXT_PUBLIC_EL_COACH_AGENT_ID;

// Reglas de transferencia del orquestador → cada destino, por TIPO de tema.
const TRANSFERS = [
  { id: env.NEXT_PUBLIC_EL_HAWKING_AGENT_ID, condition: "El estudiante muestra interés por la ciencia, la física, el espacio, el universo o por preguntarse el porqué de las cosas." },
  { id: env.NEXT_PUBLIC_EL_JOBS_AGENT_ID,    condition: "El estudiante habla de tecnología, diseño, crear productos, Apple o de 'pensar diferente'." },
  { id: env.NEXT_PUBLIC_EL_MUSK_AGENT_ID,    condition: "El estudiante habla de ingeniería, cohetes, coches, inteligencia artificial o grandes retos del mundo." },
  { id: env.NEXT_PUBLIC_EL_CR7_AGENT_ID,     condition: "El estudiante habla de fútbol o deporte desde la disciplina, el esfuerzo y la mentalidad ganadora, o menciona a Cristiano Ronaldo." },
  { id: env.NEXT_PUBLIC_EL_MESSI_AGENT_ID,   condition: "El estudiante habla de fútbol o deporte desde el talento, la humildad y disfrutar del juego, o menciona a Messi." },
  { id: env.NEXT_PUBLIC_EL_TAYLOR_AGENT_ID,  condition: "El estudiante habla de música, componer, escribir canciones o expresar emociones a través del arte." },
  { id: env.NEXT_PUBLIC_EL_IBAI_AGENT_ID,    condition: "El estudiante habla de contenido digital, streaming, videojuegos, comunicación o construir comunidad." },
  { id: env.NEXT_PUBLIC_EL_VOCATIONAL_AGENT_ID, condition: "El estudiante ya ha explorado varios intereses y conviene hablar de su futuro académico o profesional, carreras o universidades." },
];

const backCondition =
  "El estudiante quiere cambiar de tema, hablar de otra cosa, seguir explorando o terminar esta charla concreta.";

function transferTool(transfers) {
  return {
    name: "transfer_to_agent",
    description: "Transfiere la conversación al agente más adecuado según el tema.",
    response_timeout_secs: 20,
    type: "system",
    params: {
      system_tool_type: "transfer_to_agent",
      transfers: transfers.map((t) => ({
        agent_id: t.id,
        condition: t.condition,
        delay_ms: 0,
        enable_transferred_agent_first_message: true,
      })),
    },
  };
}

async function patchAgent(agentId, prompt, transfers, firstMessage) {
  const agentPrompt = { built_in_tools: { transfer_to_agent: transferTool(transfers) } };
  if (prompt) agentPrompt.prompt = prompt;
  const agent = { prompt: agentPrompt };
  if (firstMessage) agent.first_message = firstMessage;
  const body = { conversation_config: { agent } };

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: { "xi-api-key": API, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${await res.text()}`);
  return res.json();
}

(async () => {
  if (!API || !ORCH) {
    console.error("Falta ELEVENLABS_API_KEY o NEXT_PUBLIC_EL_COACH_AGENT_ID en .env.local");
    process.exit(1);
  }

  // 1) Orquestador: nuevo prompt + transferencias hacia todos los destinos.
  const md = fs.readFileSync(path.join(AGENTS_DIR, "orquestador.md"), "utf8");
  const orchPrompt = block(md, "System prompt");
  const orchFirst = block(md, "First message");
  try {
    await patchAgent(ORCH, orchPrompt, TRANSFERS.filter((t) => t.id), orchFirst);
    console.log(`✓ Orquestador configurado (${TRANSFERS.filter((t) => t.id).length} transferencias)`);
  } catch (e) {
    console.error(`✗ Orquestador — ${e.message}`);
    process.exit(1);
  }

  // 2) Cada destino: transferencia de vuelta al orquestador (no tocamos su prompt).
  for (const t of TRANSFERS) {
    if (!t.id || t.id.startsWith("REEMPLAZAR")) continue;
    try {
      await patchAgent(t.id, null, [{ id: ORCH, condition: backCondition }]);
      console.log(`✓ Transferencia de vuelta configurada → ${t.id}`);
    } catch (e) {
      console.error(`✗ ${t.id} — ${e.message}`);
    }
  }

  console.log("\nListo. La conversación arranca en el orquestador (agente Coach) y fluye sola.");
})();
