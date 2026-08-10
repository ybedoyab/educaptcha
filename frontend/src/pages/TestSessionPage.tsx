import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { openFeedPosts, type OpenFeedPost } from "../data/openFeedPosts";
import { useI18n } from "../i18n/I18nContext";
import { Logo } from "../components/Logo";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickSession(seed: number): OpenFeedPost[] {
  const rand = mulberry32(seed);
  const neutrals = openFeedPosts.filter((p) => p.tone === "neutral" || p.tone === "official");
  const problematic = openFeedPosts.filter(
    (p) => p.tone === "manipulative" || p.tone === "ambiguous",
  );
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const selected = [
    ...shuffle(neutrals).slice(0, 3),
    ...shuffle(problematic).slice(0, 3),
  ];
  return shuffle(selected);
}

type Decision = {
  postId: string;
  decision: "share" | "verify" | "skip" | "open-source";
  at: string;
};

export function TestSessionPage() {
  const { language } = useI18n();
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const posts = useMemo(() => pickSession(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [done, setDone] = useState(false);

  const current = posts[index];

  const choose = (decision: Decision["decision"]) => {
    const next = [
      ...decisions,
      { postId: current.id, decision, at: new Date().toISOString() },
    ];
    setDecisions(next);
    if (index + 1 >= posts.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const exportPayload = {
    seed,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    posts: posts.map((p) => ({
      id: p.id,
      tone: p.tone,
      category: p.category,
      triggerSkill: p.triggerSkill ?? null,
    })),
    decisions,
    metrics: {
      initialDecisions: decisions.length,
      sourceOpens: decisions.filter((d) => d.decision === "open-source").length,
      shares: decisions.filter((d) => d.decision === "share").length,
      verifies: decisions.filter((d) => d.decision === "verify").length,
      skips: decisions.filter((d) => d.decision === "skip").length,
    },
  };

  return (
    <div className="min-h-[100dvh] bg-off-white">
      <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/demo"
            className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 px-3 text-sm font-semibold"
          >
            {language === "es" ? "Volver al feed" : "Back to feed"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-navy">
          {language === "es" ? "Sesión de prueba" : "Test session"}
        </h1>
        <p className="mt-2 text-sm text-navy/60">
          Seed: <code className="rounded bg-white px-1">{seed}</code> ·{" "}
          {language === "es"
            ? "Seis publicaciones aleatorias (3 neutrales, 3 problemáticas)."
            : "Six randomized posts (3 neutral, 3 problematic)."}
        </p>

        {!done && current && (
          <article className="mt-6 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">
              {index + 1} / {posts.length}
            </p>
            <h2 className="mt-2 text-sm font-semibold text-navy">
              {current.author[language]}{" "}
              <span className="font-normal text-navy/70">{current.handle}</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy/85">
              {current.body[language]}
            </p>
            {current.imageSrc && (
              <img
                src={current.imageSrc}
                alt=""
                className="mt-3 aspect-video w-full rounded-xl object-cover"
              />
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => choose("share")}
                className="min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white"
              >
                {language === "es" ? "Compartir" : "Share"}
              </button>
              <button
                type="button"
                onClick={() => choose("verify")}
                className="min-h-11 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
              >
                {language === "es" ? "Verificar" : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => choose("open-source")}
                className="min-h-11 rounded-xl border border-navy/15 px-4 text-sm font-semibold"
              >
                {language === "es" ? "Abrir fuente" : "Open source"}
              </button>
              <button
                type="button"
                onClick={() => choose("skip")}
                className="min-h-11 rounded-xl border border-navy/15 px-4 text-sm font-semibold text-navy/60"
              >
                {language === "es" ? "Omitir" : "Skip"}
              </button>
            </div>
          </article>
        )}

        {done && (
          <section className="mt-6 space-y-4 rounded-2xl border border-navy/10 bg-white p-5">
            <h2 className="text-lg font-semibold text-navy">
              {language === "es" ? "Resultados exportables" : "Exportable results"}
            </h2>
            <p className="text-sm text-navy/60">
              {language === "es"
                ? "No se inventan resultados globales. Solo se muestran las decisiones de esta sesión."
                : "No global results are invented. Only this sessionÃ¢â‚¬â„¢s decisions are shown."}
            </p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-off-white p-3">
                <dt className="text-navy/70">
                  {language === "es" ? "Decisiones" : "Decisions"}
                </dt>
                <dd className="text-lg font-semibold">
                  {exportPayload.metrics.initialDecisions}
                </dd>
              </div>
              <div className="rounded-xl bg-off-white p-3">
                <dt className="text-navy/70">
                  {language === "es" ? "Fuentes abiertas" : "Sources opened"}
                </dt>
                <dd className="text-lg font-semibold">
                  {exportPayload.metrics.sourceOpens}
                </dd>
              </div>
              <div className="rounded-xl bg-off-white p-3">
                <dt className="text-navy/70">
                  {language === "es" ? "Omitidos" : "Skipped"}
                </dt>
                <dd className="text-lg font-semibold">
                  {exportPayload.metrics.skips}
                </dd>
              </div>
              <div className="rounded-xl bg-off-white p-3">
                <dt className="text-navy/70">
                  {language === "es" ? "Tiempo" : "Time"}
                </dt>
                <dd className="text-lg font-semibold">
                  {Math.round(exportPayload.durationMs / 1000)}s
                </dd>
              </div>
            </dl>
            <pre className="max-h-80 overflow-auto rounded-xl bg-navy p-3 text-xs text-sky">
              {JSON.stringify(exportPayload, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(exportPayload, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `educaptcha-test-session-${seed}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              {language === "es" ? "Descargar JSON" : "Download JSON"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
