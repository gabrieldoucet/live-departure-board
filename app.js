const bodyParser = require('body-parser');
const cors       = require('cors');
const express    = require('express');
const app        = express();
const _          = require('lodash');
const path       = require('path');

const soapHelper = require(path.join(__dirname, 'soap-helper.js'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'app')));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/departures', function (req, res) {
  var crs = _.get(req.body, 'crs').toUpperCase();
  soapHelper.getDepartureBoard(crs, function (departures) {
    res.json(departures);
  });
});

module.exports = app;