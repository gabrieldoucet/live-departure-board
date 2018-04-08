require('dotenv').config();
const _          = require('lodash');
const axios      = require('axios');
const xml2js     = require('xml2js');
const path       = require('path');

const API_TOKEN = process.env.API_TOKEN;

const config = require(path.join(__dirname, 'config'));

const ROWS = _.get(config, 'rows');
const CRS = _.get(config, 'crs');
const TIME_WINDOW = _.get(config, 'timeWindow');

var convertKey = function (key) {
  var keyRe = /lt[0-9]:([a-z]*)/;
  var newKey = key.replace(keyRe, '$1');
  return newKey;
};

var get = function (obj, path) {
  var result = _.get(obj, path);
  if (_.isArray(result) && _.size(result) == 1) {
    return result[0]
  }
  return result;
};

var getTrainDestinationName = function (train) {
  var dest = get(train, ['lt5:destination']);
  var location = get(dest, ['lt4:location']);
  var locationName = get(location, ['lt4:locationName']);
  return locationName;
};

var getTrainCallingPoints = function (train) {
  var subsequentCallingPoints = get(train, ['lt7:subsequentCallingPoints']);
  var callingPointList = get(subsequentCallingPoints, ['lt7:callingPointList']);
  var callingPoints = get(callingPointList, ['lt7:callingPoint']);


  var newCallingPoints = _.map(callingPoints, changeCallingPointKeys);
  return newCallingPoints;
};

var changeCallingPointKeys = function (callingPoint) {
  var newCallingPoint = {};
  _.forEach(_.keys(callingPoint), function (oldKey) {
    var newKey = convertKey(oldKey);
    var value = get(callingPoint, oldKey);
    _.set(newCallingPoint, newKey, value);
  });
  return newCallingPoint;
};

var changeTrainKeys = function (train) {
  var newTrainObj = {};
  _.forEach(_.keys(train), function (oldKey) {
    var newKey = convertKey(oldKey);
    var value = get(train, oldKey);
    _.set(newTrainObj, newKey, value);
  });
  return newTrainObj;
};

var decorateTrain = function (train) {
  var trainDestinationName = getTrainDestinationName(train);
  var callingPoints = getTrainCallingPoints(train);

  var newTrain = changeTrainKeys(train);
  newTrain = _.pick(newTrain, ['std', 'etd', 'platform']);

  _.set(newTrain, 'destination', trainDestinationName);
  _.set(newTrain, 'callingPoints', callingPoints);

  if (_.isEqual(_.findIndex(callingPoints, {'crs': 'GLC'}), -1)) {
    _.set(newTrain, 'via', 'Queen Street');
  } else {
    _.set(newTrain, 'via', 'Central');
  };
  return newTrain;
};

var trainsToJS = function (trains) {
  var newTrains = _.map(trains, decorateTrain);
  // HYN specific
  var plat1Trains = _.filter(newTrains, function (train) {
    return (_.get(train, 'platform') == 1);
  });
  return plat1Trains;
};

var getDeparturesFromXML = function (xml, callback) {
  xml2js.parseString(xml, function (err, result) {
    var body = get(result, ['soap:Envelope', 'soap:Body']);
    var departureBoardResponse = get(body, ['GetDepBoardWithDetailsResponse']);
    var stationBoardResult = get(departureBoardResponse, ['GetStationBoardResult']);
    var trainServices = get(stationBoardResult, ['lt7:trainServices']);
    trains = get(trainServices, ['lt7:service']);
    newTrains = trainsToJS(trains);
    callback(newTrains);
  });
}

var getDepartureBoard = function (crs, callback) {
  crs = crs || CRS;
  var postData = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types" xmlns:ldb="http://thalesgroup.com/RTTI/2017-10-01/ldb/">
   <soap:Header>
      <typ:AccessToken>
         <typ:TokenValue>${API_TOKEN}</typ:TokenValue>
      </typ:AccessToken>
   </soap:Header>
   <soap:Body>
      <ldb:GetDepBoardWithDetailsRequest>
         <ldb:numRows>${ROWS}</ldb:numRows>
         <ldb:crs>${crs}</ldb:crs>
         <ldb:timeOffset>0</ldb:timeOffset>
         <ldb:timeWindow>${TIME_WINDOW}</ldb:timeWindow>
      </ldb:GetDepBoardWithDetailsRequest>
   </soap:Body>
</soap:Envelope>`

  const options = {
    baseURL: 'https://lite.realtime.nationalrail.co.uk',
    url: '/OpenLDBWS/ldb11.asmx',
    method: 'POST',
    data: postData,
    headers: {
      'Content-Type': 'text/xml',
      'SOAPAction': 'http://thalesgroup.com/RTTI/2015-05-14/ldb/GetDepBoardWithDetails',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  axios(options).then(function(xmlRes) {
    getDeparturesFromXML(xmlRes.data, callback);
  })
};

module.exports = {
  getDepartureBoard: getDepartureBoard
}