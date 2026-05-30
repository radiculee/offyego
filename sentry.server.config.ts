import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sampleRate: 1.0,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  // Don't fire in dev -- keeps the Sentry dashboard clean.
  enabled: process.env.NODE_ENV === 'production',
});
