/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

var tutteliPurchase = angular.module('tutteli-purchase', [ 
    'ngCookies',
    'ui.router', 
    'ui.bootstrap', 
    'tutteli.services', 
    'tutteli-purchase.ctrls']);

tutteliPurchase.config(
        ['$urlRouterProvider', '$locationProvider', '$stateProvider',
          function($urlRouterProvider, $locationProvider, $stateProvider) {
    
    $locationProvider.html5Mode(true);

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login.tpl',
        data : {
            requireLogin : false
        }
    }).state('home', {
        url: '/',
        templateUrl: 'partials/dashboard.html',
        data : {
            requireLogin : true
        }
    }).state('users', {
        url : '/admin/users',
        templateUrl : 'users.html',
        data : {
            requireLogin : true
        }
    }).state('users.edit', {
        url : '/admin/users/edit',
        templateUrl : 'route2.list.html',
        controller : function($scope) {
            $scope.things = [ "A", "Set", "Of", "Things" ];
        }
    })
    
    
} ]);

tutteliPurchase.run(['$rootScope', '$state','$cookies', 'tutteliLoginModal', 
                     function($rootScope, $state, $cookies, tutteliLoginModal) {

    $rootScope.currentUser = $cookies.get('REMEMBERME');
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;

        if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
            event.preventDefault();
            
            tutteliLoginModal().then(function () {
              return $state.go(toState.name, toParams);
            }).catch(function (reason) {
                console.log(reason)
            });
        }
    });
}]);
