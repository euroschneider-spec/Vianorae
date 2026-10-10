import { getOrganisationCopy } from '@/lib/organisation-copy';
import type { Locale } from '@/lib/i18n';

/**
 * `part` lets a page lead with the reason this matters (`hook`) and keep the accountability
 * detail (`terms`) for after the practical content. Both halves come from the same copy, so
 * showing them apart never means two versions of the text.
 */
export function ResponsibilityNotice({ locale, compact = false, part = 'all' }: { locale: Locale; compact?: boolean; part?: 'all' | 'hook' | 'terms' }) {
  const t = getOrganisationCopy(locale);
  return <section className="responsibility-notice">
    {part !== 'terms' && <><h2>{t.responsibilityTitle}</h2><p>{t.responsibilityBody}</p></>}
    {part !== 'hook' && <><p>{t.responsibilityScope}</p>{!compact && <ul>{t.commitments.map(item => <li key={item}>{item}</li>)}</ul>}</>}
  </section>;
}
