import { Operation } from 'apollo-link';

import { ApolloLinkSentry } from './types';
import { isEmpty } from './utils';

export class OperationsObserver {
  /** The operation received from Apollo Link */
  private readonly operation: Operation;

  /** Operation data */
  public name: string;
  public type: ApolloLinkSentry.Operation.Type;
  public query?: string;
  public variables?: object;
  public cache?: object;

  /** Package options */
  private options: ApolloLinkSentry.Options;

  /**
   * Observe a GraphQL Operation
   * @param operation
   * @param options
   */
  constructor(operation: Operation, options: ApolloLinkSentry.Options) {
    this.options = options;
    this.operation = operation;

    // Extract data from the operation object
    this.name = this.getName();
    this.type = this.getType();
    this.query = this.getQuery();
    this.variables = this.getVariables();
    this.cache = this.getApolloCache();
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
    if (!this.options.breadcrumb?.includeCache) return undefined;

    const context = this.operation.getContext();
    const cache = context.cache.data.data;

    return !isEmpty(cache) ? cache : undefined;
  }

  /**
   * Get the variables from the operation
   */
  getVariables(): object | undefined {
    if (!this.options.breadcrumb?.includeVariables) return undefined;

    const { variables } = this.operation;

    return !isEmpty(variables) ? variables : undefined;
  }

  /**
   * Get the operation's query
   */
  getQuery = (): string | undefined => {
    if (!this.options.breadcrumb?.includeQuery) return undefined;

    if (this.operation.query.loc?.source) {
      return this.operation.query.loc.source.body;
    }

    return undefined;
  };
}
