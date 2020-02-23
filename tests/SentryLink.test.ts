import { ApolloLink, execute, Observable } from 'apollo-link';
import gql from 'graphql-tag';

import { SentryLink } from '../src';
import { Sentry, testkit } from './utils/sentry';
import { OperationsBreadcrumb } from '../src/OperationsBreadcrumb';
import OperationStub from './stubs/Operation';
import enableAll from './stubs/enableAllOptions';
import { Operation } from '../src/Operation';
import { stringifyObject } from '../src/utils';

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

it('attaches a sentry breadcrumb for an operation', (done) => {
  const link = ApolloLink.from([
    new SentryLink(enableAll),
    new ApolloLink(() => new Observable(
      (observer) => observer.error(new Error('Something went wrong')),
    )),
  ]);

  try {
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
  } catch (exception) {
    done.fail(exception);
  }
});

it('attaches breadcrumbs for multiple queries', (done) => {
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

  try {
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
  } catch (exception) {
    done.fail(exception);
  } finally {
    done();
  }
});

it('is possible to fill a breadcrumb from an operation', () => {
  const link = new SentryLink(enableAll);
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);

  expect(breadcrumb['breadcrumb'].message).toBe(operation.getName());
  expect(breadcrumb['breadcrumb'].category).toBe(`gql ${operation.getType()}`);
  expect(breadcrumb['breadcrumb'].data?.query).toBe(operation.getQuery());
  expect(breadcrumb['breadcrumb'].data?.cache).toBe(stringifyObject(operation.getApolloCache()));
  expect(breadcrumb['breadcrumb'].data?.variables).toBe(stringifyObject(operation.getVariables()));
});

it('allows disabling attaching the query', () => {
  const link = new SentryLink({ breadcrumb: { includeQuery: false } });
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);

  expect(breadcrumb['breadcrumb'].data?.query).toBeUndefined();
});

it('allows disabling attaching the variables', () => {
  const link = new SentryLink({ breadcrumb: { includeVariables: false } });
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);

  expect(breadcrumb['breadcrumb'].data?.variables).toBeUndefined();
});

it('allows disabling attaching apollo cache', () => {
  const link = new SentryLink({ breadcrumb: { includeCache: false } });
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);

  expect(breadcrumb['breadcrumb'].data?.cache).toBeUndefined();
});

it('allows disabling attaching the error', (done) => {
  const link = ApolloLink.from([
    new SentryLink({ breadcrumb: { includeError: false } }),
    new ApolloLink(() => new Observable(
      (observer) => observer.error(new Error('Something went wrong')),
    )),
  ]);

  try {
    execute(link, { query: TEST_QUERY }).subscribe({
      error: (exception) => {
        Sentry.captureException(exception);

        const [report] = testkit.reports();
        const [breadcrumb] = report.breadcrumbs;

        expect(breadcrumb.data?.error).toBeUndefined();

        done();
      },
    });
  } catch (exception) {
    done.fail(exception);
  } finally {
    done();
  }
});

it('allows disabling attaching the response', (done) => {
  const link = ApolloLink.from([
    new SentryLink({ breadcrumb: { includeResponse: false } }),
    new ApolloLink(() => new Observable((observer) => {
      observer.next(<any>{ status: 200, data: { success: true } });
      observer.complete();
    })),
  ]);

  try {
    execute(link, { query: TEST_QUERY }).subscribe({
      complete: () => {
        Sentry.captureException(new Error('We need to throw something'));

        const [report] = testkit.reports();
        const [breadcrumb] = report.breadcrumbs;

        expect(breadcrumb.data?.response).toBeUndefined();

        done();
      },
    });
  } catch (exception) {
    done.fail(exception);
  } finally {
    done();
  }
});

it('does not allow attaching the same breadcrumb twice', () => {
  console.warn = jest.fn();

  const link = new SentryLink(enableAll);
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);
  link.attachToEvent(breadcrumb);

  expect(breadcrumb.flushed).toBeTruthy();
  // link.attachToEvent(breadcrumb);

  Sentry.captureException(new Error('We need to throw something'));

  const [report] = testkit.reports();
  expect(report.breadcrumbs).toHaveLength(1);
});

it('warns when the same breadcrumb is added twice', () => {
  const mockedWarn = jest.fn();
  console.warn = mockedWarn;

  const link = new SentryLink(enableAll);
  const breadcrumb = new OperationsBreadcrumb();
  const operation = new Operation(OperationStub);

  link.fillBreadcrumb(breadcrumb, operation);
  link.attachToEvent(breadcrumb);
  link.attachToEvent(breadcrumb);

  expect(mockedWarn).toBeCalledTimes(1);
});
