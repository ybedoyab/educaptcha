import { useState } from "react";
import { imageCredits } from "../../data/imageCredits";
import { useI18n } from "../../i18n/I18nContext";

export function ImageCreditsButton() {
  const { language } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-h-11 text-left text-xs font-medium text-navy/50 underline-offset-2 hover:text-navy hover:underline"
      >
        {language === "es" ? "Créditos de imágenes" : "Image credits"}
      </button>
      {open && (
        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-xs text-navy/65">
          {imageCredits.map((c) => (
            <li key={c.id} className="rounded-lg bg-off-white p-2">
              <p className="font-semibold text-navy">{c.title}</p>
              <p>
                {c.author} · {c.date}
              </p>
              <p>
                <a
                  href={c.licenseUrl}
                  className="text-teal underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.license}
                </a>
              </p>
              {c.modifications && <p className="mt-1">{c.modifications}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
