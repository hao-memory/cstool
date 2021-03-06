import 'event-source-polyfill';

const hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true'); // eslint-disable-line

hotClient.subscribe((event) => {
  if (event.action === 'reload') {
    window.location.reload(); // eslint-disable-line
  }
});
