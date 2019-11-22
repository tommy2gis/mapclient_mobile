var webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const lessToJs = require("less-vars-to-js");
// const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
// const options = {
//     antDir: path.join(__dirname, './node_modules/antd'),
//     stylesDir: path.join(__dirname, './src/themes/style'),
//     varFile: path.join(__dirname, './src/themes/style/theme.less'),
//     mainLessFile: path.join(__dirname, './src/components/platformApp.less'),
//     themeVariables: ['@primary-color'],
//     indexFileName: 'platform.html'
//   }

//   const themePlugin = new AntDesignThemePlugin(options);
// 获取自己定义的要覆盖antd默认样式的文件
const themeVariables = lessToJs(
  fs.readFileSync(path.join(__dirname, "./src/themes/style/theme.less"), "utf8")
);

module.exports = {
  //配置服务器
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    disableHostCheck:true,
    contentBase: "./public",
    port: 8080,
    proxy: {
            "/mobile/*": {
              target: 'http://localhost:10001',
              changeOrigin: true 
            },
            "ArcGIS/*":{
                target: 'http://218.2.102.206',
                changeOrigin: true
            }
            
        }
  },
  entry: {
    "babel-polyfill": ["babel-polyfill"],
    // "map": './src/mapapp.js',
    mobile: "./src/index_mobile.jsx"
  },
  output: {
    path: __dirname + "/build",
    filename: "bundle-[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [".js", ".jsx"]
        },
        loader: "babel-loader",
        query: {
          plugins: [
            "transform-runtime",
            ["import", [{ style: "css", libraryName: "antd-mobile" }]],
            ["import", { libraryName: "antd", style: true }]
          ],
          presets: ["es2015", "react", "stage-2"]
        }
      },

      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },

          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
              modifyVars: themeVariables
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[path][name].[ext]",
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  // plugins: [themePlugin],
  devtool: "cheap-module-source-map"
};
