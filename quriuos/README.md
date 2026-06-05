# Quriuos

Plataforma de voz con IA para adolescentes. Descubres tus intereses hablando, te inspiras con referentes reales y recibes orientación vocacional personalizada — todo con tu voz, en menos de 10 minutos.

---

## Qué es Quriuos

Quriuos guía a los adolescentes a través de **3 bloques conversacionales**, cada uno impulsado por un agente de ElevenLabs Conversational AI:

### Bloque 1 — Coach personal (`/coach`)
Un coach personal te escucha y extrae tus intereses de forma natural. Cada interés detectado se guarda en el perfil del estudiante (localStorage).

### Bloque 2 — Personajes / Referentes (`/personajes`)
Basándose en tus intereses, la app te sugiere referentes reales (Hawking, Jobs, Musk, CR7, Messi, Taylor Swift, Ibai) para conversar con ellos mediante clones de voz de ElevenLabs.

### Bloque 3 — Orientador vocacional (`/vocacional`)
El orientador integra todo el perfil acumulado (intereses + chats) y sugiere carreras, áreas académicas y caminos profesionales concretos. Es el cierre del recorrido.

---

## Instalación y arranque

```bash
# 1. Clona el repositorio
git clone <repo-url>
cd quriuos

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno (ver sección siguiente)
cp .env.local.example .env.local
# Edita .env.local con tus agent-ids reales

# 4. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Configurar los agentes de ElevenLabs

Quriuos usa **ElevenLabs Conversational AI** para todas las experiencias de voz. Cada personaje o rol (coach, orientador, Hawking, Jobs…) necesita su propio agente.

### Pasos

1. Entra en [https://elevenlabs.io/app/conversational-ai/agents](https://elevenlabs.io/app/conversational-ai/agents).
2. Crea un agente por cada rol (coach, vocacional, y uno por personaje del bloque 2).
3. Configura el prompt del sistema, el clon de voz y el idioma (español).
4. Copia el **Agent ID** de cada agente.
5. Abre `.env.local` y pega cada id en la variable correspondiente:

```env
NEXT_PUBLIC_EL_COACH_AGENT_ID=ag_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_EL_VOCATIONAL_AGENT_ID=ag_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_EL_HAWKING_AGENT_ID=ag_xxxxxxxxxxxxxxxx
# ... (ver .env.local.example para la lista completa)
```

6. Reinicia el servidor (`npm run dev`) para que Next.js recoja las nuevas variables.

> Las variables deben empezar con `NEXT_PUBLIC_` para estar disponibles en el cliente.

---

## Stack tecnológico

- **Next.js 16** (App Router) — framework
- **TypeScript** — tipado
- **Tailwind CSS v3** — estilos con design tokens propios
- **ElevenLabs Conversational AI** — widget `<elevenlabs-convai>` + clones de voz
- **localStorage** — perfil del estudiante persistido en el dispositivo (sin servidor)

---

## Estructura principal

```
app/
  page.tsx          # Landing / portada (Bloque 0)
  coach/page.tsx    # Bloque 1 — Coach personal
  personajes/       # Bloque 2 — Referentes
  vocacional/       # Bloque 3 — Orientador vocacional
components/
  AppShell.tsx      # Marco de app + navegación inferior
  VoiceSession.tsx  # Experiencia de voz inmersiva (widget ElevenLabs)
  ProfileSummary.tsx# Resumen de intereses y chats del perfil
  ParticleField.tsx # Fondo de partículas animadas
lib/
  profile.ts        # Contrato compartido: StudentProfile + helpers
  elevenlabs.ts     # Agent IDs del coach y orientador
  characters.ts     # Datos de los 7 personajes
  careers.ts        # suggestCareers() — mapeo intereses → carreras
```
