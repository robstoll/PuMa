/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.core', ['tutteli.purchase.routing'])
    .controller('tutteli.purchase.PurchaseController', PurchaseController)
    .service('tutteli.purchase.PurchaseService', PurchaseService)
    .constant('tutteli.purchase.PurchaseService.alertId', 'tutteli-ctrls-Purchase');

PurchaseController.$inject = [
    '$parse',
    '$filter', 
    'tutteli.PreWork', 
    'tutteli.purchase.PurchaseService', 
    'tutteli.alert.AlertService', 
    'tutteli.purchase.PurchaseService.alertId',
    'tutteli.csrf.CsrfService', 
    'tutteli.purchase.CategoryService', 
    'tutteli.purchase.UserService'];
function PurchaseController(
        $parse, 
        $filter, 
        PreWork, 
        PurchaseService, 
        AlertService, 
        alertId, 
        CsrfService, 
        CategoryService, 
        UserService) {
    
    var self = this;
    var categories = [{id: 0, name: 'Loading categories...'}];
    var users = null;
    var usersLoaded = false;
    var categoriesLoaded = false;
    
    this.disabled = false;
    this.positions = [];
    this.dt = new Date();
    this.opened = false;
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 1);
    this.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    this.today = function () {
        self.dt = new Date();
    };
    
    this.open = function($event) {
        self.opened = true;
    };
    
    this.getCategories = function() {
        return categories;
    };
    
    this.loadCategories = function() {
        CategoryService.getCategories().then(function(data) {
            categoriesLoaded = data.length > 0;
            checkDisabled();
            categories = data;
            if (!categoriesLoaded) {
                self.disabled = true;
                var alertIdCategories = alertId + '-categories';
                AlertService.add(alertIdCategories, 
                        'No categories are defined yet, gathering purchases is not yet possible. '
                        + 'Please inform your administrator. '
                        + '<a ' + closeAlertAndCall(alertIdCategories, 'loadCategories') + '>'
                            + 'Click then here once the categories have been created'
                        + '</a>.');
            }
            
        }, function(errorResponse) {
            self.disabled = true;
            var alertIdUsers = alertId + '-users';
            var reportId = '_purchase_categories_report';
            var report = AlertService.getHttpErrorReport(errorResponse);
            if (errorResponse.status == 404) {
                var msg = 'Categories could not been loaded, gathering purchases is thus not possible at the moment. ' 
                    + 'Please verify you have internet connection and '
                    + '<a ' + closeAlertAndCall(alertIdUsers, 'loadCategories') + '>'
                        + 'click here to load the categories again'
                    + '</a>. If the error should occur again, then please ' 
                    + AlertService.getReportLink(reportId, 'click here') 
                    + ' and report the shown error to the admin.<br/>'
                    + AlertService.getReportContent(reportId, report);
                AlertService.add(alertIdUsers, msg);
            } else {
                var msg = 'Categories could not been loaded. Unknown error occurred. '
                    + '<a ' + closeAlertAndCall(alertIdUsers, 'loadCategories') + '>'
                        + 'Please click here to reload the categories'
                    + '</a>. If the error should occur again, then please ' 
                    + AlertService.getReportLink(reportId, 'click here') 
                    + ' and report the shown error to the admin.<br/>'
                    + AlertService.getReportContent(reportId, report);
                AlertService.add(alertIdUsers, msg);
            }
        });
    };
    
    function checkDisabled() {
        self.disabled = self.disabled && (!usersLoaded || !categoriesLoaded);
    }
    
    function closeAlertAndCall(id, methodName) {
        return 'href="#" ng-click="alertCtrl.close(\'' + id + '\')" '
            + 'onclick="angular.element(document.querySelector(\'[ui-view]\')).controller().' + methodName + '(); return false;"';
    }
    
    this.getUsers = function() {
        return users;
    };
    
    this.selectUser = function(id) {
        this.user = id;
    };
    
    this.loadUsers = function() {
        UserService.getUsers().then(function(data) {
            usersLoaded = true;
            checkDisabled();
            users = data;
        }, function(errorResponse) {
            self.disabled = true;
            var alertIdUsers = alertId + '-users';
            var reportId = '_purchase_categories_report';
            var report = AlertService.getHttpErrorReport(errorResponse);
            if (errorResponse.status == 404) {
                var msg = 'Users could not been loaded, gathering purchases is thus not possible at the moment. ' 
                    + 'Please verify you have internet connection and '
                    + '<a ' + closeAlertAndCall(alertIdUsers, 'loadUsers') + '>'
                        + 'click here to load the users again'
                    + '</a>. If the error should occur again, then please ' 
                    + AlertService.getReportLink(reportId, 'click here') 
                    + ' and report the shown error to the admin.<br/>'
                    + AlertService.getReportContent(reportId, report);
                AlertService.add(alertIdUsers, msg);
            } else {
                var msg = 'Users could not been loaded. Unknown error occurred. '
                    + '<a ' + closeAlertAndCall(alertIdUsers, 'loadUsers') + '>'
                        + 'Please click here to reload the users'
                    + '</a>. If the error should occur again, then please ' 
                    + AlertService.getReportLink(reportId, 'click here') 
                    + ' and report the shown error to the admin.<br/>'
                    + AlertService.getReportContent(reportId, report);
                AlertService.add(alertIdUsers, msg);
            }
        });
    };
    
    this.addPosition = addPosition;
    function addPosition() {
      self.positions.push(new Position($parse, $filter));  
    }
    
    this.removePosition = function(index) {
        self.positions.splice(index, 1);  
    };
    
    this.addPurchase = function($event) {
        $event.preventDefault();
        AlertService.close(alertId);
        PurchaseService.add(self.user, self.dt, self.positions, self.csrf_token).then(function() {
            AlertService.add(alertId, 'Purchase successfully added', 'success');
        }, function(errorResponse) {
            if (errorResponse.status == 401) {
                AlertService.add(alertId, error.data, 'danger');
                if (error.data == 'Invalid CSRF token.') {
                    reloadCsrfToken();
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
            } else if(errorResponse.error) {
                AlertService.add(alertId, errorResponse.error);
            } else {
                AlertService.add(alertId, 'Unknown error occurred. Please try again.', 'danger');
            }
        });
    };
    
    function reloadCsrfToken() {
        CsrfService.reloadToken('purchases/new/token', self);
    }
    
    //-------------------
    
    self.addPosition();
    var position = {};
    if (PreWork.merge('purchase.tpl', position,  'position')) {
        self.positions[0].expression = position.expression;
        self.positions[0].notice = position.notice;
    }
    PreWork.merge('purchase.tpl', this, 'purchaseCtrl');
    
    if (self.csrf_token === undefined || self.csrf_token === '') {
        reloadCsrfToken();
    }
    
    self.loadCategories();
    self.loadUsers();
}

