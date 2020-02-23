import { Severity } from '@sentry/browser';

import { ApolloLinkSentry } from './types';
import { isEmpty, stringifyObject } from './utils';

export class OperationsBreadcrumb {
  public flushed: boolean;
  private readonly breadcrumb: ApolloLinkSentry.Breadcrumb.Data;

  /**
   * Start a new ApolloLinkSentry Breadcrumb
   */
  constructor() {
    this.breadcrumb = {};
    this.flushed = false;

    this
      .setLevel(Severity.Log)
      .setCategory();
  }

  /**
   * Sets the breadcrumb's log level
   * @param level
   */
  setLevel = (level: Severity): OperationsBreadcrumb => {
    this.breadcrumb.level = level;
    return this;
  };

  /**
   * Sets the breadcrumb's category, which is prefixed with `graphQL`
   * @param category
   */
  setCategory = (category?: ApolloLinkSentry.Breadcrumb.Category): OperationsBreadcrumb => {
    this.breadcrumb.category = `gql ${category || ''}`.trim();
    return this;
  };

  /**
   * Set the breadcrumb's message, normally the graphQL operation's name
   * @param message
   */
  setMessage = (message?: string): OperationsBreadcrumb => {
    this.breadcrumb.message = message;
    return this;
  };

  /**
   * Set the breadcrumb's type
   * @param type
   */
  setType = (type: string): OperationsBreadcrumb => {
    this.breadcrumb.type = type;
    return this;
  };

  /**
   * Set the breadcrumb's query data
   * @param query
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
   * @param cache
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
   * @param variables
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
   * Set the breadcrumb's response data
   * @param response
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
   * @param error
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
   * We flush the breadcrumb after it's been sent to Sentry, so we can prevent duplicates
   */
  flush = (): ApolloLinkSentry.Breadcrumb.Data => {
    this.flushed = true;
    return this.breadcrumb;
  };

  /**
   * Stringify the breadcrumb, used for debugging purposes
   */
  /* istanbul ignore next */
  toString = (): string => stringifyObject(this.breadcrumb);
}
