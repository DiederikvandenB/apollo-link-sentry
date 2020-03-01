import { ApolloLink, Observable, execute } from 'apollo-link';
import gql from 'graphql-tag';
import * as Sentry from '@sentry/browser';
import sentryTestkit from 'sentry-testkit';

import { SentryLink, Operation } from '../src';
import { OperationBreadcrumb } from '../src/OperationBreadcrumb';
import { stringifyObject } from '../src/utils';
import OperationStub from './stubs/Operation';
import enableAll from './stubs/enableAllOptions';

const { testkit, sentryTransport } = sentryTestkit();

const TEST_QUERY = gql`query TestQuery {
  user {
    id
    name
  }
}`;

const ERROR_QUERY = gql`query ErrorQuery {
  user {
    id
    name
  }
}`;

describe('SentryLink', () => {
  beforeAll(() => {
    Sentry.init({
      dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
      transport: <any>sentryTransport,
      defaultIntegrations: false,
    });
  });

  beforeEach(() => {
    testkit.reset();

    // Clear breadcrumbs, the transaction and the fingerprint
    Sentry.configureScope((scope) => {
      scope.clearBreadcrumbs();
      scope.setTransaction();
      scope.setFingerprint([]);
    });
  });

  test('should fill a breadcrumb from an operation', () => {
    const link = new SentryLink(enableAll);
    const breadcrumb = new OperationBreadcrumb();
    const operation = new Operation(OperationStub);

    link.fillBreadcrumb(breadcrumb, operation);

    expect(breadcrumb.message).toBe(operation.name);
    expect(breadcrumb.category).toBe(`gql ${operation.type}`);
    expect(breadcrumb.query).toBe(operation.query);
    expect(breadcrumb.cache).toBe(stringifyObject(operation.cache));
    expect(breadcrumb.variables).toBe(stringifyObject(operation.variables));
  });

  test('should attach a sentry breadcrumb for an operation', (done) => {
    const link = ApolloLink.from([
      new SentryLink(enableAll),
      new ApolloLink(() => new Observable(
        (observer) => observer.error(new Error('Something went wrong')),
      )),
    ]);

    execute(link, { query: TEST_QUERY }).subscribe({
      error: (exception) => {
        Sentry.captureException(exception);

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs;
        expect(breadcrumb.category).toBe('gql query');

        done();
      },
    });
  });

  test('should attach a breadcrumb for each operation', (done) => {
    const successLink = ApolloLink.from([
      new SentryLink(enableAll),
      new ApolloLink(() => new Observable((observer) => {
        observer.next({});
        observer.complete();
      })),
    ]);

    const errorLink = ApolloLink.from([
      new SentryLink(enableAll),
      new ApolloLink(() => new Observable(
        (observer) => observer.error(new Error('Something went wrong')),
      )),
    ]);

    execute(successLink, { query: TEST_QUERY })
      .subscribe({
        complete() {
          execute(errorLink, { query: ERROR_QUERY })
            .subscribe({
              error(exception): void {
                Sentry.captureException(exception);

                const [report] = testkit.reports();
                expect(report.breadcrumbs).toHaveLength(2);

                const [success, error] = report.breadcrumbs;
                expect(success.message).toBe('TestQuery');
                expect(error.message).toBe('ErrorQuery');
                expect(error.type).toBe('error');

                done();
              },
            });
        },
      });
  });

  test('should not allow attaching the same breadcrumb twice', () => {
    console.warn = jest.fn();

    const link = new SentryLink(enableAll);
    const breadcrumb = new OperationBreadcrumb();
    const operation = new Operation(OperationStub);
    link.fillBreadcrumb(breadcrumb, operation);

    link.attachBreadcrumbToSentry(breadcrumb);
    expect(breadcrumb.flushed).toBeTruthy();

    link.attachBreadcrumbToSentry(breadcrumb);

    Sentry.captureException(new Error('Error'));

    const [report] = testkit.reports();
    expect(report.breadcrumbs).toHaveLength(1);
  });

  test('should show a warning if the same breadcrumb is attached twice', () => {
    const mockedWarn = jest.fn();
    console.warn = mockedWarn;

    const link = new SentryLink(enableAll);
    const breadcrumb = new OperationBreadcrumb();
    const operation = new Operation(OperationStub);

    link.fillBreadcrumb(breadcrumb, operation);
    link.attachBreadcrumbToSentry(breadcrumb);
    link.attachBreadcrumbToSentry(breadcrumb);

    expect(mockedWarn).toBeCalledTimes(1);
  });

  describe('options', () => {
    test('should not attach the breadcrumb if the option is disabled', () => {});

    test('should not attach the query if the option is disabled', () => {
      const link = new SentryLink({ breadcrumb: { includeQuery: false } });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb.query).toBeUndefined();
    });

    test('should not attach the variables if the option is disabled', () => {
      const link = new SentryLink({ breadcrumb: { includeVariables: false } });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb.variables).toBeUndefined();
    });

    test('should not attach the apollo cache if the option is disabled', () => {
      const link = new SentryLink({ breadcrumb: { includeCache: false } });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb.cache).toBeUndefined();
    });

    test('should not attach the response data if the option is disabled', (done) => {
      const link = ApolloLink.from([
        new SentryLink({ breadcrumb: { includeResponse: false } }),
        new ApolloLink(() => new Observable((observer) => {
          observer.next(<any>{ status: 200, data: { success: true } });
          observer.complete();
        })),
      ]);

      execute(link, { query: TEST_QUERY }).subscribe({
        complete: () => {
          Sentry.captureException(new Error('We need to throw something'));

          const [report] = testkit.reports();
          const [breadcrumb] = report.breadcrumbs;

          expect(breadcrumb.data?.response).toBeUndefined();

          done();
        },
      });
    });

    test('should not attach the error data if the option is disabled', (done) => {
      const link = ApolloLink.from([
        new SentryLink({ breadcrumb: { includeError: false } }),
        new ApolloLink(() => new Observable(
          (observer) => observer.error(new Error('Something went wrong')),
        )),
      ]);

      execute(link, { query: TEST_QUERY }).subscribe({
        error: (exception) => {
          Sentry.captureException(exception);

          const [report] = testkit.reports();
          const [breadcrumb] = report.breadcrumbs;

          expect(breadcrumb.data?.error).toBeUndefined();

          done();
        },
      });
    });

    test('should not set the transaction if the option is disabled', () => {
      const link = new SentryLink({ setTransaction: false });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      Sentry.captureException(new Error('test error'));
      const [report] = testkit.reports();
      const { originalReport } = report;

      expect(originalReport.transaction).toBeUndefined();
    });

    test('should not set the fingerprint if the option is disabled', () => {
      const link = new SentryLink({ setFingerprint: false });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      Sentry.captureException(new Error('test error'));
      const [report] = testkit.reports();
      const { originalReport } = report;

      expect(originalReport.fingerprint).toBeUndefined();
    });

    test('should add context keys to the breadcrumb', () => {
      const keys = ['headers', 'someOtherContext.lorem.ipsum'];
      const link = new SentryLink({ breadcrumb: { includeContextKeys: keys } });
      const breadcrumb = new OperationBreadcrumb();
      const operation = new Operation(OperationStub);
      const context = operation['getContextKeys'](keys);

      link.fillBreadcrumb(breadcrumb, operation);
      link.attachBreadcrumbToSentry(breadcrumb);
      Sentry.captureException(new Error('Error'));

      const [report] = testkit.reports();
      const [crumb] = report.breadcrumbs;

      expect(crumb.data?.context).toBe(stringifyObject(context));
    });

    test('should allow filtering out operations', (done) => {
      const filter = () => false;
      const link = ApolloLink.from([
        new SentryLink({ filter }),
        new ApolloLink(() => new Observable((observer) => {
          observer.next(<any>{ status: 200, data: { success: true } });
          observer.complete();
        })),
      ]);

      execute(link, { query: TEST_QUERY }).subscribe({
        complete: () => {
          Sentry.captureException(new Error('We need to throw something'));
          const [report] = testkit.reports();

          expect(report.breadcrumbs).toHaveLength(0);

          done();
        },
      });
    });

    test('should allow altering the breadcrumb with beforeBreadcrumb', (done) => {
      const beforeBreadcrumb = (breadcrumb: OperationBreadcrumb) => breadcrumb.setMessage('Test message');

      const link = ApolloLink.from([
        new SentryLink({ beforeBreadcrumb }),
        new ApolloLink(() => new Observable((observer) => {
          observer.next(<any>{ status: 200, data: { success: true } });
          observer.complete();
        })),
      ]);

      execute(link, { query: TEST_QUERY }).subscribe({
        complete: () => {
          Sentry.captureException(new Error('We need to throw something'));
          const [report] = testkit.reports();
          const [crumb] = report.breadcrumbs;

          expect(crumb.message).toBe('Test message');

          done();
        },
      });
    });
  });
});
