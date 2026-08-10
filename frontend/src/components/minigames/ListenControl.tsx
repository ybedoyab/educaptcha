import { Volume2, Square } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  /** Plain text spoken when the user presses Listen. */
  text: string;
  className?: string;
  label?: string;
  /** Smaller control for title-row placement. */
  compact?: boolean;
}

/**
 * Optional read-aloud via Web Speech API. Never autoplays; always user-triggered.
 * Text on screen remains the primary channel — audio is support, not a requirement.
 */
export function ListenControl({
  text,
  className = "",
  label,
  compact = false,
}: Props) {
  const { language } = useI18n();
  const labelId = useId();
  const [playing, setPlaying] = useState(false);
  const supported =
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Language or script changed — stop so we don't read the wrong locale.
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, [text, language]);

  if (!supported || !text.trim()) return null;

  const defaultLabel =
    language === "es" ? "Escuchar" : "Listen";
  const stopLabel = language === "es" ? "Detener" : "Stop";

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (playing) {
      synth.cancel();
      setPlaying(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = language === "es" ? "es-ES" : "en-US";
    utterance.rate = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    synth.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-labelledby={labelId}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white text-sm font-semibold text-navy hover:bg-navy/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
        compact
          ? "min-h-9 px-2.5"
          : "min-h-11 gap-2 rounded-xl px-3"
      } ${className}`}
    >
      {playing ? (
        <Square className="h-4 w-4 fill-current" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
      <span id={labelId}>{playing ? stopLabel : label ?? defaultLabel}</span>
    </button>
  );
}
