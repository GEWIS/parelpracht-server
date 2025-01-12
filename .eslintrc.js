module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['airbnb-typescript/base'],
  rules: {
    'linebreak-style': ['error', 'unix'],
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
    'indent': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        'ignoredNodes': [
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
        ]
      }
    ]
  },
  parserOptions: {
    project: ['./tsconfig.json'],
  },
};
