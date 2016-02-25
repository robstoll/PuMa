/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.core', [
    'tutteli.purchase.routing', 
    'tutteli.preWork',
    'tutteli.alert',
    'tutteli.csrf',
    'tutteli.purchase.category',
    'tutteli.purchase.user',
    'tutteli.helpers',
])
    .controller('tutteli.purchase.NewPurchaseController', NewPurchaseController)
    .controller('tutteli.purchase.EditPurchaseController', EditPurchaseController)
    .controller('tutteli.purchase.PurchaseMonthController', PurchaseMonthController)
    .service('tutteli.purchase.PurchaseService', PurchaseService)
    .service('tutteli.purchase.UsersLoaderFactory', UsersLoaderFactory)
    .service('tutteli.purchase.CategoriesLoaderFactory', CategoriesLoaderFactory)
    .constant('tutteli.purchase.PurchaseService.alertId', 'tutteli-ctrls-Purchase');

NewPurchaseController.$inject = [
    '$q',
    '$parse',
    '$filter',
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.PurchaseService',
    'tutteli.purchase.CategoriesLoaderFactory',
    'tutteli.purchase.UsersLoaderFactory',
    'tutteli.helpers.FormHelperFactory'];
function NewPurchaseController(
        $q,
        $parse, 
        $filter, 
        ROUTES, 
        PreWork,
        PurchaseService,
        CategoriesLoaderFactory,
        UsersLoaderFactory,
        FormHelperFactory) {

    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_purchase_csrf);

    var categories = [{id: 0, name: 'Loading categories...'}];
    var users = null;
    var usersLoaded = false;
    var categoriesLoaded = false;
    var disabled = false;
    var categoriesLoader = CategoriesLoaderFactory.build(self);
    var usersLoader = UsersLoaderFactory.build(self);
    
    this.datePicker = new DatePicker();
    this.positionManager = new PositionManager($parse, $filter);
    this.clearForm = self.positionManager.clearForm;
    
    this.isDisabled = function() {
        return disabled && (!usersLoaded || !categoriesLoaded); 
    };
    
    this.loadCategories = function() {
        categoriesLoader.load().then(function(data) {
            categoriesLoaded = true;
            categories = data.categories;
        }, function(errorResponse) {
            disabled = true;
        });
    };
    
    this.getCategories = function() {
        return categories;
    };
    
    this.loadUsers = function() {
        usersLoader.load().then(function(data) {
            usersLoaded = true;
            users = data.users;
        }, function(errorResponse) {
            disabled = true;
        });
    };    

    this.getUsers = function() {
        return users;
    };

    this.selectUser = function(id, username) {
        if (users === null) {
            users = [{id : id, username : username}];
        }
        self.user = id;
    };

    this.createPurchase = function($event) {
        var purchase = {
            userId : self.user,
            dt : self.datePicker.dt,
            positions :  self.positionManager.positions,
            csrf_token : self.csrf_token
        };
        formHelper.create($event, alertId, purchase, 'Purchase', null, PurchaseService);
    };
    

    // -------------------

    self.positionManager.addPosition();
    var position = {};
    if (PreWork.merge('purchases/new.tpl', position, 'position')) {
        self.positionManager.positions[0].expression = position.expression;
        self.positionManager.positions[0].notice = position.notice;
    }
    PreWork.merge('purchases/new.tpl', this, 'purchaseCtrl');

    formHelper.reloadCsrfIfNecessary();

    self.loadCategories();
    self.loadUsers();
    document.getElementById('purchase_add').style.display = 'inline';
}

function DatePicker() {
    var self = this;
    this.dt = new Date();
    this.opened = false;
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 1);
    this.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    this.today = function() {
        self.dt = new Date();
    };

    this.open = function($event) {
        self.opened = true;
    };

}

function PositionManager ($parse, $filter) {
    var self = this;
    this.positions = [];
    
    this.addPosition = function() {
        self.positions.push(new Position($parse, $filter));
    };

    this.removePosition = function(index) {
        self.positions.splice(index, 1);
    };
    
    this.clearForm = function() {
        self.positions = [];
        self.addPosition();
        document.getElementById('purchase_expression0').focus();
    };
    
    this.getTotal = function() {
        var total = 0;
        var dummy = {};
        for (var i = 0; i < self.positions.length; ++i) {
            var val  = 0;
            try {
                val = $parse(self.positions[i].expression)(dummy);
            } catch (err) {
                // that's fine
            }
            if (!val) {
                val = 0;
            }
            total += val;
        }
        return $filter('currency')(total, 'CHF ');
    };
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
            } catch (err) {
                // that's fine
            }
        }

        if (!val) {
            val = 0;
        }

        return $filter('currency')(val, 'CHF ');
    };
}

function closeAlertAndCall(alertId, methodName) {
    return 'href="#" ng-click="alertCtrl.close(\'' + alertId + '\')" '
        + 'onclick="angular.element(document.querySelector(\'[ui-view]\')).controller().' + methodName + '(); return false;"';
}

CategoriesLoaderFactory.$inject = [
  '$q',
  'tutteli.purchase.CategoryService',
  'tutteli.alert.AlertService',
  'tutteli.purchase.PurchaseService.alertId'];
function CategoriesLoaderFactory($q, CategoryService, AlertService, alertId) {
    this.build = function (controller) {
        return new CategoriesLoader($q, CategoryService, AlertService, alertId, controller);
    };
}


