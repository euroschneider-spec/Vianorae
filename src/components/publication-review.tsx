'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { draftKey, validPhoto, type Guide } from '@/lib/demo';
import { getOrganisationCopy, responsibilityVersion } from '@/lib/organisation-copy';
import { readLocalPhoto } from '@/lib/local-photos';

export function PublicationReview({ locale, guide }: { locale: Locale; guide: Guide }) {
  const t = getOrganisationCopy(locale);
  const [status, setStatus] = useState('');
  const [snapshot, setSnapshot] = useState('');
  const [busy, setBusy] = useState(false);
  const current = JSON.stringify(guide);

  async function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const representative = String(form.get('representative') || '').trim();
    const checkedOn = String(form.get('checkedOn') || '');
    setBusy(true);
    setSnapshot(current);
    try {
      if (localStorage.getItem(draftKey(locale)) !== current) { setStatus(t.reviewUnsaved); return; }
      if (!representative || !checkedOn || checkedOn > new Date().toISOString().slice(0,10)
        || ['content', 'images', 'responsibility'].some(key => form.get(key) !== 'on')) {
        setStatus(t.invalidFields); return;
      }
      for (const zone of guide.zones) {
        if (zone.photo && (!validPhoto(zone.photo) || !await readLocalPhoto(zone.photo.id))) {
          setStatus(t.photoMissing); return;
        }
      }
      localStorage.setItem(`vianorae:demo-review:v1:${locale}`, JSON.stringify({
        contentSnapshot: current, representative, checkedOn, acceptedAt: new Date().toISOString(),
        responsibilityVersion, isDemo: true,
      }));
      setStatus(t.reviewPassed);
    } catch { setStatus(t.reviewUnsaved); }
    finally { setBusy(false); }
  }

  return <section className="publication-review">
    <h2>{t.reviewTitle}</h2><p>{t.reviewIntro}</p>
    <form onSubmit={review} aria-label={t.reviewTitle}>
      <div className="form-grid">
        <label className="form-field">{t.representative}<input name="representative" required maxLength={160}/></label>
        <label className="form-field">{t.checkedOn}<input name="checkedOn" type="date" required max={new Date().toISOString().slice(0,10)}/></label>
      </div>
      {([['content',t.checkContent],['images',t.checkImages],['responsibility',t.accept]] as const).map(([name,label]) =>
        <label className="checkbox-label commitment" key={name}><input name={name} type="checkbox" required/>{label}</label>)}
      <button className="button button-outline" type="submit" disabled={busy}>{t.reviewButton}</button>
      {status && snapshot === current && <p role="status">{status}</p>}
      <p className="small-note">{t.savedLocally}</p>
    </form>
  </section>;
}
