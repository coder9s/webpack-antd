const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const glob = require('glob'); // glob模块，用于读取webpack入口目录文件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); //压缩CSS模块;
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;//处理trunk
const entries = getEntry('src/**/*.js', 'src/**/');
const config =  {
    devtool: 'source-map',
    entry: entries,
    output: {
        publicPath: "http://localhost:8081/",
        path: path.join(__dirname, 'build'),
        filename: "[name].js",
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: '/node_modules/',
                use: [{
                    loader: 'babel-loader',
                }],
            },
            {
                test: /\.css$/,
                //使用html-webpack-plugin插件独立css到一个文件;
                use: ExtractTextPlugin.extract({
                    //加载css-loader、postcss-loader（编译顺序从下往上）转译css
                    use: [{
                        loader : 'css-loader?importLoaders=1',
                    },
                        {
                            loader : 'postcss-loader',
                            //配置参数;
                            options: {
                                //从postcss插件autoprefixer 添加css3前缀;
                                plugins: function() {
                                    return [
                                        //加载autoprefixer并配置前缀,可加载更多postcss插件;
                                        require('autoprefixer')({
                                            browsers: ['ios >= 7.0']
                                        })
                                    ];
                                }
                            }
                        }]
                })
            },
            {//正则匹配后缀.less文件;
                test: /\.less$/,
                //使用html-webpack-plugin插件独立css到一个文件;
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader : 'css-loader?importLoaders=1',
                    },
                        {
                            loader : 'postcss-loader', //配置参数;
                            options: {
                                plugins: function() {
                                    return [
                                        require('autoprefixer')
                                        ({
                                            browsers: ['ios >= 7.0']
                                        })];
                                }
                            }
                        },
                        //加载less-loader同时也得安装less;
                        "less-loader"
                    ]
                })
            },
            {
                //正则匹配后缀.png、.jpg、.gif图片文件;
                test: /\.(png|jpg|gif)$/i,
                use: [{//加载url-loader 同时安装 file-loader;
                    loader : 'url-loader',
                    options : {
                        //小于10000K的图片文件转base64到css里,当然css文件体积更大;
                        limit : 10000,
                        //设置最终img路径;
                        name : '/img/[name].[ext]'
                    }
                },
                    {
                        //压缩图片(另一个压缩图片：image-webpack-loader);
                        loader : 'img-loader?minimize&optimizationLevel=5&progressive=true'
                    },]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$super', '$', 'exports', 'require']
            }
        }),
        new CommonsChunkPlugin({
            name: 'vendors',
            minChunks: Infinity
        }),
        new ExtractTextPlugin({
            filename :"[name].css",
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/index.html', //模板路径
        //     filename: "index.html", //输出名字
        //     inject: "body", //打包文件插入模板的位置
        // }),
        //webpack内置js压缩插件;
        new webpack.optimize.UglifyJsPlugin({
            compress: {    //压缩;
                warnings: false     //关闭警告;
            }
        }),
        new CleanWebpackPlugin(['build'], {
            root: '~/Documents/Ant/', //要删除文件的绝对路径
            verbose: true,
            dry: false,
        }),
        //压缩css（注:因为没有用style-loader打包到js里所以webpack.optimize.UglifyJsPlugin的压缩本身对独立css不管用）;
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,                //正则匹配后缀.css文件;
            cssProcessor: require('cssnano'),            //加载‘cssnano’css优化插件;
            cssProcessorOptions: { discardComments: {removeAll: true } }, //插件设置,删除所有注释;
            canPrint: true                             //设置是否可以向控制台打日志,默认为true;
        }),
    ],
    devServer: {
        //配置nodejs本地服务器，
        contentBase: './dist',
        hot: true //本地服务器热更新
    },
    resolve:{
        //设置可省略文件后缀名(注:如果有文件没有后缀设置‘’会在编译时会报错,必须改成' '中间加个空格。ps:虽然看起来很强大但有时候省略后缀真不知道加载是啥啊~);
        extensions: [' ','.css','.scss','.sass','.less','.js','.json'],
        //别名设置,主要是为了配和webpack.ProvidePlugin设置全局插件;
        alias: {
            //设置全局jquery插件;
        }
    }
};
var pages = Object.keys(getEntry('src/**/*.js', 'src/**/'));
pages.forEach(function(pathname) {
    console.log(pathname);
    var conf = {
        filename: pathname + '.html', //生成的html存放路径，相对于path
        template: 'src/index.html', //html模板路径
        inject:false,
    };
    config.plugins.push(new HtmlWebpackPlugin(conf));
});
module.exports = config;
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;
    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.normalize(path.join(dirname,  basename));
        pathDir = path.normalize(pathDir);
        if(pathname.startsWith(pathDir)){
            pathname = pathname.substring(pathDir.length)
        }
        entries[pathname] = ['./' + entry];
    }
    return entries;
}