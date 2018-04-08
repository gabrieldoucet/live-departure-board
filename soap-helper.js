require('dotenv').config();
const _          = require('lodash');
const axios      = require('axios');
const xml2js     = require('xml2js');

const API_TOKEN = process.env.API_TOKEN;
const CRS = process.env.CRS;

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
  var newTrain = changeTrainKeys(train);
  newTrain = _.pick(newTrain, ['std', 'etd', 'platform']);
  _.set(newTrain, 'destination', trainDestinationName);
  return newTrain;
};

var trainsToJS = function (trains) {
  var newTrains = _.map(trains, decorateTrain);
  return newTrains;
};

var getDeparturesFromXML = function (xml, callback) {
  xml2js.parseString(xml, function (err, result) {
    var body = get(result, ['soap:Envelope', 'soap:Body']);
    var departureBoardResponse = get(body, ['GetDepartureBoardResponse']);
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
      <ldb:GetDepartureBoardRequest>
         <ldb:numRows>10</ldb:numRows>
         <ldb:crs>${crs}</ldb:crs>
         <ldb:timeOffset>0</ldb:timeOffset>
         <ldb:timeWindow>60</ldb:timeWindow>
      </ldb:GetDepartureBoardRequest>
   </soap:Body>
</soap:Envelope>`

  const options = {
    baseURL: 'https://lite.realtime.nationalrail.co.uk',
    url: '/OpenLDBWS/ldb11.asmx',
    method: 'POST',
    data: postData,
    headers: {
      'Content-Type': 'text/xml',
      'SOAPAction': 'http://thalesgroup.com/RTTI/2012-01-13/ldb/GetDepartureBoard',
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