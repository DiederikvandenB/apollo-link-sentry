import {
  ApolloLink,
  CombinedGraphQLErrors,
  execute,
  ServerError,
} from '@apollo/client/core';
import * as Sentry from '@sentry/browser';
import { startSpanManual } from '@sentry/core';
import type { Span } from '@sentry/core';
import { GraphQLError, parse } from 'graphql';
import { Observable } from 'rxjs';
import sentryTestkit from 'sentry-testkit';

import { GraphQLBreadcrumb, SentryLink, SentryLinkOptions } from '../src';
import { DEFAULT_FINGERPRINT } from '../src/sentry';
import { stringify } from '../src/utils';

import { createApolloClient } from './utils';

const mockSpan = { end: jest.fn(), setStatus: jest.fn() } as unknown as Span;
const mockActiveSpan: { current?: Span } = {};

jest.mock('@sentry/core', () => ({
  ...jest.requireActual('@sentry/core'),
  startSpanManual: jest.fn(
    (_options: unknown, callback: (span: unknown) => unknown) => {
      mockActiveSpan.current = mockSpan;
      try {
        return callback(mockSpan);
      } finally {
        mockActiveSpan.current = undefined;
      }
    },
  ),
}));

const startSpanManualMock = startSpanManual as jest.MockedFunction<
  typeof startSpanManual
>;

const { testkit, sentryTransport } = sentryTestkit();

const nullLink = new ApolloLink((operation, forward) => {
  return forward(operation);
});

