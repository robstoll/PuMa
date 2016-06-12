/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

function getCurrentMonth() {
    var month = new Date().getMonth() + 1;
    if (month <= 9) {
        month = '0' + month;
    }
    return month;
}

function getCurrentYear() {
    return new Date().getFullYear();
}

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
    $stateProvider.state('home', {
        url: '/',
        redirectTo: 'new_purchase'
    })
    
    .state('login', {
        url: '/login',
        controller: 'tutteli.LoginController',
        controllerAs: 'loginCtrl',
        templateUrl: 'login.tpl',
    }).state('logout', {
        url: '/logout',
        controller: 'tutteli.LogoutController'
    })
    
    .state('purchases', {
        url: '/purchases',
        redirectTo: 'purchases_month',
    })
    .state('purchases_currentMonth', {
        url: '/purchases/month',
        redirectTo: 'purchases_monthAndYear',
        redirectParams: {month: getCurrentMonth(), year: getCurrentYear()}            
    })
    .state('purchases_monthAndYear', {
        url: '/purchases/month-:month-:year',
        controller: 'tutteli.purchase.PurchasesMonthController',
        controllerAs: 'purchasesCtrl',
        templateUrl: 'purchases/month.tpl',
        data: {
            authRoles: [USER_ROLES.authenticated]
        }
    })
    .state('new_purchase', {
        url: '/purchases/new',
        controller: 'tutteli.purchase.NewPurchaseController',
        controllerAs: 'purchaseCtrl',
        templateUrl: 'purchases/new.tpl',
        data: {
            authRoles: [USER_ROLES.authenticated]
        }
    })
    .state('edit_purchase', {
        url: '/purchases/:purchaseId/edit',
        controller: 'tutteli.purchase.EditPurchaseController',
        controllerAs: 'purchaseCtrl',
        templateUrl: 'purchases/edit.tpl',
        data: {
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
    }).state('edit_user_password', {
        url: '/users/:userId/change-password',
        controller: 'tutteli.purchase.ChangePasswordController',
        controllerAs: 'passwordCtrl',
        templateUrl: 'users/change-password.tpl',
        data: {
            //force that only current user is allowed
            authRoles: [USER_ROLES.noOne], 
            userIdParamName: 'userId'
        }
    })
    .state('reset_user_password', {
        url: '/users/:userId/reset-password',
        controller: 'tutteli.purchase.ResetPasswordController',
        controllerAs: 'passwordCtrl',
        templateUrl: 'users/reset-password.tpl',
        data: {
            authRoles: [USER_ROLES.admin]
        }
    })
    
    .state('categories', {
        url: '/categories',
        controller: 'tutteli.purchase.CategoriesController',
        controllerAs: 'categoriesCtrl',
        templateUrl : 'categories.tpl',
        data: {
            authRoles : [USER_ROLES.admin] 
        }
    }).state('new_category', {
        url: '/categories/new',
        controller: 'tutteli.purchase.NewCategoryController',
        controllerAs: 'categoryCtrl',
        templateUrl: 'categories/new.tpl',
        data: {
            authRoles: [USER_ROLES.admin]
        }
    }).state('edit_category', {
        url : '/categories/:categoryId/edit',
        controller: 'tutteli.purchase.EditCategoryController',
        controllerAs: 'categoryCtrl',
        templateUrl: 'categories/edit.tpl',
        data: {
            authRoles: [USER_ROLES.admin]
        }
    })
    
    .state('bills_currentYear', {
        url: '/accounting/bills',
        redirectTo: 'bills_year',
        redirectParams:  {year: getCurrentYear()}    
    })
    .state('bills_year', {
        url: '/accounting/bills-:year',
        controller: 'tutteli.purchase.BillsController',
        controllerAs: 'billsCtrl',
        templateUrl: 'accounting/bills.tpl',
        data: {
            authRoles: [USER_ROLES.authenticated]
        }
    });
  }
]).run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(evt, toState, params) {
      if (toState.redirectTo) {
        evt.preventDefault();
        var newParams = params;
        if (toState.redirectParams) {
            for(var prop in toState.redirectParams) {
                newParams[prop] = toState.redirectParams[prop];
            }
        }
        $state.go(toState.redirectTo, newParams);
      }
    });
}]).constant('tutteli.purchase.ROUTES', {
    get_login_csrf: 'login/token',
    get_purchases_monthAndYear_json: 'purchases/month-:month-:year.json',
    get_purchase_json: 'purchases/:purchaseId.json',
    post_purchase : 'purchases',
    put_purchase : 'purchases/:purchaseId',
    get_purchase_csrf: 'purchases/new/token',    
    get_categories_json: 'categories.json',
    get_category_json: 'categories/:categoryId.json',
    get_category_csrf: 'categories/new/token',
    post_category: 'categories',
    put_category: 'categories/:categoryId',
    get_users_json: 'users.json',
    get_user_json: 'users/:userId.json',
    get_user_csrf: 'users/new/token',
    post_user: 'users',
    put_user: 'users/:userId',
    put_user_password: 'users/:userId/change-password',
    put_reset_user_password: 'users/:userId/reset-password',
    get_bills_year_json: 'accounting/bills-:year.json',
});

})();