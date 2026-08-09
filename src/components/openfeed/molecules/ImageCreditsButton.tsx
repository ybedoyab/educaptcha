import { useState } from "react";
import { imageCredits } from "../../../data/imageCredits";
import { useI18n } from "../../../i18n/I18nContext";

export function ImageCreditsButton() {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="min-h-11 text-left text-xs text-social-muted hover:underline"
      >
        {copy.experience.imageCreditsTitle}
      </button>
      {open ? (
        <ul className="max-h-64 space-y-2 overflow-y-auto pb-3 text-xs text-social-muted">
          {imageCredits.map((credit) => (
            <li key={credit.id} className="rounded-xl bg-white p-3">
              <p className="font-bold text-social-text">{credit.title}</p>
              <p>
                {credit.author} · {credit.date}
              </p>
              <a
                href={credit.licenseUrl}
                className="text-social-blue hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {credit.license}
              </a>
              {credit.modifications ? (
                <p className="mt-1">{credit.modifications}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
