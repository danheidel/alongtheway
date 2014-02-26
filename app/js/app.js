var blogApp = angular.module('blogApp', [
	'ngRoute',
	'ngResource',
	'blogAppViewController',
	]);

	blogApp.config(['$routeProvider', 
		function ($routeProvider) {
			$routeProvider.
				when('/' , {
					templateUrl: 'partials/1-col-portfolio.html',
					controller: 'post_View_Ctrl'
				});
			}]);