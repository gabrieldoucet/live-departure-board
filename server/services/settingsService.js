const _ = require("lodash");

const getValues = function (settingsObj) {
  return _.mapValues(settingsObj, function (setting) {
    return _.get(setting, ["value"]);
  });
};

module.exports = {
  getValues: getValues,
};
