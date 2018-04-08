angular.module('liveDepartureBoard', [])

.controller('mainController', ['$scope', '$http', '$timeout',
  function ($scope, $http, $timeout) {

    $scope.crs = "HYN";
    $scope.lastUpdate;

    $scope.getNowAsString = function () {
      function checkTime(i) {
          if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
          return i;
      }

      var today = new Date();
      var h = today.getHours();
      var m = today.getMinutes();
      var s = today.getSeconds();
      m = checkTime(m);
      s = checkTime(s);

      return h + ":" + m + ":" + s;
    };

    $scope.tick = function() {
      $scope.clock = $scope.getNowAsString();

      $timeout(function(){
          $scope.tick();
      }, 1000)
    }

    $scope.refreshTrains = function() {
      // Nasty hack to get round IE's tendency to cache the page!
      $http({
        method: 'POST',
        url: 'http://localhost:8080/departures',
        data: {crs: $scope.crs}
      }).then(function(res) {
        $scope.lastUpdate = $scope.getNowAsString();
        $scope.trains = res.data;
      });

      $timeout(function(){
        $scope.refreshTrains();
      }, 10000)
    };

  $scope.tick();
  $scope.refreshTrains();
}]);