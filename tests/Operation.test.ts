import { Operation } from '../src/Operation';

import OperationStub from './stubs/Operation';

describe('Operation', () => {
  it('should be possible to create a new operation', () => {
    expect(() => new Operation(OperationStub)).not.toThrow();
  });

  it('should be possible to get the name', () => {
    const operation = new Operation(OperationStub);
    expect(operation['getName']()).toBe(OperationStub.operationName);
  });

  it('should be possible to get the type', () => {
    const operation = new Operation(OperationStub);

    // @ts-ignore
    const type = OperationStub.query.definitions[0].operation;

    expect(operation['getType']()).toBe(type);
  });

  it('should be possible to get the cache', () => {
    const operation = new Operation(OperationStub);
    const { data: cache } = OperationStub.getContext().cache.data;
    expect(operation['getApolloCache']()).toEqual(cache);
  });

  it('should be possible to get the variables', () => {
    const operation = new Operation(OperationStub);
    const { variables } = OperationStub;
    expect(operation['getVariables']()).toEqual(variables);
  });

  it('should be possible to get the query', () => {
    const operation = new Operation(OperationStub);
    const query = OperationStub.query.loc?.source.body;
    expect(operation['getQuery']()).toEqual(query);
  });

  it('should be possible to get context keys', () => {
    const operation = new Operation(OperationStub);
    const { headers } = OperationStub.getContext();

    const keys = ['headers', 'someOtherContext.lorem.ipsum'];
    const context = operation['getContextKeys'](keys);

    expect(context?.headers).toEqual(headers);
    expect(context?.['someOtherContext.lorem.ipsum']).toBeTruthy();
  });
});
