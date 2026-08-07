import { useState } from "react";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  postId: string;
  parentId?: string;
  onPosted?: () => void;
  placeholder?: string;
}

export function OpenFeedCommentComposer({
  postId,
  parentId,
  onPosted,
  placeholder,
}: Props) {
  const { addComment } = useDemoSession();
  const { language } = useI18n();
  const [text, setText] = useState("");

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    addComment(postId, body, parentId);
    setText("");
    onPosted?.();
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor={`composer-${postId}-${parentId ?? "root"}`}>
        {placeholder}
      </label>
      <input
        id={`composer-${postId}-${parentId ?? "root"}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        className="min-h-11 flex-1 rounded-xl border border-navy/10 bg-white px-3 text-sm outline-none ring-teal focus:ring-2"
      />
      <button
        type="button"
        onClick={submit}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
      >
        {language === "es" ? "Publicar" : "Post"}
      </button>
    </div>
  );
}
