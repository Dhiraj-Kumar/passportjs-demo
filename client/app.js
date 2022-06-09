var app = angular.module('myApp', ['ngRoute']);

angular.module('myApp').directive('navbar', () => ({
    templateUrl: 'views/navbar.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
}));

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'homeController'
    }).when('/login', {
        templateUrl: 'views/login.html',
        controller: 'loginController'
    }).when('/register', {
        templateUrl: 'views/register.html',
        controller: 'registerController'
    }).when('/logout', {
        templateUrl: 'views/home.html',
        controller: 'logoutController'
    }).when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'profileController',
        resolve: {
            logincheck: checkLoggedin
        }
    });
    //$locationProvider.html5Mode(true);
});

var checkLoggedin = function($q, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get('/api/loggedin').then(function(user) {
        //console.log(user.data);
        console.log(user);
        //User is Authenticated
        if (user.data !== '0') {
            $rootScope.currentUser = user.data;
            deferred.resolve();
        } else { //User is not Authenticated
            deferred.reject();
            $location.url('/login');
        }
    });
    return deferred.promise;
}
app.controller('logoutController', function($scope, $http) {
    //$scope.LogoutUser = function() {
    $http.get('/api/logout').then(function(response) {
        console.log('User Logged Out')
    });
    //};
});
app.controller('homeController', function($scope, $http) {

});
app.controller('NavbarController', function($scope, $http) {

});
app.controller('profileController', function($scope, $http) {

});
app.controller('loginController', function($scope, $http) {
    $scope.LoginUser = function() {
        $http.post('/api/login', $scope.User).then(function(response) {});
        console.log('Log In attempted');
    };
});
app.controller('registerController', function($scope, $http) {
    $scope.RegisterUser = function() {
        $http.post('/api/signup', $scope.User).then(function(response) {});
        console.log('User Registered');
    };
});
