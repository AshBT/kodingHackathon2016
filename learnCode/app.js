Lessons = new Mongo.Collection('lessons');

if (Meteor.isClient) {

    // This code only runs on the client
    angular.module('learn-to-code', ['angular-meteor', 'ui.router']);

    angular.module('learn-to-code').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function($urlRouterProvider, $stateProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $stateProvider
                .state('search', {
                    url: '/search',
                    templateUrl: 'search-tech.html',
                    controller: 'searchTechCtrl'
                }).state('lessons', {
                    url: '/lessons',
                    template: '<lessons></lessons>'
                });

            $urlRouterProvider.otherwise("/search");
        }
    ]);

    angular.module('learn-to-code').controller('searchTechCtrl', ['$scope', '$meteor',
        function($scope, $meteor) {

            $scope.lessons = $meteor.collection(Lessons);

            $scope.results = [];

            $scope.searchTech = function(url) {
                Meteor.call('searchTech', url, function(results) {
                    console.log(results);
                    if ('apps' in results) {
                        _.forEach(results['apps'], function(app) {
                            $scope.results.push(app);
                        });
                    }
                });
            };
        }
    ]);
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        wappalyzer = Meteor.npmRequire('wappalyzer');
    });

    Meteor.methods({
        searchTech: function(url) {
            var options = {
                url: url,
                debug: true,
            };
            var result = {};
            console.log(options);
            wappalyzer.detectFromUrl(options, function(err, apps, appInfo) {
                console.log(apps);
                console.log(appInfo);
                result['apps'] = apps;
                result['appInfo'] = appInfo;
                return result;
            });
        }
    });
}