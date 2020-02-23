# Apollo Link Sentry

[![Coverage Status](https://coveralls.io/repos/github/DiederikvandenB/apollo-link-sentry/badge.svg)](https://coveralls.io/github/DiederikvandenB/apollo-link-sentry)
![Test](https://github.com/DiederikvandenB/apollo-link-sentry/workflows/Test/badge.svg)

## Features
Apollo Link middleware to enrich SentryJS events with GraphQL data.

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
        includeCache: false,
        includeError: true,
        includeQuery: true,
        includeVariables: false,
        includeResponse: true,
      },

      exception: {
        report: true,
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
- `breadcrumb.includeCache`
  - default: `true`
  - Toggle to add the Apollo cache to the breadcrumb. As the cache can get quite large, it is not recommended to enable this for production environments. It can be useful for debugging purposes
- `breadcrumb.includeError`
  - default: `true`
  - Toggle to add the error to the breadcrumb, if one is received
- `breadcrumb.includeVariables`
  - default: `false`
  - Toggle to add the operation's variables to the breadcrumb. This is disabled by default because it could lead to sensitive information being sent to Sentry (think of email addresses, passwords and other sensitive user information). Use with caution.
- `breadcrumb.includeQuery`
  - default: `true`
  - Toggle to add the query / mutation string to the breadcrumb
- `breadcrumb.includeResponse`
  - default: `true`
  - Toggle to add query / mutations response to the breadcrumb. This is specifically useful when dealing with a third-party API of which you can not access the logs
- `exception.report`
  - default: `true`
  - **Not yet implemented**

## FAQ
- I don't see any events appearing in my Sentry stream
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
  
## Roadmap
- Finish the following options:
  - `breadcrumb.enable`
- Add the possibility to exclude:
  - Operations
  - URLs?
- Add error observer
- Add breadcrumb filter to remove duplicate XHR requests
- Maybe add a callback for `setFingerprint`?

## Caveats
- This package has not been tested for subscriptions
- We also need to test for different links, i.e. `apollo-link-rest`
