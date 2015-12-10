/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.users', [])
    .service('tutteli.purchase.UserService', UserService);

UserService.$inject = ['$http', '$q', 'tutteli.purchase.ROUTES'];
function UserService($http, $q, ROUTES) {
    this.getUsers = function() {
        return $http.get(ROUTES.get_users).then(function(response) {
            if (response.data.users === undefined) {
                return $q.reject({msg:'The property "users" was not defined in the returned data.', data: response.data});
            }
            return $q.resolve(response.data.users);
        });
    };
}

})();