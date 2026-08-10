import { openFeedPosts } from "../../data/openFeedPosts";
import type { LocalizedText } from "../../types";
import type { CommentsMap } from "../../components/openfeed/openFeed.types";
import { formatLocalizedExperienceText } from "../../components/openfeed/openFeed.constants";
import type { ToastValue } from "./types";

export function toToast(value: LocalizedText | string | null): ToastValue {
  if (value === null) return null;
  if (typeof value === "string") return { en: value, es: value };
  return value;
}

export function transferReason(skill?: string): LocalizedText {
  if (!skill) {
    return formatLocalizedExperienceText("transferReasonGeneric", {});
  }

  return formatLocalizedExperienceText("transferReasonNamed", {
    skill: skill.replace(/-/g, " "),
  });
}

export function seedComments(): CommentsMap {
  const map: CommentsMap = {};
  for (const p of openFeedPosts) {
    map[p.id] = [...p.seedComments];
  }
  return map;
}
