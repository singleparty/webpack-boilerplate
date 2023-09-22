const webpack = require('webpack')
const { merge } = require('webpack-merge')

const webpackCommonConfig = require('./webpack.common')
const config = require('./config')

module.exports = merge(webpackCommonConfig, {
  // Set the mode to development or production
  mode: 'development',

  // Control how source maps are generated
  devtool: 'inline-source-map',
  output: {
    path: config.build,
    filename: '[name].bundle.js',
    publicPath: '/',
    chunkFilename: 'js/[name].js',
  },

  // Spin up a server for quick development
  devServer: {
    historyApiFallback: true,
    open: false,
    compress: true,
    hot: true,
    port: 8080,
  },

  module: {
    rules: [
      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(sass|scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 1, modules: false },
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      'process.env': {
        BASE_URL: '"/"',
      },
    }),
  ],
})
