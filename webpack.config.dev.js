const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
module.exports = {
    devtool: 'cheap-eval-source-map',
    entry: [
        './src/index'
    ],
    output: {
        publicPath: "http://localhost:8081/",
        path: path.join(__dirname, 'build'),
        filename: 'index.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin("styles.css"),
        new OpenBrowserPlugin({ url: 'http://localhost:8081' }),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader:  ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            }
            ,{
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude:/node_modules/
            },{
                test: /\.json$/,
                loader: "json-loader"
            },{
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                },]}
        ]
    },
    devServer: {
        contentBase: './build',
        hot: true,
        host: '127.0.0.1',
        port: '8081'
    }
};