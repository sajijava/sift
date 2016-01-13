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
	
	$scope.handleDrop = function() {
        alert('Item has been dropped');
    }
	
	$scope.suggestions = [];
	
	$scope.suggestions.push({"id":"1","State":"Alabama","zip":"0000001"});
	$scope.suggestions.push({"id":"2","State":"Alaska","zip":"0000002"});
	$scope.suggestions.push({"id":"3","State":"New Jersey","zip":"0000003"});
	$scope.suggestions.push({"id":"4","State":"New York","zip":"0000004"});
	$scope.suggestions.push({"id":"5","State":"Colorado","zip":"0000005"});
	$scope.suggestions.push({"id":"6","State":"Utah","zip":"0000006"});
	$scope.suggestions.push({"id":"7","State":"California","zip":"0000007"});
	
	$scope.keyPress = function($event){
					console.log($event)
					
				}
	
}]);

$('#div,#inputtext').keyup(function(event){
    console.log(event.keyCode);
});


test.directive('draggable',function(){
		return function(scope, element){
			
			var el = element[0];
			el.draggable = true;
			el.addEventListener('dragstart', function(e){
				
				//effectAllowed dataTransfer property means that we're specifying the
				//item being dragged is to be moved when it's dropped,
				e.dataTransfer.effectAllowed = 'move';
				
				//Putting the id of the element into the dataTransfer data will mean
				//that we can get the element when a drop event occurs
				e.dataTransfer.setData('t',this.id);
				
				this.classList.add('drag');
				
				return false;
			},false);
			
			el.addEventListener('dragend', function(e){
				
					this.classList.remove('drag');
				
					return false;
					
				},false);
			
		}
	});

test.directive('droppable', function(){
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
							var item = document.getElementById(e.dataTransfer.getData("t"));
							
							this.appendChild(item);
							
							scope.$apply('drop()');
							return false;
								
						},false);
				}
		}
});

test.directive('typeAheadText', function(){
		return {
			restrict:'E',
			transclude:true,
			scope:{
				datalist:'=',
				displayfield:'@'
			},
			template:"test:<div ng-keypress='keyPress' class='lrspacing' tabindex='1'>{{value}}</div>",
			controller:function($scope){
				$scope.value = "Please type";
				$scope.keyPress = function($event){
					console.log($event)
					$scope.value += $event.keyCode;
				}
			}
		
	}
				
		
});