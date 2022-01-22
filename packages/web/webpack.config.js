const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const { homepage } = require('../../package.json')

const outdir = path.resolve(__dirname, '../../docs')

module.exports = (env, argv) => {
  const isDev = argv.mode && argv.mode === 'development'
  const publicPath = isDev ? './' : homepage
  return {
    entry: path.join(__dirname, 'src', 'index.tsx'),
    output: {
      path: outdir,
      filename: 'index.js'
    },
    devtool: 'inline-source-map',
    devServer: {
      static: {
        publicPath: './'
      },
      port: 9000,
      hot: false
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(js)x?$/,
          loader: 'esbuild-loader',
          exclude: /node_modules/,
          options: {
            loader: 'jsx',
            target: 'es2015'
          }
        },
        {
          test: /\.tsx?$/,
          loader: 'esbuild-loader',
          exclude: /node_modules/,
          options: {
            loader: 'tsx',
            target: 'es2015',
            tsconfigRaw: require('./tsconfig.build.json')
          }
        },
        {
          test: /\.cool$/i,
          type: 'asset/source'
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015' // Syntax to compile to (see options below for possible values)
        })
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        React: 'react'
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: path.resolve(outdir, 'index.html'),
        inject: 'body',
        publicPath: './'
      }),
      new FaviconsWebpackPlugin({
        logo: path.resolve(__dirname, 'favicon.png'),
        publicPath: publicPath,
        prefix: './'
      })
    ]
  }
}
