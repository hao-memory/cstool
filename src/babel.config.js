export default (args = {}) => {
  const use = ['stg', 'prd'].indexOf(args.env) > -1;
  const browsers = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR',
    'ie >= 9'
  ];
  if (args.useRem) {
    browsers.push('iOS >= 7', 'Android >= 4.1');
  }

  const config = {
    babelrc: false,
    compact: false,
    cacheDirectory: true,
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          modules: false,
          targets: {
            browsers
          },
          useBuiltIns: 'usage'
        }
      ]
    ],
    plugins: [
      require.resolve('babel-plugin-transform-vue-jsx'),
      require.resolve('babel-plugin-transform-object-rest-spread')
    ]
  };

  if (use) {
    config.plugins.push(require.resolve('babel-plugin-lodash'));
  }

  return config;
};
