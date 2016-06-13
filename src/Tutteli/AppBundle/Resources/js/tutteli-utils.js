/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */

function tutteliExtends(childConstructor, parentConstructor) {
    childConstructor.prototype = Object.create(parentConstructor.prototype);
    childConstructor.prototype.constructor = childConstructor;
}

function tutteliSavingController() {
    var parentObject = angular.injector(['tutteli.utils']).get('tutteli.utils.ASavingController');
    return Object.getPrototypeOf(parentObject).constructor;
}

(function(){
'use strict';

angular.module('tutteli.utils', ['ng'])
    .directive('compile', CompileDirective)
    .service('tutteli.utils.TextSelectService', TextSelectService)
    .service('tutteli.utils.ASavingController', ASavingController);

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

function ASavingController() {
    var isSaving = false;
    
    this.startSaving = function() { 
        isSaving = true;
    };
    
    this.endSaving = function() {
        isSaving = false;
    };
    
    this.isDisabled = function() {
        return isSaving;
    };
}

})();