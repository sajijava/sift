var aewatchlist = angular.module('app.sift.aeWatchlist', ['ui.grid','ngDragDrop']);

aewatchlist.controller('aeWatchlistCtrl',['$scope','aeWatchlistService','$mdDialog','$routeParams',
																					function($scope,aeWatchlistService,$mdDialog,$routeParams){
	$scope.aeWatchlistForm = {};
	$scope.sourceFields = [];
	$scope.sampleGrid = [];
	$scope.header = [];
	
	aeWatchlistService.getSourceFields()
	.then(function(d){
		$scope.sourceFields = d;
		for(src in $scope.sourceFields){
			$scope.sourceFields[src].show = true;
		}
	});
	
	aeWatchlistService.getTemplateObject()
	.then(function(d){
		$scope.aeWatchlistForm = d;
	});
	
	
	$scope.dropCallback = function(d) {
		$scope.sourceFields[d].show = false;
		
		var src = $scope.sourceFields[d];
		var row = {"header":src.desc,
								"name":src.name,
								"order":$scope.aeWatchlistForm.table.length - 1,
								"type":src.type,
								"size":src.size,
								"align":src.align};
		
		$scope.aeWatchlistForm.table.push(row);
		
		aeWatchlistService.getData($scope.aeWatchlistForm)
		.then(function(d){
			$scope.sampleGrid=d;
			makeHeader();	
		})
	};
	
	var makeHeader = function(){
			$scope.header=[];
			var first = $scope.sampleGrid[0];
			for (col in first) {
				$scope.header.push(first[col].header);
			}
		}
	$scope.dragCallback = function(event, ui) {
   // console.log(ui);
		//console.log(event);
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
			getTemplateObject : function(){ return callHttp({method:'GET',url:urlPrefix+"/get/template/object"})}
			
	}
}]);

aewatchlist.directive('draggable',function(){
		return {
			scope:{
				data:'='
			},
			link:function(scope, element,attrs){
			
			var el = element[0];
			el.draggable = true;
			el.addEventListener('dragstart',function(e){
				
				//effectAllowed dataTransfer property means that we're specifying the
				//item being dragged is to be moved when it's dropped,
				e.dataTransfer.effectAllowed = 'move';
				
				console.log(scope.data);
				//Putting the id of the element into the dataTransfer data will mean
				//that we can get the element when a drop event occurs
				var dragData = scope.$eval(attrs.index);
				e.dataTransfer.setData('d',dragData);
				
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