// ============================================================================
// Genera la voz de Luna (ElevenLabs) para la demo mates-mvp.html y la deja lista
// para embeber como data-URIs. Lee la API key de ../.env.local (no versionada).
//
//   node gen-audio.mjs            # escribe luna-audio.json (array de data-URIs)
//
// El HTML de la demo lleva un marcador `/*__AUDIO_DATA__*/[]`; sustitúyelo por el
// contenido de luna-audio.json para incrustar el audio. No contiene secretos.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(__dirname, "..", ".env.local");
const KEY = fs.readFileSync(ENV, "utf8").split("\n")
  .find((l) => l.startsWith("ELEVENLABS_API_KEY="))?.split("=")[1].trim();

const VOICE = "EXAVITQu4vr4xnSDxMaL"; // Sarah — cálida, multilingüe (no hay clon es femenino en la cuenta)
const MODEL = "eleven_multilingual_v2";

// Mismas frases que las escenas de mates-mvp.html (mantener sincronizadas).
const LINES = [
  "¡Hola Sofía! Soy Luna. Vamos a sumar dos fracciones juntas. Mira la pizarra.",
  "Para poder sumarlas, las dos necesitan el mismo número de abajo, el denominador. ¿Qué número te vale a la vez para el 3 y para el 4?",
  "Eso es: el doce. Es el menor número en el que caben tanto el 3 como el 4.",
  "Convertimos dos tercios a doceavos: multiplicamos arriba y abajo por cuatro. Dos por cuatro, ocho; tres por cuatro, doce.",
  "Y un cuarto lo multiplicamos por tres. Uno por tres, tres; cuatro por tres, doce. Ya están iguales.",
  "Ahora que las dos tienen doce abajo, sumamos solo los de arriba: ocho más tres, once. Y el doce se queda igual.",
  "Once doceavos. ¿Y ves por qué el de abajo no se suma? Porque solo dice en cuántas partes partimos, no cambia.",
  "¡Y lo has seguido tú sola, Sofía! Fracciones desbloqueadas. La próxima te toca a ti llevarme.",
];

if (!KEY || KEY.startsWith("sk_REEMPLAZAR")) {
  console.error("Falta ELEVENLABS_API_KEY en ../.env.local");
  process.exit(1);
}

const out = [];
for (let i = 0; i < LINES.length; i++) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({
        text: LINES[i],
        model_id: MODEL,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
      }),
    },
  );
  if (!res.ok) {
    console.error(`✗ línea ${i}: HTTP ${res.status} — ${await res.text()}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  out.push("data:audio/mpeg;base64," + buf.toString("base64"));
  console.error(`✓ línea ${i} (${LINES[i].length} chars → ${(buf.length / 1024).toFixed(0)} KB)`);
}

fs.writeFileSync(path.join(__dirname, "luna-audio.json"), JSON.stringify(out));
console.error(`\nListo → luna-audio.json (${out.length} clips). Pega su contenido en el marcador del HTML.`);
