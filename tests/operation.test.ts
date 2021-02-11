import { Operation } from '@apollo/client/core';
import { parse } from 'graphql';

import { extractDefinition } from '../src/operation';

export function makeOperation(overwrites: Partial<Operation> = {}): Operation {
  return {
    query: parse(`query Foo { foo }`),
    operationName: 'Foo',
    variables: {},
    extensions: {},
    getContext: () => ({}),
    setContext: (context) => context,

    ...overwrites,
  };
}

describe('extractDefinition', () => {
  it('should get the single operation definition', () => {
    const definition = extractDefinition(makeOperation());

    expect(definition.kind).toBe('OperationDefinition');
  });
});
