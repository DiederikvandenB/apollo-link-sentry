import { ApolloLink, Observable, ServerError } from '@apollo/client/core';
import type { SeverityLevel } from '@sentry/core';

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
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction,
  ): Observable<ApolloLink.Result> {
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
    return new Observable<ApolloLink.Result>((originalObserver) => {
      const subscription = forward(operation).subscribe({
        next: (result: ApolloLink.Result) => {
          breadcrumb.level = severityForResult(result);

          if (attachBreadcrumbs.includeFetchResult) {
            breadcrumb.data.fetchResult = result;
          }

          if (
            attachBreadcrumbs.includeError &&
            result.errors &&
            result.errors.length > 0
          ) {
            breadcrumb.data.error = {
              graphQLErrors: result.errors,
              message: result.errors
                .map((e: { message: string }) => e.message)
                .join(', '),
            };
          }

          originalObserver.next(result);
        },
        complete: () => {
          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.complete();
        },
        error: (error: Error) => {
          breadcrumb.level = 'error';

          let scrubbedError;
          if (ServerError.is(error)) {
            const { bodyText, response, ...rest } = error;
            scrubbedError = rest;

            if (attachBreadcrumbs.includeFetchResult) {
              breadcrumb.data.fetchResult = bodyText;
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

function severityForResult(result: ApolloLink.Result): SeverityLevel {
  return result.errors && result.errors.length > 0 ? 'error' : 'info';
}
