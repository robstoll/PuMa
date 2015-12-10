/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/angular-pre-work
 */

(function(){
'use strict';

angular.module('tutteli.calc', [])
    .directive('calculator', CalculatorDirective);

CalculatorDirective.$inject = ['$parse'];
function CalculatorDirective($parse) {
    return {
        restrict: 'E',
        scope: {
            btnClass: '=',
            field: '='
        },
        template: 
              '<div><button ng-click="press($event, \'7\')" class="{{btnClass}}">7</button><button ng-click="press($event, \'8\')" class="{{btnClass}}">8</button><button ng-click="press($event, \'9\')" class="{{btnClass}}">9</button><button ng-click="press($event, \' + \')" class="op {{btnClass}}">+</button></div>'
            + '<div><button ng-click="press($event, \'4\')" class="{{btnClass}}">4</button><button ng-click="press($event, \'5\')" class="{{btnClass}}">5</button><button ng-click="press($event, \'6\')" class="{{btnClass}}">6</button><button ng-click="press($event, \' - \')" class="op {{btnClass}}">-</button></div>'
            + '<div><button ng-click="press($event, \'1\')" class="{{btnClass}}">1</button><button ng-click="press($event, \'2\')" class="{{btnClass}}">2</button><button ng-click="press($event, \'3\')" class="{{btnClass}}">3</button><button ng-click="press($event, \' * \')" class="op {{btnClass}}">*</button></div>'
            + '<div><button ng-click="press($event, \'0\')" class="zero {{btnClass}}">0</button><button ng-click="press($event, \'.\')" class="dot op {{btnClass}}">.</button><button ng-click="del($event)" class="del op {{btnClass}}">DEL</button></div>',
        controller: ['$scope', function($scope) {
            $scope.press = function($event, text) {
                $event.preventDefault();
                if ($scope.field === undefined || $scope.field === null) {
                    $scope.field = '';
                }
                $scope.field = $scope.field + text;
            };
            
            $scope.del = function($event) {
                $event.preventDefault();
                if ($scope.field !== undefined && $scope.field !== null && $scope.field.length > 0) {
                    var len = $scope.field.length;
                    if ($scope.field.substr(len - 1, 1) == ' ' && len >= 3 && 
                            $scope.field.substr(len - 3, 1) == ' ') {
                        $scope.field = $scope.field.substr(0, len - 3);
                    } else {
                        $scope.field = $scope.field.substr(0, len - 1);
                    }
                    
                }
            };
        }]
    };
}    

})();
