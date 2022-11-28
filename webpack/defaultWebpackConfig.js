const path = require("path");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { DefinePlugin } = require("webpack");
// Uncomment the webpack-bundle-analyzer here and add to the plugins below
// in order to show size and composition of bundles
// see https://github.com/webpack-contrib/webpack-bundle-analyzer
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

/**
 * This rule will compile all imported CSS files into local <style> tags which are inlined into .js files.
 * When in development, sourceMap may cause style-loader to convert to <link> tags. This seems to vary from
 * version to version of style-loader.
 */
const CSS_RULE = {
	test: /\.s?css$/i,
	use: [
		"style-loader",
		{
			loader: "css-loader",
			options: {
				sourceMap: env !== "production",
			},
		},
	],
};

/**
 * This rule will convert imported images and fonts into standalone assets.
 * The assets are compiled into /assets/file-loader/ to distinguish them from static assets.
 * See webpack url-loader to convert this into inlining as desired.
 *
 * The publicPath defaults to /build/assets/file-loader directory but it gets there via a relative
 * path, so that your app can be deployed in a subdirectory. If you have components that lie in a directory
 * structure that has multiple levels, then use __webpack_public_path__ to transform that public path.
 *
 * //<yourapp>.tsx
 * import "./public_path.ts"
 *
 * //public_path.ts
 * ```
 * declare let __webpack_public_path__ : string;
 * __webpack_public_path__ = "../";
 * ```
 */
const IMAGE_AND_FONT_RULE = {
	test: /\.(png|img|ttf|ottf|eot|woff|woff2|svg)$/,
	use: {
		loader: "file-loader",
		options: {
			name: "[name].[ext]",
			outputPath: "/assets/file-loader/",
			publicPath: "../../assets/file-loader",
			// This interferes with url() in @font-face. Only use when necessary
			//postTransformPublicPath: (p) => `__webpack_public_path__ + ${p}`,
		},
	},
};

const SVG_RULE = {
	test: /\.svg$/,
	use: [
		{
			loader: "@svgr/webpack",
			options: {
				svgoConfig: {
					plugins: {
						removeViewBox: false,
					},
				},
			},
		},
		"file-loader",
	],
};

/**
 * This is a rule for compiling JSX files using babel.
 */
const JSX_RULE = {
	test: /\.js(x)?$/,
	exclude: /node_modules/,
	use: {
		loader: "babel-loader",
		options: {
			presets: [
				[
					"@babel/preset-env",
					{
						targets: {
							browsers: "Chrome 85",
						},
						modules: false,
					},
				],
				"@babel/preset-react",
			],
		},
	},
};

/**
 * This rule will compile all .ts and .tsx files. ts-loader uses tsc. Modify the .tsconfig file to change typescript compilation behavior.
 */
const TSX_RULE = {
	test: /\.ts(x)?$/,
	loader: "ts-loader",
	exclude: /node_modules/,
};

/**
 * This rule allows webpack to transfer source maps from imported libraries, combining them into the source map for the actual file that
 * it is bundling. This gives developers the ability to debug all the way down into imports from node_modules.
 */
const SOURCE_MAPS_RULE = {
	enforce: "pre",
	test: /\.js$/,
	loader: "source-map-loader",
};

/**
 * The DefinePlugin is used to set environment variables that are used by gulpfile.js tasks.
 *
 * The HardSourceWebpackPlugin implements incremental compilation. This greatly speeds up build time. Use `npm dev clean` to erase cache files in case of any build problems.
 */
let plugins = [
	new DefinePlugin({
		"process.env": {
			NODE_ENV: JSON.stringify(env),
		},
	}),
	new CaseSensitivePathsPlugin(),
];

// Uncomment the webpack-bundle-analyzer here and in the require above
// in order to show size and composition of bundles
// see https://github.com/webpack-contrib/webpack-bundle-analyzer
//plugins.push(new BundleAnalyzerPlugin({ analyzerMode: "static" }));

/**
 * Aliases ensure that singleton libraries, such as react-dom, are only imported once.
 * When external libraries themselves depend upon react-dom, it becomes possible for webpack to include more
 * than one instance of the library which confuses react-dom. The alias webpack entry will
 * ensure that all unpacked dependencies point to the same physical import.
 *
 * These imports are also packed using DllPlugin into vendor.bundle.js in order to speed loading times for commonly used imports.
 */
const aliases = {
	"@babel/runtime": path.resolve("./node_modules/@babel/runtime"),
	"@finsemble/finsemble-core": path.resolve("./node_modules/@finsemble/finsemble-core"),
	async: path.resolve("./node_modules/async"),
	"date-fns": path.resolve("./node_modules/date-fns"),
	lodash: path.resolve("./node_modules/lodash"),
	react: path.resolve("./node_modules/react"),
	"react-dom": path.resolve("./node_modules/react-dom"),
};

let counter = 0;

const generateDefaultConfig = (name) => {
	counter = counter + 1;
	return {
		devtool: env === "production" ? "source-map" : "eval-source-map",
		entry: {},
		cache: {
			type: "filesystem",
			cacheDirectory: path.resolve(__dirname, `../.webpack-file-cache/${env}`),
			name: name || `cache.${counter}`,
		},
		snapshot: {
			/**
			 * This is necessary so that webpack watches @finsemble node_modules for channges.
			 * Without this, the build/finsemble directory will not be copied on symlink updates.
			 */
			managedPaths: [],
		},
		stats: "minimal",
		module: {
			rules: [CSS_RULE, SVG_RULE, IMAGE_AND_FONT_RULE, JSX_RULE, TSX_RULE, SOURCE_MAPS_RULE],
		},
		mode: env,
		plugins: plugins,
		optimization: {
			usedExports: true,
		},
		output: {
			filename: "[name].js",
			path: path.resolve(__dirname, "../public/build/"),
		},
		resolve: {
			alias: aliases,
			extensions: [".tsx", ".ts", ".js", ".jsx", ".json", ".scss", ".css", ".html"],
			modules: ["./node_modules"],
		},
	};
};

module.exports = { generateDefaultConfig };
