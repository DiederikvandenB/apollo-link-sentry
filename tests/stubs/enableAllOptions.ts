import { ApolloLinkSentry } from '../../src';

const enableAll: ApolloLinkSentry.Options = {
  setTransaction: true,
  setFingerprint: true,

  breadcrumb: {
    enable: true,
    includeQuery: true,
    includeVariables: true,
    includeError: true,
    includeResponse: true,
    includeCache: true,
  },

  exception: {
    report: true,
  },
};

export default enableAll;
