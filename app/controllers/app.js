'use strict';

(function() {
    angular
        .module('voterApp', ['ui.bootstrap', 'toggle-switch', 'ui.router', 'chart.js'])
        .config(function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/polls');

            $stateProvider

            // HOME STATES AND NESTED VIEWS ========================================
                .state('home', {
                    url: '/polls',
                    templateUrl: 'public/partials/polllist.htm',
                    controller: 'pollListController'
                })
                .state('poll', {
                    url: '/poll/:pollid',
                    templateUrl: 'public/partials/poll.htm',
                    controller: 'pollViewController'
                })
                .state('editpoll', {
                    url: '/editpoll/:pollid',
                    templateUrl: 'public/partials/editpoll.htm',
                    controller: 'pollEditController'
                })
                .state('newpoll', {
                    url: '/editpoll/:pollid',
                    templateUrl: 'public/partials/editpoll.htm',
                    controller: 'pollEditController'
                })

        })
        .factory('PollService', function($http) {
            return {
                currentUser: undefined,
                pollCount: 0,
                getAllPolls: function() {
                    return $http.get("/api/polls")
                },
                getPoll: function(id) {
                    return $http.get("/api/polls/" + id)
                },
                createPoll: function(poll) {
                    return $http({
                        method: 'POST',
                        url: 'api/polls/new',
                        data: poll
                    })
                },
                savePoll: function(poll) {
                    $http({
                        method: 'POST',
                        url: 'api/polls',
                        data: poll
                    }).then(function(response) {
                        console.log("posted,", response)
                    })
                },
                deletePoll: function(pollID) {
                    console.log("launched delete from service", pollID)
                    return $http.delete("api/polls/" + pollID)
                        // .then(function(response) {
                        //     console.log("deleted,", response)
                        // })
                },
                vote: function(pollid, optionid) {
                    console.log("processed vote in service", pollid, optionid)
                    return $http.post("/api/vote?isNewOption=false&pollid=" + pollid + "&optionid=" + optionid)
                },
                addOptionWithVote: function(pollid, optionText) {
                    console.log("processed adding option with vote in service", pollid, optionText)
                    optionText = optionText.replace(" ", "+");
                    return $http.post("/api/vote?isNewOption=true&pollid=" + pollid + "&optionText=" + optionText)
                },
                getCurrentUser: function() {
                    return $http.get('/api/currentuser')
                },
                resolve: {
                    isNew: function($stateParams) {
                        if ($stateParams.pollid) return false
                        else return true;
                    }
                }
            }
        })
        .factory('UserService', function($http) {
            return {
                getCurrentUser: function() {
                    return $http.get('/api/currentuser')
                }
            }
        })
        .controller('masterController', function($scope, $http, $state, UserService, PollService) {
            //$scope.currentUserID = "mock ID"
            UserService.getCurrentUser().then(function(response) {
                $scope.currentUserID = response.data.google.id
            })
            $scope.pollCount = PollService.pollCount;
            $scope.deletePoll = function(pollID) {
                console.log("launched delete from controller,", pollID)
                PollService.deletePoll(pollID);
                $state.reload(); //$state.go('home')
            }
        })
        .controller('pollListController', ['$scope', 'PollService', 'UserService', '$http', function($scope, PollService, UserService, $http) {
            //get poll data via the service
            //if (!PollService.currentUser) PollService.initCurrentUser();
            //$scope.currentUserID = PollService.currentUser
            // PollService.getCurrentUser().then(function(response){
            //   $scope.currentUserID = response.data.id
            // });
            $scope.refresh = function() {
                    PollService.getAllPolls().then(function(response) {
                        $scope.polls = response.data;
                        $scope.pollsCount = $scope.polls.length;
                        //PollService.pollCount = $scope.polls.length; //pass to service to be accessible in other controllers
                        $scope.recalcChartAll();
                    });
                } //implement voting
            $scope.refresh();
            $scope.recalcChartAll = function() {
                //calculate the votecount for each poll by summarizing the votecounts for options 
                $scope.polls.forEach(function(poll, num, array) {
                    array[num].voteCount = 0;
                    array[num].index = num;
                    array[num].labels = [];
                    array[num].data = [];
                    array[num].options.forEach(function(option, index, options) {
                        array[num].voteCount += option.voteCount
                        array[num].labels.push(option.optionName)
                        array[num].data.push(option.voteCount)
                    }, 0)
                })
            }
            $scope.recalcChartOnePoll = function(pollindex) {
                $scope.polls[pollindex].labels = [];
                $scope.polls[pollindex].data = [];
                $scope.polls[pollindex].options.forEach(function(option, index, options) {
                    $scope.polls[pollindex].labels.push(option.optionName)
                    $scope.polls[pollindex].data.push(option.voteCount)
                }, 0)
            }
            $scope.vote = function(pollid, optionid, pollindex, optionindex) {
                console.log("launched vote in controller", pollid, optionid)
                PollService.vote(pollid, optionid).then(function(response) {
                    console.log("VOTE CALLBACK")
                        //manually increment the votecount and redraw the chart to avoid complete screen refresh (which collapses the accordion)
                        //can implement the full scope refresh from db later on some trigger (eg when the accordion closes)
                    console.log(response)
                    $scope.needsUpdate = true;
                    $scope.polls[pollindex].options[optionindex].voteCount++;
                    $scope.polls[pollindex].voteCount++;
                    $scope.recalcChartOnePoll(pollindex);
                })

            }
            $scope.addOptionWithVote = function(pollid, pollIndex, optionText) {
                PollService.addOptionWithVote(pollid, optionText); //add to db
                $scope.polls[pollIndex].options.push({
                    "optionName": optionText,
                    "voteCount": 1
                }); //add locally, for speed
                $scope.recalcChartOnePoll(pollIndex);

            }
            $scope.refreshPoll = function(pollid, index) {
                PollService.getPoll(pollid).then(function(response) {
                    var updatedPoll = {};
                    updatedPoll = response.data;
                    updatedPoll.labels = [];
                    updatedPoll.data = [];
                    updatedPoll.options.forEach(function(option, index) {
                        updatedPoll.labels.push(option.optionName)
                        updatedPoll.data.push(option.voteCount)
                    })
                    $scope.polls.splice(index, 1, updatedPoll)
                        //console.log($scope.labels,$scope.data)
                });
            }
        }])
        .controller('pollViewController', function($scope, $state, $stateParams, UserService, PollService) {
            $scope.refresh = function(pollid, index) {
                PollService.getPoll($stateParams.pollid).then(function(response) {
                    $scope.poll = response.data;
                    $scope.labels = [];
                    $scope.data = [];
                    $scope.active = true;
                    $scope.poll.options.forEach(function(option, index) {
                            $scope.labels.push(option.optionName)
                            $scope.data.push(option.voteCount)
                        })
                        //console.log($scope.labels,$scope.data)
                });
            }
            $scope.refresh();

            // PollService.getCurrentUser().then(function(response){
            //   $scope.currentUserID = response.data.id 
            // });
            //$scope.currentUser = "mock ID"
            $scope.vote = function(pollid, optionid) {
                console.log("launched vote in controller", pollid, optionid)
                PollService.vote(pollid, optionid).then(function(response) {
                    console.log("VOTE CALLBACK")
                    $scope.refresh();
                })

            }
            $scope.test = function() {
                console.log("testing");
            };
            $scope.chartOptions = {

            }

        })
        .controller('pollEditController', function($scope, $state, $stateParams, PollService) {
            if ($stateParams.pollid) var isNew = false;
            else var isNew = true;
            $scope.refresh = function() {
                    PollService.getPoll($stateParams.pollid).then(function(response) {
                        $scope.poll = response.data
                    });
                }
                // PollService.getCurrentUser().then(function(response){
                //   $scope.currentUserID = response.data.id 
                // });
            $scope.savePoll = function() {
                if (isNew) {
                    PollService.createPoll($scope.poll).then(function(response) {
                        console.log("server response:", response)
                        $stateParams.pollid = response.data.google._id;
                        $scope.refresh();
                    })

                }
                else PollService.savePoll($scope.poll)
            }
            $scope.test = function() {
                console.log("testing");
                $scope.pollName = "HUrrah!"
            };

            if (isNew) $scope.poll = {
                pollName: "",
                pollQuestion: "",
                options: [],
                userId: $scope.currentUserID
            };
            else $scope.refresh()


            $scope.addOption = function() {
                $scope.poll.options.push({
                    optionName: "",
                    voteCount: 0
                });
            };
            // $scope.deletePoll= function() {
            //     console.log("launched delete from controller,",$scope.poll)
            //     PollService.deletePoll($scope.poll)
            // },
            $scope.deleteOption = function(optId) {
                if ($scope.poll.options[optId].voteCount > 0) {
                    var r = confirm("Really delete the option? " + $scope.poll.options[optId].voteCount + " people have voted for it");
                    if (r == true) {
                        $scope.poll.options.splice(optId, 1);
                    }
                }
                else $scope.poll.options.splice(optId, 1);
            };
        })

})();
