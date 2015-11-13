var test = angular.module('app.sift.test', ['ui.grid','ngDragDrop']);

test.controller('testCtrl',['$scope','$mdDialog',function($scope,$mdDialog){
	$scope.dragList = [];
	$scope.dropList = [];
	
	$scope.dragList.push("AAAAA");
	$scope.dragList.push("BBBBB");
	$scope.dragList.push("CCCCC");
	$scope.dragList.push("DDDDD");
	$scope.dragList.push("EEEEE");
	$scope.dragList.push("FFFFF");
	$scope.dragList.push("GGGGG");
	
}]);
