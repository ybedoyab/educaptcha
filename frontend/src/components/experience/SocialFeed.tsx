import type { RefObject } from "react";
import { Bell, Compass, Home, Search, UserRound } from "lucide-react";
import type { Language } from "../../types";
import type { ExperienceScenario, FeedPostData } from "../../types/learning";
import { useI18n } from "../../i18n/I18nContext";
import { SocialPost } from "./SocialPost";

interface SocialFeedProps {
  scenario: ExperienceScenario;
  language: Language;
  highlightedPostId: string | null;
  transferMode: boolean;
  showTransferActions: boolean;
  likedIds: Set<string>;
  savedIds: Set<string>;
  feedRef: RefObject<HTMLDivElement | null>;
  onShare: (post: FeedPostData) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string) => void;
  onVerify: () => void;
  onShareImmediate: () => void;
}

export function SocialFeed({
  scenario,
  language,
  highlightedPostId,
  transferMode,
  showTransferActions,
  likedIds,
  savedIds,
  feedRef,
  onShare,
  onLike,
  onSave,
  onComment,
  onVerify,
  onShareImmediate,
}: SocialFeedProps) {
  const { copy } = useI18n();

  return (
    <div className="bg-[#F3F6FA]">
      <div className="flex items-center gap-3 border-b border-navy/8 bg-white px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-xs font-bold text-sky">
            OF
          </span>
          <span className="hidden font-display text-sm font-bold text-navy sm:inline">
            {copy.experience.feedName}
          </span>
        </div>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{copy.experience.searchPlaceholder}</span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/65"
            aria-hidden
          />
          <input
            type="search"
            placeholder={copy.experience.searchPlaceholder}
            className="w-full rounded-full border border-navy/10 bg-off-white py-2 pl-9 pr-3 text-sm text-navy placeholder:text-navy/65"
          />
        </label>
        <Bell className="hidden h-5 w-5 text-navy/70 sm:block" aria-hidden />
      </div>

      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)_220px]">
        <aside className="hidden border-r border-navy/8 bg-white p-3 lg:block">
          <nav aria-label={copy.experience.feedName} className="space-y-1">
            {[
              { icon: Home, label: copy.experience.navHome },
              { icon: Compass, label: copy.experience.navExplore },
              { icon: Bell, label: copy.experience.navAlerts },
              { icon: UserRound, label: copy.experience.navSaved },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy/70"
              >
                <item.icon className="h-4 w-4 text-teal" aria-hidden />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div
          ref={feedRef}
          className="max-h-[560px] space-y-3 overflow-y-auto p-3 sm:p-4"
        >
          {scenario.posts.map((post) => (
            <SocialPost
              key={post.id}
              post={post}
              language={language}
              highlighted={highlightedPostId === post.id}
              liked={likedIds.has(post.id)}
              saved={savedIds.has(post.id)}
              transferMode={transferMode}
              showTransferActions={showTransferActions && post.isTransferTarget}
              verifyLabel={scenario.transfer.verifyLabel[language]}
              shareImmediateLabel={scenario.transfer.shareLabel[language]}
              onShare={() => onShare(post)}
              onLike={onLike}
              onSave={onSave}
              onComment={onComment}
              onVerify={onVerify}
              onShareImmediate={onShareImmediate}
            />
          ))}
        </div>

        <aside className="hidden border-l border-navy/8 bg-white p-4 lg:block">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy/70">
            {copy.experience.trendsTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {scenario.trends.map((trend) => (
              <li
                key={trend.en}
                className="rounded-lg bg-off-white px-3 py-2 text-sm text-navy/80"
              >
                {trend[language]}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
