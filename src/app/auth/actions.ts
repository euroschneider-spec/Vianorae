'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isLocale } from '@/lib/i18n';
import { getOrganisationCopy, organisationTypes } from '@/lib/organisation-copy';
import { authConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { message: string };
const text = (form: FormData, key: string) => String(form.get(key) || '').trim();

export async function authenticate(locale: string, mode: 'register' | 'login', _previous: AuthState, form: FormData): Promise<AuthState> {
  if (!isLocale(locale)) return { message: 'Invalid language.' };
  const t = getOrganisationCopy(locale);
  if (!authConfigured()) return { message: t.unavailable };
  const email = text(form, 'email');
  const password = String(form.get('password') || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length > 128
    || password.length < (mode === 'register' ? 12 : 1)) return { message: t.invalidFields };
  const representative = text(form, 'representative');
  const organisation = text(form, 'organisation');
  const type = text(form, 'type');
  if (mode === 'register' && (!representative || representative.length > 160 || !organisation || organisation.length > 160
    || !organisationTypes.includes(type as typeof organisationTypes[number])
    || form.get('authority') !== 'on' || form.get('responsibility') !== 'on')) return { message: t.invalidFields };

  let signedIn = false;
  try {
    const supabase = await createClient();
    if (mode === 'register') {
      const requestHeaders = await headers();
      const origin = requestHeaders.get('origin');
      if (!origin || !/^https?:\/\//.test(origin)) return { message: t.authError };
      const { error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: `${new URL(origin).origin}/auth/callback?locale=${locale}`,
        // These are editable profile suggestions only. They never grant roles or tenancy.
        data: { display_name: representative, organisation_name: organisation, organisation_type: type },
      } });
      return { message: error ? t.authError : t.confirmation };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    signedIn = !error;
  } catch { return { message: t.authError }; }
  if (signedIn) redirect(`/${locale}/account`);
  return { message: t.authError };
}

export async function onboardOrganisation(locale: string, _previous: AuthState, form: FormData): Promise<AuthState> {
  if (!isLocale(locale)) return { message: 'Invalid language.' };
  const t = getOrganisationCopy(locale);
  if (!authConfigured()) return { message: t.unavailable };
  const organisation = text(form, 'organisation');
  const representative = text(form, 'representative');
  const type = text(form, 'type');
  if (!organisation || organisation.length > 160 || !representative || representative.length > 160
    || !organisationTypes.includes(type as typeof organisationTypes[number])
    || form.get('authority') !== 'on' || form.get('responsibility') !== 'on') return { message: t.invalidFields };
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || !user.email_confirmed_at || user.is_anonymous) return { message: t.authError };
    const result = await supabase.rpc('create_organisation', {
      organisation_name: organisation, organisation_type: type,
      representative_name: representative, accepted: true, statement_locale: locale,
    });
    if (result.error) return { message: t.authError };
  } catch { return { message: t.authError }; }
  redirect(`/${locale}/account`);
}

export async function signOut(locale: string) {
  if (!isLocale(locale)) return;
  if (authConfigured()) { const supabase = await createClient(); await supabase.auth.signOut(); }
  redirect(`/${locale}/login`);
}
