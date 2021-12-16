import {
  ApolloError,
  ApolloLink,
  FetchResult,
  NextLink,
  Operation,
  ServerError,
} from '@apollo/client/core';
import { Severity } from '@sentry/types';
import Observable from 'zen-observable';

import { GraphQLBreadcrumb, makeBreadcrumb } from './breadcrumb';
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
    if (typeof this.options.shouldHandleOperation === 'function') {
      if (!this.options.shouldHandleOperation(operation)) {
        return forward(operation);
      }
    }

    if (this.options.setTransaction) {
      setTransaction(operation);
    }

    if (this.options.setFingerprint) {
      setFingerprint(operation);
    }

    const breadcrumb = this.options.attachBreadcrumbs
      ? makeBreadcrumb(operation, this.options)
      : undefined;

    // While this could be done more simplistically by simply subscribing,
    // wrapping the observer in our own observer ensures we get the results
    // before they are passed along to other observers. This guarantees we
    // get to run our instrumentation before others observers potentially
    // throw and thus flush the results to Sentry.
    return new Observable<FetchResult>((originalObserver) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          if (this.options.attachBreadcrumbs) {
            // We must have a breadcrumb if attachBreadcrumbs was set
            (breadcrumb as GraphQLBreadcrumb).level = severityForResult(result);

            if (this.options.attachBreadcrumbs.includeFetchResult) {
              // We must have a breadcrumb if attachBreadcrumbs was set
              (breadcrumb as GraphQLBreadcrumb).data.fetchResult = result;
            }

            if (
              this.options.attachBreadcrumbs.includeError &&
              result.errors &&
              result.errors.length > 1
            ) {
              // We must have a breadcrumb if attachBreadcrumbs was set
              (breadcrumb as GraphQLBreadcrumb).data.error = new ApolloError({
                graphQLErrors: result.errors,
              });
            }
          }

          originalObserver.next(result);
        },
        complete: () => {
          if (this.options.attachBreadcrumbs) {
            attachBreadcrumbToSentry(
              operation,
              // We must have a breadcrumb if attachBreadcrumbs was set
              breadcrumb as GraphQLBreadcrumb,
              this.options,
            );
          }

          originalObserver.complete();
        },
        error: (error) => {
          if (this.options.attachBreadcrumbs) {
            // We must have a breadcrumb if attachBreadcrumbs was set
            (breadcrumb as GraphQLBreadcrumb).level = Severity.Error;

            let scrubbedError;
            if (isServerError(error)) {
              const { result, response, ...rest } = error;
              scrubbedError = rest;

              if (this.options.attachBreadcrumbs.includeFetchResult) {
                // We must have a breadcrumb if attachBreadcrumbs was set
                (breadcrumb as GraphQLBreadcrumb).data.fetchResult = result;
              }
            } else {
              scrubbedError = error;
            }

            if (this.options.attachBreadcrumbs.includeError) {
              // We must have a breadcrumb if attachBreadcrumbs was set
              (breadcrumb as GraphQLBreadcrumb).data.error = scrubbedError;
            }

            attachBreadcrumbToSentry(
              operation,
              // We must have a breadcrumb if attachBreadcrumbs was set
              breadcrumb as GraphQLBreadcrumb,
              this.options,
            );
          }

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

function severityForResult(result: FetchResult): Severity {
  return result.errors && result.errors.length > 0
    ? Severity.Error
    : Severity.Info;
}
