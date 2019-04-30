const path = require('path')

const baseDir = path.resolve(__dirname, '../')
const srcDir = path.resolve(baseDir, './src')
const distDir = path.resolve(baseDir, './dist')

module.exports = {
  baseDir,
  srcDir,
  srcMainDir: path.resolve(srcDir, './main'),
  srcPreloadDir: path.resolve(srcDir, './preload'),
  srcRendererDir: path.resolve(srcDir, './renderer'),
  srcOtherDir: path.resolve(srcDir, './other'),
  distDir: path.resolve(baseDir, './dist'),
  distMainFile: path.resolve(distDir, './main.js'),
  distPreloadDir: path.resolve(distDir, './preload'),
  distRendererDir: path.resolve(distDir, './renderer'),
  disOtherDir: path.resolve(distDir, './other'),
  dev: {
    host: 'localhost',
    port: 8090,
    proxyTable: {}
  },
  prod: {
    sourcemap: false
  }
}
