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
        data: {
            authRoles : []
        }
    }).state('logout', {
        url: '/logout',
        controller: 'tutteli.LogoutController'
    }).state('home', {
        url: '/',
        redirectTo: 'new_purchase'
    })
    
    .state('new_purchase', {
        url: '/purchases/new',
        controller: 'tutteli.purchase.PurchaseController',
        controllerAs: 'purchaseCtrl',
        templateUrl: 'purchases/new.tpl',
        data: {
            //user needs to be logged in
            authRoles: [USER_ROLES.authenticated]
        }
    })
    
    .state('users', {
        url: '/users',
        controller: 'tutteli.purchase.UsersController',
        controllerAs: 'usersCtrl',
        templateUrl : 'users.tpl',
        data: {
            authRoles : [USER_ROLES.admin] 
        }
    }).state('new_user', {
        url: '/users/new',
        controller: 'tutteli.purchase.NewUserController',
        controllerAs: 'userCtrl',
        templateUrl: 'users/new.tpl',
        data: {
            authRoles: [USER_ROLES.admin]
        }
    }).state('edit_user', {
        url : '/users/:userId/edit',
        controller: 'tutteli.purchase.EditUserController',
        controllerAs: 'userCtrl',
        templateUrl: 'users/edit.tpl',
        data: {
            authRoles: [USER_ROLES.admin],
            userIdParamName: 'userId'
        }
    }).state('categories', {
        url: '/categories',
        controller: 'tutteli.purchase.CategoriesController',
        controllerAs: 'categoriesCtrl',
        templateUrl : 'categories.tpl',
        data: {
            authRoles : [USER_ROLES.admin] 
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
    get_login_csrf: 'login/token',
    post_purchase : 'purchases',
    get_purchase_csrf: 'purchases/new/token',
    get_categories_json: 'categories.json',
    get_users_json: 'users.json',
    get_user_json: 'users/:userId.json',
    get_user_csrf: 'users/new/token',
    post_user: 'users',
    put_user: 'users/:userId'
});

})();