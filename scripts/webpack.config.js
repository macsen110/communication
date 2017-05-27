var path = require('path');
module.exports = {
  resolve: {
    modules: [
      '../',
      "node_modules"
    ]
  },
  entry: [
    './index' // Your appʼs entry point
  ],
  output: {
    path: path.join(__dirname, './src/'),
    filename: '[name].js'
  },
  
  module: {
    rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            query: {
              presets: ['es2015', 'react']
            }
          }
        }
    ]
  }
};