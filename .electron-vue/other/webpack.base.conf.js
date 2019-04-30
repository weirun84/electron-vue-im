'use strict'
const path = require('path')
const config = require('../config')
const { entries } = require('./views')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(config.baseDir, dir)
}

module.exports = {
  context: config.baseDir,
  entry: entries(view => path.resolve(config.srcOtherDir, view.key)),
  output: {
    path: config.distOtherDir,
    libraryTarget: 'commonjs2',
    filename: '[name].js'
  },
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src/other'),
      '~': resolve('')
    }
  },
  externals: {
    'node-notifier': 'node-notifier'
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src/other')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src/other'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  node: {
    __dirname: true,
    __filename: true
  }
}
