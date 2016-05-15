var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve('./static');

var config = {
  devtool: 'source-map',
  entry: './driver/client.js',
  output: {
    path: buildPath,
    filename: "bundle.js"
  },
  stats: {
    colors: true,
    reasons: true
  },
  resolveLoader: {
    modulesDirectories: [
      path.resolve('./node_modules')
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json'],
    modulesDirectories: ['node_modules'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }],
  }
};

module.exports = config;