import { useMemo, useState } from "react";
import { BarChart3, Info, Sparkles } from "lucide-react";
import { getAnalytics } from "../data/analytics";
import { getScenario } from "../data/experienceScenarios";
import { useI18n } from "../i18n/I18nContext";
import type { AnalyticsPeriod } from "../types";
import type { LearningSession } from "../types/learning";

function BarChart({
  title,
  items,
  maxOverride,
}: {
  title: string;
  items: { label: string; value: number }[];
  maxOverride?: number;
}) {
  const max = maxOverride ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="mb-1 flex justify-between gap-2 text-xs text-navy/65">
              <span className="truncate font-medium text-navy">{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-navy/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-sky"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyChart({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy">{title}</h3>
      <div
        className="mt-4 flex h-40 items-end gap-2"
        role="img"
        aria-label={title}
      >
        {items.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[0.65rem] font-medium text-navy/70">
              {item.value}
            </span>
            <div
              className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-teal to-sky"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-[0.65rem] text-navy/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  latestSession,
}: {
  latestSession: LearningSession | null;
}) {
  const { language, copy } = useI18n();
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const data = useMemo(() => getAnalytics(period), [period]);

  const categoryLabel = (key: string) => {
    const map = copy.categories as Record<string, string>;
    return map[key] ?? key;
  };

  const skillLabel = latestSession
    ? getScenario(latestSession.skill).skillLabel[language]
    : null;

  const periods: { id: AnalyticsPeriod; label: string }[] = [
    { id: "7d", label: copy.results.period7 },
    { id: "30d", label: copy.results.period30 },
    { id: "all", label: copy.results.periodAll },
  ];

  const kpis = [
    {
      label: copy.results.totalInteractions,
      value: data.totalInteractions.toLocaleString(language),
    },
    {
      label: copy.results.completionRate,
      value: `${data.completionRate}%`,
    },
    {
      label: copy.results.averageScore,
      value: `${data.averageScore}%`,
    },
    {
      label: copy.results.mostDifficult,
      value: categoryLabel(data.mostDifficultCategory),
    },
    {
      label: copy.results.skipRate,
      value: `${data.skipRate}%`,
    },
  ];

  const improved = Boolean(latestSession?.transferCorrect);

  return (
    <section
      id="results"
      className="scroll-mt-20 bg-white"
      aria-labelledby="results-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="results-title"
              className="font-display text-2xl font-bold text-navy sm:text-3xl"
            >
              {copy.results.title}
            </h2>
            <p className="mt-2 max-w-xl text-navy/65">{copy.results.subtitle}</p>
          </div>
          <div
            className="inline-flex rounded-xl border border-navy/10 bg-off-white p-1"
            role="group"
            aria-label="Period"
          >
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                aria-pressed={period === p.id}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  period === p.id
                    ? "bg-navy text-white"
                    : "text-navy/65 hover:bg-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber/10 px-3 py-2 text-sm font-medium text-navy/80">
          <Info className="h-4 w-4 text-amber" aria-hidden />
          {copy.results.demoBanner}
        </p>

        <div className="mt-6 rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/5 to-sky/10 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
            <Sparkles className="h-5 w-5 text-teal" aria-hidden />
            {copy.results.learningTransfer}
          </h3>
          <p className="mt-1 text-xs font-medium text-navy/70">
            {copy.results.learningTransferHint}
          </p>
          {latestSession && skillLabel ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.skillPracticed}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">{skillLabel}</dd>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.initialChallenge}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {latestSession.skipped
                    ? copy.results.resultSkipped
                    : latestSession.initialCorrect
                      ? copy.results.resultCorrect
                      : copy.results.resultMissed}
                </dd>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.transferChallenge}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {latestSession.transferCorrect
                    ? copy.results.resultCorrect
                    : copy.results.resultMissed}
                </dd>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.improvement}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {improved
                    ? copy.results.improvedYes
                    : copy.results.improvedNo}
                </dd>
              </div>
              {latestSession.minigameTypes && (
                <div className="rounded-xl bg-white/80 p-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                    {copy.results.minigameType}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-navy">
                    {latestSession.minigameTypes.join(" â†’ ")}
                  </dd>
                </div>
              )}
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.resolveTime}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {Math.round(
                    ((latestSession.initialDurationMs ?? 0) +
                      (latestSession.transferDurationMs ?? 0)) /
                      1000,
                  )}
                  s
                </dd>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.attempts}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {(latestSession.initialAttempts ?? 0) +
                    (latestSession.transferAttempts ?? 0)}
                </dd>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                  {copy.results.hintsUsed}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {latestSession.hintsUsed ?? 0}
                </dd>
              </div>
              {latestSession.signalsFound != null && (
                <div className="rounded-xl bg-white/80 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                    {copy.results.signalsFound}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-navy">
                    {latestSession.signalsFound}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-navy/65">{copy.results.noSessionYet}</p>
          )}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <li
              key={kpi.label}
              className="rounded-2xl border border-navy/8 bg-off-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                {kpi.label}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-navy">
                {kpi.value}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-navy/8 bg-off-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
            <BarChart3 className="h-4 w-4 text-teal" aria-hidden />
            {copy.results.languageDist}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-3">
            {data.languageDistribution.map((lang) => (
              <li
                key={lang.language}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-navy shadow-sm"
              >
                {lang.language}: {lang.percent}%
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <BarChart
            title={copy.results.chartCategory}
            items={data.categoryBars.map((c) => ({
              label: categoryLabel(c.category),
              value: c.value,
            }))}
          />
          <WeeklyChart
            title={copy.results.chartWeekly}
            items={data.weeklyProgress}
          />
          <BarChart
            title={copy.results.chartCorrect}
            items={data.correctDistribution.map((c) => ({
              label:
                c.label === "correct"
                  ? copy.results.distCorrect
                  : c.label === "incorrect"
                    ? copy.results.distIncorrect
                    : copy.results.distSkipped,
              value: c.value,
            }))}
          />
          <BarChart
            title={copy.results.chartDifficulty}
            items={data.difficultyBars.map((c) => ({
              label: categoryLabel(c.category),
              value: c.value,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
