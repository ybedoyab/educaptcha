import { Search, X } from "lucide-react";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";

export function OpenFeedSearch() {
  const { query, setQuery, clearSearch } = useDemoSession();
  const { copy } = useI18n();

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={copy.experience.searchPlaceholder}
        className="min-h-11 w-full rounded-xl border border-navy/10 bg-off-white pl-10 pr-10 text-sm text-navy outline-none ring-teal focus:ring-2"
        aria-label={copy.experience.searchPlaceholder}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-navy/50 hover:bg-navy/5"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