describe('SentryLink', () => {
  const context: ApolloLink.ExecuteContext = { client: createApolloClient() };

  beforeAll(() => {
    Sentry.init({
      dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
      transport: sentryTransport,
      defaultIntegrations: false,
    });
  });

  beforeEach(() => {
    testkit.reset();

    Sentry.getIsolationScope().clearBreadcrumbs();
    Sentry.getCurrentScope().setTransactionName();
    Sentry.getCurrentScope().setFingerprint([]);
  });

  it('should attach a sentry breadcrumb for an apolloOperation', (done) => {
    const link = ApolloLink.from([new SentryLink(), nullLink]);

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(
      withResult,
      {
        query: parse(`query SuccessQuery { foo }`),
      },
      context,
    ).subscribe({
      complete() {
        execute(
          withError,
          {
            query: parse(`mutation FailureMutation { bar }`),
          },
          context,
        ).subscribe({
          error(exception) {
            Sentry.captureException(exception);

            const [report] = testkit.reports();
            expect(report.breadcrumbs).toHaveLength(2);

            const [success, failure] =
              report.breadcrumbs as Array<GraphQLBreadcrumb>;

            expect(success.category).toBe('graphql.query');
            expect(success.level).toBe('info');
            expect(success.data.operationName).toBe('SuccessQuery');
            expect(success.data.fetchResult).toBe(stringify(result));
            expect(success.data).not.toHaveProperty('error');

            expect(failure.category).toBe('graphql.mutation');
            expect(failure.level).toBe('error');
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

    execute(
      withPartialErrors,
      {
        query: parse(`query PartialErrors { foo }`),
      },
      context,
    ).subscribe({
      complete() {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;

        expect(breadcrumb.category).toBe('graphql.query');
        expect(breadcrumb.level).toBe('error');
        expect(breadcrumb.data.operationName).toBe('PartialErrors');
        expect(breadcrumb.data.fetchResult).not.toBeDefined();
        expect(breadcrumb.data.error).toBe(
          stringify(new CombinedGraphQLErrors(result)),
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

    execute(
      withPartialErrors,
      {
        query: parse(`query PartialErrors { foo }`),
      },
      context,
    ).subscribe({
      complete() {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;

        expect(breadcrumb.category).toBe('graphql.query');
        expect(breadcrumb.level).toBe('error');
        expect(breadcrumb.data.operationName).toBe('PartialErrors');
        expect(breadcrumb.data.fetchResult).toBe(stringify(result));
        expect(breadcrumb.data.error).toBe(
          stringify(new CombinedGraphQLErrors(result)),
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs;
        expect(breadcrumb.level).toBe('error');

        done();
      },
    });
  });

  it('should allow inclusion of results from server errors', (done) => {
    const message = 'some message';
    const fetchResult = { errors: [{ message: 'GraphQL error message' }] };

    const serverError = new ServerError(message, {
      response: new Response(null, { status: 500 }),
      bodyText: stringify(fetchResult),
    });

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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
      error: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        expect(report.breadcrumbs).toHaveLength(1);

        const [breadcrumb] = report.breadcrumbs as Array<GraphQLBreadcrumb>;
        expect(breadcrumb.data.error).toEqual(
          stringify({
            response: serverError.response,
            statusCode: serverError.statusCode,
            bodyText: serverError.bodyText,
            name: serverError.name,
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
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

    execute(link, { query: parse(`query Handle { foo }`) }, context).subscribe({
      complete: () => {
        execute(
          link,
          { query: parse(`query Discard { foo }`) },
          context,
        ).subscribe({
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

    execute(link, { query: parse(`query Foo { foo }`) }, context).subscribe({
      complete: () => {
        Sentry.captureException(new Error());

        const [report] = testkit.reports();
        const [breadcrumb] = report.breadcrumbs;

        expect(breadcrumb.data?.foo).toBe('Foo');

        done();
      },
    });
  });

  it('should create a span when tracing is enabled', (done) => {
    startSpanManualMock.mockClear();
    (mockSpan.end as jest.Mock).mockClear();

    const link = ApolloLink.from([new SentryLink({ tracing: true }), nullLink]);

    execute(
      link,
      { query: parse(`query TracedQuery { foo }`) },
      context,
    ).subscribe({
      complete: () => {
        expect(startSpanManualMock).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'graphql.query TracedQuery',
            op: 'graphql',
            onlyIfParent: true,
            attributes: {
              'graphql.operation.type': 'query',
              'graphql.operation.name': 'TracedQuery',
            },
          }),
          expect.any(Function),
        );

        expect(mockSpan.end).toHaveBeenCalled();

        done();
      },
    });
  });

  it('should end the span on error', (done) => {
    startSpanManualMock.mockClear();
    (mockSpan.end as jest.Mock).mockClear();

    const error = new Error('network failure');
    const errorLink = ApolloLink.from([
      new SentryLink({ tracing: true }),
      new ApolloLink(() => new Observable((observer) => observer.error(error))),
    ]);

    execute(
      errorLink,
      { query: parse(`query ErrorQuery { foo }`) },
      context,
    ).subscribe({
      error: () => {
        expect(startSpanManualMock).toHaveBeenCalled();
        expect(mockSpan.setStatus).toHaveBeenCalledWith({
          code: 2,
          message: 'internal_error',
        });
        expect(mockSpan.end).toHaveBeenCalled();

        done();
      },
    });
  });

  it.each([{}, { attachBreadcrumbs: false as const }])(
    'should keep the span active while the request runs with %p',
    (options) => {
      let spanDuringRequest: Span | undefined;
      const link = ApolloLink.from([
        new SentryLink(options),
        new ApolloLink(
          () =>
            new Observable((observer) => {
              spanDuringRequest = mockActiveSpan.current;
              observer.complete();
            }),
        ),
      ]);

      execute(
        link,
        { query: parse(`query ActiveSpanQuery { foo }`) },
        context,
      ).subscribe({});

      expect(spanDuringRequest).toBe(mockSpan);
    },
  );

  it('should mark the span as errored for results with errors', () => {
    (mockSpan.setStatus as jest.Mock).mockClear();

    const link = ApolloLink.from([
      new SentryLink(),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({ errors: [new GraphQLError('partial')] });
            observer.complete();
          }),
      ),
    ]);

    execute(
      link,
      { query: parse(`query PartialErrorQuery { foo }`) },
      context,
    ).subscribe({});

    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: 2,
      message: 'internal_error',
    });
  });

  it('should end the span on unsubscribe', () => {
    (mockSpan.end as jest.Mock).mockClear();

    const pendingLink = ApolloLink.from([
      new SentryLink(),
      new ApolloLink(() => new Observable()),
    ]);

    execute(
      pendingLink,
      { query: parse(`subscription PendingSubscription { foo }`) },
      context,
    )
      .subscribe({})
      .unsubscribe();

    expect(mockSpan.end).toHaveBeenCalled();
  });

  it('should not create a span when tracing is disabled', (done) => {
    startSpanManualMock.mockClear();

    const link = ApolloLink.from([
      new SentryLink({ tracing: false }),
      nullLink,
    ]);

    execute(
      link,
      { query: parse(`query UntracedQuery { foo }`) },
      context,
    ).subscribe({
      complete: () => {
        expect(startSpanManualMock).not.toHaveBeenCalled();

        done();
      },
    });
  });
});
