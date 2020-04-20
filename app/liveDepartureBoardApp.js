require('moment');
require('jquery');
require('angular');
require('angular-popeye');

angular.module('liveDepartureBoardApp', ['pathgather.popeye']);

require('./directives/stationSelect.js');
require('./views/MainController.js');
require('./views/SettingsController.js')
require('./scripts/services.js');
