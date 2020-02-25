import { Operation as ApolloOperation } from 'apollo-link';

import { ApolloLinkSentry } from './types';
import { isEmpty } from './utils';

export class Operation {
  /** The operation received from Apollo Link */
  private readonly operation: ApolloOperation;

  /** ApolloLinkSentry Operation data */
  public name: string;
  public type: ApolloLinkSentry.Operation.Type;
  public cache: object | undefined;
  public variables: object | undefined;
  public query: string | undefined;

  /**
   * Observe a GraphQL Operation
   * @param {Operation} operation
   */
  constructor(operation: ApolloOperation) {
    this.operation = operation;
    this.name = this.getName();
    this.type = this.getType();
    this.cache = this.getApolloCache();
    this.variables = this.getVariables();
    this.query = this.getQuery();
  }

  /**
   * Get the name of the operation
   * @returns {string}
   */
  private getName(): string {
    return this.operation.operationName;
  }

  /**
   * Get the operation type
   * @returns {ApolloLinkSentry.Operation.Type}
   */
  private getType(): ApolloLinkSentry.Operation.Type {
    const { query } = this.operation;
    const definition = query.definitions[0];

    return definition.kind === 'OperationDefinition'
      ? definition.operation
      : undefined;
  }

  /**
   * Get the Apollo Cache from the operation
   * @returns {object | undefined}
   */
  private getApolloCache(): object | undefined {
    const context = this.operation.getContext();
    const cache = context.cache?.data?.data;

    return !isEmpty(cache)
      ? cache
      : undefined;
  }

  /**
   * Get the variables from the operation
   * @returns {object | undefined}
   */
  private getVariables(): object | undefined {
    const { variables } = this.operation;

    return !isEmpty(variables)
      ? variables
      : undefined;
  }

  /**
   * Get the operation's query
   * @returns {string | undefined}
   */
  private getQuery = (): string | undefined => (
    this.operation.query.loc?.source
      ? this.operation.query?.loc.source.body
      : undefined
  );
}
