import {
  ApolloLink,
  CombinedGraphQLErrors,
  ServerError,
} from '@apollo/client/core';
import type { SeverityLevel } from '@sentry/core';
import { Observable } from 'rxjs';

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

    // While this could be done more simplistically by simply subscribing,
    // wrapping the observer in our own observer ensures we get the results
    // before they are passed along to other observers. This guarantees we
    // get to run our instrumentation before others observers potentially
    // throw and thus flush the results to Sentry.
    return new Observable<ApolloLink.Result>((originalObserver) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          const breadcrumb = makeBreadcrumb(operation, options);
          breadcrumb.level = severityForResult(result);

          if (attachBreadcrumbs.includeFetchResult) {
            breadcrumb.data.fetchResult = result;
          }

          if (
            attachBreadcrumbs.includeError &&
            result.errors &&
            result.errors.length > 0
          ) {
            breadcrumb.data.error = new CombinedGraphQLErrors(result);
          }

          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.next(result);
        },
        complete: () => {
          originalObserver.complete();
        },
        error: (error) => {
          const breadcrumb = makeBreadcrumb(operation, options);
          breadcrumb.level = 'error';

          if (ServerError.is(error)) {
            const { bodyText } = error;
            if (attachBreadcrumbs.includeFetchResult) {
              breadcrumb.data.fetchResult = bodyText;
            }
          }

          if (attachBreadcrumbs.includeError) {
            breadcrumb.data.error = error;
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
