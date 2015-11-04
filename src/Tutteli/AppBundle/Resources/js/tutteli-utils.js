/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.utils', [])
.directive('compile', ['$compile', function($compile){
    return {
        link: function(scope, elem, attrs) {
            elem.html(scope.$eval(attrs.compile));
            $compile(elem.contents())(scope);
        }
    };
}]);