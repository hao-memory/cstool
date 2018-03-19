module.exports = ({ options }) => {
  const plugins = {
    autoprefixer: {
      browsers: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'ie >= 9'
      ]
    }
  };
  if (options.useRem) {
    Object.assign(plugins, {
      'postcss-pxtorem': {
        rootValue: 75,
        propList: ['*'],
        minPixelValue: 2
      }
    });
  }

  return {
    sourceMap: options.sourceMap,
    plugins
  };
};
