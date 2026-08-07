import type { LocalizedText } from "../types";

export type FeedCategory =
  | "local-news"
  | "health"
  | "environment"
  | "science"
  | "community"
  | "technology";

export type PostTone = "neutral" | "manipulative" | "ambiguous" | "official";

export type MediaKind =
  | "photo"
  | "chart"
  | "document"
  | "video"
  | "text"
  | "thread"
  | "official";

export interface FeedComment {
  id: string;
  author: string;
  handle: string;
  body: LocalizedText;
  createdAt: string;
  likes: number;
  parentId?: string;
  isOwn?: boolean;
}

export interface OpenFeedPost {
  id: string;
  author: LocalizedText;
  handle: string;
  avatarHue: number;
  time: LocalizedText;
  body: LocalizedText;
  category: FeedCategory;
  tone: PostTone;
  mediaKind: MediaKind;
  /** @deprecated Prefer mediaAssetId */
  imageSrc?: string;
  mediaAssetId?: string;
  tags: string[];
  reactions: number;
  comments: number;
  shares: number;
  seedComments: FeedComment[];
  triggerSkill?:
    | "emotional-pressure"
    | "image-context"
    | "wildfire-context"
    | "vaccine-claim"
    | "protest-context"
    | "misleading-chart"
    | "ai-content"
    | "sources";
  scenarioId?: string;
  minigameId?: string;
  transferMinigameId?: string;
  /** Post id used for transfer highlight after initial challenge */
  transferPostId?: string;
}

