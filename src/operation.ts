import { Operation } from '@apollo/client/core';
import { OperationDefinitionNode } from 'graphql';

export function extractDefinition(
  operation: Operation,
): OperationDefinitionNode {
  // We know we always have a single definition, because Apollo validates this before we get here.
  // With more then one query defined, an error like this is thrown and the query is never sent:
  // "react-apollo only supports a query, subscription, or a mutation per HOC. [object Object] had 2 queries, 0 subscriptions and 0 mutations. You can use 'compose' to join multiple operation types to a component"
  return operation.query.definitions[0] as OperationDefinitionNode;
}
