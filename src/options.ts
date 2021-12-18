import { Operation } from '@apollo/client/core';
import { Breadcrumb } from '@sentry/types';
import deepMerge from 'deepmerge';

import { GraphQLBreadcrumb } from './breadcrumb';

export type NonEmptyArray<T> = [T, ...Array<T>];

export interface FullOptions {
  /**
   * Determines if the given operation should be handled or discarded.
   *
   * If undefined, all operations will be included.
   */
  shouldHandleOperation: undefined | ((operation: Operation) => boolean);

  /**
   * The uri of the GraphQL endpoint.
   *
   * Used to add context information, e.g. to breadcrumbs.
   *
   * Defaults to undefined.
   */
  uri: undefined | string;

  /**
   * Set the Sentry transaction name to the GraphQL operation name.
   *
   * May be overwritten by other parts of your app.
   *
   * Defaults to true.
   */
  setTransaction: true | false;

  /**
   * Narrow Sentry's fingerprint by appending the GraphQL operation name to the {{default}} key.
   *
   * Only the last executed operation will be added, not every operation that's been through the link.
   * May be overwritten by other parts of your app.
   *
   * Defaults to true.
   */
  setFingerprint: true | false;

  /**
   * Attach a breadcrumb for executed GraphQL operations.
   *
   * The following information will be included by default:
   * {
   *   type: 'http',
   *   category: `graphql.${operationType}`,
   *   message: operationName,
   *   level: errors ? 'error' : 'info',
   * }
   */
  attachBreadcrumbs: AttachBreadcrumbsOptions | false;
}

export type AttachBreadcrumbsOptions = {
  /**
   * Include the full query string?
   *
   * Defaults to false.
   */
  includeQuery: false | true;

  /**
   * Include the variable values?
   *
   * Be careful not to leak sensitive information or send too much data.
   *
   * Defaults to false.
   */
  includeVariables: false | true;

  /**
   * Include the fetched result (data, errors, extensions)?
   *
   * Be careful not to leak sensitive information or send too much data.
   *
   * Defaults to false.
   */
  includeFetchResult: false | true;

  /**
   * Include the response error?
   *
   * Be careful not to leak sensitive information or send too much data.
   *
   * Defaults to false.
   */
  includeError: false | true;

  /**
   * Include the contents of the Apollo Client cache?
   *
   * This is mostly useful for debugging purposes and not recommended for production environments,
   * see "Be careful what you include", unless carefully combined with `beforeBreadcrumb`.
   *
   * Defaults to false.
   */
  includeCache: false | true;

  /**
   * Include arbitrary data from the `ApolloContext`?
   *
   * Accepts a list of keys in dot notation, e.g. `foo.bar`. Can be useful to include extra
   * information such as headers.
   *
   * Defaults to false.
   */
  includeContext: false | NonEmptyArray<string>;

  /**
   * Modify the breadcrumb right before it is sent.
   *
   * Can be used to add additional data from the operation or clean up included data.
   * Very useful in combination with options like `includeVariables` and `includeContextKeys`.
   *
   * Defaults to undefined.
   */
  transform:
    | undefined
    | ((breadcrumb: GraphQLBreadcrumb, operation: Operation) => Breadcrumb);
};

export const defaultOptions = {
  shouldHandleOperation: undefined,
  uri: undefined,
  setTransaction: true,
  setFingerprint: true,

  attachBreadcrumbs: {
    includeQuery: false,
    includeVariables: false,
    includeFetchResult: false,
    includeError: false,
    includeCache: false,
    includeContext: false,
    transform: undefined,
  },
} as const;

export function withDefaults(options: SentryLinkOptions): FullOptions {
  return deepMerge(defaultOptions, options);
}

export type SentryLinkOptions = Partial<
  Pick<
    FullOptions,
    'shouldHandleOperation' | 'uri' | 'setTransaction' | 'setFingerprint'
  >
> & {
  attachBreadcrumbs?: Partial<AttachBreadcrumbsOptions> | false;
};
