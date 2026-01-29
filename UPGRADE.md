# Upgrade guide

This document provides guidance for upgrading between major versions of `apollo-link-sentry`.

## v4 to v5

### Apollo Client v4 Support

v5.0.0 supports Apollo Client v4. If you are using Apollo Client v3, please continue using `apollo-link-sentry@4.x`.

### Breaking Changes

1. Apollo Client v4 is now required. Please upgrade your `@apollo/client` dependency to v4.

2. Apollo Client v4 now uses `rxjs` instead of zen-observable. Add `rxjs` to your dependencies:

```bash
npm install rxjs
# or
yarn add rxjs
```

3. `ApolloError` is replaced with plain object for GraphQL errors.

   When `includeError` is enabled and GraphQL errors are present in the response, the `breadcrumb.data.error` now contains a plain object instead of an `ApolloError` instance:

```typescript
// Before (v4)
breadcrumb.data.error = new ApolloError({ graphQLErrors: result.errors });

// After (v5)
breadcrumb.data.error = {
  graphQLErrors: result.errors,
  message: result.errors.map((e) => e.message).join(', '),
};
```

If you are using the `transform` option to process errors, you may need to update your code.

## v2 to v3

### Adapt your configuration

The configuration of `SentryLink` has changed.

```diff
import { SentryLink } from 'apollo-link-sentry';

new SentryLink({
- filter: (operation) => ...,
+ shouldHandleOperation: (operation) => ...,
+ uri: 'https://example.com/graphql',
  setTransaction: true,
  setFingerprint: true,

- breadcrumb: {
-   enable: true,
+ attachBreadcrumbs: {
    includeQuery: false,
    includeVariables: false,
-   includeFetchResult: false,
+   includeFetchResult: false,
    includeError: false,
    includeCache: false,
-   includeContext: ['example'],
+   includeContext: ['example'],
+   transform: (breadcrumb, operation) => ...,
  },
- beforeBreadcrumb: (breadcrumb) => ...,
})
```
