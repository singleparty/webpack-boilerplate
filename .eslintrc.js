module.exports = {
  root: true,

  env: {
    node: true,
    browser: true,
    es6: true,
  },

  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-unused-vars': 0,
    'no-debugger': 0,
    'vue/no-unused-components': 0,
    'vue/multi-word-component-names': 0,
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  globals: {},
}
