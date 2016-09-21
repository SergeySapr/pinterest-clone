'use strict';

(function () {
var apiUrl = appUrl + '/api/:id/polls';
 angular
   .module('voterApp', [])
   .controller('pollListController', ['$scope',  function ($scope) {
      $scope.polls = [{id:"20",pollName: 'TestPoll 1'},{id:"15",pollName: 'TestPoll 2'}]
   }]);

})();
