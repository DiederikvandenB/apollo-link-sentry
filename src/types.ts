import { Breadcrumb as SentryBreadcrumb } from '@sentry/types';

export namespace ApolloLinkSentry {
  export namespace Operation {
    export type Type = 'query' | 'mutation' | 'subscription' | undefined;

    export interface Data {
      query?: string;
      variables?: string;
      cache?: object;
      response?: string;
      error?: string;
    }
  }

  export namespace Breadcrumb {
    export type Category = 'query' | 'mutation' | 'subscription' | 'response' | 'error';

    export interface Data extends SentryBreadcrumb {
      data?: Operation.Data;
    }
  }

  export interface BreadcrumbOptions {
    enable: boolean;
    includeQuery: boolean;
    includeVariables: boolean;
    includeError: boolean;
    includeResponse: boolean;
    includeCache: boolean;
    // includeHeaders: boolean; (TODO: implement includeHeaders)
  }

  export interface ExceptionOptions {
    report: boolean;
  }

  export interface Options {
    setTransaction?: boolean;
    setFingerprint?: boolean;

    breadcrumb?: BreadcrumbOptions;
    exception?: ExceptionOptions;
  }
}
