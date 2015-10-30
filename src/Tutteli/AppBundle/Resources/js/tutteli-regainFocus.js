/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.regainFocus', ['ui.router'])
.run(['$rootScope', '$timeout', function($rootScope, $timeout) {
    var lastFocusedElement = angular.element(document.activeElement).attr('ng-model');
    
    //try to put the focus back to where it was before angular loaded
    var deregister = $rootScope.$on('$viewContentLoaded', function(){
        if (lastFocusedElement) {
            $timeout(function(){
                var elem = document.querySelector('[ng-model="' + lastFocusedElement + '"]');
                elem.focus();
            }, 1);
            deregister();
        }
    });
}]);