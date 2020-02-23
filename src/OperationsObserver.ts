import { Operation } from 'apollo-link';

import { ApolloLinkSentry } from './types';
import { isEmpty } from './utils';

export class OperationsObserver {
  /** The operation received from Apollo Link */
  private readonly operation: Operation;

  /**
   * Observe a GraphQL Operation
   * @param operation
   */
  constructor(operation: Operation) {
    this.operation = operation;
  }

  /**
   * Get the name of the operation
   */
  getName(): string {
    return this.operation.operationName;
  }

  /**
   * Get the operation type
   */
  getType(): ApolloLinkSentry.Operation.Type {
    if (!this.operation) return undefined;

    const { query } = this.operation;
    const definition = query.definitions[0];

    return definition.kind === 'OperationDefinition'
      ? definition.operation
      : undefined;
  }

  /**
   * Get the Apollo Cache from the operation
   */
  getApolloCache(): object | undefined {
    const context = this.operation.getContext();
    const cache = context.cache.data.data;

    return !isEmpty(cache) ? cache : undefined;
  }

  /**
   * Get the variables from the operation
   */
  getVariables(): object | undefined {
    const { variables } = this.operation;

    return !isEmpty(variables) ? variables : undefined;
  }

  /**
   * Get the operation's query
   */
  getQuery = (): string | undefined => {
    if (this.operation.query.loc?.source) {
      return this.operation.query.loc.source.body;
    }

    return undefined;
  };
}
