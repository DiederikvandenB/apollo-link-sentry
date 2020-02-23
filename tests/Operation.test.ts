import { Operation } from '../src/Operation';

import OperationStub from './stubs/Operation';

it('is possible to create a new operation', () => {
  expect(() => new Operation(OperationStub)).not.toThrow();
});

it('is possible to get the name from the operation', () => {
  const operation = new Operation(OperationStub);
  expect(operation.getName()).toBe(OperationStub.operationName);
});

it('is possible to get the type from the operation', () => {
  const operation = new Operation(OperationStub);

  // @ts-ignore
  const type = OperationStub.query.definitions[0].operation;

  expect(operation.getType()).toBe(type);
});

it('is possible to get the cache from the operation', () => {
  const operation = new Operation(OperationStub);
  const { data: cache } = OperationStub.getContext().cache.data;
  expect(operation.getApolloCache()).toEqual(cache);
});

it('is possible to get the variables from the operation', () => {
  const operation = new Operation(OperationStub);
  const { variables } = OperationStub;
  expect(operation.getVariables()).toEqual(variables);
});

it('is possible to get the query from the operation', () => {
  const operation = new Operation(OperationStub);
  const query = OperationStub.query.loc?.source.body;
  expect(operation.getQuery()).toEqual(query);
});
