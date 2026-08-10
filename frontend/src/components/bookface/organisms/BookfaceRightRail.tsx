import { openFeedPosts } from "../../../data/openFeedPosts";
import { useI18n } from "../../../i18n/I18nContext";
import { BookfaceContactRow } from "../molecules/BookfaceContactRow";
import { BOOKFACE_LIMITS } from "../bookface.constants";
import { feedPeople } from "../bookface.utils";

export function BookfaceRightRail() {
  const { copy, language } = useI18n();
  const contacts = feedPeople(openFeedPosts, language, BOOKFACE_LIMITS.contacts);

  return (
    <aside className="hidden h-full w-[300px] shrink-0 overflow-y-auto px-2 py-3 xl:block xl:w-[320px]">
      <section aria-labelledby="bf-sponsored-title">
        <h2
          id="bf-sponsored-title"
          className="px-2 text-[17px] font-semibold text-bf-muted"
        >
          {copy.experience.bfSponsoredTitle}
        </h2>
        <div className="mt-2 flex gap-3 rounded-lg px-2 py-2">
          <div
            className="grid h-[110px] w-[130px] shrink-0 place-items-center rounded-lg bg-gradient-to-br from-bf-blue to-navy px-2 text-center text-[13px] font-bold leading-4 text-white"
            aria-hidden="true"
          >
            EduCAPTCHA
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-bf-text">
              {copy.experience.bfSponsoredHeadline}
            </p>
            <p className="mt-1 text-[13px] text-bf-muted">
              {copy.experience.bfSponsoredBody}
            </p>
            <p className="mt-1 text-[12px] text-bf-muted">
              {copy.experience.bfSponsoredSite}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 border-t border-bf-border pt-3" aria-labelledby="bf-contacts-title">
        <h2
          id="bf-contacts-title"
          className="px-2 text-[17px] font-semibold text-bf-muted"
        >
          {copy.experience.bfContactsTitle}
        </h2>
        <ul className="mt-1">
          {contacts.map((contact) => (
            <BookfaceContactRow
              key={contact.id}
              name={contact.name}
              hue={contact.hue}
            />
          ))}
        </ul>
      </section>
    </aside>
  );
}
