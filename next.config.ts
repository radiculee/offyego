import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'offyego.com' }],
        destination: 'https://offyego.ie/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.offyego.com' }],
        destination: 'https://offyego.ie/:path*',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry org and project -- override via env vars if renamed in Sentry dashboard.
  org: process.env.SENTRY_ORG || 'crown-foods-rp',
  project: process.env.SENTRY_PROJECT || 'javascript-nextjs',
  // Upload source maps to Sentry then delete them from the public bundle.
  // Stack traces remain readable in Sentry; browsers never see the maps.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  // Auth token for source map upload during production builds.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Suppress SDK chatter in CI logs.
  silent: true,
});
