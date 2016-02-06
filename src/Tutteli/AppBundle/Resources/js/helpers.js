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
function ErrorHandler(AlertService) {

    this.handle = function(errorResponse, alertId, reloadCsrfTokenCallback, unknownErrorHandler) {
        if (errorResponse.status == 401) {
            var errorMsg = errorResponse.data;
            if (errorMsg.msg) {
               errorMsg = errorMsg.msg; 
            }
            AlertService.add(alertId, errorMsg, 'danger');
            if (errorMsg == 'Invalid CSRF token.') {
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
        } else if(unknownErrorHandler === undefined) {
            AlertService.add(alertId, 'Unknown error occurred. Please try again in a few minutes.', 'danger');
        } else {
            unknownErrorHandler(errorResponse);
        }
    };
}

InitHelper.$inject = ['tutteli.PreWork'];
function InitHelper(PreWork) {
    var self = this;
    
    this.initTableData = function(name, controller, data) {
        controller[name] = data[name];
        if (data.updatedAt) {
            controller.updatedAt = data.updatedAt;
            controller.updatedBy = data.updatedBy;
        }
        var rows = document.getElementById(name + '_rows');
        if (rows) {
            rows.className = '';
        }
        
        var load = document.getElementById(name + '_load');
        if (load) {
            load.style.display = 'none';
        }
        if(data[name] == null || data[name].length == 0) {
            var nothingFound = document.getElementById(name+'_nothingFound');
            if (nothingFound) {
                nothingFound.style.display = 'none';
            }
        }
    };
    
    this.initTable = function(name, controller, loadFunc) {
        self.initTableBasedOnPreWork(name + '.tpl', name, controller, loadFunc);
    };
    
    this.initTableBasedOnPreWork = function(tplName, name, controller, loadFunc) {
        var initName = name + 'Init';
        var nameUpper = name.substr(0, 1).toUpperCase() + name.substr(1);
        
        PreWork.merge(tplName, controller, name + 'Ctrl');
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

FormHelperFactory.$inject = ['$q', 'tutteli.alert.AlertService', 'tutteli.helpers.ErrorHandler', 'tutteli.csrf.CsrfService'];
function FormHelperFactory($q, AlertService, ErrorHandler, CsrfService) {
    
    this.build = function(controller, url){
        return new FormHelper($q, AlertService, ErrorHandler, CsrfService, controller, url);
    };
}

function FormHelper($q, AlertService, ErrorHandler, CsrfService, controller, url) {
    var self = this;
    
    this.create = function($event, alertId, obj, name, nameProp, Service) {
        $event.preventDefault();
        AlertService.close(alertId);
        return Service['create' + name](obj).then(function() {
            var prop = nameProp != null ? ' &quot;' + obj[nameProp] + '&quot;' : ''; 
            AlertService.add(alertId, name  + prop + ' successfully created.', 'success', 3000);
            controller.clearForm();
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, self.reloadCsrfToken);
            return $q.reject(errorResponse);
        });
    };
    
    this.update = function($event, alertId, obj, name, nameProp, Service) {
        $event.preventDefault();
        AlertService.close(alertId);
        return Service['update' + name](obj).then(function() {
            var prop = nameProp != null ? ' &quot;' + obj[nameProp] + '&quot;' : '';
            AlertService.add(alertId, name + prop + ' successfully updated.', 'success', 3000);
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, self.reloadCsrfToken);
            return $q.reject(errorResponse);
        });
    };
    
    this.call = function(methodName, $event, alertId, obj, Service, unknownErrorHandler) {
        $event.preventDefault();
        AlertService.close(alertId);
        return Service[methodName](obj).then(null, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, self.reloadCsrfToken, unknownErrorHandler);
            return $q.reject(errorResponse);
        });
    };
    
    this.reloadCsrfToken = function(){
        CsrfService.reloadToken(url, controller);
    };
    
    this.reloadCsrfIfNecessary = function() {
        if (controller.csrf_token === undefined || controller.csrf_token === '') {
            self.reloadCsrfToken();
        }
    };
}

})();