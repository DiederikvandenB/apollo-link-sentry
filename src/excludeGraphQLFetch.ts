import { ClientOptions } from '@sentry/core';

type BeforeBreadcrumbCallback = NonNullable<ClientOptions['beforeBreadcrumb']>;

export const excludeGraphQLFetch: BeforeBreadcrumbCallback = (breadcrumb) => {
  if (breadcrumb.category === 'fetch') {
    const url: string = breadcrumb.data?.url ?? '';

    if (url.includes('/graphql')) {
      return null;
    }
  }

  return breadcrumb;
};

export function withoutGraphQLFetch(
  beforeBreadcrumb: BeforeBreadcrumbCallback,
): BeforeBreadcrumbCallback {
  return (breadcrumb, hint) => {
    const withoutFetch = excludeGraphQLFetch(breadcrumb, hint);
    if (withoutFetch === null) {
      return null;
    }

    return beforeBreadcrumb(withoutFetch, hint);
  };
}
