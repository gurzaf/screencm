const { reportBase, field } = require('../SCREENS_API.json');

const generateURL = value => {
  const params = {};
  params[field] = value;
  const encoded = encodeURIComponent(JSON.stringify(params));
  return `${reportBase}?params=${encoded}`;
};

const start = () => {
  ['vcPYhGtXkypZK3FHBm49', 'oUASI78pcTdV3OILclZU'].forEach(value => {
    console.log(generateURL(value));
  });
};

start();
