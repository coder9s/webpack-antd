var path = require('path'); //引文文件路径
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); //压缩CSS模块;
module.exports = {
    devtool: 'source-map',
    entry: ['./src/index'], //入口文件
    output: {
        publicPath: "http://localhost:8081/",        //配合devServer本地Server;
        path: path.join(__dirname, 'dist'), //打包出口文件路径
        filename: 'index.js' //打包文件名
    },
    module: {
        loaders: [
            {
                //正则匹配后缀.js 和.jsx文件;
                test: /\.(js|jsx)$/,
                //需要排除的目录
                exclude: '/node_modules/',
                //加载babel-loader转译es6
                use: [{
                    loader: 'babel-loader',
                }],
            },
            {
                //正则匹配后缀.css文件;
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
        new ExtractTextPlugin({
            filename :"[name].css",
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html', //模板路径
            filename: "index.html",
            inject: "body",
        }),
        //webpack内置js压缩插件;
        new webpack.optimize.UglifyJsPlugin({
            compress: {                               //压缩;
                warnings: false                      //关闭警告;
            }
        }),
        new CleanWebpackPlugin(['dist'], {
            root: '~/Documents/Ant/',
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
        //查找module的话从这里开始查找;
        modules: [path.resolve(__dirname, "src"), "node_modules"], //绝对路径;
        //别名设置,主要是为了配和webpack.ProvidePlugin设置全局插件;
        alias: {
            //设置全局jquery插件;
        }
    }
}