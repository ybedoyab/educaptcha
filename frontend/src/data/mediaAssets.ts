import type { LocalizedText } from "../types";

export type MediaAssetType = "jpg" | "png" | "webp" | "svg";

export type MediaAsset = {
  id: string;
  publicPath: string;
  type: MediaAssetType;
  alt: LocalizedText;
  creditId?: string;
  intentionalPlaceholder?: boolean;
};

export const mediaAssets: Record<string, MediaAsset> = {
  "flood-lagos-2019": {
    id: "flood-lagos-2019",
    publicPath: "/demo-assets/photos/flood-lagos-2019.jpg",
    type: "jpg",
    alt: {
      en: "Flooded street in Lagos, Nigeria, June 2019",
      es: "Calle inundada en Lagos, Nigeria, junio 2019",
    },
    creditId: "flood-lagos",
  },
  "flood-response-2015": {
    id: "flood-response-2015",
    publicPath: "/demo-assets/photos/flood-response-2015.jpg",
    type: "jpg",
    alt: {
      en: "National Guard flood response, October 2015",
      es: "Respuesta de la Guardia Nacional a inundación, octubre 2015",
    },
    creditId: "flood-response",
  },
  "flooded-guadalajara-2013": {
    id: "flooded-guadalajara-2013",
    publicPath: "/demo-assets/photos/flooded-guadalajara-2013.jpg",
    type: "jpg",
    alt: {
      en: "Flooded street and vehicles, Guadalajara 2013",
      es: "Calle inundada y vehículos, Guadalajara 2013",
    },
    creditId: "flood-guadalajara",
  },
  "flooded-street-vehicles": {
    id: "flooded-street-vehicles",
    publicPath: "/demo-assets/photos/flooded-street-vehicles.jpg",
    type: "jpg",
    alt: {
      en: "Vehicles on a flooded urban street",
      es: "Vehículos en una calle urbana inundada",
    },
  },
  "wildfire-washington-dc": {
    id: "wildfire-washington-dc",
    publicPath: "/demo-assets/photos/wildfire-washington-dc.jpg",
    type: "jpg",
    alt: {
      en: "Wildfire smoke over Washington, D.C.",
      es: "Humo de incendios sobre Washington, D.C.",
    },
    creditId: "wildfire-dc",
  },
  "protest-2024": {
    id: "protest-2024",
    publicPath: "/demo-assets/photos/protest-2024.jpg",
    type: "jpg",
    alt: {
      en: "Protest under a gate",
      es: "Protesta bajo una puerta",
    },
    creditId: "protest-gate",
  },
  "vaccine-vial-2024": {
    id: "vaccine-vial-2024",
    publicPath: "/demo-assets/photos/vaccine-vial-2024.jpg",
    type: "jpg",
    alt: {
      en: "COVID-19 vaccine vial photograph",
      es: "Fotografía de un vial de vacuna COVID-19",
    },
    creditId: "vaccine-vial",
  },
  "covid-protest-2020": {
    id: "covid-protest-2020",
    publicPath: "/demo-assets/photos/covid-protest-2020.jpg",
    type: "jpg",
    alt: {
      en: "COVID-related protest photograph",
      es: "Fotografía de protesta relacionada con COVID",
    },
    creditId: "covid-protest",
  },
  "viral-health-alert": {
    id: "viral-health-alert",
    publicPath: "/demo-assets/viral-health-alert.svg",
    type: "svg",
    alt: {
      en: "Simulated viral health alert graphic",
      es: "Gráfico simulado de alerta de salud viral",
    },
  },
  "neutral-news-report": {
    id: "neutral-news-report",
    publicPath: "/demo-assets/neutral-news-report-utf8.svg",
    type: "svg",
    alt: {
      en: "Simulated neutral news report thumbnail",
      es: "Miniatura simulada de reporte informativo",
    },
  },
  "source-document": {
    id: "source-document",
    publicPath: "/demo-assets/source-document-utf8.svg",
    type: "svg",
    alt: {
      en: "Simulated source document preview",
      es: "Vista previa simulada de documento fuente",
    },
  },
  "misleading-chart-preview": {
    id: "misleading-chart-preview",
    publicPath: "/demo-assets/misleading-chart-preview.svg",
    type: "svg",
    alt: {
      en: "Truncated chart preview",
      es: "Vista previa de gráfica truncada",
    },
  },
  "synthetic-portrait-scene": {
    id: "synthetic-portrait-scene",
    publicPath: "/demo-assets/synthetic-portrait-scene.svg",
    type: "svg",
    alt: {
      en: "Simulated synthetic portrait scene grid",
      es: "Cuadrícula simulada de escena de retrato sintético",
    },
  },
  "archived-flood-photo": {
    id: "archived-flood-photo",
    publicPath: "/demo-assets/archived-flood-photo.svg",
    type: "svg",
    alt: {
      en: "Archived flood photo illustration",
      es: "Ilustración de foto de inundación archivada",
    },
  },
  "reused-flood-photo": {
    id: "reused-flood-photo",
    publicPath: "/demo-assets/reused-flood-photo.svg",
    type: "svg",
    alt: {
      en: "Reused flood photo illustration",
      es: "Ilustración de foto de inundación reutilizada",
    },
  },
};

export function getMediaAsset(assetId: string): MediaAsset {
  const asset = mediaAssets[assetId];
  if (!asset) {
    throw new Error(`[EduCAPTCHA] Unknown media asset: ${assetId}`);
  }
  return asset;
}

export function tryGetMediaAsset(assetId: string | undefined): MediaAsset | null {
  if (!assetId) return null;
  return mediaAssets[assetId] ?? null;
}

export const allMediaAssetIds = Object.keys(mediaAssets);
