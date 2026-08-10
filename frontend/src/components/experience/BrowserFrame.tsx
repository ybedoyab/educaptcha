import type { ReactNode } from "react";
import { useI18n } from "../../i18n/I18nContext";

interface BrowserFrameProps {
  children: ReactNode;
  className?: string;
}

export function BrowserFrame({ children, className = "" }: BrowserFrameProps) {
  const { copy } = useI18n();

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-navy/10 bg-[#EEF2F7] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden />
        <div className="ml-2 flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-xs text-navy/50">
          {copy.experience.browserUrl}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}
