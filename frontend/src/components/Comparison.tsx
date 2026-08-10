import { GraduationCap, Grid3x3, Info } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export function Comparison() {
  const { copy } = useI18n();

  return (
    <section
      className="border-y border-navy/8 bg-white"
      aria-labelledby="compare-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2
          id="compare-title"
          className="font-display text-2xl font-bold text-navy sm:text-3xl"
        >
          {copy.comparison.title}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-navy/10 bg-off-white p-6">
            <div className="flex items-center gap-2 text-navy/50">
              <Grid3x3 className="h-5 w-5" aria-hidden />
              <h3 className="font-semibold">{copy.comparison.traditionalTitle}</h3>
            </div>
            <p className="mt-4 rounded-xl border border-dashed border-navy/20 bg-white px-4 py-6 text-center text-sm text-navy/70">
              {copy.comparison.traditionalText}
            </p>
          </article>
          <article className="rounded-2xl border-2 border-teal/40 bg-teal/5 p-6">
            <div className="flex items-center gap-2 text-teal">
              <GraduationCap className="h-5 w-5" aria-hidden />
              <h3 className="font-semibold">{copy.comparison.eduTitle}</h3>
            </div>
            <p className="mt-4 rounded-xl border border-teal/30 bg-white px-4 py-6 text-center text-sm font-medium text-navy">
              {copy.comparison.eduText}
            </p>
          </article>
        </div>
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-amber/10 px-4 py-3 text-sm text-navy/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
          {copy.comparison.note}
        </p>
      </div>
    </section>
  );
}
