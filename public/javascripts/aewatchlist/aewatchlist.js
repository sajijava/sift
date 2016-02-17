var aewatchlist = angular.module('app.sift.aeWatchlist', ['ui.grid','ngDragDrop','ngRoute','ngMaterial']);

aewatchlist.controller('aeWatchlistCtrl',['$scope','aeWatchlistService','$mdDialog','$mdMedia','$routeParams','$route',
																					function($scope,aeWatchlistService,$mdDialog,$mdMedia,$routeParams,$route){
	$scope.aeWatchlistForm = {};
	$scope.sourceFields = [];
	$scope.sampleGrid = [];
	$scope.header = [];
	$scope.saved  = false;
	$scope.dataTypes = {}
	$scope.mathOps = {}
	
	aeWatchlistService.getSourceFields()
	.then(function(d){
		$scope.sourceFields = d;
		for(src in $scope.sourceFields){
			$scope.sourceFields[src].show = true;
		}
	});
	
	aeWatchlistService.getDataTypes()
	.then(function(d){
		$scope.dataTypes = d;
	})

	aeWatchlistService.getMathops()
	.then(function(d){
		$scope.mathOps = d;
	})

	
	
	var initPage = function(){
		
			aeWatchlistService.getTemplateObject($routeParams.id)
			.then(function(d){
				$scope.aeWatchlistForm = d;
				var templateColMap = {};
				for(row in $scope.aeWatchlistForm.table){
					templateColMap[$scope.aeWatchlistForm.table[row].name]={}
				}
				for(src in $scope.sourceFields){
					if (templateColMap[$scope.sourceFields[src].name] !== undefined) {
						$scope.sourceFields[src].show = false
					}
				}
				
				//getData();
			});

	}
	
	initPage();
	
	
	/*
	 * Add columns
	 **/
	$scope.addColumn = function(d) {
		var dropItem = d.split(":");
		if (dropItem.length > 1 && dropItem[0] == "sourceFields") {
			
			var idx = dropItem[1];
			$scope.sourceFields[idx].show = false;
			
			var src = $scope.sourceFields[idx];
			var row = {"header":src.desc,
									"name":src.name,
									"order":$scope.aeWatchlistForm.table.length - 1,
									"type":src.type,
									"size":src.size,
									"align":src.align};
			
			$scope.aeWatchlistForm.table.push(row);
			getData();
		}
	};
	
	var getData = function(){
		aeWatchlistService.getData($scope.aeWatchlistForm)
		.then(function(d){
			$scope.sampleGrid=d;
			makeHeader();	
		})
		
	}
	var makeHeader = function(){
			$scope.header=[];
			var first = $scope.sampleGrid[0];
			for (col in first) {
				if (first[col].name != 'symbol') {
					$scope.header.push({"header":first[col].header,"name":first[col].name});
				}
			}
		}
	$scope.removeColumn= function(d) {
		
		for(src in $scope.sourceFields){
			if ($scope.sourceFields[src].name == d) {
				$scope.sourceFields[src].show = true;
				break;
			}
		}
		
		for(idx in $scope.aeWatchlistForm.table){
			if ($scope.aeWatchlistForm.table[idx].name == d) {
				$scope.aeWatchlistForm.table.splice(idx,1);
				break;
			}
		}
		getData();
	};
	
	
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
		
	$scope.save = function(){
		aeWatchlistService.saveData($scope.aeWatchlistForm)
		.then(function(d){
			$scope.saved = d.success;
		})
	}
	$scope.clear = function(){
		$route.reload();
		$window.refresh();
	}



	/*
	 * Add New input column
	 **/

	var addInputColumn = function(newColumn){
		var align = "R";
		if (newColumn.type == 'T') {
			align = "L";
		}
		
		var newCol = {"header":newColumn.desc,
								"name":newColumn.name,
								"order":99,
								"type":newColumn.type,
								"size":newColumn.size,
								"source":"I",
								"align":align};
		
		$scope.aeWatchlistForm.table.push(newCol);
		getData();
	}
	
	$scope.customFullscreen = $mdMedia('sm');
	
	$scope.addInputField = function(ev){
	 $mdDialog.show({
      controller: addInputDialogController,
      templateUrl: 'javascripts/aewatchlist/addinput.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm') && $scope.customFullscreen,
			locals:{
				dataTypes : $scope.dataTypes
			}
    })
    .then(function(newInput) {
			console.log(newInput);
			addInputColumn(newInput);
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
	};
	var addInputDialogController = function($scope,$mdDialog,dataTypes){
		$scope.newInput = {};
		$scope.dataTypes=dataTypes;
		$scope.saveNewColumn = function(){
			$mdDialog.hide($scope.newInput);
		}
		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}
	
	/*
	 * Add new formula
	 **/

	$scope.addFormulaField = function(ev){
	 $mdDialog.show({
      controller: addFormulaDialogController,
      templateUrl: 'javascripts/aewatchlist/addformula.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm') && $scope.customFullscreen,
			locals :{
				sourceFields : $scope.sourceFields,
				mathOps : $scope.mathOps
				
			}
    })
    .then(function(newInput) {
			console.log(newInput);
			addInputColumn(newInput);
    }, function() {
      
    });
	};
	var addFormulaDialogController = function($scope,$mdDialog, sourceFields, mathOps){
		$scope.newInput = {};
		$scope.sourceFields = sourceFields;
		$scope.mathOperations = mathOps;
		$scope.formula = [];
		$scope.saveNewColumn = function(){
			$mdDialog.hide($scope.newInput);
		}
		$scope.cancel = function(){
			$mdDialog.cancel();
		}
		$scope.makeFormula = function(d){
			var idSplit = d.split(":");
			if (idSplit.length > 1) {
				var source = idSplit[0];
				var idx = idSplit[1];
				
				if (source == 'sourceFields') {
					var item = $scope.sourceFields[idx];
					$scope.formula.push({'key':item.name,'value':item.desc});
				}else if (source == 'functions') {
					var item = $scope.mathOperations.functions[idx];
					$scope.formula.push({'key':item,'value':item});
				}else if (source == 'operations') {
					var item = $scope.mathOperations.operations[idx];
					$scope.formula.push({'key':item,'value':item});
				}
			}
			console.log($scope.formula);
					
		}
		$scope.formulaText = "";
		$scope.keyPress = function($event){
				console.log($event);
				
			}
		
		
	}
	
	
	
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
			getSourceFields : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/template/fieldlist"})},
			getData : function(data){ return callHttp({method:'POST',url:urlPrefix+"/get/template/sampledata",data:data})},
			getTemplateObject : function(id){ return callHttp({method:'GET',url:urlPrefix+"/get/template/object/"+id})},
			getDataTypes : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/template/datatypes"})},
			getMathops : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/template/mathops"})},
			
			saveData : function(data){ return callHttp({method:'POST',url:urlPrefix+"/get/template/savetemplate",data:data})},
			
	}
}]);

