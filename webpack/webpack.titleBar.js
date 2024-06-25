/**
 * The webpacking for WindowTitleBar differs from other components because it does not make use of the "vendor bundle".
 * The vendor bundle allows common libraries such as react, react-dom to be consolidated into a single js file.
 * Finsemble's built-in UI components make use of this vendor bundle but this cannot be counted on for external
 * components.
 *
 * Note: this will be unnecessary once WindowTitleBar is separated from app content via a BrowserView.
 */
const { generateDefaultConfig } = require("./defaultWebpackConfig");

const entries = {
	"components/windowTitleBar/WindowTitleBar": "./src/components/windowTitleBar/windowTitleBarLoader.js",
};

let webpackConfig = generateDefaultConfig("titlebar");
webpackConfig.entry = entries;
// Without this line WP5 gives an error "automatic publicpath is not supported in this browser" when
// trying to preload windowTitleBar.js into a window.open. This is because we're using require() within
// windowTitleBarLoader, to dynamically load the WidowTitleBar.tsx. Without an accurate publicPath, any
// random url won't know where to require that file.
webpackConfig.output.publicPath = "../../assets/file-loader";

module.exports = webpackConfig;
