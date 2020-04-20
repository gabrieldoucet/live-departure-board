const angular = require('angular');
angular.module('liveDepartureBoardApp')
  .directive('stationSelect', stationSelect);

function stationSelect () {
  return {
    templateUrl: './directives/station-select.html',
    transclude: true,
    scope: {
      stationCode: '='
    },
    controller: stationSelectController,
    controllerAs: 'vm',
    bindToController: true
  };
}

stationSelectController.$inject = ['dataService'];

function stationSelectController (dataService) {
  const vm = this;
  vm.stations = {};
  dataService.getStations().then(function (stations) {
    vm.stations = stations;
  });
}
