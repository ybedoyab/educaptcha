import { imageCredits } from "../data/imageCredits";
import { mediaAssets } from "../data/mediaAssets";
import type { OpenFeedPost } from "../data/openFeedPosts";
import { experienceMinigames } from "../data/experienceMinigames";
import type { SourceTraceStep } from "../types/sourceTrace";

/** Commons / archive URLs for demo credits (opens in a new tab from the trail). */
const CREDIT_SOURCE_URLS: Record<string, string> = {
  "flood-lagos":
    "https://commons.wikimedia.org/wiki/File:Street_Flood.jpg",
  "flood-response":
    "https://commons.wikimedia.org/wiki/File:National_Guard_responds_to_flooding_in_South_Carolina_151011-Z-VD915-004.jpg",
  "flood-guadalajara":
    "https://commons.wikimedia.org/wiki/File:Flooded_street_and_vehicles.jpg",
  "wildfire-dc":
    "https://commons.wikimedia.org/wiki/Special:Search?search=wildfire+smoke+Washington+DC&go=Go",
  "protest-gate":
    "https://commons.wikimedia.org/wiki/Special:Search?search=protest+gate&go=Go",
  "vaccine-vial":
    "https://commons.wikimedia.org/wiki/Special:Search?search=COVID-19+vaccine+vial&go=Go",
  "covid-protest":
    "https://commons.wikimedia.org/wiki/File:LSE_protest_against_zero-Covid_policy,_2_December_2022.jpg",
};

function claimSnippet(post: OpenFeedPost): { en: string; es: string } {
  const trim = (s: string) =>
    s.length > 90 ? `${s.slice(0, 87).trimEnd()}…` : s;
  return { en: trim(post.body.en), es: trim(post.body.es) };
}

function sourceTraceFromMinigame(post: OpenFeedPost): SourceTraceStep[] | null {
  if (!post.minigameId) return null;
  const challenge = experienceMinigames[post.minigameId];
  const interaction = challenge?.interaction;
  if (
    interaction &&
    interaction.type === "context-match" &&
    interaction.sourceTrace &&
    interaction.sourceTrace.length > 0
  ) {
    return interaction.sourceTrace;
  }
  return null;
}

function sourceTraceFromCredit(post: OpenFeedPost): SourceTraceStep[] | null {
  if (!post.mediaAssetId) return null;
  const asset = mediaAssets[post.mediaAssetId];
  if (!asset?.creditId) return null;
  const credit = imageCredits.find((c) => c.id === asset.creditId);
  if (!credit) return null;

  const href =
    CREDIT_SOURCE_URLS[credit.id] ?? credit.licenseUrl ?? undefined;
  const claim = claimSnippet(post);

  return [
    {
      id: "claim",
      kind: "claim",
      label: { en: "Post claim", es: "Afirmación del post" },
      value: claim,
      status: "verified",
    },
    {
      id: "archive",
      kind: "archive",
      label: { en: "Original source found", es: "Fuente original encontrada" },
      value: {
        en: `${credit.source} — ${credit.author}`,
        es: `${credit.source} — ${credit.author}`,
      },
      status: "archived",
      href,
    },
    {
      id: "original",
      kind: "original",
      label: { en: "Original photo", es: "Foto original" },
      value: {
        en: credit.title,
        es: credit.title,
      },
      detail: {
        en: credit.date,
        es: credit.date,
      },
      status: "verified",
      href,
    },
    {
      id: "today-check",
      kind: "publisher",
      label: { en: "Is it from today?", es: "¿Es de hoy?" },
      value: {
        en: `No — dated ${credit.date}`,
        es: `No — fechada ${credit.date}`,
      },
      status: "conflicting",
    },
  ];
}

/** Positive trail when agents cleared a low-risk post (garden, library, etc.). */
function sourceTraceAiCleared(post: OpenFeedPost): SourceTraceStep[] {
  const claim = claimSnippet(post);
  const creditTrace = sourceTraceFromCredit(post);
  if (creditTrace) {
    // Rewrite the today-check to a match when this path is used for cleared posts
    // that genuinely align (rare for archive photos). Prefer credit facts + clear.
    return [
      creditTrace[0]!,
      creditTrace[1]!,
      creditTrace[2]!,
      {
        id: "align",
        kind: "publisher",
        label: { en: "Claim vs source", es: "Afirmación vs fuente" },
        value: {
          en: "No live-breaking claim conflict for this post type",
          es: "Sin conflicto de ‘en vivo / hoy’ para este tipo de post",
        },
        status: "verified",
      },
    ];
  }

  return [
    {
      id: "claim",
      kind: "claim",
      label: { en: "Post claim", es: "Afirmación del post" },
      value: claim,
      status: "verified",
    },
    {
      id: "source",
      kind: "publisher",
      label: { en: "Source check", es: "Revisión de fuente" },
      value: {
        en: "Original poster account — no reused archive photo found",
        es: "Cuenta original del post — sin foto de archivo reutilizada",
      },
      status: "verified",
    },
    {
      id: "today-check",
      kind: "original",
      label: { en: "Timing", es: "Fecha" },
      value: {
        en: "Matches an ordinary feed post (not a ‘LIVE tonight’ claim)",
        es: "Coincide con un post normal (no afirma ‘EN VIVO esta noche’)",
      },
      status: "verified",
    },
    {
      id: "clear",
      kind: "archive",
      label: { en: "Result", es: "Resultado" },
      value: {
        en: "Cleared to share",
        es: "Autorizado para compartir",
      },
      status: "verified",
    },
  ];
}

/**
 * Concrete evidence cards for the in-feed “See verification” panel.
 * Prefers the curated SourceTrace from context-match minigames (claim, Commons
 * link, date/place). Falls back to image credits or a clear AI checklist.
 */
export function buildVerificationTrace(
  post: OpenFeedPost,
  status: "ai-cleared" | "misleading",
): SourceTraceStep[] {
  const fromChallenge = sourceTraceFromMinigame(post);
  if (fromChallenge) return fromChallenge;

  if (status === "misleading") {
    const fromCredit = sourceTraceFromCredit(post);
    if (fromCredit) return fromCredit;
  }

  return sourceTraceAiCleared(post);
}

/** Posts the demo treats as risk — must not get a green “AI verified” claim. */
export function isRiskDemoPost(post: OpenFeedPost): boolean {
  return Boolean(
    post.triggerSkill ||
      post.tone === "manipulative" ||
      post.tone === "ambiguous",
  );
}
