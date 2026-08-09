import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Link2, MoreHorizontal } from "lucide-react";
import { useI18n } from "../../../i18n/I18nContext";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_KEYS,
} from "../../openfeed/openFeed.constants";
import { BookfaceIconButton } from "../atoms/BookfaceIconButton";
import { fillTemplate } from "../bookface.utils";

interface BookfacePostMenuProps {
  postId: string;
  author: string;
  saved: boolean;
  onToggleSave: () => void;
  /** Omitted when the post carries nothing worth checking a source for. */
  onCheckSource?: () => void;
}

const ITEM_CLASS =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-[15px] font-medium text-bf-text hover:bg-bf-hover";

/**
 * Facebook keeps secondary post actions behind the "…" affordance, so that is
 * where Bookface puts Save and the source check. Both keep the shared DOM ids
 * (`save-*`, `verify-*`) so the two skins stay addressable the same way.
 */
export function BookfacePostMenu({
  postId,
  author,
  saved,
  onToggleSave,
  onCheckSource,
}: BookfacePostMenuProps) {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const label = fillTemplate(copy.experience.bfPostMenuLabel, { author });

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector("button")?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    // Capture phase + preventDefault so Escape closes the menu and nothing
    // else: inside the post detail dialog it would otherwise also trigger the
    // dialog's own cancel and dismiss both layers at once.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== OPEN_FEED_KEYS.escape) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  const runAndClose = (action: () => void) => {
    action();
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <BookfaceIconButton
        ref={triggerRef}
        icon={MoreHorizontal}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="bg-transparent hover:bg-bf-hover"
      />
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className="absolute right-0 top-12 z-30 w-64 rounded-lg bg-white p-1 shadow-[0_2px_12px_rgba(0,0,0,0.22)]"
        >
          <button
            type="button"
            role="menuitem"
            id={OPEN_FEED_IDS.save(postId)}
            onClick={() => runAndClose(onToggleSave)}
            className={ITEM_CLASS}
          >
            {saved ? (
              <BookmarkCheck className="h-5 w-5 text-bf-green" aria-hidden="true" />
            ) : (
              <Bookmark className="h-5 w-5 text-bf-muted" aria-hidden="true" />
            )}
            {saved ? copy.experience.bfUnsavePost : copy.experience.bfSavePost}
          </button>
          {onCheckSource ? (
            <button
              type="button"
              role="menuitem"
              id={OPEN_FEED_IDS.verify(postId)}
              onClick={() => runAndClose(onCheckSource)}
              className={ITEM_CLASS}
            >
              <Link2 className="h-5 w-5 text-bf-muted" aria-hidden="true" />
              {copy.experience.bfCheckSource}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
