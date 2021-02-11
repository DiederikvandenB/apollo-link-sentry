# Upgrade guide

This document provides guidance for upgrading between major versions of `apollo-link-sentry`.

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
