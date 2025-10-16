// @ts-check

import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  eslintPluginPrettierRecommended,
  tseslint.configs.stylistic,
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.commonjs,
      },
    },
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['.js$'],
        },
      ],
      'consistent-return': 'off',
      'class-methods-use-this': ['error', { exceptMethods: ['run'] }],
      'no-param-reassign': ['error', { props: false }],
      radix: 'off',
      'default-case': 'off',
      'no-plusplus': 'off',
      'max-len': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',
      'no-warning-comments': 'warn',
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'no-use-before-define': ['error', { variables: false }],
      'linebreak-style': 'off',
      'import/no-cycle': 'off',
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': ['error'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      'import/no-named-as-default': 0,
      'import/no-named-as-default-member': 0,
      /*  'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
      ] */
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },
  globalIgnores(['*.js', 'packages/**/node_modules/*', 'packages/**/dist/*', '*.jsx']),
);
