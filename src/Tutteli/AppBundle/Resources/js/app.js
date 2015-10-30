/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.purchase', [
    'tutteli.services', 
    'tutteli.ctrls', 
    
    'ui.router',
    'ngCookies',
    
    'tutteli.preWork',
    'tutteli.auth',
    'tutteli.auth.routing',
]).config(
  ['$httpProvider', '$locationProvider','$stateProvider', 'tutteli.auth.USER_ROLES', 
  function($httpProvider, $locationProvider, $stateProvider, USER_ROLES){
    
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    $locationProvider.html5Mode(true);
    $stateProvider.state('login', {
        url: '/login',
        controller: 'tutteli.LoginCtrl',
        templateUrl: 'login.tpl',
        data : {
            authRoles : []
        }
    }).state('home', {
        url: '/',
        templateUrl: 'dashboard.html',
        data : {
            authRoles : [USER_ROLES.authenticated]
        }
    }).state('users', {
        url : '/admin/users',
        templateUrl : 'users.html',
        data : {
            authRoles : [USER_ROLES.admin]
        }
    });
    
}]).run(
  ['$rootScope', '$location', 'tutteli.auth.EVENTS', 
  function($rootScope, $location, AUTH_EVENTS) {
      
    $rootScope.$on(AUTH_EVENTS.notAuthorised, function(event, url) {
        //TODO show error message to the user
    });   
    
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, result){
        //only :/ because the href element of the <base> tag will already start with /
        var base = $location.protocol() + ':/' + angular.element(document.querySelector('base')).attr('href');
        var url = result.url;
        if (url != ""){
            if (base == url.substr(0, base.length)) {
                $location.path(url.substr(base.length + 1));
            } else {
                //TODO show error message to the user
            }
        } else {
            //no url provided, redirect to home url
            $location.path(url);
        }
        
       
    });
  }
]);  

//        
//        if (requireLogin && $rootScope.currentUser === undefined) {
//            event.preventDefault();
//            
//            LoginModal().then(function () {
//              return $state.go(toState.name, toParams);
//            }).catch(function (reason) {
//                console.log(reason)
//            });
//        }
