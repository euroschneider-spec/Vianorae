export function authConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ref = process.env.VIANORAE_SUPABASE_PROJECT_REF;
  if (!url || !key || !ref) return false;
  try { return new URL(url).hostname === `${ref}.supabase.co` && key.startsWith('sb_publishable_'); }
  catch { return false; }
}
