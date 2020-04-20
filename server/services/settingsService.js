const _ = require('lodash');

const getValues = function (settingsObj) {
  const settings = _.mapValues(settingsObj, function (setting) {
    return _.get(setting, ['value']);
  });
  return settings;
};

module.exports = {
  getValues: getValues
};
