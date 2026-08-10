import { ImagePlus, SmilePlus, Video } from "lucide-react";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";

const SHORTCUT_CLASS =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-bf-muted transition-colors hover:bg-bf-hover sm:text-[15px]";

/**
 * The "What's on your mind?" card. Authoring posts is outside the prototype's
 * scope, so every control acknowledges that rather than pretending to compose —
 * the demo's writing surface is the comment box, which the intercept pipeline
 * actually watches.
 */
export function BookfaceComposer() {
  const { setToast } = useDemoSession();
  const { copy } = useI18n();
  const announce = () => setToast(copy.experience.bfComposerSimulated);

  return (
    <section
      className="rounded-lg bg-white px-4 py-3 shadow-sm"
      aria-label={copy.experience.bfComposerPrompt}
    >
      <div className="flex items-center gap-2">
        <FeedAvatar author={copy.experience.you} hue={205} />
        <button
          type="button"
          onClick={announce}
          className="min-h-11 flex-1 rounded-full bg-bf-chip px-4 text-left text-[15px] text-bf-muted transition-colors hover:bg-bf-border"
        >
          {copy.experience.bfComposerPrompt}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1 border-t border-bf-border pt-1">
        <button type="button" onClick={announce} className={SHORTCUT_CLASS}>
          <Video className="h-5 w-5 text-bf-love" aria-hidden="true" />
          {copy.experience.bfComposerLive}
        </button>
        <button type="button" onClick={announce} className={SHORTCUT_CLASS}>
          <ImagePlus className="h-5 w-5 text-bf-green" aria-hidden="true" />
          {copy.experience.bfComposerPhoto}
        </button>
        {/* Three labels do not fit a phone-width row; the real layout drops
            shortcuts the same way. */}
        <button
          type="button"
          onClick={announce}
          className={`${SHORTCUT_CLASS} hidden sm:inline-flex`}
        >
          <SmilePlus className="h-5 w-5 text-amber" aria-hidden="true" />
          {copy.experience.bfComposerFeeling}
        </button>
      </div>
    </section>
  );
}
