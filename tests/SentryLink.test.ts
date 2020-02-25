import { ApolloLink, Observable, execute } from 'apollo-link';
import gql from 'graphql-tag';
import * as Sentry from '@sentry/browser';
import sentryTestkit from 'sentry-testkit';

import { SentryLink } from '../src';
import { Operation } from '../src/Operation';
import { OperationsBreadcrumb } from '../src/OperationsBreadcrumb';
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

    // Clear breadcrumbs from previous tests
    Sentry.configureScope((scope) => {
      scope.clearBreadcrumbs();
    });
  });

  test('should fill a breadcrumb from an operation', () => {
    const link = new SentryLink(enableAll);
    const breadcrumb = new OperationsBreadcrumb();
    const operation = new Operation(OperationStub);

    link.fillBreadcrumb(breadcrumb, operation);

    expect(breadcrumb['breadcrumb'].message).toBe(operation.name);
    expect(breadcrumb['breadcrumb'].category).toBe(`gql ${operation.type}`);
    expect(breadcrumb['breadcrumb'].data?.query).toBe(operation.query);
    expect(breadcrumb['breadcrumb'].data?.cache).toBe(stringifyObject(operation.cache));
    expect(breadcrumb['breadcrumb'].data?.variables).toBe(stringifyObject(operation.variables));
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
    const breadcrumb = new OperationsBreadcrumb();
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
    const breadcrumb = new OperationsBreadcrumb();
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
      const breadcrumb = new OperationsBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb['breadcrumb'].data?.query).toBeUndefined();
    });

    test('should not attach the variables if the option is disabled', () => {
      const link = new SentryLink({ breadcrumb: { includeVariables: false } });
      const breadcrumb = new OperationsBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb['breadcrumb'].data?.variables).toBeUndefined();
    });

    test('should not attach the apollo cache if the option is disabled', () => {
      const link = new SentryLink({ breadcrumb: { includeCache: false } });
      const breadcrumb = new OperationsBreadcrumb();
      const operation = new Operation(OperationStub);

      link.fillBreadcrumb(breadcrumb, operation);

      expect(breadcrumb['breadcrumb'].data?.cache).toBeUndefined();
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
  });
});
