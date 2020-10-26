import { Operation as ApolloOperation } from '@apollo/client';
import dotProp from 'dot-prop';

import { isEmpty } from './utils';

export class Operation {
  /** The operation received from Apollo Link */
  private readonly operation: ApolloOperation;

  /** ApolloLinkSentry Operation data */
  public name: string;
  public type: 'query' | 'mutation' | 'subscription' | undefined;
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
   * @returns {"query" | "mutation" | "subscription" | undefined}
   */
  private getType(): 'query' | 'mutation' | 'subscription' | undefined {
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

  /**
   * Get a set of keys from the context using dot notation
   * @param {string[]} keys
   * @returns {{[p: string]: any} | undefined}
   */
  public getContextKeys = (keys: string[]): { [s: string]: any } | undefined => {
    const context = this.operation.getContext();

    const find = keys
      .map((key): object | undefined => ({ [key]: dotProp.get(context, key) }))
      .reduce((a: object, b: any): object => ({ ...a, ...b }), {});

    return !isEmpty(find)
      ? find
      : undefined;
  };
}
