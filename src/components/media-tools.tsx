import { getAccessCopy } from '@/lib/accessibility-copy';
import type { Locale } from '@/lib/i18n';
import { ReadingSettingsButton } from './reading-settings';

export function MediaTools({locale,kind}:{locale:Locale;kind:'hero'|'guide'}) {
  const a=getAccessCopy(locale);
  return <div className="media-tools" role="group" aria-label={a.tools}>
    <p className="media-tools-title">{a.tools}</p>
    <ReadingSettingsButton locale={locale} className={`${kind}-reading`} showLabel/>
    <p className="media-tools-hint">{a.openSettings}</p>
  </div>;
}
