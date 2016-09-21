'use strict';

(function () {
var apiUrl = appUrl + '/api/:id/clicks';
 angular
   .module('voterApp', [])
   .controller('clickController', ['$scope','$http', function ($scope,$http) {
         console.log("about to launch get click");
         $scope.getClicks = function () {
               $http.get(apiUrl).then(function(response){
                  console.log("results:",response);
                  $scope.pollsCount = response.data;
               })
            }
         $scope.getClicks();
         $scope.addPoll = function () {
               $http.post(apiUrl).then($scope.getClicks())
         };
         $scope.resetPolls = function () {
               $http.delete(apiUrl).then($scope.getClicks())
         };
   }])
      .controller('pollListController', ['$scope', '$http', function ($scope,$http) {
         $scope.getPolls = function () {
               $http.get("/api/:id/polls").then(function(response) {
                  $scope.polls = response.data
               })
         };
         $scope.getPolls();
         
      //$scope.polls = [{id:"20",pollName: 'TestPoll 1'},{id:"15",pollName: 'TestPoll 2'}]
   }]);

})();
