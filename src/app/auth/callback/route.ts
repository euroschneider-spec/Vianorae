import { NextResponse, type NextRequest } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { authConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get('locale') || 'en';
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const code = request.nextUrl.searchParams.get('code');
  if (authConfigured() && code && code.length <= 1000) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(`/${locale}/account`, request.url));
    } catch { /* A failed or expired link goes to sign-in without reflecting parameters. */ }
  }
  return NextResponse.redirect(new URL(`/${locale}/login?confirmation=failed`, request.url));
}
