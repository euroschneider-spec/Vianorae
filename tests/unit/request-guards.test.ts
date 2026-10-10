// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const { limitedFormData, sameOrigin } = await import('@/lib/request-guards');

const form = (bytes: number) => {
  const data = new FormData();
  data.set('file', new File([new Uint8Array(bytes)], 'a.bin'));
  return data;
};
// A streamed body declares no Content-Length, like a chunked upload.
const chunked = async (data: FormData) => {
  const encoded = new Response(data);
  const bytes = new Uint8Array(await encoded.arrayBuffer());
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({ pull(controller) {
    if (offset >= bytes.length) return controller.close();
    controller.enqueue(bytes.slice(offset, offset += 4096));
  } });
  return new Request('https://site.test/api', { method: 'POST', body, duplex: 'half',
    headers: { 'content-type': encoded.headers.get('content-type')! } } as RequestInit);
};

describe('sameOrigin', () => {
  const post = (origin?: string) => new Request('https://site.test/api', { method: 'POST', headers: origin ? { origin } : {} });
  it('accepts only the exact site origin', () => {
    expect(sameOrigin(post('https://site.test'))).toBe(true);
    expect(sameOrigin(post('https://other.test'))).toBe(false);
    expect(sameOrigin(post('http://site.test'))).toBe(false);
  });
  it('treats a missing Origin as cross-site', () => {
    expect(sameOrigin(post())).toBe(false);
  });
});

describe('limitedFormData', () => {
  it('parses a body within the limit', async () => {
    const result = await limitedFormData(new Request('https://site.test/api', { method: 'POST', body: form(100) }), 10_000);
    expect((result?.get('file') as File).size).toBe(100);
  });
  it('rejects a declared length over the limit before reading', async () => {
    const request = new Request('https://site.test/api', { method: 'POST', body: form(100), headers: { 'content-length': '999999' } });
    expect(await limitedFormData(request, 10_000)).toBeNull();
  });
  it('rejects a malformed declared length', async () => {
    const request = new Request('https://site.test/api', { method: 'POST', body: form(100), headers: { 'content-length': 'abc' } });
    expect(await limitedFormData(request, 10_000)).toBeNull();
  });
  it('stops reading a chunked body once it passes the limit', async () => {
    const request = await chunked(form(50_000));
    expect(request.headers.get('content-length')).toBeNull();
    expect(await limitedFormData(request, 10_000)).toBeNull();
  });
  it('accepts a chunked body within the limit', async () => {
    const result = await limitedFormData(await chunked(form(100)), 10_000);
    expect((result?.get('file') as File).size).toBe(100);
  });
  it('throws on a body that is not form data', async () => {
    const request = new Request('https://site.test/api', { method: 'POST', body: 'x', headers: { 'content-type': 'multipart/form-data; boundary=z' } });
    await expect(limitedFormData(request, 10_000)).rejects.toThrow();
  });
});
