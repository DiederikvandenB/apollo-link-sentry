import { Scope, Severity } from '@sentry/types';
import deepMerge from 'deepmerge';
import Observable from 'zen-observable';

import { FetchResult } from '@apollo/client/link/core/types';

import {
  ApolloLink, NextLink, Operation as ApolloOperation,
} from '@apollo/client/link/core';

import { addBreadcrumb, configureScope } from '@sentry/minimal';
import { OperationBreadcrumb } from './OperationBreadcrumb';
import { Operation } from './Operation';

export interface Options {
  setTransaction?: boolean;
  setFingerprint?: boolean;

  breadcrumb?: {
    enable?: boolean;
    includeQuery?: boolean;
    includeCache?: boolean;
    includeVariables?: boolean;
    includeResponse?: boolean;
    includeError?: boolean;
    includeContextKeys?: string[];
  }

  filter?: (operation: Operation) => boolean;
  beforeBreadcrumb?: (breadcrumb: OperationBreadcrumb) => OperationBreadcrumb;
}

const defaultOptions: Options = {
  setTransaction: true,
  setFingerprint: true,

  breadcrumb: {
    enable: true,
    includeQuery: false,
    includeCache: false,
    includeVariables: false,
    includeResponse: false,
    includeError: false,
    includeContextKeys: [],
  },
};

export class SentryLink extends ApolloLink {
  private readonly options: Options;

  /**
   * Create a new ApolloLinkSentry
   * @param {Options} options
   */
  constructor(options: Options = {}) {
    super();
    this.options = deepMerge(defaultOptions, options);
  }

  /**
   * This is where the GraphQL operation is received
   * A breadcrumb will be created for the operation, and error/response data will be handled
   * @param {ApolloOperation} op
   * @param {NextLink} forward
   * @returns {Observable<FetchResult> | null}
   */
  request = (op: ApolloOperation, forward: NextLink): Observable<FetchResult> | null => {
    // Obtain necessary data from the operation
    const operation = new Operation(op);

    // Create a new breadcrumb for this specific operation
    const breadcrumb = new OperationBreadcrumb();
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
   * @param {OperationBreadcrumb} breadcrumb
   * @param {Operation} operation
   */
  fillBreadcrumb = (breadcrumb: OperationBreadcrumb, operation: Operation): void => {
    // Apply the filter option
    if (typeof this.options.filter === 'function') {
      const stop = breadcrumb.filter(this.options.filter(operation));
      if (stop) return;
    }

    breadcrumb
      .setMessage(operation.name)
      .setCategory(operation.type);

    // TODO: Maybe move this to a different place? It isn't a breadcrumb
    if (this.options.setTransaction) {
      this.setTransaction(operation);
    }

    // TODO: Maybe move this to a different place? It isn't a breadcrumb
    if (this.options.setFingerprint) {
      this.setFingerprint();
    }

    if (this.options.breadcrumb?.includeQuery) {
      breadcrumb.setQuery(operation.query);
    }

    if (this.options.breadcrumb?.includeCache) {
      breadcrumb.setCache(operation.cache);
    }

    if (this.options.breadcrumb?.includeVariables) {
      breadcrumb.setVariables(operation.variables);
    }

    if (this.options?.breadcrumb?.includeContextKeys?.length) {
      breadcrumb.setContext(operation.getContextKeys(this.options.breadcrumb.includeContextKeys));
    }
  };

  /**
   * Handle the operation's response
   * The breadcrumb is not yet attached to Sentry after this method
   * @param {FetchResult} result
   * @param {OperationBreadcrumb} breadcrumb
   * @param observer
   */
  handleResult = (result: FetchResult, breadcrumb: OperationBreadcrumb, observer: any): void => {
    if (this.options.breadcrumb?.includeResponse) {
      breadcrumb.setResponse(result);
    }

    observer.next(result);
  };

  /**
   * Changes the level and type of the breadcrumb to `error`
   * Furthermore, if the includeError option is truthy, the error data will be attached
   * Then, the error will be attached to Sentry
   * @param {OperationBreadcrumb} breadcrumb
   * @param error
   * @param observer
   */
  handleError = (breadcrumb: OperationBreadcrumb, error: any, observer: any): void => {
    breadcrumb
      .setLevel(Severity.Error)
      .setType('error');

    if (this.options.breadcrumb?.includeError) {
      breadcrumb.setError(error);
    }

    this.attachBreadcrumbToSentry(breadcrumb);

    observer.error(error);
  };

  /**
   * Since no error occurred, it is time to attach the breadcrumb to Sentry
   * @param {OperationBreadcrumb} breadcrumb
   * @param observer
   */
  handleComplete = (breadcrumb: OperationBreadcrumb, observer: any): void => {
    this.attachBreadcrumbToSentry(breadcrumb);
    observer.complete();
  };

  /**
   * Set the Sentry transaction
   * @param {Operation} operation
   */
  setTransaction = (operation: Operation): void => {
    configureScope((scope: Scope) => {
      scope.setTransactionName(operation.name);
    });
  };

  /**
   * Set the Sentry fingerprint
   */
  setFingerprint = (): void => {
    configureScope((scope: Scope) => {
      scope.setFingerprint([
        '{{default}}',
        '{{transaction}}',
      ]);
    });
  };

  /**
   * Attach the breadcrumb to the Sentry event
   * @param {OperationBreadcrumb} breadcrumb
   */
  attachBreadcrumbToSentry = (breadcrumb: OperationBreadcrumb): void => {
    // Apply options
    if (this.options.breadcrumb?.enable === false) return;
    if (breadcrumb.filtered) return;

    if (breadcrumb.flushed) {
      console.warn('[apollo-link-sentry] SentryLink.attachBreadcrumbToSentry() was called on an already flushed breadcrumb');
      return;
    }

    if (typeof this.options.beforeBreadcrumb === 'function') {
      const after = this.options.beforeBreadcrumb(breadcrumb);
      addBreadcrumb(after.flush());
      return;
    }

    addBreadcrumb(breadcrumb.flush());
  };
}
