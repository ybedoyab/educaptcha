import type { ExperienceScenario } from "../types/learning";

export const experienceScenarios: ExperienceScenario[] = [
  {
    id: "emotional-pressure",
    skill: "emotional-pressure",
    skillLabel: {
      en: "Recognizing emotional pressure",
      es: "Reconocer presión emocional",
    },
    title: {
      en: "Emotional pressure",
      es: "Presión emocional",
    },
    trends: [
      {
        en: "Civic alerts trending",
        es: "Alertas cívicas en tendencia",
      },
      {
        en: "Verify before you share",
        es: "Verifica antes de compartir",
      },
      {
        en: "Local policy updates",
        es: "Actualizaciones de políticas locales",
      },
    ],
    posts: [
      {
        id: "ep-filler-1",
        author: { en: "Marina Ortiz", es: "Marina Ortiz" },
        handle: "@marina.reads",
        time: { en: "3h", es: "3 h" },
        body: {
          en: "Quiet afternoon at the community garden. The new compost bins arrived today.",
          es: "Tarde tranquila en el jardín comunitario. Llegaron los nuevos contenedores de compost.",
        },
        reactions: 42,
        comments: 6,
        shares: 2,
        visual: "neutral",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: false,
      },
      {
        id: "ep-target-1",
        author: { en: "AlertNow Desk", es: "AlertNow Desk" },
        handle: "@alertnow.desk",
        time: { en: "18m", es: "18 min" },
        body: {
          en: "URGENT: They are trying to delete this information. Share it NOW before it disappears! A new health directive is about to change everything overnight.",
          es: "URGENTE: Están intentando eliminar esta información. ¡Compártela AHORA antes de que desaparezca! Una nueva directiva de salud está a punto de cambiarlo todo de la noche a la mañana.",
        },
        reactions: 12840,
        comments: 932,
        shares: 5401,
        visual: "urgent-alert",
        triggerAction: "share",
        isTarget: true,
        isTransferTarget: false,
      },
      {
        id: "ep-filler-2",
        author: { en: "City Library", es: "Biblioteca Municipal" },
        handle: "@city.library",
        time: { en: "5h", es: "5 h" },
        body: {
          en: "Workshop this Saturday: how to evaluate online sources. Free seats available.",
          es: "Taller este sábado: cómo evaluar fuentes en línea. Quedan lugares gratis.",
        },
        reactions: 118,
        comments: 14,
        shares: 21,
        visual: "neutral",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: false,
      },
      {
        id: "ep-transfer-1",
        author: { en: "Inside Source Notes", es: "Notas de fuente interna" },
        handle: "@inside.notes",
        time: { en: "41m", es: "41 min" },
        body: {
          en: "A source inside the institution says this decision will affect everyone tomorrow. Send this to your family before it is too late.",
          es: "Una fuente dentro de la institución dice que esta decisión afectará a todos mañana. Envíaselo a tu familia antes de que sea demasiado tarde.",
        },
        reactions: 2860,
        comments: 410,
        shares: 974,
        visual: "subtle-warn",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: true,
      },
    ],
    challenge: {
      question: {
        en: "Which signal should make you pause before sharing?",
        es: "¿Qué señal debería hacerte detenerte antes de compartir?",
      },
      options: [
        {
          id: "a",
          label: {
            en: "The post has many reactions.",
            es: "La publicación tiene muchas reacciones.",
          },
        },
        {
          id: "b",
          label: {
            en: "It uses urgency, fear and asks you to share immediately.",
            es: "Usa urgencia, miedo y te pide compartir de inmediato.",
          },
        },
        {
          id: "c",
          label: {
            en: "The text is short.",
            es: "El texto es corto.",
          },
        },
      ],
      correctOptionId: "b",
      explanationShort: {
        en: "Urgency, fear and commands to share can pressure people into reacting before verifying.",
        es: "La urgencia, el miedo y las órdenes de compartir pueden presionar a las personas para reaccionar sin verificar.",
      },
      explanationLong: {
        en: "Urgency, fear and commands to share can pressure people into reacting before verifying. High reaction counts do not prove accuracy — they often amplify emotional posts. Slow down, look for a named source, date and original document before you pass it on.",
        es: "La urgencia, el miedo y las órdenes de compartir pueden presionar a las personas para reaccionar sin verificar. Muchas reacciones no demuestran exactitud: a menudo amplifican publicaciones emocionales. Detente, busca una fuente con nombre, fecha y documento original antes de reenviarlo.",
      },
      takeaway: {
        en: "When content tries to rush you, slow down and check the original source.",
        es: "Cuando un contenido intenta apresurarte, detente y revisa la fuente original.",
      },
    },
    transfer: {
      verifyLabel: {
        en: "Verify before sharing",
        es: "Verificar antes de compartir",
      },
      shareLabel: {
        en: "Share immediately",
        es: "Compartir inmediatamente",
      },
      verifyFacts: [
        {
          label: { en: "Original source", es: "Fuente original" },
          value: { en: "Not found", es: "No encontrada" },
          status: "warning",
        },
        {
          label: { en: "Author", es: "Autor" },
          value: { en: "Not identified", es: "No identificado" },
          status: "warning",
        },
        {
          label: { en: "Date", es: "Fecha" },
          value: { en: "Unconfirmed", es: "Sin confirmar" },
          status: "warning",
        },
        {
          label: { en: "Language", es: "Lenguaje" },
          value: {
            en: "Urgency and pressure to share",
            es: "Urgencia y presión para compartir",
          },
          status: "warning",
        },
      ],
      shareCorrection: {
        en: "This post still uses pressure tactics. Try verifying before sharing.",
        es: "Esta publicación aún usa tácticas de presión. Intenta verificar antes de compartir.",
      },
    },
  },
  {
    id: "image-context",
    skill: "image-context",
    skillLabel: {
      en: "Checking image date and context",
      es: "Verificar fecha y contexto de imágenes",
    },
    title: {
      en: "Image out of context",
      es: "Imagen fuera de contexto",
    },
    trends: [
      {
        en: "Visual verification tips",
        es: "Consejos de verificación visual",
      },
      {
        en: "Archive photo searches",
        es: "Búsqueda en archivos fotográficos",
      },
      {
        en: "Local weather watch",
        es: "Clima local",
      },
    ],
    posts: [
      {
        id: "ic-filler-1",
        author: { en: "Neighborhood Hub", es: "Hub del barrio" },
        handle: "@neigh.hub",
        time: { en: "2h", es: "2 h" },
        body: {
          en: "Street market opens at 9. Bring reusable bags if you can.",
          es: "El mercado callejero abre a las 9. Trae bolsas reutilizables si puedes.",
        },
        reactions: 67,
        comments: 9,
        shares: 4,
        visual: "neutral",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: false,
      },
      {
        id: "ic-target-1",
        author: { en: "Breaking Frames", es: "Breaking Frames" },
        handle: "@breaking.frames",
        time: { en: "12m", es: "12 min" },
        body: {
          en: "LIVE from tonight’s emergency response. This photo proves what officials will not say. Share so everyone sees it.",
          es: "EN VIVO desde la respuesta de emergencia de esta noche. Esta foto prueba lo que las autoridades no dicen. Comparte para que todos la vean.",
        },
        reactions: 9044,
        comments: 701,
        shares: 3202,
        visual: "old-photo",
        triggerAction: "share",
        isTarget: true,
        isTransferTarget: false,
      },
      {
        id: "ic-filler-2",
        author: { en: "Science Desk", es: "Escritorio de ciencia" },
        handle: "@science.desk",
        time: { en: "6h", es: "6 h" },
        body: {
          en: "New open dataset on urban heat islands is available for journalists and students.",
          es: "Hay un nuevo conjunto de datos abiertos sobre islas de calor urbanas para periodistas y estudiantes.",
        },
        reactions: 203,
        comments: 27,
        shares: 55,
        visual: "neutral",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: false,
      },
      {
        id: "ic-transfer-1",
        author: { en: "Rapid Eyes", es: "Rapid Eyes" },
        handle: "@rapid.eyes",
        time: { en: "27m", es: "27 min" },
        body: {
          en: "People are already posting this as proof of today’s flood. Forward it to your group chat.",
          es: "La gente ya publica esto como prueba de la inundación de hoy. Reenvíalo a tu chat grupal.",
        },
        reactions: 4510,
        comments: 388,
        shares: 1190,
        visual: "reused-photo",
        triggerAction: "share",
        isTarget: false,
        isTransferTarget: true,
      },
    ],
    challenge: {
      question: {
        en: "What should you check before assuming this image belongs to the reported event?",
        es: "¿Qué deberías comprobar antes de asumir que esta imagen pertenece al evento reportado?",
      },
      options: [
        {
          id: "a",
          label: {
            en: "How many people liked the post",
            es: "Cuántas personas dieron me gusta",
          },
        },
        {
          id: "b",
          label: {
            en: "Original date, source and context",
            es: "Fecha, fuente y contexto originales",
          },
        },
        {
          id: "c",
          label: {
            en: "Whether the colors look unusual",
            es: "Si los colores se ven inusuales",
          },
        },
      ],
      correctOptionId: "b",
      explanationShort: {
        en: "Real images are often reused with new captions. Date, source and context matter more than how dramatic a photo looks.",
        es: "Las imágenes reales a menudo se reutilizan con nuevos pies de foto. La fecha, la fuente y el contexto importan más que lo dramática que se vea la foto.",
      },
      explanationLong: {
        en: "Real images are often reused with false dates, locations or captions. Unusual looks alone do not prove an image is fake. Check the original date, publisher and surrounding context before sharing — especially when a post claims the photo is from “tonight” without evidence.",
        es: "Las imágenes reales a menudo se reutilizan con fechas, lugares o pies de foto falsos. Que se vea inusual no prueba por sí sola que sea falsa. Revisa la fecha original, el editor y el contexto antes de compartir — sobre todo si una publicación afirma que es “de esta noche” sin evidencia.",
      },
      takeaway: {
        en: "Treat dramatic “live” photos as a prompt to check origin — not as instant proof.",
        es: "Trata las fotos “en vivo” dramáticas como una señal para revisar el origen, no como prueba instantánea.",
      },
    },
    transfer: {
      verifyLabel: {
        en: "Verify before sharing",
        es: "Verificar antes de compartir",
      },
      shareLabel: {
        en: "Share immediately",
        es: "Compartir inmediatamente",
      },
      verifyFacts: [
        {
          label: { en: "Claimed date", es: "Fecha afirmada" },
          value: { en: "“Today” — unverified", es: "“Hoy” — sin verificar" },
          status: "warning",
        },
        {
          label: { en: "Archive match", es: "Coincidencia en archivo" },
          value: {
            en: "Similar image dated 2019",
            es: "Imagen similar fechada en 2019",
          },
          status: "warning",
        },
        {
          label: { en: "Publisher", es: "Editor" },
          value: { en: "Unclear / anonymous", es: "Poco claro / anónimo" },
          status: "warning",
        },
        {
          label: { en: "Context", es: "Contexto" },
          value: {
            en: "Different city than claimed",
            es: "Ciudad distinta a la afirmada",
          },
          status: "warning",
        },
      ],
      shareCorrection: {
        en: "This image may be from another time or place. Check date and source before sharing.",
        es: "Esta imagen puede ser de otro momento o lugar. Revisa fecha y fuente antes de compartir.",
      },
    },
  },
];

export function getScenario(id: string): ExperienceScenario {
  return (
    experienceScenarios.find((s) => s.id === id) ?? experienceScenarios[0]
  );
}
