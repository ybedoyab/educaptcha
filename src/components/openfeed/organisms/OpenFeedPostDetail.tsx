import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { openFeedPosts } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { OpenFeedComments } from "./OpenFeedComments";
import { OpenFeedPost } from "./OpenFeedPost";
import { OPEN_FEED_KEYS } from "../openFeed.constants";

interface PostDetailDialogProps {
  post: OpenFeedPostData;
  onClose: () => void;
}

function PostDetailDialog({ post, onClose }: PostDetailDialogProps) {
  const { copy } = useI18n();
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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="post-detail-title"
      className="fixed inset-0 m-auto h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-white p-0 text-social-text backdrop:bg-social-text/40 sm:h-[min(90vh,780px)] sm:max-h-[90vh] sm:w-[600px] sm:rounded-2xl sm:shadow-2xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex h-[53px] shrink-0 items-center gap-6 border-b border-social-border bg-white px-2">
          <button
            type="button"
            onClick={closeDialog}
            className="grid min-h-11 min-w-11 place-items-center rounded-full hover:bg-social-text/10"
            aria-label={copy.experience.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h2 id="post-detail-title" className="text-xl font-extrabold">
            {copy.experience.postDetail}
          </h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <OpenFeedPost post={post} expanded />
          <OpenFeedComments postId={post.id} />
        </div>
      </div>
    </dialog>
  );
}

export function OpenFeedPostDetail() {
  const { selectedPostId, setSelectedPostId } = useDemoSession();
  const post = openFeedPosts.find((item) => item.id === selectedPostId);
  const closeDetail = useCallback(
    () => setSelectedPostId(null),
    [setSelectedPostId],
  );
  if (!post) return null;

  return <PostDetailDialog post={post} onClose={closeDetail} />;
}
