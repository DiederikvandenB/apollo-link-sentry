import {
  ApolloError,
  ApolloLink,
  execute,
  ServerError,
} from '@apollo/client/core';
import * as Sentry from '@sentry/browser';
import { Severity } from '@sentry/types';
import { GraphQLError, parse } from 'graphql';
import sentryTestkit from 'sentry-testkit';
import Observable from 'zen-observable';

import { GraphQLBreadcrumb, SentryLink, SentryLinkOptions } from '../src';
import { DEFAULT_FINGERPRINT } from '../src/sentry';
import { stringify } from '../src/utils';

const { testkit, sentryTransport } = sentryTestkit();

const nullLink = new ApolloLink(() => null);

describe('SentryLink', () => {
  beforeAll(() => {
    Sentry.init({
      dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
      transport: sentryTransport,
      defaultIntegrations: false,
    });
  });

  beforeEach(() => {
    testkit.reset();

    Sentry.configureScope((scope) => {
      scope.clearBreadcrumbs();
      scope.setTransactionName();
      scope.setFingerprint([]);
    });
  });

  it('should attach a sentry breadcrumb for an apolloOperation', (done) => {
    const link = ApolloLink.from([new SentryLink(), nullLink]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs;
        expect(breadcrumb.type).toBe('http');

        const data = breadcrumb.data as GraphQLBreadcrumb['data'];
        expect(data).not.toHaveProperty('query');
        expect(data).not.toHaveProperty('variables');
        expect(data).not.toHaveProperty('result');
        expect(data).not.toHaveProperty('error');
        expect(data).not.toHaveProperty('cache');
        expect(data).not.toHaveProperty('context');

        done();
      },
    });
  });

  it('should attach a breadcrumb for each apolloOperation', (done) => {
    const includeErrorAndResultOptions: SentryLinkOptions = {
      attachBreadcrumbs: { includeFetchResult: true, includeError: true },
    };

    const result = { data: { foo: true } };
    const withResult = ApolloLink.from([
      new SentryLink(includeErrorAndResultOptions),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next(result);
            observer.complete();
          }),
      ),
    ]);

    const error = new Error();
    const withError = ApolloLink.from([
      new SentryLink(includeErrorAndResultOptions),
      new ApolloLink(() => {
        return new Observable((observer) => observer.error(error));
      }),
    ]);

    execute(withResult, {
      query: parse(`query SuccessQuery { foo }`),
    }).subscribe({
      complete() {
        execute(withError, {
          query: parse(`mutation FailureMutation { bar }`),
        }).subscribe({
          error(exception) {
            Sentry.captureException(exception);

            const [report] = testkit.reports();
            expect(report.breadcrumbs).toHaveLength(2);

            const [success, failure] =
              report.breadcrumbs as Array<GraphQLBreadcrumb>;

            expect(success.category).toBe('graphql.query');
            expect(success.level).toBe(SeverityLevel.Info);
            expect(success.data.operationName).toBe('SuccessQuery');
            expect(success.data.fetchResult).toBe(stringify(result));
            expect(success.data).not.toHaveProperty('error');

            expect(failure.category).toBe('graphql.mutation');
            expect(failure.level).toBe(Severity.Error);
            expect(failure.data.operationName).toBe('FailureMutation');
            expect(failure.data).not.toHaveProperty('result');
            expect(failure.data.error).toBe(stringify(error));

            done();
          },
        });
      },
    });
  });

  it('should attach a breadcrumb with an error and null data', (done) => {
    const errors = [new GraphQLError('failure')];
    const result = {
      data: { foo: null },
      errors: errors,
    };
    const withPartialErrors = ApolloLink.from([
      new SentryLink({
        attachBreadcrumbs: { includeError: true },
      }),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next(result);
            observer.complete();
          }),
      ),
    ]);

    execute(withPartialErrors, {
      query: parse(`query PartialErrors { foo }`),
    }).subscribe({
      complete() {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;

        expect(breadcrumb.category).toBe('graphql.query');
        expect(breadcrumb.level).toBe(Severity.Error);
        expect(breadcrumb.data.operationName).toBe('PartialErrors');
        expect(breadcrumb.data.fetchResult).not.toBeDefined();
        expect(breadcrumb.data.error).toBe(
          stringify(new ApolloError({ graphQLErrors: errors })),
        );

        done();
      },
    });
  });

  it('should attach a breadcrumb with partial errors', (done) => {
    const errors = [
      new GraphQLError('partial failure'),
      new GraphQLError('another failure'),
    ];
    const result = {
      data: { foo: true },
      errors: errors,
    };
    const withPartialErrors = ApolloLink.from([
      new SentryLink({
        attachBreadcrumbs: { includeFetchResult: true, includeError: true },
      }),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next(result);
            observer.complete();
          }),
      ),
    ]);

    execute(withPartialErrors, {
      query: parse(`query PartialErrors { foo }`),
    }).subscribe({
      complete() {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;

        expect(breadcrumb.category).toBe('graphql.query');
        expect(breadcrumb.level).toBe(Severity.Error);
        expect(breadcrumb.data.operationName).toBe('PartialErrors');
        expect(breadcrumb.data.fetchResult).toBe(stringify(result));
        expect(breadcrumb.data.error).toBe(
          stringify(new ApolloError({ graphQLErrors: errors })),
        );

        done();
      },
    });
  });

  it('should mark results with errors with level error', (done) => {
    const link = ApolloLink.from([
      new SentryLink(),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({
              errors: [new GraphQLError('some message')],
            });
            observer.complete();
          }),
      ),
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs;
        expect(breadcrumb.level).toBe(Severity.Error);

        done();
      },
    });
  });

  it('should allow inclusion of results from server errors', (done) => {
    const message = 'some message';
    const fetchResult = { errors: [{ message: 'GraphQL error message' }] };

    const serverError: ServerError = {
      name: 'bla',
      message: message,
      response: new Response(),
      result: fetchResult,
      statusCode: 500,
    };

    const link = ApolloLink.from([
      new SentryLink({
        attachBreadcrumbs: {
          includeError: true,
          includeFetchResult: true,
        },
      }),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.error(serverError);
          }),
      ),
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      error: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;
        expect(breadcrumb.data.error).toEqual(
          stringify({
            name: serverError.name,
            message: serverError.message,
            statusCode: serverError.statusCode,
          }),
        );
        expect(breadcrumb.data.fetchResult).toEqual(stringify(fetchResult));

        done();
      },
    });
  });

  it('should not attach the breadcrumb if the option is disabled', (done) => {
    const link = ApolloLink.from([
      new SentryLink({ attachBreadcrumbs: false }),
      nullLink,
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(0);

        done();
      },
    });
  });

  it('should set the transaction name by default', (done) => {
    const link = ApolloLink.from([new SentryLink(), nullLink]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const { originalReport } = report;

        expect(originalReport.transaction).toBe('Foo');

        done();
      },
    });
  });

  it('should not set the transaction if the option is disabled', (done) => {
    const link = ApolloLink.from([
      new SentryLink({ setTransaction: false }),
      nullLink,
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const { originalReport } = report;

        expect(originalReport.transaction).toBeUndefined();

        done();
      },
    });
  });

  it('should set the fingerprint by default', (done) => {
    const link = ApolloLink.from([new SentryLink(), nullLink]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const { originalReport } = report;

        expect(originalReport.fingerprint).toStrictEqual([
          DEFAULT_FINGERPRINT,
          'Foo',
        ]);

        done();
      },
    });
  });

  it('should not set the fingerprint if the option is disabled', (done) => {
    const link = ApolloLink.from([
      new SentryLink({ setFingerprint: false }),
      nullLink,
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const { originalReport } = report;

        expect(originalReport.fingerprint).toBeUndefined();

        done();
      },
    });
  });

  it('should allow filtering out operations', (done) => {
    const link = ApolloLink.from([
      new SentryLink({
        shouldHandleOperation: (operation) =>
          operation.operationName === 'Handle',
      }),
      nullLink,
    ]);

    execute(link, { query: parse(`query Handle { foo }`) }).subscribe({
      complete: () => {
        execute(link, { query: parse(`query Discard { foo }`) }).subscribe({
          complete: () => {
            Sentry.captureException(new Error());

            const [report] = testkit.reports();

            expect(report.breadcrumbs).toHaveLength(1);
            const [handle] = report.breadcrumbs;

            expect(handle.data?.operationName).toBe('Handle');

            done();
          },
        });
      },
    });
  });

  it('should allow altering the breadcrumb with beforeBreadcrumb', (done) => {
    const link = ApolloLink.from([
      new SentryLink({
        attachBreadcrumbs: {
          transform: (breadcrumb, operation) => ({
            ...breadcrumb,
            data: {
              ...breadcrumb.data,
              foo: operation.operationName,
            },
          }),
        },
      }),
      nullLink,
    ]);

    execute(link, { query: parse(`query Foo { foo }`) }).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const [breadcrumb] = report.breadcrumbs;

        expect(breadcrumb.data?.foo).toBe('Foo');

        done();
      },
    });
  });
});
