import type { SourceTraceStep } from "../types/sourceTrace";

/** Stable Commons / public-domain references used as “open source” targets. */
const SOURCE_URLS = {
  lagosCommons:
    "https://commons.wikimedia.org/wiki/File:Street_Flood.jpg",
  westColumbiaCommons:
    "https://commons.wikimedia.org/wiki/File:National_Guard_responds_to_flooding_in_South_Carolina_151011-Z-VD915-004.jpg",
  wildfireCommons:
    "https://commons.wikimedia.org/wiki/File:Wildfire_smoke_in_Washington_DC.jpg",
  protestCommons:
    "https://commons.wikimedia.org/wiki/Special:Search?search=protest+gate&go=Go",
} as const;

/** Lagos flood out-of-context — OpenFeed image-context + practice visual-1 */
export const lagosFloodSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Post claim", es: "Afirmación del post" },
    value: {
      en: "LIVE from tonight’s emergency.",
      es: "EN VIVO desde la emergencia de esta noche.",
    },
    status: "conflicting",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source in post", es: "Fuente en el post" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Original source found", es: "Fuente original encontrada" },
    value: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
    status: "archived",
    href: SOURCE_URLS.lagosCommons,
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original photo", es: "Foto original" },
    value: { en: "Lagos, Nigeria", es: "Lagos, Nigeria" },
    detail: { en: "June 24, 2019", es: "24 de junio de 2019" },
    status: "verified",
    href: SOURCE_URLS.lagosCommons,
  },
  {
    id: "today-check",
    kind: "publisher",
    label: { en: "Is it from today?", es: "¿Es de hoy?" },
    value: {
      en: "No — archived June 24, 2019 (not tonight’s emergency)",
      es: "No — archivada el 24 de junio de 2019 (no es la emergencia de esta noche)",
    },
    status: "conflicting",
  },
];

/** South Carolina National Guard flood — OpenFeed transfer (ic-transfer) */
export const westColumbiaSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Post claim", es: "Afirmación del post" },
    value: {
      en: "Proof from today’s disaster in our city.",
      es: "Prueba del desastre de hoy en nuestra ciudad.",
    },
    status: "conflicting",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source in post", es: "Fuente en el post" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Original source found", es: "Fuente original encontrada" },
    value: {
      en: "U.S. Air National Guard / Wikimedia Commons",
      es: "Guardia Nacional Aérea de EE. UU. / Wikimedia Commons",
    },
    status: "archived",
    href: SOURCE_URLS.westColumbiaCommons,
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original photo", es: "Foto original" },
    value: {
      en: "West Columbia, South Carolina",
      es: "West Columbia, Carolina del Sur",
    },
    detail: { en: "October 11, 2015", es: "11 de octubre de 2015" },
    status: "verified",
    href: SOURCE_URLS.westColumbiaCommons,
  },
  {
    id: "today-check",
    kind: "publisher",
    label: { en: "Is it from today?", es: "¿Es de hoy?" },
    value: {
      en: "No — archived October 11, 2015 (not today’s disaster)",
      es: "No — archivada el 11 de octubre de 2015 (no es el desastre de hoy)",
    },
    status: "conflicting",
  },
];

/** Wildfire smoke over Washington, D.C. — claimed as Bogotá */
export const wildfireDcSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Post claim", es: "Afirmación del post" },
    value: {
      en: "A toxic cloud is covering Bogotá right now.",
      es: "Una nube tóxica cubre Bogotá ahora mismo.",
    },
    status: "conflicting",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source in post", es: "Fuente en el post" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Original source found", es: "Fuente original encontrada" },
    value: {
      en: "Wikimedia Commons — Nvss132",
      es: "Wikimedia Commons — Nvss132",
    },
    status: "archived",
    href: SOURCE_URLS.wildfireCommons,
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original photo", es: "Foto original" },
    value: {
      en: "Washington, D.C., United States",
      es: "Washington, D. C., Estados Unidos",
    },
    detail: { en: "June 8, 2023", es: "8 de junio de 2023" },
    status: "verified",
    href: SOURCE_URLS.wildfireCommons,
  },
  {
    id: "today-check",
    kind: "publisher",
    label: { en: "Is it from today / Bogotá?", es: "¿Es de hoy / Bogotá?" },
    value: {
      en: "No — Washington, D.C. wildfire smoke (June 8, 2023), not Bogotá",
      es: "No — humo en Washington, D. C. (8 de junio de 2023), no Bogotá",
    },
    status: "conflicting",
  },
];

/** Protest photo reuse */
export const protestGateSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Post claim", es: "Afirmación del post" },
    value: {
      en: "This happened downtown this morning.",
      es: "Esto pasó en el centro esta mañana.",
    },
    status: "conflicting",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source in post", es: "Fuente en el post" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Archive reference", es: "Referencia de archivo" },
    value: {
      en: "Possible archive match",
      es: "Posible coincidencia de archivo",
    },
    status: "archived",
    href: SOURCE_URLS.protestCommons,
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original photo", es: "Foto original" },
    value: {
      en: "Earlier protest coverage — 2024",
      es: "Cobertura de una protesta anterior — 2024",
    },
    detail: { en: "Different date and place", es: "Otra fecha y otro lugar" },
    status: "verified",
    href: SOURCE_URLS.protestCommons,
  },
  {
    id: "today-check",
    kind: "publisher",
    label: { en: "Is it from this morning?", es: "¿Es de esta mañana?" },
    value: {
      en: "No — reused from earlier protest coverage",
      es: "No — reutilizada de una cobertura de protesta anterior",
    },
    status: "conflicting",
  },
];
