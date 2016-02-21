Lessons = new Mongo.Collection('lessons');

if (Meteor.isClient) {

    // This code only runs on the client
    angular.module('learn-to-code', ['angular-meteor', 'ui.router']);

    angular.module('learn-to-code').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function($urlRouterProvider, $stateProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $stateProvider
                .state('landingPage', {
                    url: '/',
                    templateUrl: 'landing-page.html',
                    controller: 'landingPageCtrl'
                })
                .state('lessons', {
                    url: '/lessons/:url',
                    controller: 'searchTechCtrl',
                    templateUrl: 'results.html',
                    resolve: {
                        lessons: function($stateParams) {
                            var url = $stateParams['url'];
                            return Meteor.promise('searchTech', url);
                        }
                    }
                });

            $urlRouterProvider.otherwise("/");
        }
    ]);

    angular.module('learn-to-code').controller('landingPageCtrl', ['$scope', '$state', '$meteor',
        function($scope, $state, $meteor) {

            $scope.searchPage = true;

            $scope.enterSearchTerm = function(url) {
                $state.go('lessons', { 'url': url });
            };
        }
    ]);

    angular.module('learn-to-code').controller('searchTechCtrl', ['$scope', '$meteor', 'lessons',
        function($scope, $meteor, lessons) {

            $scope.lessons = {};
            _.forEach(lessons, function(tf, term) {
                var lessonsObj = Lessons.findOne({ "courseCategory": term });
                $scope.lessons[term] = lessonsObj;
            });
        }
    ]);
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        wappalyzer = Meteor.npmRequire('wappalyzer');
    });

    Meteor.methods({
        searchTech: function(url) {
            var searchPromise = Q.defer();

            var options = {
                url: url,
                debug: true,
            };
            var result = {};

            wappalyzer.detectFromUrl(options, function(err, apps, appInfo) {
                var appCount = 0;
                _.forEach(apps, function(app) {
                    var terms = app.split(" ");
                    _.forEach(terms, function(term) {
                        appCount ++;
                    });
                });

                var appTerms = {};
                _.forEach(apps, function(app) {
                    var terms = app.split(" ");
                    _.forEach(terms, function(term) {
                        var term = term.toLowerCase();
                        appTerms[term] = true;
                    });
                    if (_.keys(appTerms).length === appCount) {
                        searchPromise.resolve(appTerms);
                    }
                });
            });

            return searchPromise.promise;
        }
    });
}