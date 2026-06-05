# PRD — Evolve

**Documento de Requisitos de Producto (Product Requirements Document)**

| Campo | Valor |
|---|---|
| Producto | Evolve — Plataforma educativa de voz con IA |
| Contexto | Hackathon ElevenLabs (licencia 100 USD) |
| Fecha | 2026-06-05 |
| Estado | Borrador |

---

## 1. Visión del producto

Evolve es una plataforma educativa de voz con IA que acompaña a adolescentes desde sus primeras inquietudes hasta la toma de decisiones sobre su futuro académico y profesional. Combina coaching motivacional, conversaciones inmersivas con personajes inspiradores y orientación vocacional personalizada, todo a través de experiencias conversacionales por voz potenciadas por ElevenLabs.

**Declaración de producto:**
> Una plataforma de voz con IA que ayuda a adolescentes a descubrir sus intereses, conversar con referentes inspiradores y encontrar su camino académico y profesional.

---

## 2. Problema

Los adolescentes atraviesan una etapa clave en la que empiezan a descubrir qué les gusta, qué les preocupa y qué les motiva, pero a menudo:

- No tienen un espacio cercano y sin juicios donde **expresarse**.
- Perciben el conocimiento como algo abstracto, poco interactivo y **emocionalmente distante**.
- Toman decisiones vocacionales con **poca información y sin un perfil real** de sus intereses, basándose en tests puntuales en lugar de un acompañamiento continuo.

---

## 3. Objetivos

### Objetivos de producto
1. Crear un **primer vínculo emocional** entre el estudiante y la plataforma.
2. Transformar los intereses del estudiante en **experiencias de aprendizaje inmersivas**.
3. Generar un **perfil evolutivo** que alimente una orientación vocacional personalizada.

### Objetivos del hackathon
- Demostrar un uso **destacado y diferencial** de las capacidades de voz de ElevenLabs.
- Entregar un prototipo funcional que ilustre el recorrido completo de los tres bloques (al menos de forma representativa).

---

## 4. Público objetivo

- **Usuario principal:** adolescentes (aprox. 12–18 años) en etapa de descubrimiento personal y vocacional.
- **Usuarios secundarios / stakeholders:** familias, educadores y orientadores que se benefician del perfil y las recomendaciones generadas.

---

## 5. Alcance funcional por bloques

### Bloque 1 — Asistente virtual inspiracional

**Descripción:** asistente con IA y voz cercana, motivadora e inspiracional que actúa como coach personal.

**Requisitos funcionales:**
- RF1.1 — Conversación por voz en temas de deporte, hábitos, motivación, inquietudes e intereses personales.
- RF1.2 — Voz inspiracional configurada en ElevenLabs (tono cercano y motivador).
- RF1.3 — El asistente fomenta la expresión del estudiante con preguntas abiertas.
- RF1.4 — Captura y registro de los intereses e inquietudes mencionados durante la conversación.

### Bloque 2 — Conversaciones con personajes basadas en intereses

**Descripción:** generación de conversaciones de voz en tiempo real con personajes inspirados en referentes (autores, deportistas, científicos, artistas, músicos, etc.).

**Requisitos funcionales:**
- RF2.1 — A partir de un interés detectado, proponer personajes/referentes relevantes.
- RF2.2 — Conversación de voz en tiempo real con una representación del personaje (voz ElevenLabs).
- RF2.3 — El estudiante puede hablar sobre hobbies, dudas, gustos y curiosidades con el personaje.
- RF2.4 — Cada conversación enriquece el perfil de intereses del estudiante.

### Bloque 3 — Coach vocacional y orientación profesional

**Descripción:** transformación del contexto acumulado en orientación vocacional y profesional.

**Requisitos funcionales:**
- RF3.1 — Construcción de un **perfil evolutivo** a partir de las conversaciones e intereses detectados.
- RF3.2 — Coach orientativo por voz que sugiere carreras, universidades y áreas de estudio.
- RF3.3 — Recomendaciones de caminos profesionales alineados con el potencial del estudiante.
- RF3.4 — El perfil se actualiza de forma continua a medida que el estudiante usa la plataforma.

---

## 6. Requisitos no funcionales

- **RNF1 — Voz:** todas las interacciones clave deben ser por voz, con baja latencia para conversación en tiempo real.
- **RNF2 — Tono:** voces cercanas, motivadoras y apropiadas para adolescentes.
- **RNF3 — Privacidad:** los datos del menor (conversaciones, perfil) deben tratarse con especial cuidado y confidencialidad.
- **RNF4 — Persistencia:** el contexto y el perfil deben conservarse entre sesiones para permitir su evolución.
- **RNF5 — Coste:** uso optimizado de la licencia ElevenLabs de 100 USD durante el hackathon.

---

## 7. Tecnología clave

- **ElevenLabs** — motor central de voz:
  - Voces inspiracionales (Bloque 1)
  - Conversaciones en tiempo real / agentes conversacionales (Bloque 2)
  - Personajes personalizados (Bloque 2)
- **Capa de IA conversacional** — gestión del diálogo, detección de intereses y construcción del perfil.
- **Almacenamiento de perfil/contexto** — persistencia de intereses y evolución del estudiante.

---

## 8. Recorrido del usuario (user journey)

1. El estudiante inicia una conversación con el **coach personal** (Bloque 1) y se siente escuchado y motivado.
2. Durante la charla surgen **intereses** que la plataforma detecta y registra.
3. La plataforma ofrece **conversar con un personaje** inspirado en esos intereses (Bloque 2).
4. Estas conversaciones inmersivas refuerzan la **curiosidad** y enriquecen el perfil.
5. Con el tiempo, el sistema construye un **perfil evolutivo** y activa el **coach vocacional** (Bloque 3).
6. El estudiante recibe orientación sobre **carreras, universidades y caminos profesionales** alineados con su potencial.

---

## 9. Métricas de éxito

- **Vínculo:** número y duración de las conversaciones con el coach personal.
- **Curiosidad:** número de personajes con los que conversa el estudiante.
- **Profundidad del perfil:** cantidad y calidad de intereses detectados a lo largo del tiempo.
- **Orientación:** recomendaciones vocacionales generadas y percepción de utilidad por parte del estudiante.

---

## 10. Alcance del prototipo (hackathon) y fuera de alcance

### En alcance (MVP de demo)
- Coach personal por voz (Bloque 1) con detección básica de intereses.
- Al menos un personaje conversacional por voz (Bloque 2).
- Generación de un perfil simple y una recomendación vocacional de ejemplo (Bloque 3).

### Fuera de alcance (futuro)
- Integración completa con catálogos reales de universidades y carreras.
- Paneles para familias y orientadores.
- Sistema de cuentas, control parental y cumplimiento normativo completo.
- Catálogo amplio y curado de personajes.

---

## 11. Riesgos y consideraciones

- **Privacidad de menores:** requiere tratamiento especialmente cuidadoso de datos.
- **Fidelidad de personajes:** las representaciones deben ser inspiradoras sin inducir a error sobre que son recreaciones de IA.
- **Coste de voz:** controlar el consumo dentro de la licencia de 100 USD.
- **Latencia:** la conversación en tiempo real depende de respuestas de voz rápidas.
