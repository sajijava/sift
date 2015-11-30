var tabdir = angular.module('app.sift.watchlist.table', ['ui.grid']);

tabdir.directive("watchlistTable",[function(){
   
   return {
       restrict: 'E',
        replace:true,
        scope: {
                gridData:'=',
								save:'&',
								remove:'&',
								cancel:'&',
        },
        controller: ['$scope',function($scope){
		
					$scope.currentGrid = [];
					$scope.header = [];
					$scope.isEditable = false;
					
					$scope.currentGrid = $scope.data;
					
					var makeHeader = function(){
						var first = $scope.data[0];
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
					$scope.$watch('data',function(){
						scope.currentGrid = $scope.data;
						makeHeader();
						},true);

				}],
        templateUrl:'./javascripts/common/WatchlistTable.html'
   }
}]);
