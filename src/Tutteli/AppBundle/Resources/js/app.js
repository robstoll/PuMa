/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.purchase', [
    'tutteli.services', 
    'tutteli.ctrls', 
    'tutteli.purchase.routing',
    
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    
    'tutteli.preWork',
    'tutteli.auth.full',
    'tutteli.loader',
    'tutteli.alert',
    'tutteli.regainFocus',
    'tutteli.utils'
]).config(['$httpProvider', function($httpProvider){
    
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    
}]).run(
  ['$rootScope', '$location', 'tutteli.auth.EVENTS', 'tutteli.alert.AlertService',  
  function($rootScope, $location, AUTH_EVENTS, AlertService) {
      
    $rootScope.$on(AUTH_EVENTS.notAuthorised, function(event, url) {
        AlertService.add('tutteli.purchase.notAuthorised', 'You are not authorised to visit ' + url, 'danger');
    });   
    
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, result){
        AlertService.add('tutteli.purchase.loginSuccess', 'Login was successfull... loading new state...', 'success');
        var base = $location.protocol() + '://' + $location.host() 
            + angular.element(document.querySelector('base')).attr('href');
        
        var url = result.url;
        if (url != ""){
            if (base == url.substr(0, base.length)) {
                $location.path(url.substr(base.length));
            } else {
                //TODO show error message to the user
            }
        } else {
            //no url provided, redirect to home url
            $location.path(url);
        }
    });
  }
]).run(
  ['$rootScope', '$state', 'tutteli.alert.AlertService',  
  function($rootScope, $state, AlertService){
    
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        if (error.status == 404) {
            var url = $state.href(toState.name, toParams);
            var msg = 'Error while loading the new state "' + toState.name + '" - '
                + 'could not load "' + error.config.url + '".<br/>'
                + 'Please check your internet-connection and '
                + '<a href="' + url + '" ng-click="close(\'tutteli.purchase.404\')">'
                    + 'click here to repeat the action'
                + '</a>.';
           AlertService.add('tutteli.purchase.404', msg, 'danger');
        }
    });
  }
]).factory('tutteli.auth.loginUrl', function(){
    return angular.element(document.querySelector('base')).attr('href') + 'login_check';
});

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

angular.module('tutteli.purchase.routing', ['ui.router', 'tutteli.auth.routing']).config(
  ['$locationProvider','$stateProvider', 'tutteli.auth.USER_ROLES',
  function($locationProvider, $stateProvider,  USER_ROLES) {
      
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
            authRoles : [USER_ROLES.admin] //user needs to be logged in
        }
    });
  }
]);

