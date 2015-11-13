var aewatchlist = angular.module('app.sift.aeWatchlist', ['ui.grid','ngDragDrop']);

aewatchlist.controller('aeWatchlistCtrl',['$scope','aeWatchlistService','$mdDialog','$routeParams',
																					function($scope,aeWatchlistService,$mdDialog,$routeParams){
	$scope.aeWatchlistForm = {};
	$scope.sourceFields = [];
	
	if(angular.isUndefined($routeParams.id)){
		$scope.aeWatchlistForm.table = []	
	}
	
	aeWatchlistService.getSourceFields()
	.then(function(d){
		$scope.sourceFields = d;	
	})
	
	$scope.dropCallback = function(event, ui, idx) {
    console.log(ui);
		console.log(event);
		console.log(idx);
	};
	$scope.dragCallback = function(event, ui) {
   // console.log(ui);
		//console.log(event);
	};
}]);

aewatchlist.factory('aeWatchlistService',['$http','$q',function($http,$q){
	
	var urlPrefix = '/api';
	
	var callHttp = function(config){
		var defer = $q.defer();
		
		$http(config)
		.success(function(d){ defer.resolve(d) })
		.error(  function(d){ defer.reject(d)  })
		
		return defer.promise;
	}
	return{
			getSourceFields : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/template/fieldlist"})}
			
	}
}]);