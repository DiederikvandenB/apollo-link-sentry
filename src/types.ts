import { Breadcrumb as SentryBreadcrumb } from '@sentry/types';

export namespace ApolloLinkSentry {
  export namespace Operation {
    export type Type = 'query' | 'mutation' | 'subscription' | undefined;
  }

  export namespace Breadcrumb {
    export type Category = 'query' | 'mutation' | 'subscription' | 'response' | 'error';

    export interface Data extends SentryBreadcrumb {
      data?: {
        query?: string,
        variables?: string,
        cache?: string,
        response?: string,
        error?: string,
      }
    }
  }

  export interface BreadcrumbOptions {
    enable?: boolean;
    includeQuery?: boolean;
    includeCache?: boolean;
    includeVariables?: boolean;
    includeResponse?: boolean;
    includeError?: boolean;
  }

  export interface Options {
    setTransaction?: boolean;
    setFingerprint?: boolean;

    breadcrumb?: BreadcrumbOptions;
  }
}
