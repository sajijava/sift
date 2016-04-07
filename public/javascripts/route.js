'use strict'

angular.module('app.sift.*', ['app.sift.dashboard'
                              ,'app.sift.screener'
                              ,'app.sift.watch'
                              ,'app.sift.aeWatchlist'
                              ,'app.sift.errormessage'
                              ,'app.sift.userInfo'
                              /*,'app.sift.test'*/
                              ]);

angular.module('app.sift', ['ngRoute','ngMaterial','app.sift.*'])
  .config(['$routeProvider',function($routeProvider) {
    $routeProvider.
      when('/d', {templateUrl:'javascripts/dashboard/dashboard.html',controller:'dashboardCtrl'}).
      when('/s', {templateUrl:'javascripts/screener/screener.html',controller:'screenerCtrl'}).
      when('/p', {templateUrl:'javascripts/watch/watch.html',controller:'watchCtrl'}).
      when('/ae/:id?', {templateUrl:'javascripts/aewatchlist/aewatchlist.html',controller:'aeWatchlistCtrl'}).
      when('/t', {templateUrl:'javascripts/test.html',controller:'testCtrl'}).
      otherwise({redirectTo:'/p'});
  }
  ])
  .controller('menuCtrl',['$scope','$location','$routeParams',
                               function($scope,$location,$routeParams){
    
    $scope.selectedPath="";
    $scope.selectedClass = function(page){
      var currentRoute = $location.path() || '/d';
      return page == currentRoute?'selected':'';
    }
  }])
/*.config(['$mdThemingProvider',function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('cyan');
    //.dark();
    
}]);
 
;

*/

 