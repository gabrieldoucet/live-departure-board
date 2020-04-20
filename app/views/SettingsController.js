const angular = require('angular');
const _ = require('lodash');
const moment = require('moment');

angular.module('liveDepartureBoardApp')
  .controller('SettingsController', settingsController);

settingsController.$inject = ['$scope', 'Popeye', 'settingsService', 'settings'];

function settingsController ($scope, Popeye, settingsService, settings) {
  const vm = this;
  vm.settings = settings;
  vm.display = {};
  vm.newSettings = {};
  vm.newSettings.crs = _.get(settings, ['crs', 'value']);
  vm.newSettings.nbRows = _.get(settings, ['nbRows', 'value']);
  vm.newSettings.timeOffset = _.get(settings, ['timeOffset', 'value']);
  vm.newSettings.timeWindow = _.get(settings, ['timeWindow', 'value']);
  
  vm.applySettings = function () {
    settingsService.applySettings({
      crs: vm.newSettings.crs,
      nbRows: vm.newSettings.nbRows,
      timeOffset: vm.newSettings.timeOffset,
      timeWindow: vm.newSettings.timeWindow,
      filterCrs: vm.newSettings.filterCrs,
      filterType: vm.newSettings.filterType
    });
    Popeye.closeCurrentModal();
  }

  const updateDisplay = function () {
    const now = moment();
    const startMoment = moment(now).add(vm.newSettings.timeOffset, 'minutes');
    const endMoment = moment(startMoment).add(vm.newSettings.timeWindow, 'minutes');
    vm.display.startTime = startMoment.format('HH:mm');
    vm.display.endTime = endMoment.format('HH:mm');
  }

  $scope.$watch('vm.newSettings', function () {
    updateDisplay();
  }, true);
}
