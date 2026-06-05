// ============================================================================
// careers.ts — Bloque 3 (Mateo)
// Mapea intereses/categorías del perfil a sugerencias de carreras y áreas.
// Sin dependencias externas. Devuelve CareerSuggestion[].
// ============================================================================

import type { StudentProfile, InterestCategory } from "./profile";

export type CareerSuggestion = {
  area: string;
  icon: string; // Material Symbol
  careers: string[];
  why: string;
};

// ---------------------------------------------------------------------------
// Base de reglas: categoría → sugerencia
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<InterestCategory, CareerSuggestion> = {
  ciencia: {
    area: "Ciencias e Investigación",
    icon: "science",
    careers: [
      "Física / Astrofísica",
      "Biología / Biotecnología",
      "Química",
      "Matemáticas",
      "Medicina / Biomedicina",
    ],
    why: "Tu curiosidad científica encaja con carreras donde hacer preguntas y buscar respuestas es el trabajo del día a día.",
  },
  tecnología: {
    area: "Tecnología e Ingeniería",
    icon: "computer",
    careers: [
      "Ingeniería Informática / Software",
      "Diseño de Producto Digital (UX/UI)",
      "Inteligencia Artificial y Datos",
      "Ingeniería de Telecomunicaciones",
      "Ciberseguridad",
    ],
    why: "Tu afinidad por la tecnología abre la puerta a crear las herramientas y sistemas que el mundo usará mañana.",
  },
  deporte: {
    area: "Deporte y Ciencias de la Actividad Física",
    icon: "sports_soccer",
    careers: [
      "Ciencias de la Actividad Física y el Deporte (CAFD)",
      "Fisioterapia",
      "Nutrición y Dietética",
      "Medicina del Deporte",
      "Entrenamiento personal / coaching deportivo",
    ],
    why: "Tu pasión por el deporte puede convertirse en una carrera que combine rendimiento, salud y liderazgo de personas.",
  },
  arte: {
    area: "Artes, Diseño y Comunicación",
    icon: "palette",
    careers: [
      "Bellas Artes",
      "Diseño Gráfico / Diseño Visual",
      "Comunicación Audiovisual",
      "Publicidad y Relaciones Públicas",
      "Creación de Contenido Digital",
    ],
    why: "Tu sensibilidad artística y visual es el punto de partida para carreras donde la creatividad es la herramienta principal.",
  },
  música: {
    area: "Música y Producción Creativa",
    icon: "music_note",
    careers: [
      "Producción Musical y Sonido",
      "Composición / Interpretación",
      "Musicología",
      "Marketing Musical y Gestión de Artistas",
      "Comunicación Audiovisual",
    ],
    why: "Tu vínculo con la música puede llevarte desde los escenarios hasta los estudios de grabación o la industria del entretenimiento.",
  },
  negocios: {
    area: "Negocios y Emprendimiento",
    icon: "trending_up",
    careers: [
      "Administración y Dirección de Empresas (ADE)",
      "Emprendimiento y Startups",
      "Marketing Digital",
      "Economía / Finanzas",
      "Derecho Empresarial",
    ],
    why: "Tu mentalidad emprendedora y de negocios es el motor para crear impacto económico y liderar proyectos propios.",
  },
  lectura: {
    area: "Humanidades, Letras y Comunicación",
    icon: "menu_book",
    careers: [
      "Filología / Literatura",
      "Periodismo y Comunicación",
      "Historia",
      "Filosofía",
      "Escritura Creativa / Guión",
    ],
    why: "Tu amor por las palabras y las ideas encaja con carreras donde narrar, analizar y comunicar son el corazón del trabajo.",
  },
  otro: {
    area: "Exploración Multidisciplinar",
    icon: "explore",
    careers: [
      "Psicología",
      "Educación y Pedagogía",
      "Trabajo Social",
      "Estudios Internacionales",
      "Mediación y Resolución de Conflictos",
    ],
    why: "Tu perfil abierto y curioso te permite explorar múltiples caminos: las mejores carreras a veces nacen de combinar intereses distintos.",
  },
};

// Mapas de tópicos concretos → categoría extra (refuerzo de señal)
const TOPIC_HINTS: Array<{ keywords: string[]; category: InterestCategory }> = [
  {
    keywords: ["física", "astronomía", "astrofísica", "química", "biología", "matemática", "investigar"],
    category: "ciencia",
  },
  {
    keywords: ["programar", "código", "IA", "robots", "diseño web", "apps", "videojuegos", "informática"],
    category: "tecnología",
  },
  {
    keywords: ["fútbol", "baloncesto", "natación", "atletismo", "entrenamiento", "fitness", "rugby"],
    category: "deporte",
  },
  {
    keywords: ["dibujar", "pintar", "ilustrar", "fotografía", "cine", "animación", "diseño"],
    category: "arte",
  },
  {
    keywords: ["cantar", "componer", "guitarra", "piano", "batería", "producir", "rap", "reggaeton"],
    category: "música",
  },
  {
    keywords: ["emprender", "empresa", "inversión", "cripto", "marketing", "ventas", "startup"],
    category: "negocios",
  },
  {
    keywords: ["leer", "escribir", "novela", "poesía", "historia", "filosofía", "idiomas"],
    category: "lectura",
  },
];

// ---------------------------------------------------------------------------
// Función principal exportada
// ---------------------------------------------------------------------------
export function suggestCareers(profile: StudentProfile): CareerSuggestion[] {
  // Acumula un score por cada categoría
  const scores: Partial<Record<InterestCategory, number>> = {};

  const bump = (cat: InterestCategory, points: number) => {
    scores[cat] = (scores[cat] ?? 0) + points;
  };

  for (const interest of profile.interests) {
    // Señal directa de la categoría
    bump(interest.category, interest.strength * 2);

    // Señal de tópico (coincidencia con keywords)
    const topicLower = interest.topic.toLowerCase();
    for (const hint of TOPIC_HINTS) {
      if (hint.keywords.some((kw) => topicLower.includes(kw))) {
        bump(hint.category, interest.strength);
      }
    }
  }

  // Si no hay intereses, devolver todas las categorías en orden estándar
  const categoryOrder = Object.keys(CATEGORY_MAP) as InterestCategory[];
  if (Object.keys(scores).length === 0) {
    return categoryOrder.map((cat) => CATEGORY_MAP[cat]);
  }

  // Ordenar por score descendente, tomar máximo 4 sugerencias
  const sorted = (Object.keys(scores) as InterestCategory[]).sort(
    (a, b) => (scores[b] ?? 0) - (scores[a] ?? 0),
  );

  // Siempre incluir al menos 2 y como máximo 4 sugerencias relevantes
  const top = sorted.slice(0, 4);

  return top.map((cat) => CATEGORY_MAP[cat]);
}
