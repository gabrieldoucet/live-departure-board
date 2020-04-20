require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
var helmet = require('helmet');
const app = express();
const path = require('path');

const apiRouter = require(path.join(__dirname, 'routes', 'api.js'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(helmet());
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use('/api', apiRouter);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'dist', 'views', 'index.html'));
});

module.exports = app;
