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

            $scope.lessons = {};

            $scope.searchTech = function(url) {
                Meteor.promise('searchTech', url).then(function(result) {
                    _.forEach(result, function(tf, term) {
                        var lessonsObj = Lessons.findOne({ "courseCategory": term });
                        $scope.lessons[term] = lessonsObj;
                    });
                });
            };
        }
    ]);
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        wappalyzer = Meteor.npmRequire('wappalyzer');
    });

    // function urlGetter(url) {

    // }

    // var wrappedUrlGetter = Async.wrap(urlGetter);

    Meteor.methods({
        searchTech: function(url) {
            var searchPromise = Q.defer();

            var options = {
                url: url,
                debug: true,
            };
            var result = {};
            // console.log(options);
            wappalyzer.detectFromUrl(options, function(err, apps, appInfo) {
                var appTerms = {};
                _.forEach(apps, function(app) {
                    var terms = app.split(" ");
                    _.forEach(terms, function(term) {
                        var term = term.toLowerCase();
                        appTerms[term] = true;
                    });
                });

                console.log('app terms', appTerms);
                searchPromise.resolve(appTerms);
            });

            return searchPromise.promise;
            // console.log('methods response', response);
            // return response;
        }
    });
}