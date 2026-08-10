interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  showTagline?: boolean;
  tagline?: string;
  inverted?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: "text-lg", tag: "text-[0.55rem]" },
  md: { icon: 44, text: "text-xl", tag: "text-[0.65rem]" },
  lg: { icon: 56, text: "text-2xl", tag: "text-xs" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  tagline = "Verify. Think. Learn.",
  inverted = false,
  className = "",
}: LogoProps) {
  const s = sizes[size];
  const shield = inverted ? "#F8FAFC" : "#0F172A";
  const eduClass = inverted ? "text-white" : "text-navy";
  const captchaClass = inverted ? "text-sky" : "text-teal";
  const tagClass = inverted ? "text-white/80" : "text-navy/70";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="EduCAPTCHA"
      >
        <title>EduCAPTCHA</title>
        <path
          d="M32 6 L54 14 V36 C54 50 44 60 32 66 C20 60 10 50 10 36 V14 Z"
          stroke={shield}
          strokeWidth="3.5"
          fill="none"
          strokeLinejoin="round"
        />
        <rect x="18" y="24" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <rect x="29" y="24" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <rect x="40" y="24" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <rect x="18" y="35" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <rect x="29" y="35" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <rect x="40" y="35" width="9" height="9" rx="1.5" fill="#38BDF8" />
        <path
          d="M36 34 L42 40 L54 26"
          stroke="#0EA5A4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="32"
          y1="2"
          x2="32"
          y2="9"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="4"
          x2="26"
          y2="9"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="4"
          x2="38"
          y2="9"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="8"
          x2="22"
          y2="11"
          stroke="#38BDF8"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <line
          x1="46"
          y1="8"
          x2="42"
          y2="11"
          stroke="#38BDF8"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold tracking-tight ${s.text}`}>
            <span className={eduClass}>Edu</span>
            <span className={captchaClass}>CAPTCHA</span>
          </span>
          {showTagline && (
            <span
              className={`mt-1 font-semibold uppercase tracking-[0.18em] ${tagClass} ${s.tag}`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
