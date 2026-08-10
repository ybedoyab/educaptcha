import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

interface CodeSnippetProps {
  title: string;
  code: string;
  languageLabel: string;
}

export function CodeSnippet({ title, code, languageLabel }: CodeSnippetProps) {
  const { copy } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-navy/10 bg-navy">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div>
          <p className="text-xs font-semibold text-white/90">{title}</p>
          <p className="text-[0.65rem] text-white/40">{languageLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-teal" aria-hidden />
              {copy.integration.copied}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copy.integration.copy}
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-sky/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
