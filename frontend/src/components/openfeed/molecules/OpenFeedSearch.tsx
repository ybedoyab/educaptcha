import { Search, X } from "lucide-react";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";

interface OpenFeedSearchProps {
  className?: string;
}

export function OpenFeedSearch({ className = "" }: OpenFeedSearchProps) {
  const { query, setQuery, clearSearch } = useDemoSession();
  const { copy } = useI18n();

  return (
    <div className={`relative ${className}`} role="search">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-social-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.experience.socialSearchPlaceholder}
        className="min-h-11 w-full rounded-full border border-transparent bg-social-surface pl-11 pr-11 text-[15px] text-social-text outline-none transition focus:border-social-blue focus:bg-white focus:ring-1 focus:ring-social-blue"
        aria-label={copy.experience.socialSearchPlaceholder}
      />
      {query ? (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-social-blue text-white"
          aria-label={copy.experience.clearSearch}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

