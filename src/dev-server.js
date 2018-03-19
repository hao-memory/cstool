import { join } from 'path';
import webpack from 'webpack';
import proxyMiddleware from 'http-proxy-middleware';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import express from 'express';
import opn from 'opn';
import getWebpackConfig from './webpack.config';
import config from './config';

export default (args) => {
  const webpackConfig = getWebpackConfig(args);

  webpackConfig.output.filename = '[name].js';

  Object.keys(webpackConfig.entry).forEach((name) => {
    webpackConfig.entry[name] = [require.resolve('./dev-client')].concat(webpackConfig.entry[name]);
  });

  webpackConfig.plugins = [...webpackConfig.plugins, new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin(), new FriendlyErrorsPlugin()];

  // default port where dev server listens for incoming traffic
  const port = args.port || config.server.port;

  // Define HTTP proxies to your custom API backend
  // https://github.com/chimurai/http-proxy-middleware
  const proxyTable = webpackConfig.devServer ? webpackConfig.devServer.proxy || {} : {};

  const app = express();
  const compiler = webpack(webpackConfig);

  // handle fallback for HTML5 history API
  const historyApiFallback = webpackConfig.devServer ? webpackConfig.devServer.historyApiFallback || {} : {};
  app.use(require('connect-history-api-fallback')(historyApiFallback));

  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  });

  const hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: false,
    heartbeat: 2000
  });
  // force page reload when html-webpack-plugin template changes
  compiler.plugin('compilation', (compilation) => {
    compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
      hotMiddleware.publish({ action: 'reload' });
      cb();
    });
  });

  // proxy api requests
  Object.keys(proxyTable).forEach((context) => {
    let options = proxyTable[context];
    if (typeof options === 'string') {
      options = { target: options };
    }
    app.use(proxyMiddleware(options.filter || context, options));
  });

  // serve webpack bundle output
  app.use(devMiddleware);

  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware);

  // serve pure static assets
  const staticPath = join(config.server.assetsPublicPath, config.server.assetsSubDirectory);
  app.use(staticPath, express.static('./static'));

  const uri = `http://localhost:${port}`;

  console.log('> Starting dev server...');
  devMiddleware.waitUntilValid(() => {
    console.log(`> Listening at ${uri}\n`);
    if (args.autoOpenBrowser) {
      opn(uri);
    }
  });

  app.listen(port);
};
