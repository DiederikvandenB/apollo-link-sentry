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

  it('should get the single operation definition if it includes a fragment', () => {
    const definition = extractDefinition(
      makeOperation({
        query: parse(`
          fragment CoreCommentFields on Comment {
            id
          }
          query Comments {
            ...CoreCommentFields
          }
        `),
      }),
    );

    expect(definition.name?.value).toBe('Comments');
    expect(definition.kind).toBe('OperationDefinition');
  });

  it('should get a mutation operation', () => {
    const definition = extractDefinition(
      makeOperation({
        query: parse(`
          mutation Test {
            test
          }
        `),
      }),
    );

    expect(definition.name?.value).toBe('Test');
    expect(definition.kind).toBe('OperationDefinition');
  });
});
