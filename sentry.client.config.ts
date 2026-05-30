import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture 100% of errors. Small app; ceiling is high.
  sampleRate: 1.0,
  // Performance: 10% sample. Cheap on free tier, useful for
  // diagnosing slow Mapbox / Overpass calls in production.
  tracesSampleRate: 0.1,
  // Don't send PII even by accident.
  sendDefaultPii: false,
  // Skip noisy browser extension errors and known false positives.
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
  ],
  // Don't fire in dev -- keeps the Sentry dashboard clean.
  enabled: process.env.NODE_ENV === 'production',
});
