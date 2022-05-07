var webpack = require('webpack');
const path = require("path");

/**
 * https://github.com/webpack/webpack/blob/master/examples/multi-compiler/webpack.config.js
 * https://webpack.js.org/api/node/
 * -- Outside
 * https://stackoverflow.com/questions/34357489/calling-webpacked-code-from-outside-html-script-tag
 * https://webpack.js.org/configuration/output/#module-definition-systems
 * https://gist.github.com/dreyescat/c3fd66ea0f7e97ba5c21
 */

/**
 * https://webpack.js.org/concepts/entry-points/
 * https://webpack.js.org/concepts/output/
 */
module.exports = [
   // Full engine
   {
      name: "mybooking-js-engine",
      entry: "./src/app.js",
      output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: "mybooking-js-engine.js"
      },
      resolve: {
        modules: ["node_modules", "src/lib", "src/common"]
      }
      ,
      optimization: {
        // We no not want to minimize our code.
        minimize: false
      },
      devtool: 'inline-source-map',
   },
   // WordPress Plugin
   {
      name: "mybooking-js-engine-bundle",
      entry: "./src/app-bundle.js",
      output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: "mybooking-js-engine-bundle.js",
        library: "mybookingJsEngine" // export library as mybookingJSEngine
      },
      resolve: {
        modules: ["node_modules", "src/lib", "src/common"]
      },
      externals: {
          // External jquery to link the variable jquery to ProvidePlugin 'jQuery'
          'jquery': 'jQuery',
          'jquery.ui': 'jQuery',
          'moment': 'moment',
          'moment-timezone': 'moment',
          lodash: {
                 commonjs: 'lodash',
                 commonjs2: 'lodash',
                 amd: 'lodash',
                 root: '_',
          }
      },      
      plugins: [
        // Use jquery without loading it
        new webpack.ProvidePlugin({
              "$":"jquery",
              "jQuery":"jquery",
              "window.jQuery":"jquery"
            })
      ]/*,
      optimization: {
          // We no not want to minimize our code.
          minimize: false
      }
      */
      

   }
];
