import { Operation } from 'apollo-link';
import * as Sentry from '@sentry/browser';
import { Severity } from '@sentry/types';
import sentryTestkit from 'sentry-testkit';

import { OperationsBreadcrumb } from '../src/OperationsBreadcrumb';
import { OperationsObserver } from '../src/OperationsObserver';
import { ApolloLinkSentry } from '../src';
import { stringifyObject } from '../src/utils';

jest.mock('../src/OperationsObserver');

const { testkit, sentryTransport } = sentryTestkit();

Sentry.init({
  dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
  transport: <any>sentryTransport,
});

it('is possible to create a new breadcrumb', () => {
  const { category, level } = new OperationsBreadcrumb()['breadcrumb'];

  expect(level).toBe(Severity.Log); // The default log level
  expect(category).toBe('gql'); // The default category
});

it('is possible to change the breadcrumb level', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { level } = breadcrumb.level(Severity.Error)['breadcrumb'];

  expect(level).toBe(Severity.Error);
});

it('is possible to change the breadcrumb category', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { category } = breadcrumb.category('query')['breadcrumb'];

  expect(category).toBe('gql query'); // The category is prefixed with 'gql'
});

it('is possible to change the breadcrumb data', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const testData: ApolloLinkSentry.Operation.Data = {
    response: 'api response',
  };

  const { data } = breadcrumb.data(testData)['breadcrumb'];

  expect(data).toEqual(testData);
});

it('is possible to change the breadcrumb type', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { type } = breadcrumb.type('http')['breadcrumb'];

  expect(type).toBe('http');
});

it('is possible to change the breadcrumb message', () => {
  const breadcrumb = new OperationsBreadcrumb();
  const { message } = breadcrumb.message('TestQuery')['breadcrumb'];

  expect(message).toBe('TestQuery');
});

it('is possible to fill a breadcrumb from an operation', () => {
  const operation = new OperationsObserver(<Operation>{}, {});
  const breadcrumb = new OperationsBreadcrumb();

  const name = 'TestQuery';
  const type: ApolloLinkSentry.Operation.Type = 'query';
  const query = 'query TestQuery { name id }';
  const variables = { response: 'api response' };
  const cache = { ROOT_QUERY: {} };

  operation['name'] = name;
  operation['type'] = type;
  operation['query'] = query;
  operation['variables'] = variables;
  operation['cache'] = cache;

  const filled = breadcrumb.fillFromOperation(operation)['breadcrumb'];

  expect(filled.message).toBe(name);
  expect(filled.category).toBe(`gql ${type}`);
  expect(filled.data?.query).toBe(query);
  expect(filled.data?.variables).toBe(stringifyObject(variables));
  expect(filled.data?.cache).toBe(stringifyObject(cache));
});

it('is possible to attach the breadcrumb to sentry', () => {
  new OperationsBreadcrumb().attachToEvent();

  const error = new Error('error to look for');
  Sentry.captureException(error);

  expect(testkit.isExist(error)).toBe(true);
  const [caughtError] = testkit.reports();
  const [breadcrumb] = caughtError.breadcrumbs;

  expect(breadcrumb.category).toBe('gql');
});

it('flushes the breadcrumb after sending', () => {
  const breadcrumb = new OperationsBreadcrumb().attachToEvent();
  expect(breadcrumb.flushed).toBeTruthy();
});

it('does not allow attaching the breadcrumb twice', () => {
  console.warn = () => {};
  const breadcrumb = new OperationsBreadcrumb().attachToEvent();
  breadcrumb.attachToEvent();

  const error = new Error('error to look for');
  Sentry.captureException(error);

  expect(testkit.isExist(error)).toBe(true);
  const [caughtError] = testkit.reports();

  expect(caughtError.breadcrumbs).toHaveLength(1);
});

it('warns when the breadcrumb is attached twice', () => {
  const mockedWarn = jest.fn();
  console.warn = mockedWarn;

  const breadcrumb = new OperationsBreadcrumb().attachToEvent();
  breadcrumb.attachToEvent();

  expect(mockedWarn).toBeCalledTimes(1);
});
