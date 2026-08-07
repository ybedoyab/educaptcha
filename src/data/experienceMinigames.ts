import type { Challenge } from "../types";

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
        en: "Find the 3 warning signs.",
        es: "Encuentra las 3 señales de alerta.",
      },
      maxAttempts: 2,
      mediaTitle: { en: "AlertNow Desk", es: "AlertNow Desk" },
      mediaOutlet: { en: "Viral desk", es: "Escritorio viral" },
      mediaMeta: {
        en: "18m · 12.8k reactions",
        es: "18 min · 12,8 mil reacciones",
      },
      imageSrc: "/demo-assets/viral-health-alert.svg",
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
    },
  },
  "ep-transfer": {
    id: "ep-transfer",
    category: "emotional-manipulation",
    badge: "pressure-detector",
    title: {
      en: "Sort facts from pressure",
      es: "Separa hechos de presión",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "You applied the same skill to a subtler post.",
      es: "Aplicaste la misma habilidad a una publicación más sutil.",
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
      type: "drag-classify",
      instruction: {
        en: "Sort into Verifiable information or Emotional pressure.",
        es: "Clasifica en Información verificable o Presión emocional.",
      },
      maxAttempts: 2,
      prompt: {
        en: "A source inside the institution says this decision will affect everyone tomorrow. Send this to your family before it is too late.",
        es: "Una fuente dentro de la institución dice que esta decisión afectará a todos mañana. Envíaselo a tu familia antes de que sea demasiado tarde.",
      },
      wrongHint: {
        en: "Look for haste or fear.",
        es: "Busca prisa o miedo.",
      },
      zones: [
        {
          id: "info",
          label: {
            en: "Verifiable information",
            es: "Información verificable",
          },
        },
        {
          id: "pressure",
          label: {
            en: "Emotional pressure",
            es: "Presión emocional",
          },
        },
      ],
      items: [
        {
          id: "source",
          label: {
            en: "A source inside the institution says…",
            es: "Una fuente dentro de la institución dice…",
          },
          correctZoneId: "info",
        },
        {
          id: "affect",
          label: {
            en: "this decision will affect everyone tomorrow",
            es: "esta decisión afectará a todos mañana",
          },
          correctZoneId: "info",
        },
        {
          id: "family",
          label: {
            en: "Send this to your family",
            es: "Envíaselo a tu familia",
          },
          correctZoneId: "pressure",
        },
        {
          id: "late",
          label: {
            en: "before it is too late",
            es: "antes de que sea demasiado tarde",
          },
          correctZoneId: "pressure",
        },
      ],
      rebuild: {
        infoIds: ["source", "affect"],
        pressureIds: ["family", "late"],
      },
    },
  },
  "ic-match": {
    id: "ic-match",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Match the photo context",
      es: "Empareja el contexto de la foto",
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
          id: "local",
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
  "ic-transfer": {
    id: "ic-transfer",
    category: "visual-context",
    badge: "context-investigator",
    title: {
      en: "Verify the subtler claim",
      es: "Verifica la afirmación más sutil",
    },
    skillMetric: {
      en: "Transfer completed",
      es: "Transferencia completada",
    },
    explanation: {
      en: "A real image can still be misleading when its date, location or context is changed.",
      es: "Una imagen real puede ser engañosa cuando se cambia su fecha, ubicación o contexto.",
    },
    explanationWhy: {
      en: "Public-domain response photos are often reused as “proof” of a later disaster.",
      es: "Fotos de respuesta de dominio público a menudo se reutilizan como “prueba” de un desastre posterior.",
    },
    takeaway: {
      en: "Find the original date and place before sharing.",
      es: "Encuentra la fecha y el lugar originales antes de compartir.",
    },
    interaction: {
      type: "context-match",
      instruction: {
        en: "Find the original date and location.",
        es: "Encuentra la fecha y el lugar originales.",
      },
      maxAttempts: 2,
      claim: {
        en: "Proof from today’s disaster in our city — share now.",
        es: "Prueba del desastre de hoy en nuestra ciudad — comparte ya.",
      },
      imageSrc: "/demo-assets/photos/flood-response-2015.jpg",
      imageAlt: {
        en: "National Guard flood response in West Columbia, South Carolina, 2015",
        es: "Respuesta de la Guardia Nacional a inundaciones en West Columbia, Carolina del Sur, 2015",
      },
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
    },
  },
};
