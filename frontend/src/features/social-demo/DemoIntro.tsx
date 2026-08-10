import { useDemoSession } from "../demo-session";
import { useI18n } from "../../i18n/I18nContext";

type DemoIntroProps = {
  title: string;
  titleId?: string;
  className?: string;
  panelClassName?: string;
  titleClassName?: string;
  buttonClassName?: string;
};

export function DemoIntro({
  title,
  titleId = "intro-title",
  className = "fixed inset-0 z-[100] flex items-end justify-center bg-social-text/45 p-3 sm:items-center",
  panelClassName = "w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl",
  titleClassName = "text-xl font-extrabold text-social-text",
  buttonClassName = "inline-flex min-h-11 items-center rounded-full bg-social-blue px-5 text-sm font-bold text-white hover:bg-social-blue/90",
}: DemoIntroProps) {
  const { introSeen, setIntroSeen } = useDemoSession();
  const { copy } = useI18n();

  if (introSeen) return null;

  return (
    <div
      className={className}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={panelClassName}>
        <h2 id={titleId} className={titleClassName}>
          {title}
        </h2>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => setIntroSeen(true)}
            className={buttonClassName}
          >
            {copy.experience.startBrowsing}
          </button>
        </div>
      </div>
    </div>
  );
}
