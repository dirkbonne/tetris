var path = require('path');

module.exports = {
    entry: {
	bundle: [
	    './app/setup.js'
	]
    },
    
    output: {
	path: path.join(__dirname, 'dist'),
	publicPath: "/dist/",
	filename: 'bundle.js'
    },
    
    module: {
	rules: [	    
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
			presets: ['env']
		    }
		}
	    },
	    {
		test: require.resolve('snapsvg'),
		loader: 'imports-loader?this=>window,fix=>module.exports=0'
	    },
	    
	    
	]
    },

    devtool: 'inline-source-map',
    
    devServer: {
	contentBase: "./",
	inline: true,
	port: 8080
    },
}

    
