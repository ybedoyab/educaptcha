import { useCallback, useEffect, useState } from "react";
import { Expand, ImageOff, RefreshCw, X } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";

interface DemoPhotoProps {
  src: string;
  alt: string;
  className?: string;
  showArchiveBadge?: boolean;
  allowExpand?: boolean;
}

export function DemoPhoto({
  src,
  alt,
  className = "",
  showArchiveBadge = true,
  allowExpand = true,
}: DemoPhotoProps) {
  const { copy } = useI18n();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setStatus("ready");
    };
    img.onerror = () => {
      if (!cancelled) {
        console.error("[EduCAPTCHA] Failed to load demo photo:", src);
        setStatus("error");
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, retryKey]);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <>
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-xl bg-navy/5 ${className}`}
      >
        {status === "ready" && (
          <button
            type="button"
            className="block h-full w-full cursor-zoom-in"
            onClick={() => allowExpand && setExpanded(true)}
            aria-label={allowExpand ? copy.minigame.expandPhoto : alt}
          >
            <img
              key={retryKey}
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </button>
        )}

        {status === "loading" && (
          <div
            className="flex h-full min-h-[12rem] w-full items-center justify-center"
            role="status"
            aria-label={copy.minigame.loadingPhoto}
          >
            <span className="h-8 w-8 animate-pulse rounded-full border-2 border-teal border-t-transparent" />
          </div>
        )}

        {status === "error" && (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 px-4 text-center">
            <ImageOff className="h-8 w-8 text-navy/40" aria-hidden />
            <p className="text-sm font-medium text-navy/70">
              {copy.minigame.photoFailed}
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 text-xs font-semibold text-navy"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {copy.minigame.retryPhoto}
            </button>
          </div>
        )}

        {showArchiveBadge && status === "ready" && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-navy/75 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {copy.minigame.archiveBadge}
          </span>
        )}

        {allowExpand && status === "ready" && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-navy/60 p-1.5 text-white">
            <Expand className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white"
            onClick={() => setExpanded(false)}
            aria-label={copy.minigame.closePhoto}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
