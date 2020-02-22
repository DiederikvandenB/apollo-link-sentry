// import { ApolloLinkSentry } from '../src';
import { OperationsObserver } from '../src/OperationsObserver';

import OperationStub from './stubs/Operation';
import enableAllOptions from './stubs/enableAllOptions';

it('is possible to create a new operation observer', () => {
  const operation = new OperationsObserver(OperationStub, enableAllOptions);

  // @ts-ignore
  const type = OperationStub.query.definitions[0].operation;
  const { data: cache } = OperationStub.getContext().cache.data;
  const { variables } = OperationStub;
  const query = OperationStub.query.loc?.source.body;

  expect(operation['getName']()).toBe(OperationStub.operationName);
  expect(operation['getType']()).toBe(type);
  expect(operation['getApolloCache']()).toEqual(cache);
  expect(operation['getVariables']()).toEqual(variables);
  expect(operation['getQuery']()).toEqual(query);
});

it('allows disabling attaching the query', () => {
  const operation = new OperationsObserver(OperationStub, { breadcrumb: { includeQuery: false } });
  expect(operation['getQuery']()).toEqual(undefined);
});

it('allows disabling attaching the variables', () => {
  const operation = new OperationsObserver(OperationStub, { breadcrumb: { includeVariables: false } });
  expect(operation['getVariables']()).toEqual(undefined);
});

it.skip('allows disabling attaching the error', () => {
  const operation = new OperationsObserver(OperationStub, { breadcrumb: { includeError: false } });
  expect(operation['getApolloCache']()).toEqual(undefined);
});

it.skip('allows disabling attaching the response', () => {
  const operation = new OperationsObserver(OperationStub, { breadcrumb: { includeResponse: false } });
  expect(operation['getApolloCache']()).toEqual(undefined);
});

it('allows disabling attaching apollo cache', () => {
  const operation = new OperationsObserver(OperationStub, { breadcrumb: { includeCache: false } });
  expect(operation['getApolloCache']()).toEqual(undefined);
});
