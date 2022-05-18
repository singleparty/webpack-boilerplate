module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential', 'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-unused-vars': 0,
    'no-debugger': 0,
  },
  globals: {
    // 允许在代码中使用全局变量
    location: true,
    setTimeout: true,
  },
}
