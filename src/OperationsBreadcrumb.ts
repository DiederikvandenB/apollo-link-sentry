import { Severity } from '@sentry/browser';
import { Breadcrumb as SentryBreadcrumb } from '@sentry/types/dist/breadcrumb';

import { isEmpty, stringifyObject } from './utils';

export namespace Breadcrumb {
  export type Category = 'query' | 'mutation' | 'subscription' | 'response' | 'error';

  export interface Data extends SentryBreadcrumb {
    data?: {
      query?: string,
      variables?: string,
      cache?: string,
      response?: string,
      error?: string,
      context?: string,
    }
  }
}

export class OperationsBreadcrumb {
  public filtered: boolean;
  public flushed: boolean;
  private readonly breadcrumb: Breadcrumb.Data;

  /**
   * Start a new ApolloLinkSentry Breadcrumb
   */
  constructor() {
    this.filtered = false;
    this.flushed = false;
    this.breadcrumb = {};

    this
      .setLevel(Severity.Log)
      .setCategory();
  }

  /**
   * Sets the breadcrumb's log level
   * @param {Severity} level
   * @returns {OperationsBreadcrumb}
   */
  setLevel = (level: Severity): OperationsBreadcrumb => {
    this.breadcrumb.level = level;
    return this;
  };

  /**
   * Sets the breadcrumb's category, which is prefixed with `graphQL`
   * @param {Breadcrumb.Category} category
   * @returns {OperationsBreadcrumb}
   */
  setCategory = (category?: Breadcrumb.Category): OperationsBreadcrumb => {
    this.breadcrumb.category = `gql ${category || ''}`.trim();
    return this;
  };

  /**
   * Set the breadcrumb's message, normally the graphQL operation's name
   * @param {string} message
   * @returns {OperationsBreadcrumb}
   */
  setMessage = (message?: string): OperationsBreadcrumb => {
    this.breadcrumb.message = message;
    return this;
  };

  /**
   * Set the breadcrumb's type
   * @param {string} type
   * @returns {OperationsBreadcrumb}
   */
  setType = (type: string): OperationsBreadcrumb => {
    this.breadcrumb.type = type;
    return this;
  };

  /**
   * Set the breadcrumb's query data
   * @param {string | undefined} query
   * @returns {OperationsBreadcrumb}
   */
  addQuery = (query: string | undefined): OperationsBreadcrumb => {
    if (!query) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      query,
    };

    return this;
  };

  /**
   * Set the breadcrumb's cache data
   * @param {object | undefined} cache
   * @returns {OperationsBreadcrumb}
   */
  addCache = (cache: object | undefined): OperationsBreadcrumb => {
    if (isEmpty(cache)) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      cache: stringifyObject(cache),
    };

    return this;
  };

  /**
   * Set the breadcrumb's variables data
   * @param {object | undefined} variables
   * @returns {OperationsBreadcrumb}
   */
  addVariables = (variables: object | undefined): OperationsBreadcrumb => {
    if (isEmpty(variables)) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      variables: stringifyObject(variables),
    };

    return this;
  };

  /**
   * Set the breadcrumb's context
   * @param {object | undefined} context
   * @returns {OperationsBreadcrumb}
   */
  addContext = (context: object | undefined): OperationsBreadcrumb => {
    if (isEmpty(context)) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      context: stringifyObject(context),
    };

    return this;
  };

  /**
   * Set the breadcrumb's response data
   * @param {object | undefined} response
   * @returns {OperationsBreadcrumb}
   */
  addResponse = (response: object | undefined): OperationsBreadcrumb => {
    if (isEmpty(response)) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      response: stringifyObject(response),
    };

    return this;
  };

  /**
   * Set the breadcrumb's error data
   * @param {any | undefined} error
   * @returns {OperationsBreadcrumb}
   */
  addError = (error: any | undefined): OperationsBreadcrumb => {
    if (isEmpty(error)) return this;

    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      error: stringifyObject(error),
    };

    return this;
  };

  /**
   * The filter option can ensure some operations are not sent to Sentry
   * @returns {boolean}
   */
  filter = (toggle: boolean): boolean => {
    this.filtered = !toggle;
    return !toggle;
  };

  /**
   * We flush the breadcrumb after it's been sent to Sentry, so we can prevent duplicates
   * @returns {Breadcrumb.Data}
   */
  flush = (): Breadcrumb.Data => {
    this.flushed = true;
    return this.breadcrumb;
  };

  /**
   * Stringify the breadcrumb, used for debugging purposes
   * @returns {string}
   */
  /* istanbul ignore next */
  toString = (): string => stringifyObject(this.breadcrumb);
}
