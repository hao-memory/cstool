import webpack from 'webpack';
import ora from 'ora';
import rm from 'rimraf';
import getWebpackConfig from './webpack.config';
import config from './config';


const spinner = ora('webpack dist-local 构建过程开始！！！');
export default (args, callback) => {
  const webpackConfig = getWebpackConfig(args);

  webpackConfig.output.path = config.build.assetsLocalRoot;
  delete webpackConfig.externals;

  const compiler = webpack(webpackConfig);

  rm(config.build.assetsLocalRoot, (error) => {
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
};
