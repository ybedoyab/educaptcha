import type { SourceTraceStep } from "../types/sourceTrace";

/** Lagos flood out-of-context — OpenFeed image-context + practice visual-1 */
export const lagosFloodSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Claim", es: "Afirmación" },
    value: {
      en: "LIVE from tonight’s emergency.",
      es: "EN VIVO desde la emergencia de esta noche.",
    },
    status: "conflicting",
  },
  {
    id: "social",
    kind: "social",
    label: { en: "Social post", es: "Publicación social" },
    value: { en: "Breaking Frames", es: "Breaking Frames" },
    detail: {
      en: "Viral desk · high engagement",
      es: "Escritorio viral · alto engagement",
    },
    status: "unknown",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source", es: "Fuente" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Visual archive match", es: "Coincidencia de archivo" },
    value: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
    status: "archived",
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original", es: "Original" },
    value: { en: "Lagos, Nigeria", es: "Lagos, Nigeria" },
    detail: { en: "June 24, 2019", es: "24 de junio de 2019" },
    status: "verified",
  },
];

/** South Carolina National Guard flood — OpenFeed transfer (ic-transfer) */
export const westColumbiaSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Claim", es: "Afirmación" },
    value: {
      en: "Proof from today’s disaster in our city.",
      es: "Prueba del desastre de hoy en nuestra ciudad.",
    },
    status: "conflicting",
  },
  {
    id: "social",
    kind: "social",
    label: { en: "Social post", es: "Publicación social" },
    value: { en: "Rapid Eyes", es: "Rapid Eyes" },
    detail: {
      en: "People posting this as proof of today’s flood",
      es: "Se publica como prueba de la inundación de hoy",
    },
    status: "unknown",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source", es: "Fuente" },
    value: {
      en: "No original source in the caption",
      es: "Sin fuente original en el pie",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Visual archive match", es: "Coincidencia de archivo" },
    value: {
      en: "U.S. Air National Guard / Wikimedia Commons",
      es: "Guardia Nacional Aérea de EE. UU. / Wikimedia Commons",
    },
    detail: {
      en: "Airman Megan Floyd",
      es: "Airman Megan Floyd",
    },
    status: "archived",
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original", es: "Original" },
    value: {
      en: "West Columbia, South Carolina",
      es: "West Columbia, Carolina del Sur",
    },
    detail: { en: "October 11, 2015", es: "11 de octubre de 2015" },
    status: "verified",
  },
];

/** Wildfire smoke over Washington, D.C. — claimed as Bogotá */
export const wildfireDcSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Claim", es: "Afirmación" },
    value: {
      en: "A toxic cloud is covering Bogotá right now.",
      es: "Una nube tóxica cubre Bogotá ahora mismo.",
    },
    status: "conflicting",
  },
  {
    id: "social",
    kind: "social",
    label: { en: "Social post", es: "Publicación social" },
    value: { en: "SkyWatch Live", es: "SkyWatch Live" },
    status: "unknown",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source", es: "Fuente" },
    value: {
      en: "No official bulletin linked",
      es: "Sin boletín oficial enlazado",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Visual archive match", es: "Coincidencia de archivo" },
    value: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
    status: "archived",
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original", es: "Original" },
    value: {
      en: "Washington, D.C., USA",
      es: "Washington, D.C., EE. UU.",
    },
    detail: {
      en: "Wildfire smoke · 2023",
      es: "Humo de incendios · 2023",
    },
    status: "verified",
  },
];

/**
 * Protest under a gate — reused with a “this morning” caption.
 * Only known archive metadata from project credits (year 2024, Wikimedia).
 */
export const protestGateSourceTrace: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Claim", es: "Afirmación" },
    value: {
      en: "This photo is from this morning’s march.",
      es: "Esta foto es de la marcha de esta mañana.",
    },
    status: "conflicting",
  },
  {
    id: "social",
    kind: "social",
    label: { en: "Social post", es: "Publicación social" },
    value: { en: "StreetWire", es: "StreetWire" },
    status: "unknown",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source", es: "Fuente" },
    value: {
      en: "No event source in the caption",
      es: "Sin fuente del evento en el pie",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Visual archive match", es: "Coincidencia de archivo" },
    value: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
    detail: {
      en: "Protest under the gate",
      es: "Protesta bajo la puerta",
    },
    status: "archived",
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original", es: "Original" },
    value: {
      en: "Earlier protest under the gate",
      es: "Protesta anterior bajo la puerta",
    },
    detail: { en: "2024 archive coverage", es: "Cobertura de archivo 2024" },
    status: "verified",
  },
];
