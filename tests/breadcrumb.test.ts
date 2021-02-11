import { parse } from 'graphql';

import { makeBreadcrumb } from '../src/breadcrumb';
import { withDefaults } from '../src/options';

import { makeOperation } from './operation.test';

describe('makeBreadcrumb', () => {
  it('should fill with all options disabled', () => {
    const document = parse(`query Foo { foo }`);

    const breadcrumb = makeBreadcrumb(
      {
        operationName: 'Foo',
        query: document,
        variables: {},
        extensions: {},
        setContext: () => ({}),
        getContext: () => ({
          cache: {
            data: {
              data: {},
            },
          },
          foo: {
            bar: {},
          },
        }),
      },
      withDefaults({
        attachBreadcrumbs: {
          includeQuery: false,
          includeVariables: false,
          includeError: false,
          includeFetchResult: false,
          includeCache: false,
          includeContext: false,
          transform: undefined,
        },
      }),
    );

    expect(breadcrumb.category).toBe('graphql.query');
    expect(breadcrumb.data.operationName).toBe('Foo');
    expect(breadcrumb.data).not.toHaveProperty('url');
    expect(breadcrumb.data).not.toHaveProperty('query');
    expect(breadcrumb.data).not.toHaveProperty('cache');
    expect(breadcrumb.data).not.toHaveProperty('context');
    expect(breadcrumb.data).not.toHaveProperty('variables');
    expect(breadcrumb.data).not.toHaveProperty('error');
    expect(breadcrumb.data).not.toHaveProperty('result');
  });

  it('should fill with all options enabled', () => {
    const query = `query Foo { foo }`;
    const document = parse(query);
    const operationName = 'Foo';
    const variables = {};
    const cache = {};
    const foobar = {};

    const uri = 'http://foo.bar';
    const breadcrumb = makeBreadcrumb(
      {
        operationName: operationName,
        query: document,
        variables: variables,
        extensions: {},
        setContext: () => ({}),
        getContext: () => ({
          cache: {
            data: {
              data: cache,
            },
          },
          foo: {
            bar: foobar,
          },
        }),
      },
      withDefaults({
        uri,
        attachBreadcrumbs: {
          includeQuery: true,
          includeVariables: true,
          includeError: true,
          includeFetchResult: true,
          includeCache: true,
          includeContext: ['foo.bar'],
          transform: (breadcrumb) => breadcrumb,
        },
      }),
    );

    expect(breadcrumb.category).toBe('graphql.query');
    expect(breadcrumb.data.url).toBe(uri);
    expect(breadcrumb.data.query).toBe(query);
    expect(breadcrumb.data.operationName).toBe(operationName);
    expect(breadcrumb.data.variables).toBe(variables);
    expect(breadcrumb.data.cache).toBe(cache);
    expect(breadcrumb.data.context).toEqual({ 'foo.bar': foobar });
    expect(breadcrumb.data).not.toHaveProperty('error');
    expect(breadcrumb.data).not.toHaveProperty('result');
  });

  it('falls back to printing the AST if location is not included', () => {
    const source = `query Foo { foo }`;
    const documentWithoutLocation = parse(source, { noLocation: true });

    const breadcrumb = makeBreadcrumb(
      makeOperation({
        query: documentWithoutLocation,
      }),
      withDefaults({
        attachBreadcrumbs: {
          includeQuery: true,
        },
      }),
    );

    expect(breadcrumb.data.query).not.toBe(source);
    expect(breadcrumb.data.query).toContain('Foo');
  });

  it('omits cache if not found', () => {
    const breadcrumb = makeBreadcrumb(
      makeOperation({
        getContext: () => ({}),
      }),
      withDefaults({
        attachBreadcrumbs: {
          includeCache: true,
        },
      }),
    );

    expect(breadcrumb.data.cache).toBeUndefined();
  });
});
