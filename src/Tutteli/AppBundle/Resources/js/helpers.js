/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.helpers', ['tutteli.alert', 'tutteli.preWork'])
    .service('tutteli.helpers.ErrorHandler', ErrorHandler)       
    .service('tutteli.helpers.InitHelper', InitHelper)
    .service('tutteli.helpers.FormHelperFactory', FormHelperFactory);


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
                    err += prop + ': ' + data[prop] + '<br/>';
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

InitHelper.$inject = ['tutteli.PreWork'];
function InitHelper(PreWork) {
    var self = this;
    
    this.initTableData = function(name, controller, data) {
        controller[name] = data;
        var rows = document.getElementById(name + '_rows');
        if (rows) {
            rows.className = '';
        }
        
        var load = document.getElementById(name + '_load');
        if (load) {
            load.style.display = 'none';
        }
    };
    
    this.initTable = function(name, controller, loadFunc) {
        var initName = name + 'Init';
        var nameUpper = name.substr(0, 1).toUpperCase() + name.substr(1);
        
        PreWork.merge(name + '.tpl', this, name + 'Ctrl');
        if (controller[initName] !== undefined) {
            self.initTableData(name, controller, JSON.parse(controller[initName]));
        } else {
            var load = document.getElementById(name + '_load');
            if (load) {
                load.style.display = 'block';
            }
            loadFunc();
        }
    };
}

FormHelperFactory.$inject = ['tutteli.alert.AlertService', 'tutteli.helpers.ErrorHandler', 'tutteli.csrf.CsrfService'];
function FormHelperFactory(AlertService, ErrorHandler, CsrfService) {
    
    this.build = function(controller, url){
        return new FormHelper(AlertService, ErrorHandler, CsrfService, controller, url);
    };
}

function FormHelper(AlertService, ErrorHandler, CsrfService, controller, url) {
    
    this.create = function($event, alertId, obj, name, Service) {
        $event.preventDefault();
        AlertService.close(alertId);
        Service['create' + name](obj).then(function() {
            AlertService.add(alertId, name + ' successfully created.', 'success');
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, reloadCsrfToken);
        });
    };
    
    function reloadCsrfToken(){
        CsrfService.reloadToken(url, controller);
    }
    
    this.reloadCsrfIfNecessary = function() {
        if (controller.csrf_token === undefined || controller.csrf_token === '') {
            reloadCsrfToken();
        }
    };
}

})();