const eslintConfig = require('@menhera-bot/eslint-config');

module.exports = {
  ...eslintConfig,
  ignorePatterns: ['*.js', 'packages/**/node_modules/*', 'packages/**/dist/*', '*.jsx'],
};