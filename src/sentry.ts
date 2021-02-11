import { Operation } from '@apollo/client/core';
import { addBreadcrumb, configureScope } from '@sentry/minimal';
import { Scope } from '@sentry/types';

import { GraphQLBreadcrumb } from './breadcrumb';
import { extractDefinition } from './operation';
import { FullOptions } from './options';

export function setTransaction(operation: Operation): void {
  const definition = extractDefinition(operation);
  const name = definition.name;

  if (name) {
    configureScope((scope: Scope) => {
      scope.setTransactionName(name.value);
    });
  }
}

export const DEFAULT_FINGERPRINT = '{{ default }}';

export function setFingerprint(operation: Operation): void {
  const definition = extractDefinition(operation);
  const name = definition.name;

  if (name) {
    configureScope((scope: Scope) => {
      scope.setFingerprint([DEFAULT_FINGERPRINT, name.value]);
    });
  }
}

export function attachBreadcrumbToSentry(
  operation: Operation,
  breadcrumb: GraphQLBreadcrumb,
  options: FullOptions,
): void {
  if (
    options.attachBreadcrumbs &&
    typeof options.attachBreadcrumbs.transform === 'function'
  ) {
    addBreadcrumb(options.attachBreadcrumbs.transform(breadcrumb, operation));
    return;
  }

  addBreadcrumb(breadcrumb);
}
