import { Search, X } from "lucide-react";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";

interface BookfaceSearchProps {
  className?: string;
}

export function BookfaceSearch({ className = "" }: BookfaceSearchProps) {
  const { query, setQuery, clearSearch } = useDemoSession();
  const { copy } = useI18n();

  return (
    <div className={`relative ${className}`} role="search">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bf-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.experience.bfSearchPlaceholder}
        aria-label={copy.experience.bfSearchPlaceholder}
        className="min-h-11 w-full rounded-full border border-transparent bg-bf-chip pl-9 pr-10 text-[15px] text-bf-text outline-none transition placeholder:text-bf-muted focus:border-bf-blue focus:bg-white"
      />
      {query ? (
        <button
          type="button"
          onClick={clearSearch}
          aria-label={copy.experience.clearSearch}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-bf-muted hover:bg-bf-hover"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
