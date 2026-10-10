import { NextResponse } from 'next/server';
import { isKnownQrCode, qrLocale } from '@/lib/qr';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isKnownQrCode(code)) return new Response('Unknown guide code', { status: 404 });
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/${qrLocale(url)}/places/willow-museum/guide`, url.origin), {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
  });
}
