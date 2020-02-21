import * as Sentry from '@sentry/browser';

import { ApolloLinkSentry } from './types';
import { OperationsObserver } from './OperationsObserver';
import { stringifyObject, trimObject } from './utils';

export class LinkSentryBreadcrumb {
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
  public level(level: Sentry.Severity): LinkSentryBreadcrumb {
    this.breadcrumb.level = level;
    return this;
  }

  /**
   * Sets the breadcrumb's category, which is prefixed with `graphQL`
   * @param category
   */
  public category(category?: ApolloLinkSentry.Breadcrumb.Category): LinkSentryBreadcrumb {
    this.breadcrumb.category = `gql ${category || ''}`.trim();
    return this;
  }

  /**
   * Set the breadcrumb's message, normally the graphQL operation's name
   * @param message
   */
  public message(message?: string): LinkSentryBreadcrumb {
    this.breadcrumb.message = message;
    return this;
  }

  /**
   * Set the breadcrumb's extra data
   * @param data
   */
  public data(data: ApolloLinkSentry.Operation.Data): LinkSentryBreadcrumb {
    this.breadcrumb.data = {
      ...this.breadcrumb.data,
      ...data,
    };

    return this;
  }

  /**
   * Set the breadcrumb's type, normally `http`
   * @param type
   */
  public type(type: string): LinkSentryBreadcrumb {
    this.breadcrumb.type = type;
    return this;
  }

  /**
   * Fill the breadcrumb with information from an OperationsObserver
   * @param operation
   */
  public fillFromOperation(operation: OperationsObserver): void {
    const data: ApolloLinkSentry.Operation.Data = trimObject({
      query: operation.query,
      cache: stringifyObject(operation.cache),
      variables: stringifyObject(operation.variables),
    });

    this
      .message(operation.name)
      .category(operation.type)
      .data(data);
  }

  /**
   * Tell Sentry about our breadcrumb
   */
  public addToEvent(): LinkSentryBreadcrumb {
    if (this.flushed) {
      console.warn('[apollo-link-sentry] OperationsBreadcrumb.addToEvent() was called on an already flushed breadrumb');
      return this;
    }

    Sentry.addBreadcrumb(this.breadcrumb);
    this.flushed = true;

    return this;
  }

  /**
   * Stringify the breadcrumb
   */
  public toString(): string {
    return stringifyObject(this.breadcrumb);
  }
}
