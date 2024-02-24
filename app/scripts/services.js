const angular = require("angular");
const _ = require("lodash");

angular
  .module("liveDepartureBoardApp")
  .factory("dataService", dataService)
  .factory("settingsService", settingsService);

dataService.$inject = ["$http", "settingsService"];
settingsService.$inject = ["$rootScope"];

function dataService($http, settingsService) {
  const getDepartureBoard = function () {
    const settings = settingsService.getSettings();
    return $http({
      method: "POST",
      url: "/api/departure-board",
      data: { settings: settings },
    }).then(function (res) {
      return res.data;
    });
  };

  const getStations = function () {
    return $http({
      method: "GET",
      url: "/api/stations",
    }).then(function (res) {
      return res.data;
    });
  };

  const loadSettings = function () {
    return $http({
      method: "GET",
      url: "/api/settings",
    }).then(function (res) {
      const settings = res.data;
      settingsService.load(settings);
    });
  };

  return {
    getDepartureBoard: getDepartureBoard,
    getStations: getStations,
    loadSettings: loadSettings,
  };
}

function settingsService($rootScope) {
  let _settings = null;

  function load(settings) {
    if (_.isNil(_settings)) {
      _settings = settings;
    }
  }

  function getSettings(selectorOrSelectors) {
    let settings;
    if (_.isNil(selectorOrSelectors)) {
      return _settings;
    } else {
      if (_.isArray(selectorOrSelectors)) {
        settings = _.map(_settings, selectorOrSelectors);
      } else if (_.isString(selectorOrSelectors)) {
        settings = _.get(_settings, [selectorOrSelectors, "value"]);
      } else {
        return {};
      }
    }
    return settings;
  }

  function applySettings(settingsObj) {
    _.forEach(settingsObj, function (value, key) {
      const eventType = key + ":updated";
      $rootScope.$broadcast(eventType, value);
      _.set(_settings, [key, "value"], value);
    });
    $rootScope.$broadcast("settings:changed");
  }

  return {
    getSettings: getSettings,
    applySettings: applySettings,
    load: load,
  };
}