function CategoriesLoader($q, CategoryService, AlertService, alertId, controller) {
    var self = this;
    this.load = function() {
        return CategoryService.getCategories().then(function(data) {
            if (data.categories.length == 0) {
                var alertIdCategories = alertId + '-categories';
                AlertService.add(alertIdCategories,
                        'No categories are defined yet, gathering purchases is not yet possible. '
                        + 'Please inform your administrator. '
                        + '<a '+ closeAlertAndCall(alertIdCategories, 'loadCategories') + '>'
                            + 'Click then here once the categories have been created'
                        + '</a>.');
                return $q.reject(data);
            }
            return $q.resolve(data);
        }, function(errorResponse) {
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
            return $q.reject(errorResponse);
        });
    };
}

UsersLoaderFactory.$inject = [
  '$q',
  'tutteli.purchase.UserService',
  'tutteli.alert.AlertService',
  'tutteli.purchase.PurchaseService.alertId'];
function UsersLoaderFactory($q, UserService, AlertService, alertId) {
    this.build = function (controller) {
        return new UsersLoader($q, UserService, AlertService, alertId, controller);
    };
}

function UsersLoader($q, UserService, AlertService, alertId, controller) {
    var self = this;
    this.load = function() {
        return UserService.getUsers().then(null, function(errorResponse) {
            controller.disabled = true;
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
            return $q.reject(errorResponse);
        });
    };
}

EditPurchaseController.$inject = [
  '$stateParams',
  '$parse',
  '$filter',
  'tutteli.purchase.ROUTES',
  'tutteli.PreWork',
  'tutteli.purchase.PurchaseService',
  'tutteli.purchase.EditCategoryController.alertId',
  'tutteli.helpers.FormHelperFactory'];
function EditPurchaseController(
        $stateParams, 
        $parse,
        $filter,
        ROUTES, 
        PreWork,  
        PurchaseService,  
        alertId, 
    FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_purchase_csrf);
    
    var categories = [{id: 0, name: 'Loading categories...'}];
    var users = null;
    var usersLoaded = false;
    var categoriesLoaded = false;
    var isNotLoaded = true;
    
    this.datePicker = new DatePicker();
    this.positionManager = new PositionManager($parse, $filter);
    this.clearForm = self.positionManager.clearForm;
    
    // -------------------
    
    var positions = {};
    if (PreWork.merge('purchases/edit.tpl', positions, 'positions')) {
        //positions is actually an object with field names as index
        for(var i in positions) {
            self.positionManager.addPosition();
            self.positionManager.positions[i].expression = positions[i].expression;
            self.positionManager.positions[i].notice = positions[i].notice;
        }
    }
    PreWork.merge('purchases/edit.tpl', this, 'purchaseCtrl');

    isNotLoaded = self.positionManager.positions.length == 0;
    if (isNotLoaded) {
        self.loadPurchase($stateParams.purchaseId);
    }
    
    formHelper.reloadCsrfIfNecessary();

//    self.loadCategories();
//    self.loadUsers();
    document.getElementById('purchase_add').style.display = 'inline';
}


PurchaseMonthController.$inject = [
    '$stateParams',
    'tutteli.purchase.PurchaseService',
    'tutteli.helpers.InitHelper'];
function PurchaseMonthController($stateParams, PurchaseService, InitHelper) {
    var self = this;
    
    this.purchases = null;
    
    this.initPurchases = function(data) {
        InitHelper.initTableData('purchases', self, data);
    };
    
    // ----------------
    
    InitHelper.initTableBasedOnPreWork('purchases/month.tpl', 'purchases', this, function() {
       PurchaseService.getPurchases($stateParams.month, $stateParams.year).then(self.initPurchases);
    });
}

PurchaseService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES'];
function PurchaseService($http, $q, $timeout, ROUTES) {
    
    this.createPurchase = function(purchase) {
        var errors = '';
        var positionDtos = [];
        for (var i = 0; i < purchase.positions.length; ++i) {
            var position = purchase.positions[i];
            if (position.expression == '0') {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">'
                            + 'price of position ' + (i + 1) 
                        + '</a> needs to be greater than 0.<br/>';
            } else if (!position.expression.match(/^[0-9]+(.[0-9]{1,2})?(\s*(\+|-|\*)\s*[0-9]+(.[0-9]{1,2})?)*$/)) {
                errors += 'The <a href="#" onclick="document.getElementById(\'purchase_expression' + i + '\').focus(); return false">'
                            +'price expression of position ' + (i + 1)
                        + '</a> is erroneous. '
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
            purchase.positions = positionDtos;
            return $http.post(ROUTES.post_purchase, purchase);
        }
        // delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function() {
            delay.reject({error: errors});
        }, 1);
        return delay.promise;
    };
    
    this.getPurchases = function(month, year) {
        var url = ROUTES.get_purchases_monthAndYear_json
            .replace(':month', month)
            .replace(':year', year);
        
        return $http.get(url).then(function(response) {
            if (response.data.purchases === undefined) {
                return $q.reject({msg:'The property "purchases" was not defined in the returned data.', data: response.data});
            }
            if (response.data.updatedAt === undefined) {
                return $q.reject({msg:'The property "updatedAt" was not defined in the returned data.', data: response.data});
            }
            if (response.data.updatedBy === undefined) {
                return $q.reject({msg:'The property "updatedBy" was not defined in the returned data.', data: response.data});
            }
            return $q.resolve(response.data);
        });
    };
}

})();