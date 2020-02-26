import { Options } from '../../src';

const enableAll: Options = {
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
