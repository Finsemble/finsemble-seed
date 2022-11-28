/**
 * This webpack config creates a JavaScript "DLL" using webpack's DLLPlugin module. The imports
 * listed under `entries` are compiled into this DLL so that applications don't need to compile
 * them directly. Instead, those applications receive this code by including the compiled DLL
 * as a <script> tag. See `webpack.components.js` for an implementation.
 *
 * vendor.bundle.js is the name of the generated DLL.
 *
 */
const path = require("path");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const { DefinePlugin, DllPlugin } = require("webpack");
// Uncomment the webpack-bundle-analyzer here and add to the plugins below
// in order to show size and composition of bundles
// see https://github.com/webpack-contrib/webpack-bundle-analyzer
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

console.log("ENVIRONMENT", env);
let plugins = [
	new DllPlugin({
		name: "vendor_lib",
		path: path.join(__dirname, "vendor-manifest.json"),
	}),
	new DefinePlugin({
		"process.env": {
			NODE_ENV: JSON.stringify(env),
		},
	}),
];

// Uncomment the webpack-bundle-analyzer here and in the require above
// in order to show size and composition of bundles
// see https://github.com/webpack-contrib/webpack-bundle-analyzer
//plugins.push(new BundleAnalyzerPlugin({ analyzerMode: "static" }));

/**
 * Each entry must also be listed under the "alias" setting in webpack.components.js otherwise
 * webpack will not load the listed module from the DLL.
 *
 * Note: @finsemble/finsemble-core is not to be confused with the Finsemble preload (FSBL.js) or
 * JavaScript adapter. This library is a direct dependency of @finsemble/finsemble-ui. It is
 * included here because, like react, lodash, async, ..., it is a single, large dependency that is
 * required by most UI Components.
 */
module.exports = {
	entry: {
		vendor: ["react", "react-dom", "async", "lodash", "date-fns", "@finsemble/finsemble-core"],
	},
	output: {
		filename: "vendor.bundle.js",
		path: path.join(__dirname, "../public/build"),
		library: "vendor_lib",
	},
	plugins: plugins,
};
