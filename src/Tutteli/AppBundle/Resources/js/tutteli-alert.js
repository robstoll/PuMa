/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.alert', [])
.controller('tutteli.alert.AlertCtrl', 
  ['$scope', '$element', 'tutteli.alert.AlertService', 
  function ($scope, $element, AlertService) {
    $element.css('display','block');
    $scope.alerts = AlertService.getAlerts();
    $scope.close = AlertService.close;
  }
]).service('tutteli.alert.AlertService', function(){
    var alerts = {};
    this.getAlerts = function(){
        return alerts;
    };

    this.add = function(key, msg, type) {
        alerts[key] = {key: key, msg: msg, type: type};
    };
    
    this.close = function(key) {
        delete alerts[key];
    };
});