import { useEffect } from "react";
import { useDemoSession } from "../demo-session";
import { useI18n } from "../../i18n/I18nContext";
import { OPEN_FEED_TIMINGS } from "../../components/openfeed/openFeed.constants";

type ToastProps = {
  className?: string;
};

export function Toast({
  className = "fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-social-text px-5 py-3 text-sm font-bold text-white shadow-xl md:bottom-4",
}: ToastProps) {
  const { toast, setToast } = useDemoSession();
  const { language } = useI18n();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(
      () => setToast(null),
      OPEN_FEED_TIMINGS.toastMs,
    );
    return () => window.clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;
  return (
    <div role="status" aria-live="polite" className={className}>
      {toast[language]}
    </div>
  );
}
