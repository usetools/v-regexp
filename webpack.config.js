const path = require('path');
const webpack = require('webpack');

const filename = '[name].min.js';

module.exports = {
  entry: {
    'v-regexp': path.join(__dirname, 'src'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename,
    library: 'v-regexp',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
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
    new webpack.SourceMapDevToolPlugin({
      filename: `${filename}.map`,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@v-regexp': path.resolve(__dirname, 'src'),
    },
  },
};
