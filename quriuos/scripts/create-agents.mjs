// ============================================================================
// Crea los 9 agentes conversacionales de Quriuos en ElevenLabs vía API.
// Lee los prompts de ../agentes/*.md y la API key de ../.env.local.
// Vuelca los agent-id resultantes en ../.env.local.
//
//   node scripts/create-agents.mjs
//
// Requiere ELEVENLABS_API_KEY en .env.local. No contiene secretos.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const AGENTS_DIR = path.join(ROOT, "agentes");

// --- Cargar .env.local ---
function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

// --- Extraer un bloque ``` tras un encabezado markdown ---
function block(md, heading) {
  const re = new RegExp("## " + heading + "\\s*```[a-z]*\\n([\\s\\S]*?)```");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

// --- Definición de los 9 agentes (suffix env, archivo, voz) ---
const AGENTS = [
  { suffix: "COACH",      name: "Quriuos · Coach personal",       file: "coach.md",      voiceId: "g6MJVcMkaIuw2MQBwlTr" }, // marcos (clon)
  { suffix: "VOCATIONAL", name: "Quriuos · Orientador vocacional", file: "orientador.md", voiceId: "cjVigY5qzO86Huf0OWal" }, // Eric (premade)
  { suffix: "HAWKING",    name: "Quriuos · Stephen Hawking",       file: "hawking.md",    voiceId: "oHDe4pYJRLswDTm7RiiQ" },
  { suffix: "JOBS",       name: "Quriuos · Steve Jobs",            file: "jobs.md",       voiceId: "OWMqXuGyjHBrKc6iGQpi" },
  { suffix: "MUSK",       name: "Quriuos · Elon Musk",             file: "musk.md",       voiceId: "my8sTPdnoAxxMuiklZno" },
  { suffix: "CR7",        name: "Quriuos · Cristiano Ronaldo",     file: "cr7.md",        voiceId: "Uaeen6NAQ8oXibpsMpmY" },
  { suffix: "MESSI",      name: "Quriuos · Lionel Messi",          file: "messi.md",      voiceId: "0fEmFuPmngsZz4AlRZnI" },
  { suffix: "TAYLOR",     name: "Quriuos · Taylor Swift",          file: "taylor.md",     voiceId: "IzYdpQcwMQvnEzPMU7Dy" },
  { suffix: "IBAI",       name: "Quriuos · Ibai Llanos",           file: "ibai.md",       voiceId: "8XnOhsTuazSovND7JYo0" },
];

async function createAgent(apiKey, a) {
  const md = fs.readFileSync(path.join(AGENTS_DIR, a.file), "utf8");
  const prompt = block(md, "System prompt");
  const firstMessage = block(md, "First message");
  if (!prompt) throw new Error(`No se pudo extraer el system prompt de ${a.file}`);

  const body = {
    name: a.name,
    conversation_config: {
      agent: {
        prompt: { prompt },
        first_message: firstMessage,
        language: "es",
      },
      // Español requiere turbo/flash v2_5. Flash = rápido y económico (ahorra créditos).
      tts: { voice_id: a.voiceId, model_id: "eleven_flash_v2_5" },
    },
  };

  const res = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${await res.text()}`);
  }
  const json = await res.json();
  return json.agent_id;
}

function updateEnv(results) {
  let env = fs.readFileSync(ENV_PATH, "utf8");
  for (const { suffix, agentId } of results) {
    const varName = `NEXT_PUBLIC_EL_${suffix}_AGENT_ID`;
    env = env.replace(new RegExp(`${varName}=.*`), `${varName}=${agentId}`);
  }
  fs.writeFileSync(ENV_PATH, env);
}

(async () => {
  const env = loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.startsWith("sk_REEMPLAZAR")) {
    console.error("Falta ELEVENLABS_API_KEY en .env.local");
    process.exit(1);
  }

  const results = [];
  for (const a of AGENTS) {
    try {
      const agentId = await createAgent(apiKey, a);
      results.push({ suffix: a.suffix, agentId });
      console.log(`✓ ${a.name.padEnd(34)} → ${agentId}`);
    } catch (e) {
      console.error(`✗ ${a.name} — ${e.message}`);
    }
  }

  if (results.length) {
    updateEnv(results);
    console.log(`\nActualizado .env.local con ${results.length}/${AGENTS.length} agent-id.`);
  }
})();
