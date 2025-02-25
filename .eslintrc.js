module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  ignorePatterns: ['dist', 'node_modules'],
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
    '@typescript-eslint/no-redeclare': 'off',
    'linebreak-style': ['error', 'windows'],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    },
  ],
};
