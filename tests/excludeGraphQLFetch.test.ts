import { excludeGraphQLFetch, withoutGraphQLFetch } from '../src';

describe('excludeGraphQLFetch', () => {
  it('should remove fetch operations on GraphQL endpoints', () => {
    expect(
      excludeGraphQLFetch({
        category: 'fetch',
        data: { url: 'https://example.com/graphql' },
      }),
    ).toBeNull();
  });

  it('should default to not assuming GraphQL when missing the URL', () => {
    const breadcrumb = {
      category: 'fetch',
      data: {},
    };

    expect(excludeGraphQLFetch(breadcrumb)).toBe(breadcrumb);
  });

  it('should leave non-GraphQL fetches', () => {
    const breadcrumb = {
      category: 'fetch',
      data: { url: 'https://example.com' },
    };
    expect(excludeGraphQLFetch(breadcrumb)).toBe(breadcrumb);
  });

  it('should leave non-fetch breadcrumbs', () => {
    const breadcrumb = { category: 'not-fetch' };
    expect(excludeGraphQLFetch(breadcrumb)).toBe(breadcrumb);
  });
});

describe('withoutGraphQLFetch', () => {
  it('should wrap custom callback and short circuit when filtering out fetches', () => {
    const callback = jest.fn();

    const wrapped = withoutGraphQLFetch(callback);

    expect(
      wrapped({
        category: 'fetch',
        data: { url: 'https://example.com/graphql' },
      }),
    ).toBeNull();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should pass non-fetches and the hint along to callback', () => {
    const initial = { category: 'not-fetch' };
    const hint = { foo: 'bar' };

    const callback = jest.fn();
    const altered = { category: 'altered' };
    callback.mockReturnValue(altered);

    const wrapped = withoutGraphQLFetch(callback);

    expect(wrapped(initial, hint)).toBe(altered);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(initial, hint);
  });
});
