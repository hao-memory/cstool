import ora from 'ora';
import rm from 'rimraf';
import webpack from 'webpack';
import getWebpackConfig from './webpack.config';
import config from './config';

require('./check-versions')();

const spinner = ora('webpack dist 构建过程开始！！！');
export default (params, callback) => {
  const args = { ...params };
  delete args.local;

  if (args.server) {
    require('./dev-server')(args);
  } else {
    const webpackConfig = getWebpackConfig(args);
    const compiler = webpack(webpackConfig);
    rm(config.build.assetsRoot, (error) => {
      if (error) {
        throw error;
      }

      spinner.start();
      compiler.run((err, stats) => {
        spinner.stop();

        if (err) {
          throw err;
        }
        process.stdout.write(`${stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        })}\n\n`);

        const { errors } = stats.toJson();
        if (errors && errors.length) {
          process.exit(1);
        }

        if (typeof callback === 'function') {
          callback(err);
        }
      });
    });
  }
};
