const axios = require('axios');
const _ = require('lodash');
const path = require('path');
const convert = require('xml-js');

const _requestObject = require(path.join(__dirname, '..', 'data', 'soapEnvelope'));
const _stations = require(path.join(__dirname, '..', 'data', 'stations'));
const settingsService = require(path.join(__dirname, '..', 'services', 'settingsService'));

const API_TOKEN = process.env.API_TOKEN;

const addHeader = function (requestObject) {
  const header = {
    'typ:AccessToken': {
      'typ:TokenValue': {
        _text: API_TOKEN
      }
    }
  };
  _.set(requestObject, ['soap:Envelope', 'soap:Header'], header);
  return requestObject;
};

const addBody = function (settings, requestObject) {
  const { crs, nbRows, timeOffset, timeWindow, filterType, filterCrs } = settings;
  const body = {
    'ldb:GetDepBoardWithDetailsRequest': {
      'ldb:crs': {
        _text: crs
      },
      'ldb:nbRows': {
        _text: nbRows
      },
      'ldb:timeOffset': {
        _text: timeOffset
      },
      'ldb:timeWindow': {
        _text: timeWindow
      }
    }
  };
  if (!_.isNil(filterType) && !_.isNil(filterCrs)) {
    _.set(body, ['ldb:filterType'], filterType);
    _.set(body, ['ldb:filterCrs'], filterCrs);
  }
  _.set(requestObject, ['soap:Envelope', 'soap:Body'], body);
  return requestObject;
};

const getRequestObject = function (settings) {
  let requestObject = _.cloneDeep(_requestObject);
  requestObject = addHeader(requestObject);
  requestObject = addBody(settings, requestObject);
  return requestObject;
};

_.mixin({
  deepMapKeys: function (obj, fn) {
    const x = {};
    _.forOwn(obj, function (v, k) {
      if (_.isPlainObject(v)) {
        v = _.deepMapKeys(v, fn);
      } else if (_.isArray(v)) {
        v = _.map(v, function (i) {
          return _.deepMapKeys(i, fn);
        });
      }
      if (_.has(v, '_text')) {
        x[fn(v, k)] = _.get(v, ['_text']);
      } else {
        x[fn(v, k)] = v;
      }
    });
    return x;
  }
});

const keyMapper = function (value, key) {
  const regexp = /lt[0-9]:([a-z]*)/;
  const newKey = key.replace(regexp, '$1');
  return newKey;
};

const getStations = function () {
  return _.sortBy(_stations, ['name']);
};

const trainDecorator = function (_train) {
  const trainDestinationName = _.get(_train, ['destination', 'location', 'locationName']);
  let callingPoints = _.get(_train, ['subsequentCallingPoints', 'callingPointList', 'callingPoint']);
  if (_.isObject(callingPoints) && !_.isArray(callingPoints)) {
    callingPoints = [callingPoints];
  }
  const train = _.pick(_train, ['std', 'etd', 'platform']);

  _.set(train, 'destination', trainDestinationName);
  _.set(train, 'callingPoints', callingPoints);
  return train;
};

const getDeparturesFromXML = function (xml, crs) {
  const resultObject = convert.xml2js(xml, { compact: true, nativeType: true });
  let stationBoardWithDetails = _.get(resultObject, ['soap:Envelope', 'soap:Body', 'GetDepBoardWithDetailsResponse', 'GetStationBoardResult']);
  stationBoardWithDetails = _.deepMapKeys(stationBoardWithDetails, keyMapper);
  const trains = _.get(stationBoardWithDetails, ['trainServices', 'service']);
  const newTrains = _.map(trains, trainDecorator);
  const station = _.find(_stations, { code: crs });
  return { trains: newTrains, stationInfo: station };
};

const getDepartureBoard = function (settingsObj) {
  const settings = settingsService.getValues(settingsObj);
  const crs = _.get(settings, ['crs']);
  const requestObject = getRequestObject(settings);
  const postData = convert.js2xml(requestObject, { compact: true });

  const options = {
    baseURL: 'https://lite.realtime.nationalrail.co.uk',
    url: '/OpenLDBWS/ldb11.asmx',
    method: 'POST',
    data: postData,
    headers: {
      'Content-Type': 'text/xml',
      SOAPAction: 'http://thalesgroup.com/RTTI/2015-05-14/ldb/GetDepBoardWithDetails',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return axios(options)
    .then(function (res) {
      const xmlDepartureBoard = res.data;
      return getDeparturesFromXML(xmlDepartureBoard, crs);
    });
};

module.exports = {
  getDepartureBoard: getDepartureBoard,
  getStations: getStations
};
