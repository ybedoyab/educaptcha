import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { openFeedPosts } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { OPEN_FEED_KEYS } from "../../openfeed/openFeed.constants";
import { BookfaceComments } from "./BookfaceComments";
import { BookfacePost } from "./BookfacePost";
import { fillTemplate } from "../bookface.utils";

interface PostDetailDialogProps {
  post: OpenFeedPostData;
  onClose: () => void;
}

function PostDetailDialog({ post, onClose }: PostDetailDialogProps) {
  const { copy, language } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    const handleCancel = (event: Event) => {
      event.preventDefault();
      closeDialog();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== OPEN_FEED_KEYS.escape) return;
      event.preventDefault();
      closeDialog();
    };
    dialog.addEventListener("cancel", handleCancel);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [closeDialog]);

  const title = fillTemplate(copy.experience.bfPostDetailTitle, {
    author: post.author[language],
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="bookface-post-detail-title"
      className="fixed inset-0 m-auto h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-white p-0 text-bf-text backdrop:bg-black/60 sm:h-[min(90vh,760px)] sm:max-h-[90vh] sm:w-[600px] sm:rounded-lg sm:shadow-2xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="flex h-full flex-col">
        <header className="relative flex h-[60px] shrink-0 items-center justify-center border-b border-bf-border px-14">
          <h2
            id="bookface-post-detail-title"
            className="truncate text-[17px] font-bold text-bf-text"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            aria-label={copy.experience.close}
            className="absolute right-3 grid min-h-11 min-w-11 place-items-center rounded-full bg-bf-chip text-bf-muted hover:bg-bf-border"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <BookfacePost post={post} expanded />
          <BookfaceComments postId={post.id} />
        </div>
      </div>
    </dialog>
  );
}

export function BookfacePostDetail() {
  const { selectedPostId, setSelectedPostId } = useDemoSession();
  const post = openFeedPosts.find((item) => item.id === selectedPostId);
  const closeDetail = useCallback(
    () => setSelectedPostId(null),
    [setSelectedPostId],
  );
  if (!post) return null;

  return <PostDetailDialog post={post} onClose={closeDetail} />;
}
