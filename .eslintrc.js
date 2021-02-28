module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript/base'],
  rules: {
    'linebreak-style': ['error', 'windows'],
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'no-plusplus': 'off',
    'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'arrow-body-style': 'off',
    'import/no-cycle': 'off',
  },
  parserOptions: {
    project: ['./tsconfig.json', './test/tsconfig.json'],
  },
};
