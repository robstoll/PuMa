/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.alert', ['tutteli.utils'])
    .controller('tutteli.alert.AlertController', AlertController)
    .service('tutteli.alert.AlertService', AlertService);

AlertController.$inject =  ['$element', 'tutteli.alert.AlertService'];
function AlertController($element, AlertService) {
    $element.css('display','block');
    this.alerts = AlertService.getAlerts();
    this.close = AlertService.close;
    this.openErrorReport = AlertService.openErrorReport;
}

AlertService.$inject =  ['$interpolate', 'tutteli.UtilsService'];
function AlertService($interpolate, UtilsService){
    var self = this;  
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
    
    this.getHttpErrorReport = function (response) {
        var errorMsg = '';
        if (response.stack) {
            errorMsg += response.stack.replace('\n', '<br/>');
        } else if (response.status) {
            errorMsg += 'status: ' + response.status + '<br/>statusText: ' + response.statusText + '<br/><br/>';
            errorMsg += self.getObjectInfo(response.config);
        } else if (response.msg) {
            errorMsg += 'msg: '+ response.msg + '<br/>' + self.getObjectInfo(response.data, 'response');
        }
        return errorMsg;
    };
    
    this.getObjectInfo = function (obj, name, tDepth) {
        var depth = tDepth || 0;
        var msg ='';
        var indent = '&nbsp;'.repeat((depth + 1) * 2);
        
        if (depth == 0) {
            msg += name +': {<br/>';
        }
        
        for (var prop in obj) {
            if (angular.isArray(obj[prop]) && depth <= 3) {
                msg += indent +  prop + ': [<br/>';
                msg += self.getObjectInfo(obj[prop], '', depth + 1);
                msg += indent + ']<br/>';
            } else if (angular.isObject(obj[prop]) &&  depth <= 3) {
                msg += indent + prop + ': {<br/>';
                msg += self.getObjectInfo(obj[prop], '', depth + 1); 
                msg += indent + '}<br/>';
            } else{
                msg += indent + prop + ': ' + obj[prop] + '<br/>';    
            }
        }
        
        if (depth == 0) {
            msg += '}';
        }
        
        return msg;
    };
    
    this.addErrorReport = function(key, msg, type, repeatUrl, repeatUrlText, reportId, reportUrlText, reportText) {
        var message = $interpolate(msg)({
            repeatLink : '<a href="' + repeatUrl + '" ng-click="close(\'' + key + '\')">' + repeatUrlText + '</a>',
            reportLink : '<a style="cursor:pointer" ng-click="alertCtrl.openErrorReport(\'' + reportId + '\')">' + reportUrlText + '</a>',
            reportContent: '<div id="'+ reportId + '" class="error-report">' + reportText + '</div>'
        });
        this.add(key, message, type);
    };
    
    this.openErrorReport = function(reportId) {
        var element = document.getElementById(reportId); 
        element.style.display= 'block'; 
        UtilsService.selectText(element);
    };
}

})();