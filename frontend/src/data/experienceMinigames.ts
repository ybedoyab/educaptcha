import type { Challenge } from "../types";
import {
  lagosFloodSourceTrace,
  protestGateSourceTrace,
  westColumbiaSourceTrace,
  wildfireDcSourceTrace,
} from "./sourceTraces";

const OUT_OF_CONTEXT_CONCLUSIONS = [
  {
    id: "current",
    label: {
      en: "This is a current local event",
      es: "Es un evento local de hoy",
    },
    correct: false,
  },
  {
    id: "wrong-context",
    label: {
      en: "This is a real image used in the wrong context",
      es: "Es una imagen real usada en el contexto equivocado",
    },
    correct: true,
  },
  {
    id: "ai",
    label: {
      en: "This is an AI-generated image",
      es: "Es una imagen generada por IA",
    },
    correct: false,
  },
];

export const experienceMinigames: Record<string, Challenge> = {
  "ep-spot": {
    id: "ep-spot",
    category: "emotional-manipulation",
    badge: "pressure-detector",
    title: {
      en: "Spot the pressure signals",
      es: "Detecta las señales de presión",
    },
    skillMetric: {
      en: "Signals found",
      es: "Señales encontradas",
    },
    explanation: {
      en: "Urgency, fear and share commands push people to react before verifying.",
      es: "La urgencia, el miedo y las órdenes de compartir empujan a reaccionar sin verificar.",
    },
    explanationWhy: {
      en: "These tactics are designed to skip the pause where you would check a source.",
      es: "Estas tácticas buscan saltarse la pausa en la que revisarías una fuente.",
    },
    takeaway: {
      en: "When content rushes you, slow down.",
      es: "Cuando un contenido te apresura, reduce la velocidad.",
    },
    interaction: {
      type: "spot-signals",
      instruction: {
        en: "Before you share, notice how this post is asking you to react. Spot the pressure signals, then say what they mean.",
        es: "Antes de compartir, fíjate cómo este post te pide reaccionar. Marca las señales de presión y di qué significan.",
      },
      maxAttempts: 2,
      claim: {
        en: "URGENT: They are trying to delete this before it disappears. Share it NOW.",
        es: "URGENTE: Están intentando borrar esto antes de que desaparezca. Compártela YA.",
      },
      mediaTitle: { en: "AlertNow Desk", es: "AlertNow Desk" },
      mediaOutlet: { en: "Viral desk", es: "Escritorio viral" },
      mediaMeta: {
        en: "18m · 12.8k reactions",
        es: "18 min · 12,8 mil reacciones",
      },
      mediaAssetId: "viral-health-alert",
      reactions: 12840,
      targetCount: 3,
      headlineParts: [
        {
          id: "urgent",
          text: { en: "URGENT", es: "URGENTE" },
          isSignal: true,
        },
        {
          id: "mid",
          text: {
            en: ": They are trying to delete this. ",
            es: ": Están intentando borrar esto. ",
          },
          isSignal: false,
        },
        {
          id: "fear",
          text: {
            en: "before it disappears",
            es: "antes de que desaparezca",
          },
          isSignal: true,
        },
        {
          id: "sp",
          text: { en: ". ", es: ". " },
          isSignal: false,
        },
        {
          id: "share",
          text: {
            en: "Share it NOW",
            es: "Compártela YA",
          },
          isSignal: true,
        },
      ],
      signals: [
        {
          id: "urgent",
          text: { en: "URGENT", es: "URGENTE" },
          label: { en: "Artificial urgency", es: "Urgencia artificial" },
        },
        {
          id: "fear",
          text: {
            en: "before it disappears",
            es: "antes de que desaparezca",
          },
          label: { en: "Fear cue", es: "Señal de miedo" },
        },
        {
          id: "share",
          text: { en: "Share it NOW", es: "Compártela YA" },
          label: { en: "Share command", es: "Orden de compartir" },
        },
      ],
      conclusions: [
        {
          id: "pressure",
          label: {
            en: "It uses urgency, fear, and a share command to skip verification",
            es: "Usa urgencia, miedo y una orden de compartir para saltarse la verificación",
          },
          correct: true,
        },
        {
          id: "true",
          label: {
            en: "The urgency proves the claim is true",
            es: "La urgencia prueba que la afirmación es verdad",
          },
          correct: false,
        },
        {
          id: "share-now",
          label: {
            en: "I should share now so others can decide",
            es: "Debo compartir ya para que otros decidan",
          },
          correct: false,
        },
      ],
      conclusion: {
        en: "Urgency, fear, and share commands push people to react before verifying.",
        es: "Urgencia, miedo y órdenes de compartir empujan a reaccionar sin verificar.",
      },
    },
  },
  "ep-transfer": {
    id: "ep-transfer",
    category: "emotional-manipulation",
    badge: "pressure-detector",
    title: {
      en: "What did you find?",
      es: "¿Qué encontraste?",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You practiced applying this skill to a new example.",
      es: "Practicaste aplicar esta habilidad a un nuevo ejemplo.",
    },
    explanationWhy: {
      en: "Pressure can sound quieter while still rushing a share decision.",
      es: "La presión puede sonar más suave y aun así apresurar la decisión de compartir.",
    },
    takeaway: {
      en: "Verify before you forward to family.",
      es: "Verifica antes de reenviar a la familia.",
    },
    interaction: {
      type: "single-choice",
      instruction: {
        en: "Choose what this evidence means.",
        es: "Elige qué significa esta evidencia.",
      },
      prompt: {
        en: "What did you find in this follow-up post?",
        es: "¿Qué encontraste en este post de seguimiento?",
      },
      claim: {
        en: "Forward this to your family group before it’s too late.",
        es: "Reenvía esto al grupo familiar antes de que sea tarde.",
      },
      maxAttempts: 2,
      options: [
        {
          id: "verified",
          label: {
            en: "Fully verified evidence",
            es: "Evidencia totalmente verificada",
          },
        },
        {
          id: "mix",
          label: {
            en: "Unverified claims mixed with pressure",
            es: "Afirmaciones sin verificar mezcladas con presión",
          },
        },
        {
          id: "safe",
          label: {
            en: "Safe to share immediately",
            es: "Seguro para compartir de inmediato",
          },
        },
      ],
      correctOptionId: "mix",
    },
  },
  "ic-match": {
    id: "ic-match",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Before you share, check this photo",
      es: "Antes de compartir, revisa esta foto",
    },
    skillMetric: {
      en: "Source checked",
      es: "Fuente revisada",
    },
    explanation: {
      en: "This is a real image, but it was reused with the wrong date and location.",
      es: "Es una imagen real, pero se reutilizó con fecha y lugar incorrectos.",
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
        en: "Before you share, check this photo. This image may be old or out of context.",
        es: "Antes de compartir, revisa esta foto. Esta imagen puede ser antigua o estar fuera de contexto.",
      },
      maxAttempts: 2,
      claimQuestion: {
        en: "Is this photo really from tonight?",
        es: "¿Esta foto es realmente de esta noche?",
      },
      claim: {
        en: "LIVE from tonight’s emergency response.",
        es: "EN VIVO desde la emergencia de esta noche.",
      },
      postBody: {
        en: "Share so everyone sees it.",
        es: "Comparte para que todos la vean.",
      },
      mediaAssetId: "flood-lagos-2019",
      imageAlt: {
        en: "Flooded street in Lagos, Nigeria, June 2019",
        es: "Calle inundada en Lagos, Nigeria, junio 2019",
      },
      sourceTrace: lagosFloodSourceTrace,
      zoomTargets: [
        {
          id: "vehicles",
          label: { en: "Vehicle models and water line", es: "Modelos de vehículos y línea de agua" },
          x: 20,
          y: 55,
          w: 35,
          h: 25,
        },
        {
          id: "buildings",
          label: { en: "Building facades", es: "Fachadas de edificios" },
          x: 55,
          y: 20,
          w: 35,
          h: 30,
        },
      ],
      cards: [
        {
          id: "2019",
          label: {
            en: "Street flood archive",
            es: "Archivo de inundación urbana",
          },
          detail: {
            en: "June 24, 2019 · Wikimedia Commons",
            es: "24 de junio de 2019 · Wikimedia Commons",
          },
          date: { en: "June 24, 2019", es: "24 de junio de 2019" },
          location: { en: "Lagos, Nigeria", es: "Lagos, Nigeria" },
          medium: { en: "Wikimedia Commons / Omagxii", es: "Wikimedia Commons / Omagxii" },
          findings: {
            en: "Same vehicles, water line and building facades",
            es: "Mismos vehículos, línea de agua y fachadas",
          },
          mediaAssetId: "flood-lagos-2019",
          correct: true,
        },
        {
          id: "local",
          label: {
            en: "Local emergency desk claim",
            es: "Afirmación de mesa de emergencia local",
          },
          detail: {
            en: "Caption-only social upload",
            es: "Subida social solo con pie de foto",
          },
          date: { en: "Claimed: tonight", es: "Afirmado: esta noche" },
          location: { en: "Unnamed city", es: "Ciudad sin nombre" },
          medium: { en: "Anonymous social account", es: "Cuenta social anónima" },
          findings: {
            en: "No publisher metadata beyond the caption",
            es: "Sin metadatos de editor más allá del pie",
          },
          mediaAssetId: "flood-response-2015",
          correct: false,
        },
        {
          id: "today",
          label: {
            en: "Unsourced “today” listing",
            es: "Registro “hoy” sin fuente",
          },
          detail: {
            en: "No archive trail",
            es: "Sin rastro de archivo",
          },
          date: { en: "Unknown", es: "Desconocida" },
          location: { en: "Unknown", es: "Desconocida" },
          medium: { en: "No publisher", es: "Sin editor" },
          findings: {
            en: "No original image supplied by the claim",
            es: "La afirmación no aporta imagen original",
          },
          noImage: true,
          correct: false,
        },
      ],
      conclusions: OUT_OF_CONTEXT_CONCLUSIONS,
      revealClaimed: {
        en: "Claimed: Tonight’s local emergency",
        es: "Afirmado: Emergencia local de esta noche",
      },
      revealOriginal: {
        en: "Original: Lagos, Nigeria — June 24, 2019",
        es: "Original: Lagos, Nigeria — 24 de junio de 2019",
      },
      conclusion: {
        en: "This is a real image, but it was reused with the wrong date and location.",
        es: "Es una imagen real, pero se reutilizó con fecha y lugar incorrectos.",
      },
    },
  },
  "ic-transfer": {
    id: "ic-transfer",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Check this photo before sharing",
      es: "Revisa esta foto antes de compartir",
    },
    skillMetric: {
      en: "Source checked",
      es: "Fuente revisada",
    },
    explanation: {
      en: "This is a real image, but it was reused with the wrong date and location.",
      es: "Es una imagen real, pero se reutilizó con fecha y lugar incorrectos.",
    },
    explanationWhy: {
      en: "Older response photos are often reused as “proof” of a later disaster.",
      es: "Fotos antiguas de respuesta a menudo se reutilizan como “prueba” de un desastre posterior.",
    },
    takeaway: {
      en: "Find the original date and place before sharing.",
      es: "Encuentra la fecha y el lugar originales antes de compartir.",
    },
    interaction: {
      type: "context-match",
      instruction: {
        en: "Another image may have the same out-of-context risk. Check the original source before sharing.",
        es: "Otra imagen puede tener el mismo riesgo fuera de contexto. Revisa la fuente original antes de compartir.",
      },
      maxAttempts: 2,
      claim: {
        en: "Proof from today’s disaster in our city.",
        es: "Prueba del desastre de hoy en nuestra ciudad.",
      },
      mediaAssetId: "flood-response-2015",
      imageAlt: {
        en: "National Guard flood response in West Columbia, South Carolina, 2015",
        es: "Respuesta de la Guardia Nacional a inundaciones en West Columbia, Carolina del Sur, 2015",
      },
      sourceTrace: westColumbiaSourceTrace,
      conclusions: OUT_OF_CONTEXT_CONCLUSIONS,
      cards: [
        {
          id: "2015",
          label: {
            en: "2015 — West Columbia, SC",
            es: "2015 — West Columbia, SC",
          },
          detail: {
            en: "Oct 11, 2015 · statewide flood response",
            es: "11 oct 2015 · respuesta estatal a inundaciones",
          },
          correct: true,
        },
        {
          id: "today",
          label: {
            en: "Today — our city",
            es: "Hoy — nuestra ciudad",
          },
          detail: {
            en: "Matches the viral caption",
            es: "Coincide con el pie viral",
          },
          correct: false,
        },
        {
          id: "unknown",
          label: {
            en: "Unknown — no publisher",
            es: "Desconocido — sin editor",
          },
          detail: {
            en: "No archive trail",
            es: "Sin rastro de archivo",
          },
          correct: false,
        },
      ],
      revealClaimed: {
        en: "Claimed: today’s disaster, local city",
        es: "Afirmado: desastre de hoy, ciudad local",
      },
      revealOriginal: {
        en: "Original: West Columbia, SC — October 11, 2015",
        es: "Original: West Columbia, SC — 11 de octubre de 2015",
      },
      conclusion: {
        en: "This is a real image, but it was reused with the wrong date and location.",
        es: "Es una imagen real, pero se reutilizó con fecha y lugar incorrectos.",
      },
    },
  },
  "wf-match": {
    id: "wf-match",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Locate the smoke photo",
      es: "Ubica la foto del humo",
    },
    skillMetric: {
      en: "Place and date checked",
      es: "Lugar y fecha verificados",
    },
    explanation: {
      en: "Wildfire smoke photos travel globally; captions invent a local crisis.",
      es: "Las fotos de humo viajan globalmente; los pies inventan una crisis local.",
    },
    explanationWhy: {
      en: "Checking place, date and source prevents panic sharing.",
      es: "Revisar lugar, fecha y fuente evita compartir con pánico.",
    },
    takeaway: {
      en: "Ask where and when before forwarding a sky photo.",
      es: "Pregunta dónde y cuándo antes de reenviar una foto del cielo.",
    },
    interaction: {
      type: "context-match",
      instruction: {
        en: "Before you share, check this photo. The caption names one place, but visual cues may point elsewhere.",
        es: "Antes de compartir, revisa esta foto. El texto nombra un lugar, pero las señales visuales pueden apuntar a otro.",
      },
      maxAttempts: 2,
      claim: {
        en: "A toxic cloud is covering Bogotá right now. Officials are hiding it.",
        es: "Una nube tóxica cubre Bogotá ahora mismo. Las autoridades lo ocultan.",
      },
      mediaAssetId: "wildfire-washington-dc",
      imageAlt: {
        en: "Wildfire smoke over Washington, D.C.",
        es: "Humo de incendios sobre Washington, D.C.",
      },
      sourceTrace: wildfireDcSourceTrace,
      conclusions: OUT_OF_CONTEXT_CONCLUSIONS,
      zoomTargets: [
        {
          id: "skyline",
          label: { en: "Recognizable skyline buildings", es: "Edificios reconocibles del skyline" },
          x: 30,
          y: 45,
          w: 40,
          h: 30,
        },
        {
          id: "haze",
          label: { en: "Haze and lighting conditions", es: "Neblina y condiciones de luz" },
          x: 10,
          y: 10,
          w: 50,
          h: 25,
        },
      ],
      cards: [
        {
          id: "dc",
          label: { en: "Archive: Washington, D.C.", es: "Archivo: Washington, D.C." },
          detail: { en: "Wildfire smoke event", es: "Evento de humo de incendios" },
          date: { en: "June 2023", es: "Junio 2023" },
          location: { en: "Washington, D.C., USA", es: "Washington, D.C., EE. UU." },
          medium: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
          findings: { en: "High visual match", es: "Alta coincidencia visual" },
          mediaAssetId: "wildfire-washington-dc",
          correct: true,
        },
        {
          id: "bogota",
          label: { en: "Claimed: Bogotá tonight", es: "Afirmado: Bogotá esta noche" },
          detail: { en: "No official bulletin", es: "Sin boletín oficial" },
          date: { en: "Claimed: now", es: "Afirmado: ahora" },
          location: { en: "Bogotá", es: "Bogotá" },
          medium: { en: "Anonymous post", es: "Publicación anónima" },
          findings: { en: "Caption only", es: "Solo pie de foto" },
          correct: false,
        },
        {
          id: "unknown",
          label: { en: "Unknown sky frame", es: "Cielo sin identificar" },
          detail: { en: "No publisher", es: "Sin editor" },
          date: { en: "Unknown", es: "Desconocida" },
          location: { en: "Unknown", es: "Desconocida" },
          medium: { en: "Unsourced", es: "Sin fuente" },
          findings: { en: "Low confidence", es: "Baja confianza" },
          correct: false,
        },
      ],
      revealClaimed: {
        en: "Claimed: Bogotá — right now",
        es: "Afirmado: Bogotá — ahora mismo",
      },
      revealOriginal: {
        en: "Original: Washington, D.C. wildfire smoke",
        es: "Original: humo de incendios en Washington, D.C.",
      },
      conclusion: {
        en: "Authentic image, incorrect context.",
        es: "Imagen auténtica, contexto incorrecto.",
      },
    },
  },
  "wf-transfer": {
    id: "wf-transfer",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Another sky claim",
      es: "Otra afirmación sobre el cielo",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You practiced applying this skill to a new example.",
      es: "Practicaste aplicar esta habilidad a un nuevo ejemplo.",
    },
    explanationWhy: {
      en: "Sky photos are easy to mislabel across cities.",
      es: "Las fotos del cielo son fáciles de etiquetar mal entre ciudades.",
    },
    takeaway: {
      en: "Compare skyline cues before sharing.",
      es: "Compara pistas del skyline antes de compartir.",
    },
    interaction: {
      type: "single-choice",
      instruction: {
        en: "What should you check first?",
        es: "¿Qué debes revisar primero?",
      },
      prompt: {
        en: "Another sky/place claim appeared. What should you check first?",
        es: "Apareció otra afirmación de cielo/lugar. ¿Qué debes revisar primero?",
      },
      claim: {
        en: "Proof from today’s disaster in our city.",
        es: "Prueba del desastre de hoy en nuestra ciudad.",
      },
      maxAttempts: 2,
      options: [
        {
          id: "place",
          label: {
            en: "Place, date and original source",
            es: "Lugar, fecha y fuente original",
          },
        },
        {
          id: "likes",
          label: {
            en: "How many people already shared it",
            es: "Cuántas personas ya lo compartieron",
          },
        },
        {
          id: "fear",
          label: {
            en: "How alarming the caption sounds",
            es: "Qué tan alarmante suena el pie",
          },
        },
      ],
      correctOptionId: "place",
    },
  },
  "vx-inspect": {
    id: "vx-inspect",
    category: "sources",
    badge: "source-checker",
    title: {
      en: "Photo vs claim",
      es: "Foto frente a afirmación",
    },
    skillMetric: {
      en: "Claim separated from image",
      es: "Afirmación separada de la imagen",
    },
    explanation: {
      en: "A real vial photo does not prove an unsupported safety claim.",
      es: "Una foto real de un vial no prueba una afirmación de seguridad sin respaldo.",
    },
    explanationWhy: {
      en: "Visual evidence and textual claims must be checked separately.",
      es: "La evidencia visual y las afirmaciones textuales se revisan por separado.",
    },
    takeaway: {
      en: "Ask what the image actually shows — not what the caption asserts.",
      es: "Pregunta qué muestra realmente la imagen — no lo que afirma el pie.",
    },
    interaction: {
      type: "image-inspection",
      instruction: {
        en: "Before you share, compare what the photo shows with what the caption claims.",
        es: "Antes de compartir, compara lo que muestra la foto con lo que afirma el pie.",
      },
      maxAttempts: 2,
      claim: {
        en: "This vial proves the new formula is unsafe. Share before they remove it.",
        es: "Este vial prueba que la nueva fórmula no es segura. Comparte antes de que lo quiten.",
      },
      mediaAssetId: "vaccine-vial-2024",
      imageAlt: {
        en: "COVID-19 vaccine vial photograph",
        es: "Fotografía de un vial de vacuna COVID-19",
      },
      maxMarks: 3,
      hotspots: [
        {
          id: "label",
          x: 35,
          y: 40,
          w: 30,
          h: 25,
          isWarning: false,
          label: {
            en: "A labeled vaccine vial",
            es: "Un vial de vacuna con etiqueta",
          },
        },
        {
          id: "claim",
          x: 10,
          y: 10,
          w: 40,
          h: 20,
          isWarning: true,
          label: {
            en: "That the new formula is unsafe",
            es: "Que la nueva fórmula no es segura",
          },
        },
        {
          id: "ban",
          x: 60,
          y: 20,
          w: 30,
          h: 20,
          isWarning: true,
          label: {
            en: "That this product will be banned today",
            es: "Que este producto será prohibido hoy",
          },
        },
      ],
      conclusions: [
        {
          id: "unsupported",
          label: {
            en: "Real photo, but the safety claim is not proven by the image",
            es: "Foto real, pero la afirmación de seguridad no la prueba la imagen",
          },
          correct: true,
        },
        {
          id: "proves",
          label: {
            en: "The vial proves the formula is unsafe",
            es: "El vial prueba que la fórmula no es segura",
          },
          correct: false,
        },
        {
          id: "fake",
          label: {
            en: "The vial photo must be entirely fake",
            es: "La foto del vial debe ser completamente falsa",
          },
          correct: false,
        },
      ],
      conclusion: {
        en: "The photo is real. The “unsafe” claim is not in the image — it needs another source.",
        es: "La foto es real. La afirmación de “no segura” no está en la imagen — necesita otra fuente.",
      },
    },
  },
  "vx-transfer": {
    id: "vx-transfer",
    category: "sources",
    badge: "source-checker",
    title: {
      en: "Separate image and claim",
      es: "Separa imagen y afirmación",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You practiced applying this skill to a new example.",
      es: "Practicaste aplicar esta habilidad a un nuevo ejemplo.",
    },
    explanationWhy: {
      en: "Urgency language does not turn a photo into proof.",
      es: "El lenguaje de urgencia no convierte una foto en prueba.",
    },
    takeaway: {
      en: "Seek a clinical source for safety claims.",
      es: "Busca una fuente clínica para afirmaciones de seguridad.",
    },
    interaction: {
      type: "single-choice",
      instruction: {
        en: "Best next step?",
        es: "¿Mejor siguiente paso?",
      },
      prompt: {
        en: "A photo is being used as proof of a safety claim. Best next step?",
        es: "Una foto se usa como prueba de una afirmación de seguridad. ¿Mejor siguiente paso?",
      },
      claim: {
        en: "Clinic tip: bring your vaccine card — walk-ins welcome Friday.",
        es: "Consejo de clínica: trae tu carnet de vacunación — viernes sin cita.",
      },
      maxAttempts: 2,
      options: [
        {
          id: "source",
          label: {
            en: "Find a primary health authority source",
            es: "Buscar una fuente primaria de autoridad sanitaria",
          },
        },
        {
          id: "share",
          label: {
            en: "Share immediately so others can decide",
            es: "Compartir de inmediato para que otros decidan",
          },
        },
        {
          id: "trust",
          label: {
            en: "Trust the photo because it looks clinical",
            es: "Confiar en la foto porque se ve clínica",
          },
        },
      ],
      correctOptionId: "source",
    },
  },
  "pr-match": {
    id: "pr-match",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Reuse of a protest photo",
      es: "Reutilización de una foto de protesta",
    },
    skillMetric: {
      en: "Event year checked",
      es: "Año del evento verificado",
    },
    explanation: {
      en: "Protest images are often reused with a new “today” caption.",
      es: "Las imágenes de protesta a menudo se reutilizan con un pie de “hoy”.",
    },
    explanationWhy: {
      en: "Location, year and original event matter more than crowd size.",
      es: "Ubicación, año y evento original importan más que el tamaño de la multitud.",
    },
    takeaway: {
      en: "Verify the original event before treating a crowd photo as today’s news.",
      es: "Verifica el evento original antes de tratar una foto de multitud como noticia de hoy.",
    },
    interaction: {
      type: "context-match",
      instruction: {
        en: "Before you share, check this photo. This image may be old or out of context.",
        es: "Antes de compartir, revisa esta foto. Esta imagen puede ser antigua o estar fuera de contexto.",
      },
      maxAttempts: 2,
      claim: {
        en: "Huge crowds in our capital today. This photo is from this morning’s march.",
        es: "Multitudes enormes en nuestra capital hoy. Esta foto es de la marcha de esta mañana.",
      },
      mediaAssetId: "protest-2024",
      imageAlt: {
        en: "Protest under a gate",
        es: "Protesta bajo una puerta",
      },
      sourceTrace: protestGateSourceTrace,
      conclusions: OUT_OF_CONTEXT_CONCLUSIONS,
      zoomTargets: [
        {
          id: "signage",
          label: { en: "Signage and banners", es: "Señalización y pancartas" },
          x: 25,
          y: 35,
          w: 35,
          h: 30,
        },
        {
          id: "gate",
          label: { en: "Architecture of the gate", es: "Arquitectura de la puerta" },
          x: 50,
          y: 10,
          w: 35,
          h: 35,
        },
      ],
      cards: [
        {
          id: "archive",
          label: { en: "Earlier protest archive", es: "Archivo de protesta anterior" },
          detail: { en: "Different year / event", es: "Año / evento distinto" },
          date: { en: "Earlier coverage", es: "Cobertura anterior" },
          location: { en: "Original venue", es: "Lugar original" },
          medium: { en: "Photo archive", es: "Archivo fotográfico" },
          findings: { en: "High visual match", es: "Alta coincidencia visual" },
          mediaAssetId: "protest-2024",
          correct: true,
        },
        {
          id: "today",
          label: { en: "This morning’s march", es: "La marcha de esta mañana" },
          detail: { en: "Matches caption only", es: "Solo coincide el pie" },
          date: { en: "Claimed: today", es: "Afirmado: hoy" },
          location: { en: "“Our capital”", es: "“Nuestra capital”" },
          medium: { en: "Social post", es: "Publicación social" },
          findings: { en: "Caption match", es: "Coincide el pie" },
          correct: false,
        },
        {
          id: "covid",
          label: { en: "Unrelated 2020 protest", es: "Protesta de 2020 no relacionada" },
          detail: { en: "Different scene", es: "Escena distinta" },
          date: { en: "2020", es: "2020" },
          location: { en: "Different city cues", es: "Otras pistas de ciudad" },
          medium: { en: "Archive", es: "Archivo" },
          findings: { en: "Partial similarity", es: "Similitud parcial" },
          mediaAssetId: "covid-protest-2020",
          correct: false,
        },
      ],
      revealClaimed: {
        en: "Claimed: this morning’s march",
        es: "Afirmado: la marcha de esta mañana",
      },
      revealOriginal: {
        en: "Original: earlier protest under the gate",
        es: "Original: protesta anterior bajo la puerta",
      },
      conclusion: {
        en: "Authentic image, incorrect context.",
        es: "Imagen auténtica, contexto incorrecto.",
      },
    },
  },
  "pr-transfer": {
    id: "pr-transfer",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Crowd photo checklist",
      es: "Lista para fotos de multitud",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You practiced applying this skill to a new example.",
      es: "Practicaste aplicar esta habilidad a un nuevo ejemplo.",
    },
    explanationWhy: {
      en: "Reuse thrives when captions skip the year.",
      es: "La reutilización prospera cuando el pie omite el año.",
    },
    takeaway: {
      en: "Confirm year and venue for protest photos.",
      es: "Confirma año y lugar en fotos de protesta.",
    },
    interaction: {
      type: "single-choice",
      instruction: {
        en: "Which check matters most?",
        es: "¿Qué revisión importa más?",
      },
      prompt: {
        en: "Another crowd photo claims “today.” Which check matters most?",
        es: "Otra foto de multitud afirma “hoy”. ¿Qué revisión importa más?",
      },
      claim: {
        en: "Huge crowds in our capital today. This photo is from this morning’s march.",
        es: "Multitudes enormes en la capital hoy. Esta foto es de la marcha de esta mañana.",
      },
      maxAttempts: 2,
      options: [
        {
          id: "year",
          label: {
            en: "Original year, location and event",
            es: "Año, ubicación y evento originales",
          },
        },
        {
          id: "crowd",
          label: {
            en: "How large the crowd looks",
            es: "Qué tan grande se ve la multitud",
          },
        },
        {
          id: "share",
          label: {
            en: "Whether friends already shared it",
            es: "Si amigos ya lo compartieron",
          },
        },
      ],
      correctOptionId: "year",
    },
  },
  "ch-repair": {
    id: "ch-repair",
    category: "misleading-stats",
    badge: "chart-reader",
    title: {
      en: "Repair the truncated chart",
      es: "Repara la gráfica truncada",
    },
    skillMetric: {
      en: "Axis repaired",
      es: "Eje reparado",
    },
    explanation: {
      en: "A truncated vertical axis exaggerates small differences.",
      es: "Un eje vertical truncado exagera diferencias pequeñas.",
    },
    explanationWhy: {
      en: "Comparing before/after scales reveals the distortion.",
      es: "Comparar escalas antes/después revela la distorsión.",
    },
    takeaway: {
      en: "Always check where the axis starts.",
      es: "Siempre revisa dónde empieza el eje.",
    },
    interaction: {
      type: "chart-repair",
      instruction: {
        en: "Before you share, check how this chart is scaled. Repair the axis, then say what the trick was.",
        es: "Antes de compartir, revisa cómo está escalada esta gráfica. Repara el eje y di cuál era el truco.",
      },
      maxAttempts: 2,
      claim: {
        en: "Engagement exploded overnight. Look at this chart — undeniable proof.",
        es: "El engagement explotó de la noche a la mañana. Mira esta gráfica — prueba innegable.",
      },
      series: [
        { id: "a", label: { en: "Yesterday", es: "Ayer" }, value: 92 },
        { id: "b", label: { en: "Today", es: "Hoy" }, value: 98 },
      ],
      axisStart: 88,
      axisEnd: 100,
      targetStart: 0,
      tolerance: 8,
      successMessage: {
        en: "With a fuller axis, the jump looks modest — not “explosion.”",
        es: "Con un eje más completo, el salto se ve modesto — no una “explosión”.",
      },
      conclusions: [
        {
          id: "exaggerate",
          label: {
            en: "A truncated axis made a small change look huge",
            es: "Un eje truncado hizo que un cambio pequeño se viera enorme",
          },
          correct: true,
        },
        {
          id: "boom",
          label: {
            en: "Engagement really exploded overnight",
            es: "El engagement realmente explotó de la noche a la mañana",
          },
          correct: false,
        },
        {
          id: "broken",
          label: {
            en: "The chart numbers themselves are fake",
            es: "Los números de la gráfica son falsos",
          },
          correct: false,
        },
      ],
      conclusion: {
        en: "Always check where the vertical axis starts before trusting a dramatic chart.",
        es: "Siempre revisa dónde empieza el eje vertical antes de confiar en una gráfica dramática.",
      },
    },
  },
  "ch-transfer": {
    id: "ch-transfer",
    category: "misleading-stats",
    badge: "chart-reader",
    title: {
      en: "Read the axis again",
      es: "Lee el eje otra vez",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You practiced applying this skill to a new example.",
      es: "Practicaste aplicar esta habilidad a un nuevo ejemplo.",
    },
    explanationWhy: {
      en: "Dramatic language often accompanies truncated scales.",
      es: "El lenguaje dramático suele acompañar escalas truncadas.",
    },
    takeaway: {
      en: "Ask for the full scale before accepting “undeniable proof.”",
      es: "Pide la escala completa antes de aceptar una “prueba innegable”.",
    },
    interaction: {
      type: "single-choice",
      instruction: {
        en: "What should you inspect on a viral chart?",
        es: "¿Qué debes inspeccionar en una gráfica viral?",
      },
      prompt: {
        en: "Another dramatic chart appeared. What should you inspect first?",
        es: "Apareció otra gráfica dramática. ¿Qué debes inspeccionar primero?",
      },
      claim: {
        en: "New privacy update — numbers speak for themselves.",
        es: "Nueva actualización de privacidad — los números hablan solos.",
      },
      maxAttempts: 2,
      options: [
        {
          id: "axis",
          label: {
            en: "Where the vertical axis starts and ends",
            es: "Dónde empieza y termina el eje vertical",
          },
        },
        {
          id: "colors",
          label: {
            en: "Whether the bars use bright colors",
            es: "Si las barras usan colores brillantes",
          },
        },
        {
          id: "likes",
          label: {
            en: "How many likes the chart post has",
            es: "Cuántos me gusta tiene la publicación",
          },
        },
      ],
      correctOptionId: "axis",
    },
  },
};

