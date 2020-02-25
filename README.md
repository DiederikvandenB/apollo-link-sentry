# Apollo Link Sentry
Apollo Link middleware to enrich SentryJS events with GraphQL data.

[![npm](https://img.shields.io/npm/v/apollo-link-sentry)](https://www.npmjs.com/package/apollo-link-sentry)
[![David](https://img.shields.io/david/diederikvandenb/apollo-link-sentry)](https://github.com/diederikvandenb/apollo-link-sentry)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiederikvandenB/apollo-link-sentry/Test)](https://github.com/DiederikvandenB/apollo-link-sentry/actions)
[![Coveralls github branch](https://img.shields.io/coveralls/github/DiederikvandenB/apollo-link-sentry/master)](https://coveralls.io/github/DiederikvandenB/apollo-link-sentry?branch=master)
[![npm-downloads](https://img.shields.io/npm/dt/apollo-link-sentry)](https://www.npmjs.com/package/apollo-link-sentry)

## Installation
```
yarn add apollo-link-sentry
```

## Features
Turn this:

<p align="center"><img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/before.png" alt="Before" width="auto" align="center" /></p>

Into this:

<p align="center"><img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/after.png" alt="After" width="auto" /></p>

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
```js
const defaultOptions = {
  /**
   * Set the Sentry `transaction` to the `operationName` of the query / mutation. Note that this
   * only works if the transaction is not overwritten later in your app.
   */
  setTransaction: true,

  /**
   * Narrow Sentry's fingerprint by appending the operation's name to Sentry's {{default}} key.
   * It works in such a way that only the last operation is added, not every operation that's been
   * through the link. Note that if you override this somewhere else in your app, it is possible
   * that the value set by `apollo-link-sentry` is overwritten.
   */
  setFingerprint: true,

  breadcrumb: {
    /**
     * Set to false to disable attaching GraphQL operations as breadcrumbs. If only this breadcrumb
     * option is toggled, the breadcrumb will only show the operation name and it's type.
     */
    enable: true,

    /**
     * Include the query / mutation string in the breadcrumb.
     */
    includeQuery: false,

    /**
     * Include the entire Apollo cache in the breadcrumb. It is not recommended to enable this
     * option in production environment, for several reasons, see "Be careful what you include".
     * This option is specifically useful for debugging purposes, but when applied in combination
     * with `beforeBreadcrumb` can also be used in production.
     */
    includeCache: false,

    /**
     * Include the operation's variables in the breadcrumb. Again, be careful what you include,
     * or apply a filter.
     */
    includeVariables: false,

    /**
     * Include the operation's fetch result in the breadcrumb.
     */
    includeResponse: false,

    /**
     * If an error is received, it can be included in the breadcrumb. Regardless of this option,
     * the breadcrumb's type is set to error to reflect a failed operation in the Sentry UI.
     */
    includeError: false,

    /**
     * Include context keys as extra data in the breadcrumb. Accepts dot notation.
     * The data is stringified and formatted. Can be used to include headers for instance.
     */
    includeContextKeys: [],
  },
};
```

### Compatibility with other Apollo Links
`apollo-link-sentry` aims to be friendly with other `apollo-link` packages, in the sense that we would like for you to be able to attach as much data as you want. For example, if you would like to add the HTTP headers you set with `apollo-link-context`, you can do that by setting `includeContextKeys: ['headers']`.

In case you find that there's a piece of data you're missing, feel free to open an issue.

### Be careful what you include
Please note that Sentry sets some limits to how big events can be. For instance, **events greater than 200KiB are immediately dropped (pre decompression)**. More information on that [here](https://docs.sentry.io/accounts/quotas/#attributes-limits). Be especially careful with the `includeCache` option, as caches can become quite large.

Furthermore, much of the data you are sending to Sentry can include (sensitive) personal information. This might lead you to violating the terms of the GDPR. Use Sentry's `beforeBreadrcrumb` function to filter out all sensitive data.

## FAQ
- **I don't see any events appearing in my Sentry stream**
  - Note that this package (currently) only adds breadcrumbs. This means that you are still responsible for reporting errors to Sentry. You can do this by calling `Sentry.captureException()`. See this example:
  ```jsx
  <Mutation mutation={ERROR_MUTATION}>
    {(mutate, { data, error, loading }) => {
      if (loading) return <div>loading</div>;
      if (error) return <div>{error.toString()}</div>;
  
      const onClick = () => mutate().catch((error) => {
        Sentry.captureException(error);
      });
  
      return <div>
        <button type="button" onClick={() => onClick()}>Mutate</button>
        {JSON.stringify(data)}
      </div>
    }}
  </Mutation>
  ```
- **GraphQL operations are also logged as fetch breadcrumbs**
  - Sentry by default attaches all fetch events as breadcrumbs. This means that there are two ways to ensure GraphQL operations appear but once:
    1. Disable the default integration for fetch requests. Note that this is only recommended if you **only** use GraphQL requests in your application. The default integration can be disabled like this:
    ```js
    Sentry.init({
      dsn: '',
      defaultIntegrations: [
        new Sentry.Integrations.Breadcrumbs({ fetch: false }),
      ],
    });
    ```
    2. Otherwise, it will be possible to use the `beforeBreadcrumb` option of Sentry to filter out the duplicates. This feature is not yet implemented in this package, but it is on the roadmap (see below). 

## Caveats
- This package has not been tested for subscriptions
- We also need to test for different links, i.e. `apollo-link-rest`

## Roadmap / notes
- Add the possibility to exclude:
  - Operations
  - URLs?
- Write best practice scenario:
  - setting `includeError` true
  - catch errors manually
  - throw custom error
  - how to use together with `apollo-link-error`?
    - does it report errors twice if you do sentry capture there and in your catch
- Add breadcrumb filter to remove duplicate fetch requests
