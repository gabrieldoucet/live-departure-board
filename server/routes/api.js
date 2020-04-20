const express = require('express');
const _ = require('lodash');
const path = require('path');
const router = new express.Router();

const DEFAULT_STATION_CODE = process.env.DEFAULT_STATION_CODE;

const trainService = require(path.join(__dirname, '..', 'services', 'trainService'));

const mockData = require(path.join(__dirname, '..', 'data', 'mockData'));
const _settings = require(path.join(__dirname, '..', 'data', 'settings'));
if (!_.isNil(DEFAULT_STATION_CODE)) {
  _.set(_settings, ['crs', 'value'], DEFAULT_STATION_CODE);
}

router.post('/departure-board', function (req, res) {
  const settings = _.get(req, ['body', 'settings']);
  trainService.getDepartureBoard(settings).then(function (departures) {
    res.json(departures);
  });
});

router.get('/mock', function (req, res) {
  res.json(mockData);
});

router.get('/stations', function (req, res) {
  const stations = trainService.getStations();
  res.json(stations);
});

router.get('/settings', function (req, res) {
  res.json(_settings);
});

module.exports = router;
