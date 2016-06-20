/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma', [
    'tutteli.utils',
    'tutteli.puma.routing',
    'tutteli.login',
    'tutteli.logout',
    'tutteli.csrf',
    'tutteli.navigation',
    'tutteli.calc',
    'tutteli.puma.core',
    'tutteli.puma.bill',
    'tutteli.puma.category',
    'tutteli.puma.user',
    'tutteli.helpers',
    
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    
    'tutteli.preWork',
    'tutteli.auth',
    'tutteli.auth.cookie',
    'tutteli.loader',
    'tutteli.alert',
    'tutteli.regainFocus',
    
]).config(['$httpProvider', function($httpProvider) {
    
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

}])
    .run(authEventHandler)
    .run(routingErrorHandler)
    .run(routingSuccessHandler)
    .factory('tutteli.baseHref', baseHrefFactory)
    .factory('tutteli.auth.loginUrl', loginUrlFactory);

function baseHrefFactory() {
    return angular.element(document.querySelector('base')).attr('href');
}

loginUrlFactory.$inject = ['tutteli.baseHref'];
function loginUrlFactory(baseHref) {
     return baseHref + 'login_check';
}

authEventHandler.$inject =  [
    '$rootScope', 
    '$location', 
    '$state', 
    'tutteli.auth.EVENTS', 
    'tutteli.alert.AlertService', 
    'tutteli.LoginController.alertId', 
    'tutteli.LoginModalService',
    'tutteli.baseHref'];
function authEventHandler(
        $rootScope, 
        $location, 
        $state, 
        AUTH_EVENTS, 
        AlertService, 
        alertId, 
        LoginModalService, 
        baseHref) {
      
    $rootScope.$on(AUTH_EVENTS.notAuthorised, function(event, response) {
        AlertService.add('tutteli.puma.notAuthorised', 
                'You are not authorised to visit ' + response.url, 'danger');
    });   
    
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event, data) {
        if ($location.path() != '/login') {
          event.preventDefault();
          
          LoginModalService.open().then(function() {
              if (data.toState) {
                  $state.go(data.toState, data.toParams);
              } else if (data.response) {
                  
              }
          }, function (reason) {
              console.log(reason);
          });
        } else {
            AlertService.add(alertId, 'You are not yet logged in, please use the form below.', 'warning');
        }
    });   
    
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, result) {
        AlertService.add('tutteli.puma.loginSuccess', 
                'Login was successfull... loading new state...', 'success', 3000);
        
        var baseUrl = $location.protocol() + '://' + $location.host() + baseHref;
        
        var url = result.data.url || '';
        if (url != ""){
            if (baseUrl == url.substr(0, baseUrl.length)) {
                $location.path(url.substr(baseUrl.length));
            } else {
                AlertService.add('tutteli.puma.hijack', 
                        'Possible attempt of haijacking detected. Loading "' + url + '" was aborted.<br/>'
                        + 'Please log out if this seems suspicious to you, close your browser and restart again.',
                        'warning');
            }
        } else {
            //no url provided, redirect to home url
            $location.path(url);
        }
    });
    
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event, result) {
        AlertService.add('tutteli.puma.logoutSuccess', 
                'Logout was successfull... redirecting to the login page...', 'success', 3000);
        $state.go('login');
    });
}

routingErrorHandler.$inject = ['$rootScope', '$state', 'tutteli.alert.AlertService'];
function routingErrorHandler($rootScope, $state, AlertService) {
    
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        var msg = 'Error while loading the new state "' + toState.name + '" - ';
        var url = $state.href(toState.name, toParams);
        
        if (error.status == 404) {
            msg += 'could not load "' + error.config.url + '".<br/>'
                + 'Please check your internet-connection and {{repeatLink}}.';
            AlertService.addNoConnection('tutteli.puma.404', msg, 'danger',
                    url, 'click here to repeat the action');
        } else if(error.status != 403 && error.status != 401) {
            
            var errorMsg = AlertService.getHttpErrorReport(error) + '<br/><br/>';
            
            errorMsg += AlertService.getObjectInfo(fromState, 'fromState') + '<br/><br/>' 
                + AlertService.getObjectInfo(fromParams, 'fromParams') + '<br/><br/>'
                + AlertService.getObjectInfo(toState, 'toState') + '<br/><br/>'
                + AlertService.getObjectInfo(toParams, 'toParams');
            
            msg += 'unexpected error occurred.<br/>'
                + 'Please {{repeatLink}}.'
                + 'If it should occurr again (this message does not disappear), '
                + 'then please {{reportLink}} and report the shown error to the admin.<br/>'
                + '{{reportContent}}';
            AlertService.addErrorReport('tutteli.puma.500', msg, 'danger', 
                    url, 'click here to repeat the action', 
                    '_stateChange_report', 'click here', errorMsg);
        }
    });
}

routingSuccessHandler.$inject = ['$rootScope', 'tutteli.alert.AlertService'];
function routingSuccessHandler($rootScope, AlertService) {
    $rootScope.$on('$viewContentLoaded', function(event, view) {
        AlertService.clear();
    });
}

})();