import {
  ApolloLink, NextLink, Observable, Operation as ApolloOperation,
} from 'apollo-link';
import * as Sentry from '@sentry/browser';
import deepMerge from 'deepmerge';
import { FetchResult } from 'apollo-link/lib/types';
import { Scope, Severity } from '@sentry/types';

import { Operation } from './Operation';
import { OperationsBreadcrumb } from './OperationsBreadcrumb';
import { ApolloLinkSentry } from './types';

const defaultOptions: ApolloLinkSentry.Options = {
  setTransaction: true,
  setFingerprint: true,

  breadcrumb: {
    enable: true,
    includeCache: false,
    includeError: true,
    includeQuery: true,
    includeVariables: false,
    includeResponse: true,
  },

  exception: {
    report: true,
  },
};

export class SentryLink extends ApolloLink {
  private readonly options: ApolloLinkSentry.Options;

  /**
   * Create a new ApolloLinkSentry
   * @param options
   */
  constructor(options: ApolloLinkSentry.Options = {}) {
    super();
    this.options = deepMerge(defaultOptions, options);
  }

  /**
   * This is where the GraphQL operation is received
   * A breadcrumb will be created for the operation, and error/response data will be handled
   * @param op
   * @param forward
   */
  request = (op: ApolloOperation, forward: NextLink): Observable<FetchResult> | null => {
    // Obtain necessary data from the operation
    const operation = new Operation(op);

    // Create a new breadcrumb for this specific operation
    const breadcrumb = new OperationsBreadcrumb();
    this.fillBreadcrumb(breadcrumb, operation);

    // Start observing the operation for results
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(op).subscribe({
        next: (result: FetchResult) => this.handleResult(result, breadcrumb, observer),
        complete: () => this.handleComplete(breadcrumb, observer),
        error: (error: any) => this.handleError(breadcrumb, error, observer),
      });

      // Close the subscription
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    });
  };

  /**
   * Fill the breadcrumb with information, respecting the provided options
   * The breadcrumb is not yet attached to Sentry after this method
   * @param breadcrumb
   * @param operation
   */
  fillBreadcrumb = (breadcrumb: OperationsBreadcrumb, operation: Operation): void => {
    breadcrumb
      .setMessage(operation.getName())
      .setCategory(operation.getType());

    // TODO: Maybe move this to a different place? It isn't a breadcrumb
    // TODO: Add test
    if (this.options.setTransaction) {
      this.setTransaction(operation);
    }

    // TODO: Maybe move this to a different place? It isn't a breadcrumb
    // TODO: Add test
    if (this.options.setFingerprint) {
      this.setFingerprint();
    }

    if (this.options.breadcrumb?.includeQuery) {
      breadcrumb.addQuery(operation.getQuery());
    }

    if (this.options.breadcrumb?.includeCache) {
      breadcrumb.addCache(operation.getApolloCache());
    }

    if (this.options.breadcrumb?.includeVariables) {
      breadcrumb.addVariables(operation.getVariables());
    }
  };

  /**
   * Handle the operation's response
   * The breadcrumb is not yet attached to Sentry after this method
   * @param result
   * @param breadcrumb
   * @param observer
   */
  handleResult = (result: FetchResult, breadcrumb: OperationsBreadcrumb, observer: any): void => {
    if (this.options.breadcrumb?.includeResponse) {
      breadcrumb.addResponse(result);
    }

    observer.next(result);
  };

  /**
   * Changes the level and type of the breadcrumb to `error`
   * Furthermore, if the includeError option is truthy, the error data will be attached
   * Then, the error will be attached to Sentry
   * @param breadcrumb
   * @param error
   * @param observer
   */
  handleError = (breadcrumb: OperationsBreadcrumb, error: any, observer: any): void => {
    breadcrumb
      .setLevel(Severity.Error)
      .setType('error');

    if (this.options.breadcrumb?.includeError) {
      breadcrumb.addError(error);
    }

    this.attachToEvent(breadcrumb);

    observer.error(error);
  };

  /**
   * Since no error occurred, it is time to attach the breadcrumb to Sentry
   * @param breadcrumb
   * @param observer
   */
  handleComplete = (breadcrumb: OperationsBreadcrumb, observer: any): void => {
    this.attachToEvent(breadcrumb);
    observer.complete();
  };

  /**
   * Set the Sentry transaction
   * @param operation
   */
  setTransaction = (operation: Operation): void => {
    Sentry.configureScope((scope: Scope) => {
      scope.setTransaction(operation.getName());
    });
  };

  /**
   * Set the Sentry fingerprint
   */
  setFingerprint = (): void => {
    Sentry.configureScope((scope: Scope) => {
      scope.setFingerprint([
        '{{default}}',
        '{{transaction}}',
      ]);
    });
  };

  /**
   * Attach the breadcrumb to the Sentry event
   * @param breadcrumb
   */
  attachToEvent = (breadcrumb: OperationsBreadcrumb): void => {
    if (breadcrumb.flushed) {
      console.warn('[apollo-link-sentry] OperationsBreadcrumb.attachToEvent() was called on an already flushed breadcrumb');
      return;
    }

    Sentry.addBreadcrumb(breadcrumb.flush());
  };
}
