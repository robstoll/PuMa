/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.auth.cookie', ['tutteli.auth', 'ngCookies'])
    .run(authEventHandler);

authEventHandler.$inject =  ['$rootScope', '$cookies', 'tutteli.auth.EVENTS', 'tutteli.auth.Session'];
function authEventHandler($rootScope, $cookies, AUTH_EVENTS, Session) {
 
    var user = $cookies.getObject('user');
    if (user) {
        Session.create(user);
    }
    
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
        var date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        $cookies.putObject('user', Session.user, {expires: date});
    });
    
    $rootScope.$on(AUTH_EVENTS.logout, function() {
        $cookies.remove('user');
    });
    
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
        $cookies.remove('user');
    });
}

})();