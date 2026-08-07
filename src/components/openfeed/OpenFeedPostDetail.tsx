import { X } from "lucide-react";
import { useDemoSession } from "../../context/DemoSessionContext";
import { openFeedPosts } from "../../data/openFeedPosts";
import { useI18n } from "../../i18n/I18nContext";
import { OpenFeedPost } from "./OpenFeedPost";
import { OpenFeedComments } from "./OpenFeedComments";

export function OpenFeedPostDetail() {
  const { selectedPostId, setSelectedPostId } = useDemoSession();
  const { language } = useI18n();
  if (!selectedPostId) return null;
  const post = openFeedPosts.find((p) => p.id === selectedPostId);
  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-navy/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-detail-title"
      onClick={() => setSelectedPostId(null)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setSelectedPostId(null);
      }}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/8 bg-white px-4 py-3">
          <h2 id="post-detail-title" className="text-sm font-semibold text-navy">
            {language === "es" ? "Publicación" : "Post"}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedPostId(null)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-navy/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <OpenFeedPost post={post} expanded />
        <OpenFeedComments postId={post.id} />
      </div>
    </div>
  );
}
