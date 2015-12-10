/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.csrf', [])
    .service('tutteli.csrf.CsrfService', CsrfService);

CsrfService.$inject = ['$http', '$q'];
function CsrfService($http, $q) {
    
    this.reloadToken = function(url, obj, thePropName, theCsrfTokenName) {
        var propName = thePropName === undefined ? 'csrf_token' : thePropName;
        var csrfTokenName = theCsrfTokenName === undefined ? 'csrf_token' : theCsrfTokenName;
        
        return $http.get(url).then(function(response) {
            if (response.data[csrfTokenName] === undefined) {
                return $q.reject({msg: csrfTokenName + ' was not defined in the returned data', data: result.data});
            }
            obj[propName] = response.data[csrfTokenName];
        });
    };
}

})();