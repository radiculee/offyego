const isProd = process.env.NODE_ENV === 'production';

const noop = (): void => {};

export const logger = {
  log: isProd ? noop : console.log.bind(console),
  warn: isProd ? noop : console.warn.bind(console),
  error: console.error.bind(console),
};
