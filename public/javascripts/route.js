'use strict'

angular.module('app.sift.*', ['app.sift.dashboard'
                              ,'app.sift.screener'
                              ,'app.sift.watch'
                              ,'app.sift.aeWatchlist'
                              ]);

angular.module('app.sift', ['ngRoute','ngMaterial','app.sift.*']).
  config(['$routeProvider',function($routeProvider) {
    $routeProvider.
      when('/s', {templateUrl:'javascripts/dashboard/dashboard.html',controller:'dashboardCtrl'}).
      when('/d', {templateUrl:'javascripts/screener/screener.html',controller:'screenerCtrl'}).
      when('/', {templateUrl:'javascripts/watch/watch.html',controller:'watchCtrl'}).
      when('/ae/:id?', {templateUrl:'javascripts/aewatchlist/aewatchlist.html',controller:'aeWatchlistCtrl'}).
      when('/t', {templateUrl:'javascripts/test.html',controller:'testCtrl'}).
      otherwise({redirectTo:'/'});
  },
  ])                       
.config(['$mdThemingProvider',function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('blue');
    //.dark();
    
}]);
 
;
 