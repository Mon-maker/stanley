const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.js", // Your main JavaScript file
    output: {
        filename: "bundle.js", // Name of the bundled file
        path: path.resolve(__dirname, "dist"), // Output directory
        clean: true, // Clean dist/ folder before build
    },
    mode: "development", // Default mode
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html", // Template for the HTML file
        }),
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist"), // Serve files from "dist"
        },
        host: "0.0.0.0", // Allow connections from any IP
        port: 8080, // Keep the default Webpack Dev Server port
        open: true, // Automatically open browser on localhost
    },
    
};
