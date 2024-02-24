const axios = require("axios");
const _ = require("lodash");
const path = require("path");

const settingsService = require(
  path.join(__dirname, "..", "services", "settingsService")
);

const _stations = require(path.join(__dirname, "..", "data", "stations"));
const API_TOKEN = process.env.API_TOKEN;

const getRequestParams = function (settings) {
  const { nbRows, timeOffset, timeWindow, filterType, filterCrs } = settings;
  const params = {
    numRows: nbRows,
    timeOffset: timeOffset,
    timeWindow: timeWindow,
  };
  if (!_.isNil(filterType) && !_.isNil(filterCrs)) {
    _.set(params, ["filterType"], filterType);
    _.set(params, ["filterCrs"], filterCrs);
  }
  return params;
};

const getStations = function () {
  return _.sortBy(_stations, ["name"]);
};

const trainDecorator = function (_train) {
  const trainDestinationName = _.get(_train, [
    "destination",
    "0",
    "locationName",
  ]);
  let callingPoints = _.get(_train, [
    "subsequentCallingPoints",
    "0",
    "callingPoint",
  ]);
  const train = _.pick(_train, ["std", "etd", "platform"]);

  _.set(train, "destination", trainDestinationName);
  _.set(train, "callingPoints", callingPoints);
  return train;
};

const getDepartures = function (trainServices, crs) {
  const newTrains = _.map(trainServices, trainDecorator);
  const station = _.find(_stations, { code: crs });
  return { trains: newTrains, stationInfo: station };
};

const getDepartureBoard = function (settingsObj) {
  const settings = settingsService.getValues(settingsObj);
  console.log(settings);
  const params = getRequestParams(settings);
  const crs = _.get(settings, ["crs"]);
  const options = {
    baseURL: "https://api1.raildata.org.uk/1010-live-departure-board-dep/LDBWS",
    url: `api/20220120/GetDepBoardWithDetails/${crs}`,
    method: "GET",
    headers: {
      "x-apikey": `${API_TOKEN}`,
      Accept: "application/json",
    },
    params: params,
  };

  return axios(options)
    .then(function (res) {
      const trainServices = _.get(res.data, ["trainServices"]);
      return getDepartures(trainServices, crs);
    })
    .catch((error) => {
      console.error(error.message);
    });
};

module.exports = {
  getDepartureBoard: getDepartureBoard,
  getStations: getStations,
};
