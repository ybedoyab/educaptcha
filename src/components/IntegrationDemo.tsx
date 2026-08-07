import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Compass, Info, MessageSquare } from "lucide-react";
import { challenges } from "../data/challenges";
import { useI18n } from "../i18n/I18nContext";
import type { SectionId } from "../types";
import { CodeSnippet } from "./CodeSnippet";
import { MinigameRenderer } from "./minigames/MinigameRenderer";

const NPM_CODE = `npm install educaptcha

import { EduCaptcha } from "educaptcha";

<EduCaptcha
  language="en"
  categories={["clickbait", "ai-content", "sources"]}
  onComplete={(result) => console.log(result)}
/>`;

const SCRIPT_CODE = `<script src="https://cdn.educaptcha.org/widget.js"></script>

<div
  data-educaptcha
  data-language="en"
  data-theme="light"
></div>`;

export function IntegrationDemo({
  onNavigate,
}: {
  onNavigate: (id: SectionId) => void;
}) {
  const { copy } = useI18n();
  const [comment, setComment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [published, setPublished] = useState<string | null>(null);
  const challenge = challenges[0];
  const closeRef = useRef<HTMLButtonElement>(null);

  const finishFlow = () => {
    setModalOpen(false);
    if (comment.trim()) setPublished(comment.trim());
    setComment("");
  };

  const openModal = () => {
    if (!comment.trim()) return;
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishFlow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, comment]);

  return (
    <section
      id="integration"
      className="scroll-mt-20 border-b border-navy/8 bg-white"
      aria-labelledby="integration-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2
          id="integration-title"
          className="font-display text-2xl font-bold text-navy sm:text-3xl"
        >
          {copy.integration.title}
        </h2>
        <p className="mt-2 max-w-2xl text-navy/65">{copy.integration.subtitle}</p>

        <div className="mt-6 rounded-2xl border border-teal/25 bg-teal/5 p-5">
          <h3 className="font-display text-lg font-bold text-navy">
            {copy.integration.experienceCtaTitle}
          </h3>
          <p className="mt-2 text-sm text-navy/75">
            {copy.integration.experienceCtaText}
          </p>
          <button
            type="button"
            onClick={() => onNavigate("experience")}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" aria-hidden />
            {copy.integration.experienceCta}
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-off-white p-5 shadow-sm sm:p-6">
            <article>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                {copy.integration.exampleNews}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-navy">
                {copy.integration.newsTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">
                {copy.integration.newsSummary}
              </p>
            </article>

            <div className="mt-6 border-t border-navy/10 pt-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-navy">
                <MessageSquare className="h-4 w-4 text-teal" aria-hidden />
                {copy.integration.commentsHeading}
              </h4>

              {published && (
                <div
                  className="mt-3 animate-slide-up rounded-xl border border-teal/30 bg-teal/5 p-3"
                  role="status"
                >
                  <p className="text-xs font-semibold text-teal">
                    {copy.integration.publishedAs} {copy.integration.guest}
                  </p>
                  <p className="mt-1 text-sm text-navy">{published}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-navy/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal" aria-hidden />
                    {copy.integration.publishedConfirm}
                  </p>
                </div>
              )}

              <label className="mt-4 block">
                <span className="sr-only">{copy.integration.commentPlaceholder}</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder={copy.integration.commentPlaceholder}
                  className="w-full resize-y rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/40"
                />
              </label>
              <button
                type="button"
                onClick={openModal}
                disabled={!comment.trim()}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {copy.integration.publish}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <CodeSnippet
              title={copy.integration.npmTitle}
              languageLabel="bash / tsx"
              code={NPM_CODE}
            />
            <CodeSnippet
              title={copy.integration.scriptTitle}
              languageLabel="html"
              code={SCRIPT_CODE}
            />
            <p className="flex items-start gap-2 rounded-xl bg-amber/10 px-3 py-2.5 text-sm text-navy/80">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
              {copy.integration.prototypeNote}
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) finishFlow();
          }}
        >
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto">
            <MinigameRenderer
              challenge={challenge}
              compact
              onComplete={finishFlow}
              onSkip={finishFlow}
            />
          </div>
        </div>
      )}
    </section>
  );
}
