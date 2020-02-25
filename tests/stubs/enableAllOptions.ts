import { ApolloLinkSentry } from '../../src';

const enableAll: ApolloLinkSentry.Options = {
  setTransaction: true,
  setFingerprint: true,

  breadcrumb: {
    enable: true,
    includeQuery: true,
    includeCache: true,
    includeVariables: true,
    includeResponse: true,
    includeError: true,
  },
};

export default enableAll;
