const angular = require('angular');
const moment = require('moment');

angular.module('liveDepartureBoardApp')
  .controller('MainController', mainController);

mainController.$inject = ['$scope', '$timeout', 'Popeye', 'dataService', 'settingsService'];

function mainController ($scope, $timeout, Popeye, dataService, settingsService) {
  const vm = this;

  vm.lastUpdate = '';
  vm.controls = {
    play: true
  };

  vm.toggleUpdate = function () {
    vm.controls.play = !vm.controls.play;
  }

  vm.toggleSettings = function () {
    Popeye.openModal({
      templateUrl: './views/settings.html',
      controller: 'SettingsController as vm',
      resolve: {
        settings: function (settingsService) {
          return settingsService.getSettings();
        }
      }
    });
  }

  const tick = function () {
    vm.clock = moment().utcOffset(1).format('HH:mm:ss');

    $timeout(function () {
      tick();
    }, 1000)
  }

  const getDepartureBoard = function () {
    dataService.getDepartureBoard()
      .then(function (data) {
        vm.lastUpdate = moment().utcOffset(1).format('HH:mm:ss');
        vm.trains = data.trains;
        vm.stationInfo = data.stationInfo;
      });
  };

  const refreshBoard = function () {
    $timeout(function () {
      if (vm.controls.play) {
        getDepartureBoard();
      }
      refreshBoard();
    }, 15000);
  };

  $scope.$on('crs:updated', function (event, newCrs) {
    vm.crs = newCrs;
  });

  $scope.$on('settings:changed', function () {
    getDepartureBoard();
  });

  dataService.loadSettings().then(function () {
    vm.crs = settingsService.getSettings('crs');
    tick();
    refreshBoard();
    getDepartureBoard();
  });
}
