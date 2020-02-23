import * as Sentry from '@sentry/browser';
import sentryTestkit from 'sentry-testkit';

const { testkit, sentryTransport } = sentryTestkit();

Sentry.init({
  dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
  transport: <any>sentryTransport,
  defaultIntegrations: false,
});

export {
  Sentry,
  testkit,
};