aewatchlist.directive('expItem',function(){
	return {
		restrict:'E',
		transclude:true,
		scope:{
			key:'=',
			value:'=',
			remove:'&'
		},
		template:"<span ng-keypress='keyPress' class='lrspacing'>{{value}}</span>",
		controller:function($scope){
			$scope.keyPress = function($event){
				console.log($event)
			}
		}
		
	}
});

aewatchlist.directive('draggable',function(){
		return {
			link:function(scope, element,attrs){
			
			var el = element[0];
			el.draggable = true;
			el.addEventListener('dragstart',function(e){
				
				//effectAllowed dataTransfer property means that we're specifying the
				//item being dragged is to be moved when it's dropped,
				e.dataTransfer.effectAllowed = 'move';
				
				//console.log(scope.data);
				//Putting the id of the element into the dataTransfer data will mean
				//that we can get the element when a drop event occurs
				//var dragData = scope.$eval(attrs.index);
				e.dataTransfer.setData('d',attrs.index);
				
				console.log("drag data "+attrs.index);
				
				this.classList.add('drag');
				
				return false;
			});
			
			el.addEventListener('dragend',function(e){
				
					this.classList.remove('drag');
				
					return false;
					
			});
			
			/*$scope.$watch(attr.draggable,function(n){
				element.bind('dragstart',onDragStart);
				element.bind('dragend',onDragEnd);
			})*/
			
		}
		}
		
	});

aewatchlist.directive('droppable', function(){
		return {
				scope:{
					drop:'&'
				},
				link:function(scope, element){
					var el = element[0];
					
					
					el.addEventListener('dragover',function(e){
						
						// the dropEffect property of dataTransfer to "move", the same as we set effectAllowed
						//in the dragstart event. If these values didn't match the browser wouldn't let us drop
						//the item into the bin.
						e.dataTransfer.dropEffect = 'move';
						
						if (e.preventDefault)
							e.preventDefault();
						
						this.classList.add('over');
						
						return false;
						
						
						},false);
					
					el.addEventListener('dragenter',function(e){
							this.classList.add('over');
							return false;
				
						},false);
				
					el.addEventListener('dragleave',function(e){
							this.classList.remove('over');
							return false;
				

						},false);
					
					el.addEventListener('drop',function(e){
							if (e.stopPropagation)
								e.stopPropagation();
								
							this.classList.remove('over');
							
							//get the item element from the id that we put into the dataTransfer in the
							//dragstart event & append it to the droppable element
							var droppedData = e.dataTransfer.getData("d");
							console.log(droppedData);
							
							
							scope.$apply(function(scope){
								var func = scope.drop();
								if (angular.isDefined(func)) {
									func(droppedData);
								}
								});
							return false;
								
						},false);
				}
		}
});


