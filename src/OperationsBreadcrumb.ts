import * as Sentry from '@sentry/browser';

import { ApolloLinkSentry } from './types';
import { OperationsObserver } from './OperationsObserver';
import { stringifyObject, trimObject } from './utils';

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
      .level(Sentry.Severity.Log)
      .category();
  }

  /**
   * Sets the breadcrumb's log level
   * @param level
   */
  level = (level: Sentry.Severity): OperationsBreadcrumb => {
    this.breadcrumb.level = level;
    return this;
  };

  /**
   * Sets the breadcrumb's category, which is prefixed with `graphQL`
   * @param category
   */
  category = (category?: ApolloLinkSentry.Breadcrumb.Category): OperationsBreadcrumb => {
    this.breadcrumb.category = `gql ${category || ''}`.trim();
    return this;
  };

  /**
   * Set the breadcrumb's message, normally the graphQL operation's name
   * @param message
   */
  message = (message?: string): OperationsBreadcrumb => {
    this.breadcrumb.message = message;
    return this;
  };

  /**
   * Set the breadcrumb's extra data
   * @param data
   */
  data = (data: ApolloLinkSentry.Operation.Data): OperationsBreadcrumb => {
    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      ...data,
    };

    return this;
  };

  /**
   * Set the breadcrumb's type, normally `http`
   * @param type
   */
  type = (type: string): OperationsBreadcrumb => {
    this.breadcrumb.type = type;
    return this;
  };

  /**
   * Fill the breadcrumb with information from an OperationsObserver
   * @param operation
   */
  fillFromOperation = (operation: OperationsObserver): OperationsBreadcrumb => {
    const data: ApolloLinkSentry.Operation.Data = trimObject({
      query: operation.query,
      cache: stringifyObject(operation.cache),
      variables: stringifyObject(operation.variables),
    });

    return this
      .message(operation.name)
      .category(operation.type)
      .data(data);
  };

  /**
   * Tell Sentry about our breadcrumb
   */
  attachToEvent = (): OperationsBreadcrumb => {
    if (this.flushed) {
      console.warn('[apollo-link-sentry] OperationsBreadcrumb.attachToEvent() was called on an already flushed breadrumb');
      return this;
    }

    Sentry.addBreadcrumb(this.breadcrumb);
    this.flushed = true;

    return this;
  };

  /**
   * Stringify the breadcrumb, used for debugging purposes
   */
  /* istanbul ignore next */
  toString = (): string => stringifyObject(this.breadcrumb);
}