export const openFeedPosts: OpenFeedPost[] = [
  {
    id: "p-garden",
    author: { en: "Marina Ortiz", es: "Marina Ortiz" },
    handle: "@marina.reads",
    avatarHue: 160,
    time: { en: "3h", es: "3 h" },
    body: {
      en: "Quiet afternoon at the community garden. New compost bins arrived today.",
      es: "Tarde tranquila en el jardín comunitario. Llegaron los nuevos contenedores de compost.",
    },
    category: "community",
    tone: "neutral",
    mediaKind: "text",
    tags: ["community", "garden"],
    reactions: 42,
    comments: 4,
    shares: 2,
    seedComments: [
      {
        id: "c1",
        author: "Leo",
        handle: "@leo.n",
        body: {
          en: "Nice! Which neighborhood plot is this?",
          es: "¡Qué bien! ¿De qué parcela del barrio es?",
        },
        createdAt: "2026-08-06T10:00:00Z",
        likes: 3,
      },
      {
        id: "c2",
        author: "Ada",
        handle: "@ada.k",
        body: {
          en: "Bring seedlings this Saturday if you can.",
          es: "Trae plantones el sábado si puedes.",
        },
        createdAt: "2026-08-06T10:20:00Z",
        likes: 5,
      },
    ],
  },
  {
    id: "p-library",
    author: { en: "City Library", es: "Biblioteca Municipal" },
    handle: "@city.library",
    avatarHue: 200,
    time: { en: "5h", es: "5 h" },
    body: {
      en: "Workshop this Saturday: how to evaluate online sources. Free seats available.",
      es: "Taller este sábado: cómo evaluar fuentes en línea. Quedan lugares gratis.",
    },
    category: "community",
    tone: "official",
    mediaKind: "official",
    mediaAssetId: "neutral-news-report",
    tags: ["library", "literacy"],
    reactions: 118,
    comments: 6,
    shares: 21,
    seedComments: [
      {
        id: "c3",
        author: "Sam",
        handle: "@sam.r",
        body: {
          en: "High engagement does not confirm accuracy.",
          es: "Un alto engagement no confirma exactitud.",
        },
        createdAt: "2026-08-06T09:00:00Z",
        likes: 12,
      },
    ],
  },
  {
    id: "p-science",
    author: { en: "Science Desk", es: "Escritorio de ciencia" },
    handle: "@science.desk",
    avatarHue: 190,
    time: { en: "6h", es: "6 h" },
    body: {
      en: "New open dataset on urban heat islands is available for journalists and students.",
      es: "Hay un nuevo conjunto de datos abiertos sobre islas de calor urbanas.",
    },
    category: "science",
    tone: "official",
    mediaKind: "document",
    mediaAssetId: "source-document",
    tags: ["science", "data"],
    reactions: 203,
    comments: 8,
    shares: 55,
    seedComments: [
      {
        id: "c4",
        author: "Noor",
        handle: "@noor.d",
        body: {
          en: "Does anyone have the original source?",
          es: "¿Alguien tiene la fuente original?",
        },
        createdAt: "2026-08-06T08:30:00Z",
        likes: 7,
      },
    ],
  },
  {
    id: "p-market",
    author: { en: "Neighborhood Hub", es: "Hub del barrio" },
    handle: "@neigh.hub",
    avatarHue: 40,
    time: { en: "2h", es: "2 h" },
    body: {
      en: "Street market opens at 9. Bring reusable bags if you can.",
      es: "El mercado callejero abre a las 9. Trae bolsas reutilizables si puedes.",
    },
    category: "local-news",
    tone: "neutral",
    mediaKind: "text",
    tags: ["local", "market"],
    reactions: 67,
    comments: 3,
    shares: 4,
    seedComments: [
      {
        id: "c5",
        author: "Mia",
        handle: "@mia.p",
        body: {
          en: "Will there be fresh fruit stalls?",
          es: "¿Habrá puestos de fruta fresca?",
        },
        createdAt: "2026-08-06T11:00:00Z",
        likes: 2,
      },
    ],
  },
  {
    id: "p-tech",
    author: { en: "Civic Tech Lab", es: "Lab Civic Tech" },
    handle: "@civic.tech",
    avatarHue: 210,
    time: { en: "8h", es: "8 h" },
    body: {
      en: "We published a privacy checklist for community websites. Feedback welcome.",
      es: "Publicamos una lista de privacidad para sitios comunitarios. Se aceptan comentarios.",
    },
    category: "technology",
    tone: "neutral",
    mediaKind: "document",
    mediaAssetId: "source-document",
    tags: ["tech", "privacy"],
    reactions: 89,
    comments: 5,
    shares: 17,
    seedComments: [
      {
        id: "c6",
        author: "Jon",
        handle: "@jon.w",
        body: {
          en: "This account was created yesterday.",
          es: "Esta cuenta se creó ayer.",
        },
        createdAt: "2026-08-06T07:00:00Z",
        likes: 4,
      },
    ],
  },
  {
    id: "p-weather",
    author: { en: "Metro Weather", es: "Clima Metro" },
    handle: "@metro.weather",
    avatarHue: 220,
    time: { en: "1h", es: "1 h" },
    body: {
      en: "Light rain expected after 4 p.m. No alerts issued for the metro area.",
      es: "Lluvia ligera prevista después de las 16:00. Sin alertas para el área metro.",
    },
    category: "environment",
    tone: "official",
    mediaKind: "text",
    tags: ["weather"],
    reactions: 156,
    comments: 4,
    shares: 9,
    seedComments: [
      {
        id: "c7",
        author: "Pat",
        handle: "@pat.l",
        body: {
          en: "Thanks for the clear bulletin.",
          es: "Gracias por el boletín claro.",
        },
        createdAt: "2026-08-06T12:00:00Z",
        likes: 6,
      },
    ],
  },
  {
    id: "p-bike",
    author: { en: "Transit Watch", es: "Vigilancia tránsito" },
    handle: "@transit.watch",
    avatarHue: 130,
    time: { en: "4h", es: "4 h" },
    body: {
      en: "Bike lane on 5th Avenue reopens Monday after resurfacing.",
      es: "El carril bici de la 5ª avenida reabre el lunes tras el reseñado.",
    },
    category: "local-news",
    tone: "neutral",
    mediaKind: "text",
    tags: ["transit"],
    reactions: 74,
    comments: 3,
    shares: 11,
    seedComments: [
      {
        id: "c8",
        author: "Kim",
        handle: "@kim.b",
        body: {
          en: "Finally — that stretch was rough.",
          es: "Por fin — ese tramo estaba mal.",
        },
        createdAt: "2026-08-06T09:40:00Z",
        likes: 8,
      },
    ],
  },
  {
    id: "p-health-tips",
    author: { en: "Public Health Office", es: "Oficina de Salud Pública" },
    handle: "@public.health",
    avatarHue: 175,
    time: { en: "7h", es: "7 h" },
    body: {
      en: "Flu clinic hours extended this week. Appointments available on the city site.",
      es: "Horario ampliado de la clínica de gripe esta semana. Citas en el sitio de la ciudad.",
    },
    category: "health",
    tone: "official",
    mediaKind: "official",
    mediaAssetId: "neutral-news-report",
    tags: ["health", "clinic"],
    reactions: 221,
    comments: 9,
    shares: 48,
    seedComments: [
      {
        id: "c9",
        author: "Rae",
        handle: "@rae.m",
        body: {
          en: "Is walk-in still possible on Friday?",
          es: "¿Todavía se puede ir sin cita el viernes?",
        },
        createdAt: "2026-08-06T08:10:00Z",
        likes: 3,
      },
    ],
  },
  {
    id: "p-alert-urgent",
    author: { en: "AlertNow Desk", es: "AlertNow Desk" },
    handle: "@alertnow.desk",
    avatarHue: 15,
    time: { en: "18m", es: "18 min" },
    body: {
      en: "URGENT: They are trying to delete this information. Share it NOW before it disappears!",
      es: "URGENTE: Están intentando eliminar esta información. ¡Compártela AHORA antes de que desaparezca!",
    },
    category: "health",
    tone: "manipulative",
    mediaKind: "photo",
    mediaAssetId: "viral-health-alert",
    tags: ["viral", "urgency"],
    reactions: 12840,
    comments: 32,
    shares: 5401,
    triggerSkill: "emotional-pressure",
    scenarioId: "emotional-pressure",
    minigameId: "ep-spot",
    transferMinigameId: "ep-transfer",
    transferPostId: "p-inside",
    seedComments: [
      {
        id: "c10",
        author: "Alex",
        handle: "@alex.t",
        body: {
          en: "I saw this in several groups, so it must be true.",
          es: "Lo vi en varios grupos, así que debe ser verdad.",
        },
        createdAt: "2026-08-06T12:10:00Z",
        likes: 41,
      },
      {
        id: "c11",
        author: "Dana",
        handle: "@dana.v",
        body: {
          en: "Does anyone have the original source?",
          es: "¿Alguien tiene la fuente original?",
        },
        createdAt: "2026-08-06T12:15:00Z",
        likes: 28,
      },
      {
        id: "c12",
        author: "Chris",
        handle: "@chris.q",
        body: {
          en: "This account was created yesterday.",
          es: "Esta cuenta se creó ayer.",
        },
        createdAt: "2026-08-06T12:18:00Z",
        likes: 55,
      },
    ],
  },
  {
    id: "p-flood-live",
    author: { en: "Breaking Frames", es: "Breaking Frames" },
    handle: "@breaking.frames",
    avatarHue: 25,
    time: { en: "12m", es: "12 min" },
    body: {
      en: "LIVE from tonight’s emergency response. Share so everyone sees it.",
      es: "EN VIVO desde la emergencia de esta noche. Comparte para que todos la vean.",
    },
    category: "environment",
    tone: "manipulative",
    mediaKind: "photo",
    mediaAssetId: "flood-lagos-2019",
    tags: ["flood", "out-of-context"],
    reactions: 9044,
    comments: 41,
    shares: 3202,
    triggerSkill: "image-context",
    scenarioId: "image-context",
    minigameId: "ic-match",
    transferMinigameId: "ic-transfer",
    transferPostId: "p-flood-today",
    seedComments: [
      {
        id: "c13",
        author: "Eve",
        handle: "@eve.s",
        body: {
          en: "The same image appears in a 2019 archive.",
          es: "La misma imagen aparece en un archivo de 2019.",
        },
        createdAt: "2026-08-06T12:20:00Z",
        likes: 63,
      },
      {
        id: "c14",
        author: "Omar",
        handle: "@omar.h",
        body: {
          en: "High engagement does not confirm accuracy.",
          es: "Un alto engagement no confirma exactitud.",
        },
        createdAt: "2026-08-06T12:22:00Z",
        likes: 37,
      },
    ],
  },
  {
    id: "p-wildfire",
    author: { en: "SkyWatch Live", es: "SkyWatch Live" },
    handle: "@skywatch.live",
    avatarHue: 5,
    time: { en: "22m", es: "22 min" },
    body: {
      en: "A toxic cloud is covering Bogotá right now. Officials are hiding it.",
      es: "Una nube tóxica cubre Bogotá ahora mismo. Las autoridades lo ocultan.",
    },
    category: "environment",
    tone: "manipulative",
    mediaKind: "photo",
    mediaAssetId: "wildfire-washington-dc",
    tags: ["wildfire", "out-of-context"],
    reactions: 7102,
    comments: 29,
    shares: 2104,
    triggerSkill: "wildfire-context",
    scenarioId: "wildfire-context",
    minigameId: "wf-match",
    transferMinigameId: "wf-transfer",
    transferPostId: "p-flood-today",
    seedComments: [
      {
        id: "c15",
        author: "Lina",
        handle: "@lina.c",
        body: {
          en: "Does anyone have the original source?",
          es: "¿Alguien tiene la fuente original?",
        },
        createdAt: "2026-08-06T12:05:00Z",
        likes: 19,
      },
      {
        id: "c16",
        author: "Theo",
        handle: "@theo.b",
        body: {
          en: "I saw this in several groups, so it must be true.",
          es: "Lo vi en varios grupos, así que debe ser verdad.",
        },
        createdAt: "2026-08-06T12:08:00Z",
        likes: 11,
      },
    ],
  },
  {
    id: "p-vaccine",
    author: { en: "Health Truth Now", es: "Health Truth Now" },
    handle: "@health.truth",
    avatarHue: 330,
    time: { en: "35m", es: "35 min" },
    body: {
      en: "This vial proves the new formula is unsafe. Share before they remove it.",
      es: "Este vial prueba que la nueva fórmula no es segura. Comparte antes de que lo quiten.",
    },
    category: "health",
    tone: "manipulative",
    mediaKind: "photo",
    mediaAssetId: "vaccine-vial-2024",
    tags: ["health", "unsupported-claim"],
    reactions: 5320,
    comments: 44,
    shares: 1890,
    triggerSkill: "vaccine-claim",
    scenarioId: "vaccine-claim",
    minigameId: "vx-inspect",
    transferMinigameId: "vx-transfer",
    transferPostId: "p-health-tips",
    seedComments: [
      {
        id: "c17",
        author: "Nina",
        handle: "@nina.f",
        body: {
          en: "A photo of a vial does not prove a safety claim.",
          es: "La foto de un vial no prueba una afirmación de seguridad.",
        },
        createdAt: "2026-08-06T11:50:00Z",
        likes: 48,
      },
    ],
  },
  {
    id: "p-protest",
    author: { en: "StreetWire", es: "StreetWire" },
    handle: "@street.wire",
    avatarHue: 280,
    time: { en: "50m", es: "50 min" },
    body: {
      en: "Huge crowds in our capital today. This photo is from this morning’s march.",
      es: "Multitudes enormes en nuestra capital hoy. Esta foto es de la marcha de esta mañana.",
    },
    category: "local-news",
    tone: "ambiguous",
    mediaKind: "photo",
    mediaAssetId: "protest-2024",
    tags: ["protest", "reuse"],
    reactions: 4011,
    comments: 22,
    shares: 980,
    triggerSkill: "protest-context",
    scenarioId: "protest-context",
    minigameId: "pr-match",
    transferMinigameId: "pr-transfer",
    transferPostId: "p-flood-today",
    seedComments: [
      {
        id: "c18",
        author: "Gus",
        handle: "@gus.y",
        body: {
          en: "The same image appears in a 2019 archive.",
          es: "La misma imagen aparece en un archivo de 2019.",
        },
        createdAt: "2026-08-06T11:40:00Z",
        likes: 21,
      },
    ],
  },
  {
    id: "p-chart",
    author: { en: "Metric Buzz", es: "Metric Buzz" },
    handle: "@metric.buzz",
    avatarHue: 50,
    time: { en: "1h", es: "1 h" },
    body: {
      en: "Engagement exploded overnight. Look at this chart — undeniable proof.",
      es: "El engagement explotó de la noche a la mañana. Mira esta gráfica — prueba innegable.",
    },
    category: "technology",
    tone: "manipulative",
    mediaKind: "chart",
    mediaAssetId: "misleading-chart-preview",
    tags: ["chart", "misleading"],
    reactions: 2880,
    comments: 17,
    shares: 744,
    triggerSkill: "misleading-chart",
    scenarioId: "misleading-chart",
    minigameId: "ch-repair",
    transferMinigameId: "ch-transfer",
    transferPostId: "p-tech",
    seedComments: [
      {
        id: "c19",
        author: "Ivy",
        handle: "@ivy.z",
        body: {
          en: "Check where the vertical axis starts.",
          es: "Revisa dónde empieza el eje vertical.",
        },
        createdAt: "2026-08-06T11:20:00Z",
        likes: 33,
      },
    ],
  },
  {
    id: "p-inside",
    author: { en: "Inside Source Notes", es: "Notas de fuente interna" },
    handle: "@inside.notes",
    avatarHue: 20,
    time: { en: "41m", es: "41 min" },
    body: {
      en: "A source inside the institution says this decision will affect everyone tomorrow. Send this to your family before it is too late.",
      es: "Una fuente dentro de la institución dice que esta decisión afectará a todos mañana. Envíaselo a tu familia antes de que sea demasiado tarde.",
    },
    category: "local-news",
    tone: "ambiguous",
    mediaKind: "text",
    tags: ["pressure", "transfer"],
    reactions: 2860,
    comments: 18,
    shares: 974,
    triggerSkill: "emotional-pressure",
    scenarioId: "emotional-pressure",
    minigameId: "ep-transfer",
    seedComments: [
      {
        id: "c20",
        author: "Bea",
        handle: "@bea.k",
        body: {
          en: "Anonymous sources still need corroboration.",
          es: "Las fuentes anónimas aún necesitan corroboración.",
        },
        createdAt: "2026-08-06T11:55:00Z",
        likes: 26,
      },
    ],
  },
  {
    id: "p-flood-today",
    author: { en: "Rapid Eyes", es: "Rapid Eyes" },
    handle: "@rapid.eyes",
    avatarHue: 35,
    time: { en: "27m", es: "27 min" },
    body: {
      en: "People are already posting this as proof of today’s flood.",
      es: "La gente ya publica esto como prueba de la inundación de hoy.",
    },
    category: "environment",
    tone: "ambiguous",
    mediaKind: "photo",
    mediaAssetId: "flood-response-2015",
    tags: ["flood", "transfer"],
    reactions: 4510,
    comments: 20,
    shares: 1190,
    triggerSkill: "image-context",
    scenarioId: "image-context",
    minigameId: "ic-transfer",
    seedComments: [
      {
        id: "c21",
        author: "Cal",
        handle: "@cal.j",
        body: {
          en: "Looks familiar from an older response photo.",
          es: "Se parece a una foto antigua de respuesta.",
        },
        createdAt: "2026-08-06T12:01:00Z",
        likes: 14,
      },
    ],
  },
  {
    id: "p-thread",
    author: { en: "Verify Club", es: "Verify Club" },
    handle: "@verify.club",
    avatarHue: 170,
    time: { en: "9h", es: "9 h" },
    body: {
      en: "Thread: five habits for checking images before you forward them. 1/5",
      es: "Hilo: cinco hábitos para revisar imágenes antes de reenviarlas. 1/5",
    },
    category: "community",
    tone: "neutral",
    mediaKind: "thread",
    tags: ["thread", "literacy"],
    reactions: 512,
    comments: 24,
    shares: 140,
    seedComments: [
      {
        id: "c22",
        author: "Dee",
        handle: "@dee.o",
        body: {
          en: "Saving this for our school workshop.",
          es: "Lo guardo para el taller escolar.",
        },
        createdAt: "2026-08-06T06:00:00Z",
        likes: 18,
      },
    ],
  },
  {
    id: "p-video",
    author: { en: "City Channel", es: "Canal Ciudad" },
    handle: "@city.channel",
    avatarHue: 185,
    time: { en: "10h", es: "10 h" },
    body: {
      en: "Council meeting replay is available. Simulated video thumbnail below.",
      es: "La retransmisión del consejo ya está disponible. Miniatura de video simulada abajo.",
    },
    category: "local-news",
    tone: "official",
    mediaKind: "video",
    mediaAssetId: "neutral-news-report",
    tags: ["council", "video"],
    reactions: 330,
    comments: 12,
    shares: 40,
    seedComments: [
      {
        id: "c23",
        author: "Fran",
        handle: "@fran.u",
        body: {
          en: "Timestamp 14:20 covers the budget vote.",
          es: "En el minuto 14:20 está la votación del presupuesto.",
        },
        createdAt: "2026-08-06T05:30:00Z",
        likes: 9,
      },
    ],
  },
];

export const openFeedTrends: LocalizedText[] = [
  { en: "Verify before you share", es: "Verifica antes de compartir" },
  { en: "Local policy updates", es: "Actualizaciones de políticas locales" },
  { en: "Visual verification tips", es: "Consejos de verificación visual" },
  { en: "Community workshops", es: "Talleres comunitarios" },
];
