/* eslint-disable @typescript-eslint/quotes */
import { Operation } from '@apollo/client/link/core';
import { Token } from 'graphql';

const operation: Operation = {
  variables: {
    something: 'data',
  },
  extensions: {},
  operationName: 'HelloQuery',
  query: {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: {
          kind: 'Name',
          value: 'HelloQuery',
        },
        variableDefinitions: [
          {
            kind: 'VariableDefinition',
            variable: {
              kind: 'Variable',
              name: {
                kind: 'Name',
                value: 'name',
              },
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
        ],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              name: {
                kind: 'Name',
                value: 'hello',
              },
              arguments: [
                {
                  kind: 'Argument',
                  name: {
                    kind: 'Name',
                    value: 'name',
                  },
                  value: {
                    kind: 'Variable',
                    name: {
                      kind: 'Name',
                      value: 'name',
                    },
                  },
                },
              ],
              directives: [],
            },
          ],
        },
      },
    ],
    loc: {
      start: 0,
      end: 56,
      startToken: <Token>{},
      endToken: <Token>{},
      source: {
        body: 'query HelloQuery($name: String) {\n  hello(name: $name)\n}',
        name: 'GraphQL request',
        locationOffset: {
          line: 1,
          column: 1,
        },
      },
    },
  },

  getContext: (): any => ({
    cache: {
      watches: {},
      typenameDocumentCache: {},
      cacheKeyRoot: {
        weakness: true,
        weak: {},
      },
      silenceBroadcast: false,
      config: {
        fragmentMatcher: {},
        addTypename: true,
        resultCaching: true,
        freezeResults: false,
      },
      addTypename: true,
      data: {
        data: {
          "\"ROOT_QUERY\"": {
            'hello({})': 'Hello World!',
          },
        },
      },
      optimisticData: {
        data: {},
      },
      storeWriter: {},
      storeReader: {
        freezeResults: false,
      },
    },
    headers: {
      'App-Impersonation-Key': 'a0cb2511-d7b1-47a2-ad59-da06bf2f1a10',
    },
    someOtherContext: {
      lorem: {
        ipsum: {
          dorem: true,
        },
      },
    },
  }),

  setContext: (): any => {},
};

export default operation;
