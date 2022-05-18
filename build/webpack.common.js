const webpack = require('webpack')
const path = require('path')
const PreloadPlugin = require("@vue/preload-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const config = require('./config')

module.exports = {
  entry: [path.join(config.src, 'main.ts')],
  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: config.public,
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: 'webpack Boilerplate',
      favicon: path.join(config.public, 'favicon.ico'),
      template: path.join(config.public, 'index.html'), // template file
      filename: 'index.html', // output file
      env: process.env
    }),
    new VueLoaderPlugin(),
    new PreloadPlugin(
      {
        rel: 'preload',
        include: 'initial',
        fileBlacklist: [
          /\.map$/,
          /hot-update\.js$/
        ]
      }
    ),
    new PreloadPlugin(
      {
        rel: 'prefetch',
        include: 'asyncChunks'
      }
    ),
  ],

  // Determine how modules within the project are treated
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.(t|j)s$/, exclude: /node_modules/, use: ['babel-loader'] },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },

      { test: /\.vue$/, use: ['vue-loader'] },
      {
        test: /\.ts$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: { appendTsSuffixTo: [/\.vue$/], transpileOnly: true, happyPackMode: false }
          },

        ]
      }
    ],
  },

  resolve: {
    modules: [config.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.vue', '.json'],
    alias: {
      '@': config.src,
      vue$: 'vue/dist/vue.runtime.esm-bundler.js'
    },
  },
}