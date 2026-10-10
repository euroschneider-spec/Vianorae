import { isLocale, type Locale } from './i18n';

// The QR registry table is not wired up yet; until it is, one demo code exists.
const knownCodes = ['willow-museum'];
export const isKnownQrCode = (code: string) => knownCodes.includes(code);

export function qrLocale(url: URL): Locale {
  const requested = url.searchParams.get('locale') || 'en';
  return isLocale(requested) ? requested : 'en';
}
