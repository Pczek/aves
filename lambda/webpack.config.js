// Import path for resolving file paths
var path = require('path');
module.exports = {
  // Specify the entry point for our app
  entry: [
    path.join(__dirname, 'test/synthesize.js')
  ],
  // Specify the output file containing our bundled code
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  // Let webpack know to generate a Node.js bundle
  target: "node",
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      // include: /test/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015','stage-1']
      }
    }]
  }
}
