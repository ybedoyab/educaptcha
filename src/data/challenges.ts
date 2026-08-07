import type { Challenge } from "../types";

export const challenges: Challenge[] = [
  {
    id: "clickbait-1",
    category: "clickbait",
    badge: "signal-spotter",
    title: {
      en: "Spot clickbait signals",
      es: "Detecta señales de clickbait",
    },
    skillMetric: {
      en: "Signals found",
      es: "Señales encontradas",
    },
    explanation: {
      en: "Emotional words, vague authority and rush-to-share lines are classic clickbait tactics.",
      es: "Palabras emocionales, autoridad vaga y prisas por compartir son tácticas clásicas de clickbait.",
    },
    explanationWhy: {
      en: "These patterns are designed to trigger a reaction before you check a named source, date or original document.",
      es: "Estos patrones buscan provocar una reacción antes de que revises una fuente con nombre, fecha o documento original.",
    },
    takeaway: {
      en: "Tap the rush language before you share.",
      es: "Toca el lenguaje de urgencia antes de compartir.",
    },
    interaction: {
      type: "spot-signals",
      instruction: {
        en: "Find the 3 warning signs.",
        es: "Encuentra las 3 señales de alerta.",
      },
      maxAttempts: 2,
      mediaTitle: {
        en: "Health Pulse Daily",
        es: "Health Pulse Daily",
      },
      mediaOutlet: {
        en: "Unverified desk",
        es: "Escritorio sin verificar",
      },
      mediaMeta: {
        en: "Guest · Just now · 12.8k reactions",
        es: "Invitado · Ahora · 12,8 mil reacciones",
      },
      imageSrc: "/demo-assets/viral-health-alert.svg",
      reactions: 12840,
      targetCount: 3,
      headlineParts: [
        {
          id: "shocking",
          text: { en: "SHOCKING", es: "IMPACTANTE" },
          isSignal: true,
        },
        {
          id: "cure",
          text: { en: " cure ", es: " cura " },
          isSignal: false,
        },
        {
          id: "hidden",
          text: {
            en: "they do not want you to know",
            es: "que no quieren que sepas",
          },
          isSignal: true,
        },
        {
          id: "dash",
          text: { en: " — ", es: " — " },
          isSignal: false,
        },
        {
          id: "share",
          text: {
            en: "share before it disappears",
            es: "compártela antes de que desaparezca",
          },
          isSignal: true,
        },
        {
          id: "end",
          text: { en: "!", es: "!" },
          isSignal: false,
        },
      ],
      signals: [
        {
          id: "shocking",
          text: { en: "SHOCKING", es: "IMPACTANTE" },
          label: { en: "Emotional language", es: "Lenguaje emocional" },
        },
        {
          id: "hidden",
          text: {
            en: "they do not want you to know",
            es: "que no quieren que sepas",
          },
          label: { en: "Hidden authority", es: "Autoridad oculta" },
        },
        {
          id: "share",
          text: {
            en: "share before it disappears",
            es: "compártela antes de que desaparezca",
          },
          label: { en: "Artificial urgency", es: "Urgencia artificial" },
        },
      ],
    },
  },
  {
    id: "sources-1",
    category: "sources",
    badge: "source-checker",
    title: {
      en: "Build a verification path",
      es: "Construye una ruta de verificación",
    },
    skillMetric: {
      en: "Evidence connected",
      es: "Evidencias conectadas",
    },
    explanation: {
      en: "Reliable claims need who, when and original evidence — not popularity.",
      es: "Las afirmaciones confiables necesitan quién, cuándo y evidencia original — no popularidad.",
    },
    explanationWhy: {
      en: "Likes and forwarded screenshots can travel without a named author, date or primary document.",
      es: "Los me gusta y las capturas reenviadas pueden circular sin autor, fecha o documento primario.",
    },
    takeaway: {
      en: "Connect who, when and the original study.",
      es: "Conecta quién, cuándo y el estudio original.",
    },
    interaction: {
      type: "drag-classify",
      instruction: {
        en: "Drop each clue into Who, When or Evidence.",
        es: "Suelta cada pista en Quién, Cuándo o Evidencia.",
      },
      maxAttempts: 2,
      prompt: {
        en: "“Scientists confirmed a breakthrough yesterday. Share immediately.”",
        es: "“Los científicos confirmaron un avance ayer. Comparte de inmediato.”",
      },
      wrongHint: {
        en: "Popularity is not evidence.",
        es: "La popularidad no es evidencia.",
      },
      zones: [
        { id: "who", label: { en: "Who?", es: "¿Quién?" } },
        { id: "when", label: { en: "When?", es: "¿Cuándo?" } },
        {
          id: "evidence",
          label: { en: "Original evidence?", es: "¿Evidencia original?" },
        },
      ],
      items: [
        {
          id: "author",
          label: { en: "Author name", es: "Nombre del autor" },
          correctZoneId: "who",
        },
        {
          id: "date",
          label: { en: "Publication date", es: "Fecha de publicación" },
          correctZoneId: "when",
        },
        {
          id: "link",
          label: {
            en: "Link to original study",
            es: "Enlace al estudio original",
          },
          correctZoneId: "evidence",
        },
        {
          id: "likes",
          label: { en: "Number of likes", es: "Número de me gusta" },
          correctZoneId: null,
        },
        {
          id: "screenshot",
          label: {
            en: "Forwarded screenshot",
            es: "Captura reenviada",
          },
          correctZoneId: null,
        },
        {
          id: "institution",
          label: {
            en: "Publishing institution",
            es: "Institución que publicó",
          },
          correctZoneId: "who",
        },
      ],
    },
  },
  {
    id: "visual-1",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Match image to context",
      es: "Relaciona la imagen con su contexto",
    },
    skillMetric: {
      en: "Context verified",
      es: "Contexto verificado",
    },
    explanation: {
      en: "A real image can still be misleading when its date, location or context is changed.",
      es: "Una imagen real puede ser engañosa cuando se cambia su fecha, ubicación o contexto.",
    },
    explanationWhy: {
      en: "Archive metadata often survives when social captions invent a new “tonight” story.",
      es: "Los metadatos de archivo suelen sobrevivir cuando los pies de foto inventan un “esta noche”.",
    },
    takeaway: {
      en: "Check date and place before trusting a viral photo.",
      es: "Revisa fecha y lugar antes de confiar en una foto viral.",
    },
    interaction: {
      type: "context-match",
      instruction: {
        en: "Match the photo to the correct archive card.",
        es: "Empareja la foto con la ficha de archivo correcta.",
      },
      maxAttempts: 2,
      claim: {
        en: "LIVE from tonight’s emergency response.",
        es: "EN VIVO desde la emergencia de esta noche.",
      },
      imageSrc: "/demo-assets/photos/flood-lagos-2019.jpg",
      imageAlt: {
        en: "Flooded street in Lagos, Nigeria, June 2019",
        es: "Calle inundada en Lagos, Nigeria, junio 2019",
      },
      cards: [
        {
          id: "2019",
          label: {
            en: "2019 — Lagos, Nigeria",
            es: "2019 — Lagos, Nigeria",
          },
          detail: {
            en: "June 24, 2019 · Wikimedia Commons",
            es: "24 de junio de 2019 · Wikimedia Commons",
          },
          correct: true,
        },
        {
          id: "2024",
          label: {
            en: "2024 — Local emergency",
            es: "2024 — Emergencia local",
          },
          detail: {
            en: "Matches the viral caption",
            es: "Coincide con el pie viral",
          },
          correct: false,
        },
        {
          id: "today",
          label: {
            en: "Today — Source unavailable",
            es: "Hoy — Fuente no disponible",
          },
          detail: {
            en: "Claim only · no publisher",
            es: "Solo afirmación · sin editor",
          },
          correct: false,
        },
      ],
      revealClaimed: {
        en: "Claimed: Tonight’s local emergency",
        es: "Afirmado: Emergencia local de esta noche",
      },
      revealOriginal: {
        en: "Original: Lagos, Nigeria — June 24, 2019",
        es: "Original: Lagos, Nigeria — 24 de junio de 2019",
      },
    },
  },
  {
    id: "ai-1",
    category: "ai-content",
    badge: "ai-skeptic",
    title: {
      en: "Inspect, then decide carefully",
      es: "Inspecciona, luego decide con cuidado",
    },
    skillMetric: {
      en: "Responsible conclusion",
      es: "Conclusión responsable",
    },
    explanation: {
      en: "Odd details are a reason to verify — not proof by themselves.",
      es: "Los detalles raros son motivo para verificar — no una prueba por sí solos.",
    },
    explanationWhy: {
      en: "No single visual artifact proves AI generation. Source and context still matter.",
      es: "Ningún artefacto visual prueba por sí solo que sea IA. Fuente y contexto siguen importando.",
    },
    takeaway: {
      en: "Mark anomalies, then check provenance.",
      es: "Marca anomalías y luego revisa la procedencia.",
    },
    interaction: {
      type: "image-inspection",
      instruction: {
        en: "Mark warning signs, then pick a conclusion.",
        es: "Marca señales de alerta y elige una conclusión.",
      },
      maxAttempts: 2,
      imageSrc: "/demo-assets/synthetic-portrait-scene.svg",
      imageAlt: {
        en: "Stylized portrait with inspectable visual anomalies",
        es: "Retrato estilizado con anomalías visuales inspeccionables",
      },
      maxMarks: 3,
      hotspots: [
        {
          id: "text",
          x: 56,
          y: 12,
          w: 36,
          h: 22,
          isWarning: true,
          label: { en: "Warped sign text", es: "Texto deformado" },
        },
        {
          id: "fingers",
          x: 58,
          y: 48,
          w: 28,
          h: 24,
          isWarning: true,
          label: { en: "Odd finger shapes", es: "Formas de dedos raras" },
        },
        {
          id: "reflect",
          x: 54,
          y: 72,
          w: 36,
          h: 16,
          isWarning: true,
          label: {
            en: "Inconsistent reflection",
            es: "Reflejo inconsistente",
          },
        },
        {
          id: "shadow",
          x: 18,
          y: 84,
          w: 30,
          h: 12,
          isWarning: true,
          label: { en: "Mismatched shadow", es: "Sombra que no coincide" },
        },
        {
          id: "normal",
          x: 78,
          y: 48,
          w: 14,
          h: 16,
          isWarning: false,
          label: { en: "Ordinary block", es: "Zona ordinaria" },
        },
      ],
      conclusions: [
        {
          id: "ai",
          label: {
            en: "Definitely AI-generated",
            es: "Definitivamente generado por IA",
          },
          correct: false,
        },
        {
          id: "real",
          label: {
            en: "Definitely authentic",
            es: "Definitivamente auténtico",
          },
          correct: false,
        },
        {
          id: "verify",
          label: {
            en: "Needs source and context checks",
            es: "Requiere verificar fuente y contexto",
          },
          correct: true,
        },
      ],
    },
  },
  {
    id: "emotion-1",
    category: "emotional-manipulation",
    badge: "pressure-detector",
    title: {
      en: "Separate facts from pressure",
      es: "Separa información de presión",
    },
    skillMetric: {
      en: "Pressure sorted",
      es: "Presión clasificada",
    },
    explanation: {
      en: "Verifiable lines can sit next to urgency, fear and share commands.",
      es: "Líneas verificables pueden ir junto a urgencia, miedo y órdenes de compartir.",
    },
    explanationWhy: {
      en: "Sorting fragments reveals what can be checked and what only pushes you to act.",
      es: "Clasificar fragmentos revela qué se puede comprobar y qué solo empuja a actuar.",
    },
    takeaway: {
      en: "Keep the facts; pause on the pressure.",
      es: "Quédate con los hechos; pausa ante la presión.",
    },
    interaction: {
      type: "drag-classify",
      instruction: {
        en: "Sort each line into Information or Pressure.",
        es: "Clasifica cada línea en Información o Presión.",
      },
      maxAttempts: 2,
      prompt: {
        en: "A viral civic post mixes report language with urgency.",
        es: "Una publicación cívica viral mezcla lenguaje de informe con urgencia.",
      },
      wrongHint: {
        en: "Look for fear or haste.",
        es: "Busca miedo o prisa.",
      },
      zones: [
        { id: "info", label: { en: "Information", es: "Información" } },
        {
          id: "pressure",
          label: { en: "Pressure tactic", es: "Táctica de presión" },
        },
      ],
      items: [
        {
          id: "report",
          label: {
            en: "According to the published report",
            es: "Según el informe publicado",
          },
          correctZoneId: "info",
        },
        {
          id: "act",
          label: { en: "ACT NOW", es: "ACTÚA YA" },
          correctZoneId: "pressure",
        },
        {
          id: "lose",
          label: {
            en: "Everyone will lose everything",
            es: "Todos lo perderán todo",
          },
          correctZoneId: "pressure",
        },
        {
          id: "date",
          label: {
            en: "The document was published on August 3",
            es: "El documento se publicó el 3 de agosto",
          },
          correctZoneId: "info",
        },
        {
          id: "delete",
          label: {
            en: "Share before they delete it",
            es: "Comparte antes de que lo borren",
          },
          correctZoneId: "pressure",
        },
        {
          id: "prelim",
          label: {
            en: "The study describes preliminary findings",
            es: "El estudio describe hallazgos preliminares",
          },
          correctZoneId: "info",
        },
      ],
      rebuild: {
        infoIds: ["report", "date", "prelim"],
        pressureIds: ["act", "lose", "delete"],
      },
    },
  },
  {
    id: "stats-1",
    category: "misleading-stats",
    badge: "chart-reader",
    title: {
      en: "Repair the misleading chart",
      es: "Repara la gráfica engañosa",
    },
    skillMetric: {
      en: "Chart repaired",
      es: "Gráfica reparada",
    },
    explanation: {
      en: "Small numerical differences no longer look dramatic.",
      es: "Las diferencias numéricas pequeñas ya no se ven dramáticas.",
    },
    explanationWhy: {
      en: "A truncated axis magnifies change. Starting at zero restores proportion.",
      es: "Un eje truncado magnifica el cambio. Empezar en cero restaura la proporción.",
    },
    takeaway: {
      en: "Drag the axis to zero before you trust the gap.",
      es: "Lleva el eje a cero antes de confiar en la brecha.",
    },
    interaction: {
      type: "chart-repair",
      instruction: {
        en: "Repair the chart so the comparison is proportional.",
        es: "Repara la gráfica para que la comparación sea proporcional.",
      },
      maxAttempts: 2,
      series: [
        { id: "a", label: { en: "Week A", es: "Semana A" }, value: 86 },
        { id: "b", label: { en: "Week B", es: "Semana B" }, value: 91 },
      ],
      axisStart: 84,
      axisEnd: 94,
      targetStart: 0,
      tolerance: 4,
      successMessage: {
        en: "Small numerical differences no longer look dramatic.",
        es: "Las diferencias numéricas pequeñas ya no se ven dramáticas.",
      },
    },
  },
];

export const categorySkills: Record<
  Challenge["category"],
  { en: string; es: string }
> = {
  clickbait: {
    en: "Spotting emotional headlines",
    es: "Detectar titulares emocionales",
  },
  sources: {
    en: "Checking provenance",
    es: "Verificar procedencia",
  },
  "visual-context": {
    en: "Verifying image context",
    es: "Verificar contexto de imágenes",
  },
  "ai-content": {
    en: "Responsible AI skepticism",
    es: "Escepticismo responsable ante la IA",
  },
  "emotional-manipulation": {
    en: "Resisting pressure tactics",
    es: "Resistirse a tácticas de presión",
  },
  "misleading-stats": {
    en: "Reading charts critically",
    es: "Leer gráficos con criterio",
  },
};
