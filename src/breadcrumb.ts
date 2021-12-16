import { FetchResult, Operation } from '@apollo/client/core';
import { Breadcrumb as SentryBreadcrumb } from '@sentry/types';
import dotProp from 'dot-prop';
import { print } from 'graphql';

import { extractDefinition } from './operation';
import { FullOptions, AttachBreadcrumbsOptions } from './options';

export interface BreadcrumbData {
  url?: string;
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  fetchResult?: FetchResult;
  error?: Error;
  cache?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface GraphQLBreadcrumb extends SentryBreadcrumb {
  data: BreadcrumbData;
}

export function makeBreadcrumb(
  operation: Operation,
  options: FullOptions,
): GraphQLBreadcrumb {
  // We validated this is set before calling this function
  const attachBreadcrumbs =
    options.attachBreadcrumbs as AttachBreadcrumbsOptions;

  const definition = extractDefinition(operation);

  const data: BreadcrumbData = {};

  const uri = options.uri;
  if (uri) {
    data.url = uri;
  }

  const operationName = definition.name?.value;
  if (operationName) {
    data.operationName = operationName;
  }

  if (attachBreadcrumbs.includeQuery) {
    data.query =
      // The document might have been parsed with `noLocation: true`
      definition.loc?.source?.body ?? print(definition);
  }

  if (attachBreadcrumbs.includeVariables) {
    data.variables = operation.variables;
  }

  if (attachBreadcrumbs.includeCache) {
    data.cache =
      (operation.getContext().cache?.data?.data as Record<string, unknown>) ??
      undefined;
  }

  const contextKeys = attachBreadcrumbs.includeContext;
  if (contextKeys) {
    data.context = extractKeys(operation.getContext(), contextKeys);
  }

  return {
    type: 'http',
    category: `graphql.${definition.operation}`,
    data,
  };
}

function extractKeys(
  context: Record<string, unknown>,
  keys: Array<string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  keys.forEach((key) => {
    result[key] = dotProp.get(context, key);
  });

  return result;
}
