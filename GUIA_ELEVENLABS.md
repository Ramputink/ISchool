# Guía de integración ElevenLabs — Quriuos

Esta guía explica cómo crear los **agentes conversacionales** en ElevenLabs y
conectarlos con la app. La app ya está integrada con el SDK `@elevenlabs/react`
(`useConversation`): el visualizador reacciona a la voz real, la transcripción
sale de eventos reales y los controles mute/terminar funcionan de verdad.

> **Tú ya tienes las VOCES clonadas.** Lo que falta es crear un **Agente** por
> cada personalidad, asignarle su voz y su prompt, y copiar su `agent-id` a
> `.env.local`. Los prompts listos para pegar están en la carpeta `agentes/`.

---

## 1. Crear cada agente (paso a paso)

Para cada uno de los **9 agentes** (Coach, Orientador y 7 personajes):

1. Dashboard de ElevenLabs → **Conversational AI → Agents → + New agent** (empieza en blanco).
2. **System prompt**: pega el contenido de la sección *System prompt* del archivo
   correspondiente en `agentes/` (p.ej. `agentes/hawking.md`).
3. **First message**: pega la sección *First message* del mismo archivo.
4. **Voice**: selecciona el **clon de voz** que ya tienes para ese personaje.
5. **Language**: Español (o "auto").
6. **LLM**: un modelo rápido para voz (p.ej. GPT-4o mini o Gemini Flash).
7. **Guarda** y copia el **Agent ID** (aparece en la cabecera del agente,
   formato `agent_xxxxxxxxxxxxxxxxxxxx`).

---

## 2. Acceso público (importante para que funcione sin backend)

La app conecta desde el navegador usando solo el `agent-id`. Para que esto
funcione **sin** montar un servidor de tokens:

- En cada agente → **Security / Advanced** → activa el acceso
  **público / no autenticado** ("Enable authentication" = **OFF**, o
  "Allow public access").
- Si hay **allowlist de dominios**, añade `http://localhost:3000` (desarrollo) y
  tu dominio de despliegue.

> Si prefieres mantener los agentes **privados**, hay que generar un
> *conversation token* / *signed URL* en un backend con tu API key y pasarlo a
> `startSession({ conversationToken })`. Para el hackathon, **público es más rápido**.

---

## 3. Conectar los agent-id con la app

1. Copia el archivo de ejemplo:
   ```bash
   cd quriuos
   cp .env.local.example .env.local
   ```
2. Pega cada `agent-id` en su variable:

   | Agente | Variable en `.env.local` | Voz a asignar | Prompt |
   |---|---|---|---|
   | Coach personal | `NEXT_PUBLIC_EL_COACH_AGENT_ID` | voz cálida/motivadora | `agentes/coach.md` |
   | Orientador vocacional | `NEXT_PUBLIC_EL_VOCATIONAL_AGENT_ID` | voz serena/confiable | `agentes/orientador.md` |
   | Stephen Hawking | `NEXT_PUBLIC_EL_HAWKING_AGENT_ID` | clon Hawking | `agentes/hawking.md` |
   | Steve Jobs | `NEXT_PUBLIC_EL_JOBS_AGENT_ID` | clon Jobs | `agentes/jobs.md` |
   | Elon Musk | `NEXT_PUBLIC_EL_MUSK_AGENT_ID` | clon Musk | `agentes/musk.md` |
   | Cristiano Ronaldo | `NEXT_PUBLIC_EL_CR7_AGENT_ID` | clon CR7 | `agentes/cr7.md` |
   | Lionel Messi | `NEXT_PUBLIC_EL_MESSI_AGENT_ID` | clon Messi | `agentes/messi.md` |
   | Taylor Swift | `NEXT_PUBLIC_EL_TAYLOR_AGENT_ID` | clon Taylor | `agentes/taylor.md` |
   | Ibai Llanos | `NEXT_PUBLIC_EL_IBAI_AGENT_ID` | clon Ibai | `agentes/ibai.md` |

3. **Reinicia** el servidor (las variables `NEXT_PUBLIC_` se leen al arrancar):
   ```bash
   npm run dev
   ```

---

## 4. Variables dinámicas (contexto del estudiante)

La app envía contexto en cada sesión vía `dynamicVariables`. Los prompts ya las
usan con la sintaxis `{{variable}}` — ElevenLabs las detecta automáticamente, no
hay que configurarlas aparte.

| Variable | Dónde se usa | Contenido |
|---|---|---|
| `{{student_name}}` | todos | nombre del estudiante |
| `{{interests}}` | todos | lista de intereses detectados |
| `{{character}}` | personajes | nombre del personaje activo |
| `{{characters_talked}}` | orientador | referentes con los que ya habló |
| `{{suggested_areas}}` | orientador | áreas de carrera sugeridas por la app |

> Si una variable no existe en el prompt de tu agente, ElevenLabs simplemente la
> ignora. Puedes referenciar solo las que quieras.

---

## 5. Presupuesto de créditos (~130k)

- Conversational AI consume créditos **por minuto** de conversación.
- **Prueba primero en modo texto** dentro del dashboard (no gasta voz) para
  afinar cada prompt.
- Reparte ~30k por dev para desarrollo y **deja ~40k de reserva para la demo**.
- Corta la sesión (`Terminar sesión`) al acabar cada prueba; no la dejes abierta.

---

## 6. Comprobación rápida

1. Con al menos el agente **Coach** configurado, abre `/coach`.
2. Pulsa **Empezar a hablar** → acepta el permiso de micrófono.
3. Deberías ver "Conectando…" → "Escuchando…/Hablando…", el visualizador
   moviéndose con la voz real y la transcripción apareciendo.
4. Si ves el aviso *"Falta el agent-id"*, revisa `.env.local` y reinicia.
5. Si falla la conexión, revisa que el agente sea **público** y que el dominio
   esté en la allowlist.
