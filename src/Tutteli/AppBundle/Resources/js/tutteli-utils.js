/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.utils', [])
    .directive('compile', CompileDirective)
    .service('tutteli.utils.TextSelectService', TextSelectService)
    .service('tutteli.utils.ErrorHandler', ErrorHandler);

CompileDirective.$inject = ['$compile'];
function CompileDirective($compile) {
    return {
        link: function(scope, elem, attrs) {
            elem.html(scope.$eval(attrs.compile));
            $compile(elem.contents())(scope);
        }
    };
}

function TextSelectService() {
    
    this.selectText = function (element) {
        if (document.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();        
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
}

ErrorHandler.$inject = ['tutteli.alert.AlertService'];
function ErrorHandler(AlertService){
    this.handle = function(errorResponse, alertId, reloadCsrfTokenCallback) {
        if (errorResponse.status == 401) {
            AlertService.add(alertId, errorResponse.data, 'danger');
            if (errorResponse.data == 'Invalid CSRF token.') {
                reloadCsrfTokenCallback();
            }
        } else if (errorResponse.status == 400) {
            var data = errorResponse.data;
            var err = '';
            if (angular.isObject(data)) {
                for (var prop in data) {
                    err += data[prop] + '<br/>';
                }
            } else {
                err = data;
            }
            AlertService.add(alertId, err, 'danger');
        } else if (errorResponse.error) {
            AlertService.add(alertId, errorResponse.error);
        } else {
            AlertService.add(alertId, 'Unknown error occurred. Please try again.', 'danger');
        }
    };
}

})();