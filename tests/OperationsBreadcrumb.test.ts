import { Severity } from '@sentry/types';

import { OperationsBreadcrumb } from '../src/OperationsBreadcrumb';
import { stringifyObject } from '../src/utils';

jest.mock('../src/Operation');

it('is possible to create a new breadcrumb', () => {
  const { category, level } = new OperationsBreadcrumb()['breadcrumb'];

  expect(level).toBe(Severity.Log); // The default log level
  expect(category).toBe('gql'); // The default category
});

it('is possible to change the breadcrumb level', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { level } = breadcrumb.setLevel(Severity.Error)['breadcrumb'];

  expect(level).toBe(Severity.Error);
});

it('is possible to change the breadcrumb category', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { category } = breadcrumb.setCategory('query')['breadcrumb'];

  expect(category).toBe('gql query'); // The category is prefixed with 'gql'
});

it('is possible to change the breadcrumb type', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { type } = breadcrumb.setType('error')['breadcrumb'];

  expect(type).toBe('error');
});

it('is possible to change the breadcrumb message', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { message } = breadcrumb.setMessage('TestQuery')['breadcrumb'];

  expect(message).toBe('TestQuery');
});

it('is possible to add the cache to the breadcrumb', () => {
  const cache = {
    data: {
      '"ROOT_QUERY"': {
        'hello({})': 'Hello World!',
      },
    },
  };

  const breadcrumb = new OperationsBreadcrumb();
  const { data } = breadcrumb.addCache(cache)['breadcrumb'];

  expect(data?.cache).toBe(stringifyObject(cache));
});

it('is possible to add the variables to the breadcrumb', () => {
  const variables = { name: 'TestName' };

  const breadcrumb = new OperationsBreadcrumb();
  const { data } = breadcrumb.addVariables(variables)['breadcrumb'];

  expect(data?.variables).toBe(stringifyObject(variables));
});

it('is possible to add a response to the breadcrumb', () => {
  const response = { status: 200, data: { success: true } };

  const breadcrumb = new OperationsBreadcrumb();
  const { data } = breadcrumb.addResponse(response)['breadcrumb'];

  expect(data?.response).toBe(stringifyObject(response));
});

it('is possible to add an error to the breadcrumb', () => {
  const error = { status: 401, data: { error: 'Unauthorized' } };

  const breadcrumb = new OperationsBreadcrumb();
  const { data } = breadcrumb.addError(error)['breadcrumb'];

  expect(data?.error).toBe(stringifyObject(error));
});

it('is possible to flush the breadcrumb', () => {
  const breadcrumb = new OperationsBreadcrumb();
  breadcrumb.flush();

  expect(breadcrumb.flushed).toBeTruthy();
});
