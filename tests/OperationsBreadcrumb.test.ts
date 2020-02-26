import { Severity } from '@sentry/types';

import { OperationBreadcrumb } from '../src/OperationBreadcrumb';
import { stringifyObject } from '../src/utils';

jest.mock('../src/Operation');

describe('OperationBreadcrumb', () => {
  it('should set defaults when creating a new breadcrumb', () => {
    const { category, level } = new OperationBreadcrumb()['breadcrumb'];

    expect(level).toBe(Severity.Log); // The default log level
    expect(category).toBe('gql'); // The default category
  });

  it('should be possible to set the level', () => {
    const breadcrumb = new OperationBreadcrumb();
    const { level } = breadcrumb.setLevel(Severity.Error)['breadcrumb'];

    expect(level).toBe(Severity.Error);
  });

  it('should be possible to set the category', () => {
    const breadcrumb = new OperationBreadcrumb();
    const { category } = breadcrumb.setCategory('query')['breadcrumb'];

    expect(category).toBe('gql query'); // The category is prefixed with 'gql'
  });

  it('should be possible to set the type', () => {
    const breadcrumb = new OperationBreadcrumb();
    const { type } = breadcrumb.setType('error')['breadcrumb'];

    expect(type).toBe('error');
  });

  it('should be possible to set the message', () => {
    const breadcrumb = new OperationBreadcrumb();
    const { message } = breadcrumb.setMessage('TestQuery')['breadcrumb'];

    expect(message).toBe('TestQuery');
  });

  it('should be possible to set the cache', () => {
    const cache = {
      data: {
        '"ROOT_QUERY"': {
          'hello({})': 'Hello World!',
        },
      },
    };

    const breadcrumb = new OperationBreadcrumb();
    const { data } = breadcrumb.setCache(cache)['breadcrumb'];

    expect(data?.cache).toBe(stringifyObject(cache));
  });

  it('should be possible to set the variables', () => {
    const variables = { name: 'TestName' };

    const breadcrumb = new OperationBreadcrumb();
    const { data } = breadcrumb.setVariables(variables)['breadcrumb'];

    expect(data?.variables).toBe(stringifyObject(variables));
  });

  it('should be possible to set the context', () => {
    const context = { headers: { 'X-Debug': true } };

    const breadcrumb = new OperationBreadcrumb();
    const { data } = breadcrumb.setContext(context)['breadcrumb'];

    expect(data?.context).toBe(stringifyObject(context));
  });

  it('should be possible to add a response', () => {
    const response = { status: 200, data: { success: true } };

    const breadcrumb = new OperationBreadcrumb();
    const { data } = breadcrumb.setResponse(response)['breadcrumb'];

    expect(data?.response).toBe(stringifyObject(response));
  });

  it('should be possible to add an error', () => {
    const error = { status: 401, data: { error: 'Unauthorized' } };

    const breadcrumb = new OperationBreadcrumb();
    const { data } = breadcrumb.setError(error)['breadcrumb'];

    expect(data?.error).toBe(stringifyObject(error));
  });

  it('should be possible to flush', () => {
    const breadcrumb = new OperationBreadcrumb();
    breadcrumb.flush();

    expect(breadcrumb.flushed).toBeTruthy();
  });
});
