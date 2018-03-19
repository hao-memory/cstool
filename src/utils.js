import { existsSync } from 'fs';
import { posix, join } from 'path';
import glob from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import config from './config';

const isProduction = process.env.NODE_ENV === JSON.parse(config.build.env.NODE_ENV);

const getEntries = function (options) {
  const {
    cwd,
    local,
    env,
    server
  } = options;
  const exec = local ? join(cwd, 'src/modules/*/index-local.js') : join(cwd, 'src/modules/*/index.js');
  const entries = {};
  const paths = glob.sync(exec);
  const exclude = /common/;
  let filename;
  paths.forEach(function (singlePath) {
    if (exclude && exclude.test(singlePath)) {
      return;
    }
    filename = singlePath.split('/');
    filename = filename[filename.length - 2];
    entries[filename] = [singlePath];

    if (!server) {
      entries[filename].unshift('babel-polyfill');
      const configPath = join(cwd, `config/config.${env}.js`);
      if (existsSync(configPath)) {
        entries[filename].unshift(configPath);
      }
    }
  });
  return entries;
};

const getHtmlWebpackPlugins = function (options) {
  const {
    entry = {},
    cwd,
    extract,
    local,
    env
  } = options;
  const plugins = [];
  Object.keys(entry).forEach(function (name) {
    const pluginConfig = {};
    const modulePath = join(cwd, 'src', 'modules', name);
    const configFile = join(modulePath, 'config.json');

    pluginConfig.domain = `${config.cdnMapping.others.cdn}.${config.environment[env].domain}`;
    pluginConfig.aureuma_domain = config.environment[env].aureuma_domain;

    if (existsSync(configFile)) {
      const perConfig = require(configFile);   // eslint-disable-line
      pluginConfig.title = perConfig.title;
    }

    let template;
    if (local) {
      template = join(modulePath, 'index-local.html');
      if (existsSync(template)) {
        pluginConfig.template = template;
      } else {
        template = join(cwd, 'src', 'template-local.html');
        if (existsSync(template)) {
          pluginConfig.template = template;
        }
      }
    } else {
      template = join(modulePath, 'index.html');
      if (existsSync(template)) {
        pluginConfig.template = template;
      } else {
        template = join(cwd, 'src', 'template.html');
        if (existsSync(template)) {
          pluginConfig.template = template;
        }
      }
    }

    // 每个页面生成一个html
    const plugin = new HtmlWebpackPlugin(Object.assign({}, {
      filename: `${name}.html`,
      inject: 'body',
      chunks: extract ? ['manifest', 'vendor', name] : [name]
    }, pluginConfig));

    plugins.push(plugin);
  });
  return plugins;
};

const assetsPath = function (_path) {
  return posix.join(config.build.assetsSubDirectory, _path);
};

const cssLoaders = function (opts) {
  const options = opts || {};

  const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
      minimize: isProduction,
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
      sourceMap: options.sourceMap,
      config: {
        path: require.resolve('./postcss.config.js'),
        ctx: opts
      }
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = [cssLoader, postcssLoader];
    if (loader) {
      loaders.push({
        loader: require.resolve(`${loader}-loader`),
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: require.resolve('vue-style-loader')
      });
    }
    return [require.resolve('vue-style-loader')].concat(loaders);
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

// Generate loaders for standalone style files (outside of .vue)
const styleLoaders = function (options) {
  const output = [];
  const loaders = cssLoaders(options);
  Object.keys(loaders).forEach((extension) => {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader
    });
  });
  return output;
};

const vueLoaders = function (opts, babelConfig) {
  return {
    loaders: {
      ...cssLoaders(opts),
      js: {
        loader: require.resolve('babel-loader'),
        options: babelConfig
      }
    },
    cssSourceMap: opts.sourceMap,
    transformToRequire: {
      video: 'src',
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  };
};

/**
 * Merge custom config from `webpack.config.js`
 * @param webpackConfig {Object}
 * @param customConfigPath {String}
 */
const mergeCustomConfig = function (webpackConfig, customConfigPath) {
  if (!existsSync(customConfigPath)) {
    return webpackConfig;
  }

  const customConfig = require(customConfigPath); //eslint-disable-line
  /* eslint prefer-rest-params:0 */
  if (typeof customConfig === 'function') {
    return customConfig(webpackConfig, ...[...arguments].slice(2));
  }

  throw new Error(`Return of ${customConfigPath} must be a function.`);
};

export default {
  getEntries,
  getHtmlWebpackPlugins,
  assetsPath,
  cssLoaders,
  styleLoaders,
  vueLoaders,
  mergeCustomConfig
};
