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
                    url: '/learnToBuild/:url',
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

            document.body.className = "dontShowBackgroundImage";
            $scope.searchPage = true;

            $scope.enterSearchTerm = function(url) {

                var url = url.replace('https://', '');
                var url = url.replace('http://', '');

                $state.go('lessons', { 'url': url });
            };
        }
    ]);

    angular.module('learn-to-code').controller('searchTechCtrl', ['$scope', '$meteor', 'lessons', '$stateParams',
        function($scope, $meteor, lessons, $stateParams) {

            document.body.className = "showBackgroundImage";

            console.log(lessons);
            $scope.url = $stateParams['url'];

            $scope.lessons = {};

            $scope.valid = false;

            _.forEach(lessons, function(tf, term) {

                console.log(term);
                var category = term;

                term = term.toLowerCase();

                if (term === "ruby on rails") {
                    term = "rails";
                }

                if (term.length >= 3) {
                    var lessonsObj = Lessons.findOne({ "courseCategory": term });

                    console.log(lessonsObj);

                    if (typeof lessonsObj !== 'undefined') {
                        var lessonsToReturn = [];

                        var courses = lessonsObj['courseInfo'];

                        _.forEach(courses, function(course) {
                            if (course['course_level'] === "Beginner" || "Intermediate") {
                                var scaler = 1;
                                if (course['course_level'] === "Beginner") {
                                    scaler = 3;
                                }

                                course['courseScore'] = scaler * course['course_rating'] * parseInt(course['num_ratings']);
                                lessonsToReturn.push(course);
                            }
                        });

                        var sortedLessons = _.sortBy(lessonsToReturn, function(o) {
                            return o.courseScore;
                        }).reverse();

                        $scope.lessons[category] = sortedLessons;
                        $scope.valid = true;
                    }
                }
            });


            // $scope.lessons = sortedLessons;
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

            var searches = ['http://', 'https://'];

            for (var index in searches) {
                var search = searches[index];

                var urlToSearch = search + url;
                console.log(urlToSearch);

                var options = {
                    url: urlToSearch,
                    debug: true,
                };

                wappalyzer.detectFromUrl(options, function(err, apps, appInfo) {
                    console.log(err);
                    console.log(apps);
                    console.log(appInfo);

                    if (typeof appInfo !== "undefined") {
                        if (_.keys(appInfo).length > 0) {
                            console.log('resolve');
                            searchPromise.resolve(appInfo);
                        } else {
                            searchPromise.resolve({});
                        }
                    } else {
                        if (search === 'https://') {
                            console.log('didnt resolve');
                            searchPromise.resolve({});
                        }
                    }

                });

                return searchPromise.promise;
            }
        }
    });
}