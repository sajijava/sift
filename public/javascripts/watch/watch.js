var watch = angular.module('app.sift.watch', ['ui.grid']);

watch.controller('watchCtrl',['$scope','watchService','$mdDialog',function($scope,watchService,$mdDialog){
	
		$scope.currentGrid = []
		$scope.watchlist = [];
		$scope.selectedWatch="";
		$scope.addSymbol = "";
		$scope.header = [];
		$scope.isEditable = false;
		


		$scope.addToList = function(){
			
			watchService.addNewWatchListData($scope.selectedWatch,$scope.addSymbol.toUpperCase())
			.then(function(d){
					$scope.currentGrid = d;
					$scope.addSymbol = "";
					$scope.isEditable = true;
					getData($scope.selectedWatch);
				})
		}
		
		$scope.save = function(){
			
			console.log($scope.currentGrid);
			
			watchService.saveWatchListData($scope.selectedWatch,$scope.currentGrid)
			.then(function(d){
				$scope.isEditable = false;
				getData($scope.selectedWatch);
			});
		}
		$scope.cancel= function(){
			$scope.isEditable = false;
			getData(w[0].id);
		}
		
		
		watchService.getWatchList()
		.then(function(w){
			$scope.watchlist = w;
			$scope.selectedWatch = w[0].id;
			/*if (typeof w != 'undefined' && w.length > 0) {
				getData(w[0].id);
			}*/
		});
		
		$scope.$watch('selectedWatch', function(newValue, oldValue){
			if (!angular.isUndefined(newValue) && newValue.length > 0) {
				getData(newValue);
			}
			});

		var getData = function(id){
			watchService.getWatchListData(id)
			.then(function(d){
					console.log(d);
					$scope.errorCode = d.errorCode
					$scope.currentGrid = d.data;
					$scope.header = [];
					makeHeader();	
			});
		}
		var makeHeader = function(){
			var first = $scope.currentGrid[0];
			for (col in first) {
				$scope.header.push(first[col].header);
			}
		}
		
		$scope.textAlign = function(col)
		{
			var align = "align-left";
			if (col.align == "L") {
				align = "align-left";
			}else if (col.align == "R") {
				align = "align-right";
			}else if (col.align == "C") {
				align = "align-center";
			}
			return align;
		}
		
		$scope.formatNumber = function(number)
		{
			number = number.toFixed(2) + '';
			x = number.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}
		$scope.remove = function(row){
			console.log(row);
			
			var symbol = row[0].data;
			var confirm = $mdDialog.confirm()
          .title('Remove...')
          .content('Would you like to remove '+symbol+' from the list?')
          .ariaLabel('Lucky day')
          
          .ok('Yes')
          .cancel('No');
					
				$mdDialog.show(confirm)
				.then(function() {
								watchService.removeFromWatchListData($scope.selectedWatch,symbol)
								.then(function(){
									getData($scope.selectedWatch);
									})
							},
							function() {
								;
						});
		
		}
		$scope.editList = function(){
			$scope.isEditable = true;
		//	getData($scope.selectedWatch);
			
		}
		
	}]);


watch.factory('watchService',['$http','$q',function($http,$q){
	
	var urlPrefix = '/api';
	
	var callHttp = function(config){
		var defer = $q.defer();
		
		$http(config)
		.success(function(d){ defer.resolve(d) })
		.error(  function(d){ defer.reject(d)  })
		
		return defer.promise;
	}
	return{
			getWatchList : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/watcher/list"})},
			getWatchListData : function(id){ return callHttp({method:'GET',url:urlPrefix+"/get/watcher/data/"+id})},
			addNewWatchListData : function(id,newSymbol){ return callHttp({method:'GET',url:urlPrefix+"/watcher/add/"+id+"/"+newSymbol})},
			saveWatchListData : function(id,data){ return callHttp({method:'POST',url:urlPrefix+"/watcher/save/"+id, data:data})},
			removeFromWatchListData : function(id,symbol){ return callHttp({method:'GET',url:urlPrefix+"/watcher/remove/"+id+"/"+symbol})},
	}
}]);

watch.filter("currencyFilter", function(){
  
  return function (value, scope) {
    return (angular.isDefined(value) && angular.isNumber(value))?('$' + value.toFixed(2)):value;
  };
});
watch.filter("percentFilter", function(){
  
  return function (value, scope) {
    return (angular.isDefined(value) && angular.isNumber(value))?(value.toFixed(2)+'%'):value;
  };
});
watch.filter('fractionFilter', function () {
  return function (value) {
    return (angular.isDefined(value) && angular.isNumber(value))?(value.toFixed(3)):value;
  };
})
