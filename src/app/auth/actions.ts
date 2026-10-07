'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isLocale } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { authConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { applicationFromForm, getVerificationCopy } from '@/lib/verification';
import { verificationReady } from '@/lib/verification-server';

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
  const application = mode === 'register' ? applicationFromForm(form,locale) : null;
  if (mode === 'register' && !application) return {message:t.invalidFields};

  let signedIn = false;
  try {
    const supabase = await createClient();
    if (mode === 'register' && application) {
      if (!await verificationReady(supabase)) return {message:getVerificationCopy(locale).setup};
      const requestHeaders = await headers();
      const origin = requestHeaders.get('origin');
      if (!origin || !/^https?:\/\//.test(origin)) return { message: t.authError };
      const { error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: `${new URL(origin).origin}/auth/callback?locale=${locale}`,
        // These are editable profile suggestions only. They never grant roles or tenancy.
        data: { display_name: application.representative, organisation_name: application.organisation, organisation_type: application.type, verification_suggestion: application },
      } });
      return { message: error ? t.authError : getVerificationCopy(locale).confirmation };
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
  const application=applicationFromForm(form,locale);
  const revision=Number(text(form,'revision')) || null;
  if (!application || (revision!==null && (!Number.isSafeInteger(revision) || revision<1))) return {message:t.invalidFields};
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || !user.email_confirmed_at || user.is_anonymous) return { message: t.authError };
    if (!await verificationReady(supabase)) return {message:getVerificationCopy(locale).setup};
    const result = await supabase.rpc('submit_organization_application', {application,expected_revision:revision});
    if (result.error) return { message: t.authError };
  } catch { return { message: t.authError }; }
  redirect(`/${locale}/account`);
}

export async function signOut(locale: string) {
  if (!isLocale(locale)) return;
  if (authConfigured()) { const supabase = await createClient(); await supabase.auth.signOut(); }
  redirect(`/${locale}/login`);
}
