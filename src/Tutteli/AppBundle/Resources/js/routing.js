/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';


angular.module('tutteli.purchase.routing', [
    'ui.router', 
    'tutteli.auth.routing', 
    'tutteli.login',
    'tutteli.logout',
    'tutteli.purchase.core'
]).config(
  ['$locationProvider','$stateProvider', 'tutteli.auth.USER_ROLES',
  function($locationProvider, $stateProvider,  USER_ROLES) {
      
    $locationProvider.html5Mode(true);
    $stateProvider.state('login', {
        url: '/login',
        controller: 'tutteli.LoginController',
        controllerAs: 'loginCtrl',
        templateUrl: 'login.tpl',
        data : {
            authRoles : []
        }
    }).state('logout', {
        url: '/logout',
        controller: 'tutteli.LogoutController'
    }).state('home', {
        url: '/',
        redirectTo: 'purchase'
    }).state('purchase', {
        url: '/purchases/new',
        controller: 'tutteli.purchase.PurchaseController',
        controllerAs: 'purchaseCtrl',
        templateUrl: 'purchases/new.tpl',
        data : {
            authRoles : [USER_ROLES.authenticated]
        }
    }).state('users', {
        url : '/admin/users',
        templateUrl : 'users.html',
        data : {
            authRoles : [USER_ROLES.admin] //user needs to be logged in
        }
    });
  }
]).run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(evt, toState, params) {
      if (toState.redirectTo) {
        evt.preventDefault();
        $state.go(toState.redirectTo, params);
      }
    });
}]).constant('tutteli.purchase.ROUTES', {
    post_purchase : 'purchases',
    get_categories: 'categories',
});

})();