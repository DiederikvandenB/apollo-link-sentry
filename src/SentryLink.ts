import {
  ApolloError,
  ApolloLink,
  FetchResult,
  NextLink,
  Operation,
  ServerError,
} from '@apollo/client/core';
import type { SeverityLevel } from '@sentry/core';
import { Observable } from 'zen-observable-ts';

import { makeBreadcrumb } from './breadcrumb';
import { FullOptions, SentryLinkOptions, withDefaults } from './options';
import {
  attachBreadcrumbToSentry,
  setFingerprint,
  setTransaction,
} from './sentry';

export class SentryLink extends ApolloLink {
  private readonly options: FullOptions;

  constructor(options: SentryLinkOptions = {}) {
    super();
    this.options = withDefaults(options);
  }

  request(
    operation: Operation,
    forward: NextLink,
  ): Observable<FetchResult> | null {
    const { options } = this;

    if (!(options.shouldHandleOperation?.(operation) ?? true)) {
      return forward(operation);
    }

    if (options.setTransaction) {
      setTransaction(operation);
    }

    if (options.setFingerprint) {
      setFingerprint(operation);
    }

    const { attachBreadcrumbs } = options;
    if (!attachBreadcrumbs) {
      return forward(operation);
    }

    const breadcrumb = makeBreadcrumb(operation, options);

    // While this could be done more simplistically by simply subscribing,
    // wrapping the observer in our own observer ensures we get the results
    // before they are passed along to other observers. This guarantees we
    // get to run our instrumentation before others observers potentially
    // throw and thus flush the results to Sentry.
    return new Observable<FetchResult>((originalObserver) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          breadcrumb.level = severityForResult(result);

          if (attachBreadcrumbs.includeFetchResult) {
            breadcrumb.data.fetchResult = result;
          }

          if (
            attachBreadcrumbs.includeError &&
            result.errors &&
            result.errors.length > 0
          ) {
            breadcrumb.data.error = new ApolloError({
              graphQLErrors: result.errors,
            });
          }

          originalObserver.next(result);
        },
        complete: () => {
          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.complete();
        },
        error: (error) => {
          breadcrumb.level = 'error';

          let scrubbedError;
          if (isServerError(error)) {
            const { result, response, ...rest } = error;
            scrubbedError = rest;

            if (attachBreadcrumbs.includeFetchResult) {
              breadcrumb.data.fetchResult = result;
            }
          } else {
            scrubbedError = error;
          }

          if (attachBreadcrumbs.includeError) {
            breadcrumb.data.error = scrubbedError;
          }

          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.error(error);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }
}

function isServerError(error: unknown): error is ServerError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'result' in error &&
    'statusCode' in error
  );
}

function severityForResult(result: FetchResult): SeverityLevel {
  return result.errors && result.errors.length > 0 ? 'error' : 'info';
}
