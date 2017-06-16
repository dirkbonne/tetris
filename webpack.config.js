const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

var commonConfig = {
    entry: {
	bundle: [
	    './src/index.js'
	]
    },
    
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],
    module: {
	rules: [
	    {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        // Byte limit to inline files as Data URL
                        limit: 10000
                    }
                },
            },
            {
		test: /\.js$/, // include .js files
		enforce: "pre", // preload the jshint loader
		exclude: /node_modules/, // exclude any and all files in the node_modules folder
		use: {
		    loader: "jshint-loader",
		    options: {
			// any jshint option http://www.jshint.com/docs/options/
			// i. e.
			camelcase: true,
			
			// jshint errors are displayed by default as warnings
			// set emitErrors to true to display them as errors
			emitErrors: true,
			
			// jshint to not interrupt the compilation
			// if you want any file with jshint errors to fail
			// set failOnHint to true
			failOnHint: false,

			undef:true,

			unused: true,

			strict: "implied",

			esversion: 6,

			// setTimeout, clearTimeout, document
			browser: true,

			// console, alert, ...
			devel: true, 
			// custom reporter function
			//reporter: function(errors) { }
		    }
		}
	    },
            
	    {
		test: /\.js$/,
		exclude: /(node_modules|bower_components)/,
		use: {
		    loader: 'babel-loader',
		    options: {
			presets: ['env' /*, 'react'*/]
		    }
		}
	    },
	    {
		test: require.resolve('snapsvg'),
		loader: 'imports-loader?this=>window,fix=>module.exports=0'
	    },
	    
	    
	]
    },
};

var devConfig = {
    output: {
	path: path.join(__dirname, 'build.dev'),
	publicPath: "/build.dev/",
	filename: '[name].js'
    },

    devtool: 'inline-source-map',
    
    devServer: {
	contentBase: "./",
	inline: true,
	port: 8080
    },
};

var prodConfig = {
    output: {
	path: path.join(__dirname, 'prod'),
	publicPath: "/prod/",
	filename: '[name].js'
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false,
            },
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ],
};

module.exports = (env) => {
    return merge(commonConfig, env === "prod"? prodConfig : devConfig);
};
