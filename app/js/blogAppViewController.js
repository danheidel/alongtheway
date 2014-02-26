var blogAppViewController = angular.module ('blogAppViewController', []);

blogAppViewController.controller('post_View_Ctrl', function ($scope, $http, $routeParams, $location) {

  	function getYELP() {
  		return $.ajax({
  			url: '/getyelp'
  		});
  	};
/////
/////
  	$.when(getYELP()).done(function(results) {
  		console.log($scope.City);
  		var yelp_Data = results.businesses;
  		$scope.list = yelp_Data;
	    if (!$scope.$$phase && !$scope.$root.$$phase) {
	        $scope.$apply();
	    }	
  		// $scope.list = angular.copy(yelp_Data); 
  		console.log($scope.list);
    });



});
