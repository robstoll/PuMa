/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.logout', ['tutteli.auth'])
    .controller('tutteli.LogoutController', LogoutController);
    
LogoutController.$inject = ['tutteli.auth.AuthService'];
function LogoutController(AuthService) {
    AuthService.logout();
}

})();    