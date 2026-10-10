import { describe, it, expect } from 'vitest';
import { isKnownQrCode, qrLocale } from '@/lib/qr';

describe('qr helpers', () => {
  it('knows only the demo code', () => {
    expect(isKnownQrCode('willow-museum')).toBe(true);
    expect(isKnownQrCode('other')).toBe(false);
  });
  it('falls back to English for missing or unsupported locales', () => {
    expect(qrLocale(new URL('https://x.test/q/a'))).toBe('en');
    expect(qrLocale(new URL('https://x.test/q/a?locale=fr'))).toBe('en');
    expect(qrLocale(new URL('https://x.test/q/a?locale=ro'))).toBe('ro');
  });
});
