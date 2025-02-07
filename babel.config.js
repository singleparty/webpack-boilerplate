module.exports = {
  presets: [['@babel/preset-env']],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: {
          version: 3,
          proposals: true,
        },
        useESModules: true,
        absoluteRuntime: true,
      },
    ],
  ],
}
