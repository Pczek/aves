const path = require('path');
const webpack = require('webpack');
const WebpackStrip = require("strip-loader");

module.exports = {

	devtool: 'cheap-module-source-map',
	entry: './src/js/AvesPlayer.js',
	output: {
		path: './dist/js',
		filename: 'aves.bundle.js',
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	],
	module: {
		loaders: [
			{ test: /\.js$/, loader: WebpackStrip.loader('console.log') },{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015', 'react', 'stage-1']
			}
		}]
	},

};
