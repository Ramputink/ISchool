# Demo — MVP tutor de mates (Nuri)

Demo visual **autocontenida** del MVP del neuro-tutor de SpaceForEdu, en formato
**videollamada**: la tutora IA *Luna* aparece en vídeo (avatar 2D animado) y
**explica en voz alta**, sobre una pizarra animada, cómo sumar `2/3 + 1/4` paso a
paso — guiando a la alumna sin darle la respuesta ("enseña, no resuelve").

## `mates-mvp.html`
Un único fichero HTML sin dependencias ni llamadas externas (apto para publicar
como Artifact / abrir en cualquier navegador). Incluye:
- UI de videollamada (tutora en PiP, self-view, subtítulos, controles).
- Pizarra con **fracciones tipografiadas** y stepper de 3 pasos.
- **Voz real de ElevenLabs** de Luna, incrustada como data-URIs MP3, con
  **lip-sync por análisis de audio** (Web Audio `AnalyserNode` mueve la boca con
  la amplitud real). Respaldo: `speechSynthesis` del navegador.

Ábrelo, sube el volumen y pulsa **"Unirme a la videollamada"**.

## `gen-audio.mjs`
Regenera la voz de Luna vía la API de ElevenLabs (voz *Sarah*, modelo
`eleven_multilingual_v2`). Lee la API key de `../.env.local` (no versionada).

```bash
cd quriuos/demo-mates
node gen-audio.mjs        # → luna-audio.json (array de data-URIs)
# luego sustituye el marcador /*__AUDIO_DATA__*/[] del HTML por su contenido
```

> Nota: la voz es femenina multilingüe (no nativa de español) porque la cuenta no
> tiene un clon femenino en español. Para producción se usaría la voz clonada del
> tutor + avatar generativo en tiempo real (~$0.10/min).
