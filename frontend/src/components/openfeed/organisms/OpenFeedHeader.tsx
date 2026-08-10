import { useI18n } from "../../../i18n/I18nContext";
import { YMark } from "../atoms/YMark";
import { SessionControls } from "../molecules/SessionControls";

export function OpenFeedHeader() {
  const { copy } = useI18n();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-social-border bg-white px-4 md:hidden">
      <YMark
        className="h-7 w-7 text-social-text"
        label={copy.experience.socialBrandLabel}
      />
      <SessionControls showTestSession={false} />
    </header>
  );
}

