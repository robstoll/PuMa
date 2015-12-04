/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase', [
    'tutteli.purchase.routing',
    'tutteli.login',
    'tutteli.purchase.core',
    
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    
    'tutteli.preWork',
    'tutteli.auth',
    'tutteli.auth.cookie',
    'tutteli.loader',
    'tutteli.alert',
    'tutteli.regainFocus',
    'tutteli.utils'
]).config(['$httpProvider', function($httpProvider){
    
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

}])
    .run(authEventHandler)
    .run(routingErrorHandler)
    .factory('tutteli.auth.loginUrl', loginUrlFactory);

function loginUrlFactory(){
    return angular.element(document.querySelector('base')).attr('href') + 'login_check';
}

authEventHandler.$inject =  ['$rootScope', '$location', 'tutteli.auth.EVENTS', 'tutteli.alert.AlertService'];
function authEventHandler($rootScope, $location, AUTH_EVENTS, AlertService) {
      
    $rootScope.$on(AUTH_EVENTS.notAuthorised, function(event, url) {
        AlertService.add('tutteli.purchase.notAuthorised', 'You are not authorised to visit ' + url, 'danger');
    });   
    
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, result){
        AlertService.add('tutteli.purchase.loginSuccess', 'Login was successfull... loading new state...', 'success');
        var base = $location.protocol() + '://' + $location.host() 
            + angular.element(document.querySelector('base')).attr('href');
        
        var url = result.url || '';
        if (url != ""){
            if (base == url.substr(0, base.length)) {
                $location.path(url.substr(base.length));
            } else {
                AlertService.add('tutteli.purchase.hijack', 
                        'Possible attempt of haijacking detected. Loading "' + url + '" was aborted.<br/>'
                        + 'Please log out if this seems suspicious to you, close your browser and restart again.',
                        'warning');
            }
        } else {
            //no url provided, redirect to home url
            $location.path(url);
        }
    });
}

routingErrorHandler.$inject = ['$rootScope', '$state', 'tutteli.alert.AlertService'];
function routingErrorHandler($rootScope, $state, AlertService){
    
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        var msg = 'Error while loading the new state "' + toState.name + '" - ';
        var url = $state.href(toState.name, toParams);
        
        if (error.status == 404) {
            msg += 'could not load "' + error.config.url + '".<br/>'
                + 'Please check your internet-connection and ' 
                + '<a href="' + url + '" ng-click="close(\'tutteli.purchase.404\')">'
                    + 'click here to repeat the action'
                + '</a>.';
            AlertService.add('tutteli.purchase.404', msg, 'danger');
        } else {
            
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
            AlertService.addErrorReport('tutteli.purchase.500', msg, 'danger', 
                    url, 'click here to repeat the action', 
                    '_stateChange_report', 'click here', errorMsg);
        }
    });
}

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

})();