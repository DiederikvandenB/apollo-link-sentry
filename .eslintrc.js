module.exports = {
  root: true,
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: "tsconfig.json",
  },
  rules: {
    'import/prefer-default-export': 0,
    'lines-between-class-members': 0,
  }
};
