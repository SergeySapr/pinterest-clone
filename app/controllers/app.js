'use strict';

(function() {
    angular
        .module('pinterestApp', ['ui.bootstrap', 'wu.masonry', 'ui.router','xeditable','ngTagsInput'])
        .config(function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/home');

            $stateProvider

            // HOME STATES AND NESTED VIEWS ========================================
                .state('home', {
                    url: '/home',
                    templateUrl: 'public/partials/imagewall.htm',
                    controller: 'imageWallController'
                })
                // .state('poll', {
                //     url: '/poll/:pollid',
                //     templateUrl: 'public/partials/poll.htm',
                //     controller: 'pollViewController'
                // })
                .state('userimages', {
                    url: '/user/:userid',
                    templateUrl: 'public/partials/oneuserimagewall.htm',
                    controller: 'userImagesController',
                                resolve: {
                PreviousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                        return currentStateData;
                    }
                ]
            },
                })
                .state('viewimage', {
                    url: '/image/:imageid',
                    templateUrl: 'public/partials/viewimage.htm',
                    controller: 'imageViewController',
                                resolve: {
                PreviousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                        return currentStateData;
                    }
                ]
            },
                })
                .state('editimage', {
                    url: '/editimage/:imageid',
                    templateUrl: 'public/partials/editimage.htm',
                    controller: 'imageEditController',
                                resolve: {
                PreviousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                        return currentStateData;
                    }
                ]
            },
                })
                .state('newimage', {
                    url: '/editimage/:imageid',
                    templateUrl: 'public/partials/editimage.htm',
                    controller: 'imageEditController'
                })
                // .state('newpoll', {
                //     url: '/editpoll/:pollid',
                //     templateUrl: 'public/partials/editpoll.htm',
                //     controller: 'pollEditController'
                // })

        })
        .factory('ImageService', function($http) {
            return {
                currentUser: undefined,
                pollCount: 0,
                getAllImages: function() {
                    return $http.get("/api/images")
                },
                getUserImages: function(userid) {
                    return $http.get("/api/"+userid+"/images")
                },
                getImage: function(id) {
                    return $http.get("/api/images/" + id)
                },
                createImage: function(image) {
                    return $http({
                        method: 'POST',
                        url: 'api/images/new',
                        data: image
                    })
                },
                saveImage: function(image) {
                    return $http({
                        method: 'POST',
                        url: 'api/images',
                        data: image
                    }).then(function(response) {
                        console.log("posted,", response)
                    })
                },
                // savePoll: function(poll) {
                //     $http({
                //         method: 'POST',
                //         url: 'api/polls',
                //         data: poll
                //     }).then(function(response) {
                //         console.log("posted,", response)
                //     })
                // },
                deleteImage: function(imageID) {
                    console.log("launched delete from service", imageID)
                    return $http.delete("api/images/" + imageID)
                        // .then(function(response) {
                        //     console.log("deleted,", response)
                        // })
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
                },
                getUserList: function(){
                    return $http.get('/api/users')
                }
            }
        })
        .controller('masterController', function($scope, $http, $state, $window,UserService, ImageService) {
            //$scope.currentUserID = "mock ID"
            UserService.getCurrentUser().then(function(response) {
                //console.log(response.data.google)
                $scope.currentUser = {}
                $scope.currentUser.ID = response.data.google.id
                $scope.currentUser.displayName = response.data.google.name
            })
            $scope.deleteImage = function(imageID) {
                ImageService.deleteImage(imageID)
            }
             $scope.goBack = function(){
                $window.history.back();
            }
        })
        .controller('imageWallController', ['$scope', 'ImageService', 'UserService', '$http', function($scope, ImageService, UserService, $http) {
            //get image data via the service
            $scope.refresh = function() {
                ImageService.getAllImages().then(function(response) {
                    $scope.images = response.data;
                    $scope.imageCount = $scope.images.length;
                });
            }
            $scope.refresh();

        }])
        .controller('userImagesController', ['$scope', '$stateParams','ImageService', 'UserService', '$http', function($scope, $stateParams,ImageService, UserService, $http) {
            //get image data via the service
            $scope.refresh = function() {
                ImageService.getUserImages($stateParams.userid).then(function(response) {
                    $scope.images = response.data;
                    $scope.imageCount = $scope.images.length;
                });
            }
            $scope.refresh();

        }])
        .controller('imageEditController', function($scope, $state, $stateParams, ImageService,PreviousState) {
            if ($stateParams.imageid) var isNew = false;
            else var isNew = true;
            $scope.refresh = function() {
                ImageService.getImage($stateParams.imageid).then(function(response) {
                    $scope.image = response.data
                });
            }
            $scope.saveImage = function() {
                if (isNew) {
                    ImageService.createImage($scope.image).then(function(response) {
                        console.log("server response:", response)
                        $stateParams.imageid = response.data.google._id;
                        $scope.refresh();
                    })

                }
                else 
                console.log("launching image save, json:",$scope.image)
                ImageService.saveImage($scope.image)
                $state.go('home');
            }

            if (isNew) $scope.image = {
                imageDesc: '',
                linkUrl: '',
                tags: [],
                likes: 0,
                userId: $scope.currentUserID
            };
            else $scope.refresh()

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
        .controller('imageViewController', function($scope, $state, $stateParams, ImageService,PreviousState) {
            $scope.refresh = function() {
                ImageService.getImage($stateParams.imageid).then(function(response) {
                    $scope.image = response.data
                });
            }
            $scope.refresh();
        })
        .directive('editableCollection', function factory($compile) {
    return {
        link: function (scope, el, attrs, controller) {

            //parse the element and attributes
            if (!attrs.expandingOn) {
                throw 'Expected exanding-on attribute on element: '
                    + el.html() + '\n but found: '
                    + JSON.stringify(attrs.$attr) + '\n';
            }

            var split = attrs.editableCollection.split(' ');
            var elementName = split[0];
            var collectionName = split[2];

            if (split.length != 3 || split[1] != 'in') {
                throw 'Expected editable collection defined as "{element} in {collection}" got: '
                    + attrs.editableCollection;
            }

            //Take the elements from this one to move to a child ng-repeat
            var original = el.contents();

            //Add the ng-repeat for the actual collection
            var repeater = angular.element('<div/>');
            repeater.attr('ng-repeat', attrs.editableCollection);
            repeater.append(original);
            el.append(repeater);

            //Add the ng-repeat for the overflow
            var overflowId = 'shouldBeUniquelyGeneratedToAvoidCollisions';
            console.log('Created overflow with id: '+overflowId+ ' for '+collectionName);
            scope[overflowId] = [
                {}
            ];
            var overflow = repeater.clone();
            overflow.attr('ng-repeat',
                elementName + ' in ' + overflowId);
            el.append(overflow);

            //Watch the first element and expand the overflow if needed
            scope.$watch(overflowId+'[0].' + attrs.expandingOn, function (value) {
                if (value && scope[overflowId].length < 2) {
                    scope[overflowId].push({});
                } else if ((!value) && scope[overflowId].length > 1) {
                    scope[overflowId].pop();
                }
            });

            //Watch the second element and push the first in the collection if it changes
            scope.$watch(overflowId+'[1].' + attrs.expandingOn, function (value) {
                if (value) {
                    console.log(collectionName, scope);
                    scope.$eval(collectionName).push(scope[overflowId].shift());
                }
            });

            //compile everything so that Angular can link the new stuff
            $compile(el.contents())(scope);
        }
    };
});

})();
