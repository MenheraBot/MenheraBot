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
  plugins: ['import', 'prettier', 'unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'consistent-return': 'off',
    'class-methods-use-this': ['error', { exceptMethods: ['run'] }],
    'no-param-reassign': ['error', { props: false }],
    radix: 'off',
    'default-case': 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 0,
    'no-warning-comments': 'warn',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/extensions': [0, 'never', { ts: 'never' }],
    'no-use-before-define': ['error', { variables: false }],
    'linebreak-style': 'off',
    'import/no-cycle': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
			'warn',
			{ 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
		]
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
