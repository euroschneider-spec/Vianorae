import type { NextConfig } from 'next';
const config: NextConfig = {
  // Use the compiler API; this also works in containers that restrict detached CLI subprocesses.
  experimental: { useTypeScriptCli: false },
  poweredByHeader: false, // Avoid advertising the framework version to probing clients.
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ] }];
  }
};
export default config;
