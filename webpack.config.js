const path = require('path')
// Import HTML plugin
const HTMLWebpackPlugin = require('html-webpack-plugin')
// Copy entire directory
const CopyWebpackPlugin = require('copy-webpack-plugin')
// Import clean plugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ESLintPlugin = require('eslint-webpack-plugin')

// All configuration information in webpack should be written in module.exports
module.exports = {
  devServer: {
    port: '8088'
  },
  // Specify entry file
  entry: './src/ts/demo.ts',
  // Specify directory where packaged files are located
  output: {
    // Specify directory for packaged files
    path: path.resolve(__dirname, 'dist'),
    // File name after packaging
    filename: 'bundle.js',
    libraryTarget: 'umd',
    // Tell webpack not to use arrow functions
    // By default, the packaged result is an immediately executed arrow function, which cannot be executed in IE 11!
    // With the configuration below, webpack won't use arrow functions at the outermost layer when packaging
    // Webpack new version no longer wants to be compatible with IE! 233
    environment: {
      arrowFunction: false,
    },
  },
  // Specify modules to use when webpack packages
  module: {
    // Specify rules to load
    rules: [
      {
        // test specifies the files to which the rule applies
        test: /\.ts$/,
        // Loader to use
        // Webpack在加载时是"从后向前"加载！
        use: [
          // 配置babel
          {
            // 指定加载器
            loader: 'babel-loader',
            // 设置babel
            options: {
              // 设置预定义的环境
              presets: [
                [
                  // 指定环境的插件
                  '@babel/preset-env',
                  // 配置信息
                  {
                    // 要兼容的目标浏览器
                    targets: {
                      chrome: '58',
                      ie: '11',
                    },
                    // 指定corejs的版本
                    // package.json中的版本为3.8.1
                    corejs: '3',
                    // 使用corejs的方式，"usage" 表示按需加载
                    useBuiltIns: 'usage',
                  },
                ],
              ],
            },
          },
          'ts-loader',
        ],
        // 要排除的文件
        exclude: /node-modules/,
      },
      {
        test: /\.(css|scss|sass)$/i,
        use: ['style-loader', 'css-loader'],
      },
      // Shaders
      {
        test: /\.(glsl|vs|fs)$/,
        loader: 'ts-shader-loader',
      },
    ],
  },

  // 配置Webpack插件
  plugins: [
    // new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: './src/index.html',
    }),
    // Copy entire directory
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, './static') }],
    }),

    new ESLintPlugin({
      context: './src', // 检查目录
      extensions: ['js', 'jsx', 'ts', 'tsx'], // 文件扩展
    }),
  ],
  // 用来设置引用模块
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // 包太大会提示你
  performance: {
    hints: false,
  },
}
