var userInfo = angular.module('app.sift.userInfo', []);

userInfo.directive("userInfo",[function(){
   
   return {
        restrict: 'E',
        replace:true,
        scope: {
        },
				controller:['$scope',function($scope){
					$scope.currDateTime = new Date();
					$scope.userName = 'Saji'
				}],
        templateUrl:'./javascripts/common/userInfo.html'
   }
}]);