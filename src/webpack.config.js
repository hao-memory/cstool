import { join, resolve } from 'path';
import { existsSync } from 'fs';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CDNPlugin from './cdnPlugin';
import getBabelConfig from './babel.config';
import { getEntries, getHtmlWebpackPlugins, assetsPath, styleLoaders, vueLoaders, mergeCustomConfig } from './utils';
import config from './config';

export default (args) => {
  const entries = getEntries(args);

  const babelConfig = mergeCustomConfig(getBabelConfig(args), resolve(args.cwd, 'babel.config.js'));

  let webpackConfig = {
    entry: entries,
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    },
    resolveLoader: {
      modules: [join(__dirname, '../node_modules/'), 'node_modules']
    },
    module: {
      rules: [
        ...styleLoaders(args),
        {
          test: /\.vue$/,
          loader: require.resolve('vue-loader'),
          options: vueLoaders(args, babelConfig)
        },
        {
          test: /\.js$/,
          loader: require.resolve('babel-loader'),
          options: babelConfig
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: assetsPath('img/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      ]
    }
  };

  if (['stg', 'prd'].indexOf(args.env) > -1) {
    webpackConfig = webpackMerge(webpackConfig, {
      devtool: '#source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env': config.build.env
        }),
        // lodash按需加载
        new LodashModuleReplacementPlugin({
          collections: true,
          paths: true
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            drop_console: true
          },
          sourceMap: args.sourceMap
        }),
        new webpack.optimize.ModuleConcatenationPlugin()
      ]
    });
  } else {
    webpackConfig = webpackMerge(webpackConfig, {
      devtool: '#cheap-module-eval-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env': config.dev.env
        })]
    });
  }
  if (args.hash) {
    webpackConfig = webpackMerge(webpackConfig, {
      output: {
        path: config.build.assetsRoot,
        filename: assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: assetsPath('js/[id].[chunkhash].js')
      }
    });
  } else {
    webpackConfig = webpackMerge(webpackConfig, {
      output: {
        path: config.build.assetsRoot,
        filename: assetsPath('js/[name].js'),
        chunkFilename: assetsPath('js/[id].js')
      }
    });
  }


  if (args.extract) {
    webpackConfig = webpackMerge(webpackConfig, {
      plugins: [
        // extract css into its own file
        new ExtractTextPlugin({
          filename: assetsPath(args.hash ? 'css/[name].[contenthash].css' : 'css/[name].css')
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
          cssProcessor: require('cssnano'),
          cssProcessorOptions: {
            preset: 'default'
          }
        }),
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks(module, count) {
            // any required modules inside node_modules are extracted to vendor
            return (module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(join(args.cwd, 'node_modules')) === 0 && count > 2);
          }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor']
        }),
        ...getHtmlWebpackPlugins({
          cwd: args.cwd,
          entry: webpackConfig.entry,
          extract: true,
          local: args.local,
          env: args.env
        })
      ]
    });
  } else {
    webpackConfig = webpackMerge(webpackConfig, {
      plugins: getHtmlWebpackPlugins({
        cwd: args.cwd,
        entry: webpackConfig.entry,
        local: args.local,
        env: args.env
      })
    });
  }

  webpackConfig.output.publicPath = args.server ? config.server.assetsPublicPath : config.build.assetsPublicPath;

  if (args.cdn) {
    webpackConfig.output.publicPath = config.dummy_domain;
    webpackConfig = webpackMerge(webpackConfig, {
      plugins: [
        new CDNPlugin({
          env: args.env,
          cwd: args.cwd,
          packageName: args.packageName
        })
      ]
    });
  }

  if (!args.sourceMap) {
    webpackConfig.devtool = false;
  }

  if (!args.server) {
    const { staticDirPath } = config.build;
    if (existsSync(staticDirPath)) {
      webpackConfig = webpackMerge(webpackConfig, {
        plugins: [
          new CopyWebpackPlugin([
            {
              from: staticDirPath,
              to: config.build.assetsSubDirectory,
              ignore: ['.*']
            }
          ])
        ]
      });
    }
  }

  webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));

  return webpackConfig;
};
