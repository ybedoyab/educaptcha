import { useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { getMediaAsset, type MediaAsset } from "../../data/mediaAssets";
import { useI18n } from "../../i18n/I18nContext";

interface DemoPhotoProps {
  assetId?: string;
  asset?: MediaAsset;
  /** @deprecated Prefer assetId */
  src?: string;
  alt?: string;
  className?: string;
  showArchiveBadge?: boolean;
  eager?: boolean;
  /**
   * Corner rounding for the frame. A prop rather than something `className` can
   * override, because two conflicting radius utilities resolve by stylesheet
   * order, not by class order. Bookface renders photos full-bleed and square.
   */
  radiusClassName?: string;
}

export function DemoPhoto({
  assetId,
  asset: assetProp,
  src,
  alt,
  className = "",
  showArchiveBadge = false,
  eager = false,
  radiusClassName = "rounded-xl",
}: DemoPhotoProps) {
  const { copy, language } = useI18n();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  let asset: MediaAsset | null = assetProp ?? null;
  if (!asset && assetId) {
    try {
      asset = getMediaAsset(assetId);
    } catch {
      asset = null;
    }
  }

  const resolvedSrc = asset?.publicPath ?? src;
  const resolvedAlt =
    alt ?? asset?.alt[language] ?? (language === "es" ? "Imagen" : "Image");

  /**
   * Reset during render rather than in an effect. A photo the browser already
   * has cached — every minigame re-shows one the feed just displayed — can fire
   * `load` before passive effects flush, and an effect that then set "loading"
   * would leave a complete image stranded at `opacity-0` behind the skeleton.
   */
  const lastSrcRef = useRef(resolvedSrc);
  if (lastSrcRef.current !== resolvedSrc) {
    lastSrcRef.current = resolvedSrc;
    setStatus("loading");
  }

  if (!resolvedSrc) {
    return null;
  }

  /**
   * An image that finished before React attached its handlers fires no event we
   * can hear, so settle the status from the element itself on mount. SVGs are
   * exempt from the width check: without intrinsic dimensions some engines
   * report `naturalWidth === 0` for a perfectly good vector.
   */
  const settleFromElement = (node: HTMLImageElement | null) => {
    if (!node?.complete) return;
    const isVector = resolvedSrc.endsWith(".svg");
    setStatus(node.naturalWidth === 0 && !isVector ? "error" : "ready");
  };

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-navy/5 ${radiusClassName} ${className}`}
    >
      {status === "loading" && (
        <div
          className="absolute inset-0 animate-pulse bg-navy/5"
          role="status"
          aria-label={copy.minigame.loadingPhoto}
        />
      )}

      {status !== "error" && (
        <img
          key={resolvedSrc}
          ref={settleFromElement}
          src={resolvedSrc}
          alt={resolvedAlt}
          className={`h-full w-full object-cover transition-opacity ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setStatus("ready")}
          onError={() => {
            if (import.meta.env.DEV) {
              console.error(
                "[EduCAPTCHA] Unexpected image load failure",
                assetId ?? resolvedSrc,
              );
            }
            setStatus("error");
          }}
        />
      )}

      {status === "error" && (
        <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 px-3 text-center">
          <ImageOff className="h-6 w-6 text-navy/35" aria-hidden />
          <p className="text-xs font-medium text-navy/55">
            {copy.minigame.photoFailed}
          </p>
          {import.meta.env.DEV && assetId && (
            <p className="font-mono text-[10px] text-navy/40">{assetId}</p>
          )}
        </div>
      )}

      {showArchiveBadge && status === "ready" && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-navy/75 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
          {copy.minigame.archiveBadge}
        </span>
      )}
    </div>
  );
}
