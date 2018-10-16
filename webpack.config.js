module.exports = {
  context: __dirname + '/src/script',
  entry: {
    'picotune': './index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: './[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
