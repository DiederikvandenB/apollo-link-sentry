import { FetchResult } from 'apollo-link/lib/types';
import {
  ApolloLink, NextLink, Observable, Operation,
} from 'apollo-link';
import deepMerge from 'deepmerge';
import { Severity } from '@sentry/types';

import { OperationsObserver } from './OperationsObserver';
import { OperationsBreadcrumb } from './OperationsBreadcrumb';
import { ApolloLinkSentry } from './types';
import { stringifyObject } from './utils';

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

  constructor(options: ApolloLinkSentry.Options = {}) {
    super();
    this.options = deepMerge(defaultOptions, options);
  }

  request = (op: Operation, forward: NextLink): Observable<FetchResult> | null => {
    // Obtain necessary data from the operation
    const operation = new OperationsObserver(op, this.options);

    // Create a new breadcrumb for this specific operation
    const breadcrumb = new OperationsBreadcrumb();
    breadcrumb.fillFromOperation(operation);

    // Start observing the operation for results
    return new Observable<FetchResult>((observer) => {
      const subscription = forward(op).subscribe({
        // This is where the operation's response is received, which is then added to the breadcrumb
        next: (result: FetchResult) => {
          breadcrumb.data({ response: stringifyObject(result.data) });
          observer.next(result);
        },

        // Successful operations end up here, after which we send the breadcrumb to Sentry
        complete: () => {
          breadcrumb.addToEvent();
          observer.complete.bind(observer);
        },

        // If an operation fails, we can catch the error here
        error: (error) => {
          breadcrumb
            .level(Severity.Error)
            .type('error')
            .data({ error: stringifyObject(error) })
            .addToEvent();

          observer.error(error);
        },
      });

      // Close the subscription
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    });
  };
}
