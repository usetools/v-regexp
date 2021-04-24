const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// 整个项目的根目录
const ROOT = path.resolve(__dirname, '..');
// v-regexp 项目根目录
const V_REGEXP_ROOT = path.resolve(ROOT, 'src');
const filename = '[name].[hash:10].js';

module.exports = {
  mode: 'development',
  entry: {
    site: path.join(__dirname, 'src'),
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    filename,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(less|css)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
    }),
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@v-regexp': V_REGEXP_ROOT,
    },
  },
  resolveLoader: {
    modules: [path.resolve(ROOT, 'node_modules'), 'node_modules'],
  },
  devServer: {
    hot: true,
    port: 9000,
    publicPath: '/',
    historyApiFallback: true,
    contentBase: ['./dist'],
  },
};
