import QRCode from 'qrcode';
import { isKnownQrCode, qrLocale } from '@/lib/qr';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isKnownQrCode(code)) return new Response('Unknown guide code', { status: 404 });
  const url = new URL(request.url);
  const destination = new URL(`/q/${code}`, url.origin);
  destination.searchParams.set('locale', qrLocale(url));
  const svg = await QRCode.toString(destination.toString(), {
    type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 256, color: { dark: '#1b3025', light: '#ffffff' },
  });
  const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
  return new Response(svg, { headers: {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'Content-Disposition': `${disposition}; filename="vianorae-willow-museum.svg"`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  } });
}
