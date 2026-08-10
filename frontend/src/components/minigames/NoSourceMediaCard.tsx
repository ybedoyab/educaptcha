import { FileQuestion } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function NoSourceMediaCard({ title, subtitle, className = "" }: Props) {
  const { language } = useI18n();
  return (
    <div
      className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-navy/20 bg-off-white px-4 text-center ${className}`}
      role="img"
      aria-label={
        title ??
        (language === "es"
          ? "Sin imagen original"
          : "No original image supplied")
      }
    >
      <FileQuestion className="h-8 w-8 text-navy/35" aria-hidden />
      <p className="text-sm font-semibold text-navy/70">
        {title ??
          (language === "es"
            ? "Sin imagen original"
            : "No original image supplied")}
      </p>
      <p className="text-xs text-navy/45">
        {subtitle ??
          (language === "es"
            ? "Fuente y fecha desconocidas"
            : "Source and date unknown")}
      </p>
    </div>
  );
}
