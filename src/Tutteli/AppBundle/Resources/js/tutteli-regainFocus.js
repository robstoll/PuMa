/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.regainFocus', ['ui.router'])
    .run(viewContentLoaderHandler);

viewContentLoaderHandler.$inject = ['$rootScope', '$timeout'];
function viewContentLoaderHandler($rootScope, $timeout) {
    var lastFocusedElement = angular.element(document.activeElement).attr('ng-model');
    
    //try to put the focus back to where it was before angular loaded
    var deregister = $rootScope.$on('$viewContentLoaded', function(){
        if (lastFocusedElement) {
            $timeout(function(){
                var element = document.querySelector('[ng-model="' + lastFocusedElement + '"]');
                if (element) {
                    element.focus();
                }
            }, 1);
            deregister();
        }
    });
}

})();