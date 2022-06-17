# Apollo Link Sentry

Apollo Link to enrich Sentry events with GraphQL data

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiederikvandenB/apollo-link-sentry/Test)](https://github.com/DiederikvandenB/apollo-link-sentry/actions)
[![Code Coverage](https://img.shields.io/coveralls/github/DiederikvandenB/apollo-link-sentry/master)](https://coveralls.io/github/DiederikvandenB/apollo-link-sentry?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![npm-version](https://img.shields.io/npm/v/apollo-link-sentry)](https://www.npmjs.com/package/apollo-link-sentry)
[![npm-downloads](https://img.shields.io/npm/dt/apollo-link-sentry)](https://www.npmjs.com/package/apollo-link-sentry)

## Installation

```
yarn add apollo-link-sentry
```

**Note**: Due to a release issue, v3.0.0 of this package has been unpublished. Please use v3.0.1
**Note**: starting from v2.0.0 of this package we support `@apollo/client` v3.0.

## Features

Turn this:

<p align="center">
  <img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/before.png" alt="Before" width="auto" />
</p>

Into this:

<p align="center">
  <img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/after.png" alt="After" width="auto" />
</p>

## Basic setup

Initialize Sentry as you would normally. Then, add `apollo-link-sentry` to your Apollo Client's `link` array:

```js
import { SentryLink } from 'apollo-link-sentry';

const client = new ApolloClient({
  link: ApolloLink.from([
    new SentryLink(/* See options */),
    new HttpLink({ uri: 'http://localhost:4000' }),
  ]),
  cache: new InMemoryCache(),
});
```

## Options

```typescript
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
   * Very useful in combination with options like `includeVariables` and `includeContext`.
   *
   * Defaults to undefined.
   */
  transform:
    | undefined
    | ((breadcrumb: GraphQLBreadcrumb, operation: Operation) => Breadcrumb);
};
```

### Compatibility with other Apollo Links

`apollo-link-sentry` aims to be friendly with other `apollo-link` packages,
in the sense that we would like for you to be able to attach as much data as you want.
For example, if you would like to add the HTTP headers you set with `apollo-link-context`,
you can do that by setting `includeContextKeys: ['headers']`.

In case you find that there's a piece of data you're missing, feel free to open an issue.

### Be careful what you include

Please note that Sentry sets some limits to how big events can be.
For instance, **events greater than 200KiB are immediately dropped (pre decompression)**.
More information on that [here](https://docs.sentry.io/accounts/quotas/#attributes-limits).
Be especially careful with the `includeCache` option, as caches can become quite large.

Furthermore, much of the data you are sending to Sentry can include (sensitive) personal information.
This might lead you to violating the terms of the GDPR.
Use Sentry's `beforeBreadcrumb` function to filter out all sensitive data.

## Exclude redundant `fetch` breadcrumbs

By default, Sentry attaches all fetch events as breadcrumbs.
Since this package tracks GraphQL requests as breadcrumbs,
they would show up duplicated in Sentry.

You can use either one of the following options to exclude
redundant `fetch` breadcrumbs:

1. Disable the default integration for fetch requests entirely.
   Note that this is only recommended if you **only** use GraphQL requests in your application.
   The default integration can be disabled like this:

   ```js
   Sentry.init({
     ...,
     defaultIntegrations: [
       new Sentry.BrowserTracing({ traceFetch: false }),
     ],
   });
   ```

2. Use the `beforeBreadcrumb` option of Sentry to filter out the duplicates.
   The helpers in this package recognize every breadcrumb of category `fetch`
   where the URL contains `/graphql` as a GraphQL request.

   ```js
   import { excludeGraphQLFetch } from 'apollo-link-sentry';

   Sentry.init({
     ...,
     beforeBreadcrumb: excludeGraphQLFetch,
   })
   ```

   If you have a custom wrapper, use the higher order function:

   ```js
   import { withoutGraphQLFetch } from 'apollo-link-sentry';

   Sentry.init({
     ...,
     beforeBreadcrumb: withoutGraphQLFetch((breadcrumb, hint) => { ... }),
   })
   ```

## FAQ

### I don't see any events appearing in my Sentry stream

This package only adds breadcrumbs, you are still responsible for reporting errors to Sentry.
You can do this by calling `Sentry.captureException()`:

```jsx
<Mutation mutation={MUTATION_THAT_MIGHT_FAIL}>
  {(mutate, { data, error, loading }) => {
    if (loading) return <div>loading</div>;
    if (error) return <div>{error.toString()}</div>;

    const onClick = () =>
      mutate().catch((error) => {
        Sentry.captureException(error);
      });

    return (
      <div>
        <button type="button" onClick={() => onClick()}>
          Mutate
        </button>
        {JSON.stringify(data)}
      </div>
    );
  }}
</Mutation>
```
