module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off',
    'consistent-return': 'off',
    'class-methods-use-this': ['error', { exceptMethods: ['run'] }],
    'no-param-reassign': ['error', { props: false }],
    radix: 'off',
    'default-case': 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
    'import/no-unresolved': [2, { ignore: ['config.json$'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/extensions': [0, 'never', { ts: 'never' }],
    'no-use-before-define': ['error', { variables: false }],
    'linebreak-style': 'off',
    'import/no-cycle': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: true,
      'eslint-import-resolver-typescript': true,
    },
  },
};
