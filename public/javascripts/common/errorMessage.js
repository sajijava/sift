var errormsg = angular.module('app.sift.errormessage', []);

errormsg.directive("errorMessage",[function(){
   
   return {
        restrict: 'E',
        replace:true,
        scope: {
					errorcode:'='
        },
        templateUrl:'./javascripts/common/errorMessage.html'
   }
}]);