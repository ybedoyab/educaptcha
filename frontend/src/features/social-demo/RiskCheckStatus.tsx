import { useDemoSession } from "../demo-session";
import { useI18n } from "../../i18n/I18nContext";

type RiskCheckStatusProps = {
  className?: string;
};

export function RiskCheckStatus({ className = "sr-only" }: RiskCheckStatusProps) {
  const { pendingActionKey } = useDemoSession();
  const { copy } = useI18n();
  return (
    <p className={className} role="status">
      {pendingActionKey ? copy.experience.checking : ""}
    </p>
  );
}
