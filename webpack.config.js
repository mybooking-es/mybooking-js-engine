/* eslint-disable no-undef */
const webpack = require('webpack');
const path = require('path');

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
      entry: './src/app.js',
      mode: 'development',
      output: {
        path: path.resolve(__dirname, 'dist/js'),
        library: 'mybookingJsEngine', // export library as mybookingJSEngine
        environment: {
          arrowFunction: false,
        }
      },
      resolve: {
        modules: ['node_modules', 'src/lib', 'src/common']
      },
      optimization: {
        // We no not want to minimize our code.
        minimize: false,
        splitChunks: {
          cacheGroups: {
            main: {
              test:  path.resolve(__dirname, 'src'),
              name: 'main',
              filename: 'mybooking-js-engine.js',
              chunks: 'all',
            },
          },
        },
      },
      devtool: 'inline-source-map',
   },

   // WordPress Plugin
   {
      entry: './src/app-bundle.js',
      mode: 'production',
      output: {
        path: path.resolve(__dirname, 'dist/js'),
        library: 'mybookingJsEngine', // export library as mybookingJSEngine
        environment: {
          arrowFunction: false,
        }
      },
      resolve: {
        modules: ['node_modules', 'src/lib', 'src/common']
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
              '$':'jquery',
              'jQuery':'jquery',
              'window.jQuery':'jquery'
            })
      ],
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: [
              path.resolve(__dirname, 'node_modules'),
              path.resolve(__dirname, 'src/lib'),
              path.resolve(__dirname, 'src/common'),
            ],
            use: {
              loader: 'babel-loader',
            },
          },
        ],
      },
      optimization: {
        minimize: true,
        splitChunks: {
          cacheGroups: {
            main: {
              test:  path.resolve(__dirname, 'src'),
              name: 'main',
              filename: 'mybooking-js-engine-bundle.js',
              chunks: 'all',
            },
          },
        },
      },
   }
];
