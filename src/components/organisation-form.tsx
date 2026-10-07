'use client';

import { useActionState } from 'react';
import { authenticate, onboardOrganisation } from '@/app/auth/actions';
import type { Locale } from '@/lib/i18n';
import { getOrganisationCopy, organisationTypes } from '@/lib/organisation-copy';

export function OrganisationForm({ locale, mode, enabled, initial }: {
  locale: Locale; mode: 'register' | 'login' | 'onboard'; enabled: boolean;
  initial?: { organisation: string; type: string; representative: string };
}) {
  const t = getOrganisationCopy(locale);
  const action = mode === 'onboard' ? onboardOrganisation.bind(null, locale) : authenticate.bind(null, locale, mode);
  const [state, submit, pending] = useActionState(action, { message: '' });
  const hasOrganisation = mode !== 'login';
  const button = mode === 'onboard' ? t.createOrganisation : mode === 'register' ? t.register : t.login;

  return <form action={submit} className="organisation-form" aria-label={button}>
    {!enabled && <p className="notice">{t.unavailable}</p>}
    <fieldset disabled={!enabled || pending}>
      <legend>{button}</legend>
      <div className="form-grid">
        {hasOrganisation && <>
          <label className="form-field">{t.organisation}<input name="organisation" autoComplete="organization" required maxLength={160} defaultValue={initial?.organisation}/></label>
          <label className="form-field">{t.type}<select name="type" defaultValue={initial?.type || 'institution'}>{organisationTypes.map((type,i) => <option key={type} value={type}>{t.types[i]}</option>)}</select></label>
          <label className="form-field wide">{t.representative}<input name="representative" autoComplete="name" required maxLength={160} defaultValue={initial?.representative}/></label>
        </>}
        {mode !== 'onboard' && <>
          <label className="form-field">{t.email}<input type="email" name="email" autoComplete="email" required maxLength={254}/></label>
          <div className="form-field"><label htmlFor="account-password">{t.password}</label><input id="account-password" type="password" name="password" aria-describedby={mode === 'register' ? 'password-hint' : undefined} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 12 : 1} maxLength={128}/>{mode === 'register' && <small id="password-hint">{t.passwordHint}</small>}</div>
        </>}
      </div>
      {hasOrganisation && <>
        <label className="checkbox-label commitment"><input type="checkbox" name="authority" required/>{t.authority}</label>
        <label className="checkbox-label commitment"><input type="checkbox" name="responsibility" required/>{t.accept}</label>
      </>}
      <button className="button" type="submit">{button}</button>
    </fieldset>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
