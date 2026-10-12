// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'web-build/*', '.expo/*'],
  },
  {
    rules: {
      // Quotes and apostrophes inside React Native <Text> are safe; this rule targets HTML.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
