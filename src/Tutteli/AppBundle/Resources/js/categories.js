/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.category', [])
    .service('tutteli.purchase.CategoryService', CategoryService);

CategoryService.$inject = [
    '$http', 
    '$q',
    '$timeout',
    'tutteli.purchase.ROUTES', 
    'tutteli.alert.AlertService'];
function CategoryService($http, $q, $timeout, ROUTES, AlertService) {
    this.getCategories = function() {
        return $http.get(ROUTES.get_categories).then(function(response) {
            if (response.data.categories === undefined) {
                return $q.reject({msg:'categories was not defined in the returned data', data: response.data});
            }
            return $q.resolve(response.data.categories);
        });
    };
    
    this.add = function(userId, date, positions, csrf_token) {
        var errors = '';
        var positionDtos = [];
        for (var i = 0; i < positions.length; ++i) {
            var position = positions[i];
            if (position.expression == '0') {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">price of position ' + (i + 1) + '</a> needs to be greater than 0.<br/>';
            } else if(!position.expression.match(/^[0-9]+(.[0-9]+)?(\s*(\+|-|\*)\s*[0-9]+(.[0-9]+)?)*$/)) {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">price expression of position ' + (i + 1) + '</a> is erroneous. '
                        + 'Only the following operators are allowed: plus (+), minus (-), multiply (*).<br/>';
            } else {
                positionDtos[i] = {
                        expression: position.expression,
                        categoryId: position.category,
                        notice: position.notice
                };
            }
        }
        if (errors == '') {
            var data = {userId: userId, dt: date, positions: positionDtos, csrf_token: csrf_token};
            return $http.post(ROUTES.post_purchase, data);
        } 
        //delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function(){
            delay.reject({error: errors});
        }, 1);
        return delay.promise;
    };
}

})();