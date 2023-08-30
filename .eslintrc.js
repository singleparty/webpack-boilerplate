module.exports = {
  root: true,

  env: {
    node: true,
    browser: true,
    es6: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-unused-vars': 1,
    '@typescript-eslint/no-unused-vars': 1,
    'no-debugger': 1,
    'vue/no-unused-components': 0,
    'vue/multi-word-component-names': 0,
  },

  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true,
    },
    requireConfigFile: false,
    project: true,
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  globals: {},
}
