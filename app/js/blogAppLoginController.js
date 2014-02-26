var blogAppLoginController = angular.module ('blogAppLoginController', []);

blogAppLoginController.controller('login_View_Ctrl', function ($scope, $http, $location) {

	$scope.login = function() {
		var jSON_packet = JSON.stringify({username:$scope.username,
			password:$scope.password});

		$http.post('/login', jSON_packet).success(function (response) {
			if(response==="Authenticated"){
				$location.path("/new_entry");
			}
			if(response==="fail!"){
				$location.path("/");
			}
		});
	};

	$scope.logout = function() {
		$http.get('/logout').success(function (response){
			if(response === "logged_out"){
				$location.path('/');
			}
		}
	)};


});