module.exports = {
  root: true,
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: 'tsconfig.eslint.json',
  },
  rules: {
    'no-console': [1, { allow: ['warn', 'error'] }],
    'import/prefer-default-export': 0,
    'lines-between-class-members': 0,
  }
};
