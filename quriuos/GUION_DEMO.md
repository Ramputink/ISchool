# 🎤 Guion de demo — Quriuos (MVP)

Duración objetivo: **3–4 minutos**. Es un **chatbot de voz único**: el estudiante
habla y, según el tipo de pregunta, la conversación **cambia sola** al referente
adecuado (con su voz) y, al final, al orientador vocacional. Todo queda guardado
en memoria.

---

## 0. Antes de empezar (checklist)

- [ ] `cd quriuos && npm run dev` y abrir `http://localhost:3000`.
- [ ] `.env.local` con `ELEVENLABS_API_KEY` + los 9 `agent-id` (ya configurados).
- [ ] Micrófono permitido en el navegador. Auriculares (evita acoples).
- [ ] Conexión a internet estable.
- [ ] (Opcional) Pulsa **Mi futuro → Reiniciar mi perfil** para empezar limpio,
      o **NO** lo reinicies si quieres demostrar la memoria de una sesión previa.
- [ ] Sube el volumen: la gracia es **oír** cómo cambia la voz.

---

## 1. El gancho (20s)

> "Los adolescentes no saben qué estudiar porque nadie les escucha de verdad.
> Quriuos es **un coach de voz con IA**: hablas con él como con un amigo, y según
> lo que te interesa, **te presenta a referentes reales** —Hawking, Cristiano,
> Taylor Swift…— con quienes hablas **en su propia voz**. Y con todo eso, te
> orienta hacia tu futuro. Una sola conversación, sin menús."

---

## 2. Demo en vivo (2–3 min)

### Paso 1 — Arranque (escucha y descubre)
1. Escribe tu nombre cuando lo pida (ej. *Marta*) → demuestra personalización.
2. Pulsa **Empezar a hablar** y di:
   > "Hola, no sé muy bien qué se me da bien, pero me flipa el espacio y por qué
   > existe el universo."
3. 👉 Señala: *"Fíjate, es gradual: primero me escucha y pregunta, no salta de golpe."*

### Paso 2 — Cambio automático de personaje (el WOW) 🪐
4. Insiste un poco en el tema:
   > "Sí, me obsesionan los agujeros negros y el origen de todo."
5. 👉 Quriuos anunciará y **transferirá a Stephen Hawking**: cambia el **avatar**,
   el **color** y, sobre todo, **la voz**.
6. Habla con Hawking un par de frases:
   > "¿Cómo empezaste a hacerte estas preguntas?"

### Paso 3 — Otro interés → otro referente 🏟️
7. Cambia de tema para mostrar que reacciona al **tipo de pregunta**:
   > "Oye, y por otro lado me encantaría ser futbolista, ¿cómo se entrena la
   > mentalidad ganadora?"
8. 👉 Volverá a Quriuos y transferirá a **Cristiano Ronaldo** (otra voz, otro avatar).

### Paso 4 — Orientación vocacional 🧭
9. Pide el cierre:
   > "Con todo esto, ¿qué crees que podría estudiar?"
10. 👉 Transfiere al **Orientador**, que integra ciencia + deporte y sugiere
    caminos. Abre **Mi futuro** (arriba a la derecha): se ven los **intereses
    detectados**, los **referentes con los que habló** y las **carreras sugeridas**.

### Paso 5 — Memoria (cierre potente) 🧠
11. Pulsa **Terminar**, recarga la página (F5) y pulsa **Empezar a hablar** otra vez.
12. 👉 El **historial de chat sigue ahí** y Quriuos **te saluda recordando** de qué
    hablasteis (no repite preguntas). Di: *"¿Te acuerdas de lo que hablamos?"*

---

## 3. Cierre (20s)

> "Esto es un MVP construido en el hackathon con la tecnología de voz de
> ElevenLabs: un orquestador que **transfiere entre agentes** con voces clonadas,
> memoria del estudiante y orientación vocacional. La visión: acompañar a cada
> adolescente desde su primera curiosidad hasta decidir su futuro."

---

## Frases de prueba por personaje (por si improvisas)

| Si dices algo de… | Se enciende |
|---|---|
| espacio, física, "por qué existe el universo" | **Stephen Hawking** |
| crear una app, diseño, "pensar diferente" | **Steve Jobs** |
| cohetes, coches, IA, grandes retos | **Elon Musk** |
| fútbol con disciplina/esfuerzo | **Cristiano Ronaldo** |
| fútbol con talento/humildad | **Lionel Messi** |
| componer, escribir canciones, música | **Taylor Swift** |
| streaming, videojuegos, crear contenido | **Ibai** |
| "¿qué estudio?", carreras, universidad | **Orientador** |

---

## Plan B (si algo falla)

- **No conecta / error**: revisa internet y que el agente esté como público o que
  el endpoint `/api/elevenlabs-token` responda (la API key en `.env.local`).
- **No cambia de personaje**: insiste en el tema con palabras clave de la tabla;
  el cambio es gradual a propósito (necesita un par de frases claras).
- **Sin micrófono**: cuenta el flujo con el historial ya guardado de una sesión
  previa (no reinicies el perfil) y muestra **Mi futuro**.
- **Se gastan créditos**: ten una sesión grabada (vídeo de 60s) como respaldo.
