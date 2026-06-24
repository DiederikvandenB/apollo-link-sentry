import {
  ApolloLink,
  CombinedGraphQLErrors,
  ServerError,
} from '@apollo/client/core';
import type { Span, SeverityLevel } from '@sentry/core';
import { startSpanManual } from '@sentry/core';
import { Observable } from 'rxjs';

import { makeBreadcrumb } from './breadcrumb';
import { extractDefinition } from './operation';
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
      if (options.tracing) {
        return this.withSpan(operation, forward);
      }

      return forward(operation);
    }

    const breadcrumb = makeBreadcrumb(operation, options);

    // While this could be done more simplistically by simply subscribing,
    // wrapping the observer in our own observer ensures we get the results
    // before they are passed along to other observers. This guarantees we
    // get to run our instrumentation before others observers potentially
    // throw and thus flush the results to Sentry.
    return new Observable<ApolloLink.Result>((originalObserver) => {
      let span: Span | undefined;

      if (options.tracing) {
        startSpanManual(spanOptionsForOperation(operation), (s) => {
          span = s;
        });
      }

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
            breadcrumb.data.error = new CombinedGraphQLErrors(result);
          }

          originalObserver.next(result);
        },
        complete: () => {
          span?.end();
          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.complete();
        },
        error: (error) => {
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

          span?.end();
          attachBreadcrumbToSentry(operation, breadcrumb, options);

          originalObserver.error(error);
        },
      });

      return () => {
        span?.end();
        subscription.unsubscribe();
      };
    });
  }

  private withSpan(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction,
  ): Observable<ApolloLink.Result> {
    return new Observable<ApolloLink.Result>((observer) => {
      let span: Span | undefined;

      startSpanManual(spanOptionsForOperation(operation), (s) => {
        span = s;
      });

      const subscription = forward(operation).subscribe({
        next: (result) => observer.next(result),
        complete: () => {
          span?.end();
          observer.complete();
        },
        error: (error) => {
          span?.end();
          observer.error(error);
        },
      });

      return () => {
        span?.end();
        subscription.unsubscribe();
      };
    });
  }
}

function spanOptionsForOperation(operation: ApolloLink.Operation) {
  const definition = extractDefinition(operation);
  const type = definition.operation;
  const name = definition.name?.value ?? 'anonymous';

  return {
    name: `graphql.${type} ${name}`,
    op: 'graphql',
    attributes: {
      'graphql.operation.type': type,
      'graphql.operation.name': name,
    },
  };
}

function severityForResult(result: ApolloLink.Result): SeverityLevel {
  return result.errors && result.errors.length > 0 ? 'error' : 'info';
}