function Position($parse, $filter) {
    var self = this;
    this.expression = null;
    this.category = null;
    this.notice = '';
    this.calc = function() {
        var val = 0;
        if (self.expression) {
            try {
                val = $parse(self.expression)(this);
            } catch(err) {
                //that's fine
            }
        }
        
        if (!val) {
            val = 0;
        }
        
        return $filter('currency')(val, 'CHF ');
    };
}

PurchaseService.$inject = [
    '$http', 
    '$q',
    '$timeout',
    'tutteli.purchase.ROUTES', 
    'tutteli.alert.AlertService'];
function PurchaseService($http, $q, $timeout, ROUTES, AlertService) {
    this.add = function(userId, date, positions, csrf_token) {
        var errors = '';
        var positionDtos = [];
        for (var i = 0; i < positions.length; ++i) {
            var position = positions[i];
            if (position.expression == '0') {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">price of position ' + (i + 1) + '</a> needs to be greater than 0.<br/>';
            } else if(!position.expression.match(/^[0-9]+(.[0-9]+)?(\s*(\+|-|\*)\s*[0-9]+(.[0-9]+)?)*$/)) {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">price expression of position ' + (i + 1) + '</a> is erroneous. '
                        + 'Only the following operators are allowed: plus (+), minus (-), multiply (*).<br/>';
            } else {
                positionDtos[i] = {
                        expression: position.expression,
                        categoryId: position.category,
                        notice: position.notice
                };
            }
        }
        if (errors == '') {
            var data = {userId: userId, dt: date, positions: positionDtos, csrf_token: csrf_token};
            return $http.post(ROUTES.post_purchase, data);
        } 
        //delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function(){
            delay.reject({error: errors});
        }, 1);
        return delay.promise;
    };
}

})();