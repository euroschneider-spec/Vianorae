import { getOrganisationCopy } from '@/lib/organisation-copy';
import type { Locale } from '@/lib/i18n';

export function ResponsibilityNotice({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const t = getOrganisationCopy(locale);
  return <section className="responsibility-notice">
    <h2>{t.responsibilityTitle}</h2>
    <p>{t.responsibilityBody}</p>
    <p>{t.responsibilityScope}</p>
    {!compact && <ul>{t.commitments.map(item => <li key={item}>{item}</li>)}</ul>}
  </section>;
}
