# Apollo Link Sentry

[![Coverage Status](https://coveralls.io/repos/github/DiederikvandenB/apollo-link-sentry/badge.svg?branch=master)](https://coveralls.io/github/DiederikvandenB/apollo-link-sentry?branch=master)
![Test](https://github.com/DiederikvandenB/apollo-link-sentry/workflows/Test/badge.svg)

## Features
Apollo Link middleware to enrich SentryJS events with GraphQL data.

Turn this:

<p align="center"><img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/before.png" alt="Before" width="auto" align="center" /></p>

Into this:

<p align="center"><img src="https://raw.githubusercontent.com/DiederikvandenB/apollo-link-sentry/master/screenshots/after.png" alt="After" width="auto" /></p>

## Installation
Add `apollo-link-sentry` to your dependencies:

```
yarn add apollo-link-sentry
```

Initialize Sentry as you would normally. Then, add `apollo-link-sentry` to your Apollo Client's `link` array:
```js
import { SentryLink } from 'apollo-link-sentry';

const client = new ApolloClient({
  link: ApolloLink.from([
    new SentryLink({
      setTransaction: true,
      setFingerprint: true,

      breadcrumb: {
        enable: true,
        includeQuery: true,
        includeError: true,
        includeCache: false,
        includeVariables: false,
        includeResponse: false,
      },
                   
      exception: {
        report: true
      },
    }),
    new HttpLink({ uri: 'http://localhost:4000' }),
  ]),
  cache: new InMemoryCache(),
});
```

## Options
- `setTransaction`
  - default: `true`
  - Set the Sentry `transaction` to the `operationName` of the query / mutation
- `setFingerprint`
  - default: `true`
  - Narrow the Sentry event `fingerprint` by adding the transaction name
- `breadcrumb.enable`
  - default: `true`
  - Toggle to add query / mutations as breadcrumbs
- `breadcrumb.includeQuery`
  - default: `true`
  - Toggle to add the query / mutation string to the breadcrumb
- `breadcrumb.includeError`
  - default: `true`
  - Toggle to add the error to the breadcrumb, if one is received
- `breadcrumb.includeCache`
  - default: `false`
  - Toggle to add the Apollo cache to the breadcrumb. As the cache can get quite large, it is not recommended to enable this for production environments. It can be useful for debugging purposes
- `breadcrumb.includeVariables`
  - default: `false`
  - Toggle to add the operation's variables to the breadcrumb. This is disabled by default because it could lead to sensitive information being sent to Sentry (think of email addresses, passwords and other sensitive user information). Use with caution.
- `breadcrumb.includeResponse`
  - default: `true`
  - Toggle to add query / mutations response to the breadcrumb. This is specifically useful when dealing with a third-party API of which you can not access the logs
- `exception.report`
  - default: `true`
  - **Not yet implemented**

## Compatibility with other Apollo Links
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

## Roadmap
- Finish the following options:
  - `breadcrumb.enable`
    - Also add option to exclude successful operations
- Add the possibility to exclude:
  - Operations
  - URLs?
- Add error observer
- Add breadcrumb filter to remove duplicate fetch requests
- Add operation's filter
- Maybe add a callback for `setFingerprint`?

## Caveats
- This package has not been tested for subscriptions
- We also need to test for different links, i.e. `apollo-link-rest`
