/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma.core', [
    'tutteli.puma.routing', 
    'tutteli.preWork',
    'tutteli.alert',
    'tutteli.csrf',
    'tutteli.puma.category',
    'tutteli.puma.user',
    'tutteli.helpers',
    'tutteli.utils',
    'ui.bootstrap',
])
    .controller('tutteli.puma.NewPurchaseController', NewPurchaseController)
    .controller('tutteli.puma.EditPurchaseController', EditPurchaseController)
    .controller('tutteli.puma.PurchasesMonthController', PurchasesMonthController)
    .service('tutteli.puma.PurchaseService', PurchaseService)
    .service('tutteli.puma.LoaderFactory', LoaderFactory)
    .service('tutteli.puma.PositionManagerFactory', PositionManagerFactory)
    .constant('tutteli.puma.PurchaseService.alertId', 'tutteli-ctrls-Purchase');

function parseDateIfNecessary(date) {
    //necessary since ui.datePicker does not use the format specified during initialisation (month and day are switched)
    if (!(date instanceof Date)) {
        var result = date.match(/((?:0?[1-9])|(?:[1-3][0-9]))\.((?:0?[1-9])|(?:1[0-2]))\.((?:[1-2][0-9])?[0-9][0-9])/);
        if (result) {
            var year = result[3].length == 2 ? '20' + result[3] : result[3];
            var month = result[2] - 1;
            var day = result[1];
            date = new Date(year, month, day);
            if (date.getFullYear() != year || date.getMonth() != month || date.getDate() != day) {
                throw "overlapping date";
            }
        }
    }
    return date;
}

// needs to be outside of APurchaseController otherwise it is always a different function 
// and thus is registered multiple times
function ShiftPlusKeyEventListener(event) {
    //SHIFT & +
    if (event.shiftKey && event.keyCode == 107) {
        event.preventDefault();
        document.getElementById('puma_add').click();
    }
}

var ASavingController = tutteliSavingController();
tutteliExtends(APurchaseController, ASavingController);
function APurchaseController(
        $scope,
        uibDateParser,
        ROUTES, 
        PreWork,
        PurchaseService,
        alertId,
        LoaderFactory,
        PositionManagerFactory,
        FormHelperFactory) {
    ASavingController.call(this);
    var self = this;
    
    var categories = [{id: 0, name: 'Loading categories...'}];
    var users = null;
    var usersLoaded = false;
    var categoriesLoaded = false;
    var disabled = false;
    
    var categoriesLoader = LoaderFactory.buildCategoriesLoader(self);
    var usersLoader = LoaderFactory.buildUsersLoader(self);
    
    
    this.formHelper = FormHelperFactory.build(self, ROUTES.get_puma_csrf);
    this.dt = new Date();
    this.datePicker = new DatePicker(this);
    this.positionManager = PositionManagerFactory.build();
    this.clearForm = self.positionManager.clearForm;
    
    this.parseDateIfNecessary = function(dt) {
        try {
            self.dt = parseDateIfNecessary(self.dt);
        } catch(err) {
            //we ignore an error here, will be throw during save if the user should not realise it.
        }
    };
    
    this.preInitUsers = function() {
        if (!usersLoaded && self.user) {
            users = [{id: self.user, username: self.user_label, isReal: 1}];
        }
    };
    
    this.preInitCategories = function(id, name) {
        if (!categoriesLoaded) {
            var entry = {id: id, name: name};
            if (categories[0].id == 0) {
                categories = [entry];
            } else {
                categories.push(entry);
            }
        }
    };
    
    var isDisabledParent = this.isDisabled;
    this.isDisabled = function() {
        return (disabled && (!usersLoaded || !categoriesLoaded)) || isDisabledParent(); 
    };
    
    this.loadCategories = function() {
        categoriesLoader.load().then(function(data) {
            categories = data.categories;
            categoriesLoaded = true;
        }, function(errorResponse) {
            disabled = true;
        });
    };
    
    this.getCategories = function() {
        return categories;
    };
    
    this.loadUsers = function() {
        usersLoader.load().then(function(data) {
            users = data.users;
            usersLoaded = true;
        }, function(errorResponse) {
            disabled = true;
        });
    };    

    this.getUsers = function() {
        return users;
    };
    
    // -------------------
    
    self.formHelper.reloadCsrfIfNecessary();

    self.loadCategories();
    self.loadUsers();
    document.getElementById('puma_add').style.display = 'inline';
    window.addEventListener('keydown', ShiftPlusKeyEventListener);
    $scope.$on("$destroy", function() {
       window.removeEventListener('keydown', ShiftPlusKeyEventListener); 
    });
}

NewPurchaseController.$inject = [
    'tutteli.auth.Session',
    '$scope',
    'uibDateParser',
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.PurchaseService',
    'tutteli.puma.PurchaseService.alertId',
    'tutteli.puma.LoaderFactory',
    'tutteli.puma.PositionManagerFactory',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(NewPurchaseController, APurchaseController);
function NewPurchaseController(
        Session,
        $scope,
        uibDateParser,
        ROUTES, 
        PreWork,
        PurchaseService,
        alertId,
        LoaderFactory,
        PositionManagerFactory,
        FormHelperFactory) {
    APurchaseController.apply(this, [].slice.call(arguments).slice(1));
    var self = this;
   
    this.createPurchase = function($event) {
        self.startSaving();
        var puma = {
            userId : self.user,
            dt : self.dt,
            positions :  self.positionManager.positions,
            csrf_token : self.csrf_token
        };
        self.formHelper.create($event, alertId, puma, 'Purchase', null, PurchaseService).then(self.endSaving, self.endSaving);
    };

    // -------------------

    self.positionManager.addPosition();
    var position = {};
    if (PreWork.merge('pumas/new.tpl', position, 'position')) {
        self.positionManager.positions[0].expression = position.expression;
        self.positionManager.positions[0].notice = position.notice;
    }
    PreWork.merge('pumas/new.tpl', this, 'pumaCtrl');
    self.parseDateIfNecessary();
    if (Session.user.isReal) {
        self.user = Session.user.id;
        self.user_label = Session.user.username;
    }
    self.preInitUsers();
}


EditPurchaseController.$inject = [
  '$stateParams',
  '$scope',
  'uibDateParser',
  'tutteli.puma.ROUTES',
  'tutteli.PreWork',
  'tutteli.puma.PurchaseService',
  'tutteli.puma.EditCategoryController.alertId',
  'tutteli.puma.LoaderFactory',
  'tutteli.puma.PositionManagerFactory',
  'tutteli.helpers.FormHelperFactory'];
tutteliExtends(EditPurchaseController, APurchaseController);
function EditPurchaseController(
        $stateParams, 
        $scope,
        uibDateParser,
        ROUTES, 
        PreWork,  
        PurchaseService,  
        alertId, 
        LoaderFactory,
        PositionManagerFactory,
        FormHelperFactory) {
    APurchaseController.apply(this, [].slice.call(arguments).slice(1));
    var self = this;
    var isNotLoaded = true;
    
    this.loadPurchase = function (pumaId) {
        PurchaseService.getPurchase(pumaId).then(function(puma) {
            self.id = puma.id;
            self.dt = puma.pumaDate;
            self.parseDateIfNecessary();
            self.user = puma.user.id;
            self.user_label = puma.user.username;
            self.preInitUsers();
            self.updatedAt = puma.updatedAt;
            self.updatedBy = puma.updatedBy;
            updatePositions(puma.positions);
            isNotLoaded = false;
            self.positionManager.focusFirstInput();
        });
    };
    
    var isDisabledParent = this.isDisabled;
    this.isDisabled = function() {
        return isNotLoaded || isDisabledParent();
    };
    
    this.updatePurchase = function($event) {
        self.startSaving();
        var puma = {
            id : self.id,
            userId : self.user,
            dt : self.dt,
            positions :  self.positionManager.positions,
            csrf_token : self.csrf_token
        };
        var select = document.getElementById('puma_user');
        var identifier = puma.dt.toLocaleDateString('de-ch') + ' - ' + select.options[select.selectedIndex].text;
        self.formHelper.update($event, alertId, puma, 'Purchase', identifier, PurchaseService).then(self.endSaving, self.endSaving);
    };
   
    function updatePositions(positions) {
        //positions is actually an object with field names corresponding to an index
        for(var i in positions) {
            self.positionManager.addPosition();
            var position = self.positionManager.positions[i];
            position.expression = positions[i].expression;
            position.notice = positions[i].notice;
            if (positions[i].category instanceof Object) {
                position.category = positions[i].category.id;
                self.preInitCategories(positions[i].category.id, positions[i].category.name);
            } else {
                position.category = positions[i].category;
                self.preInitCategories(positions[i].category, positions[i].category_label);
            }
        }
    }
    
    // -------------------
    
    self.dt = "";
    var positions = {};
    if (PreWork.merge('pumas/edit.tpl', positions, 'positions')) {
        updatePositions(positions);
    }
    PreWork.merge('pumas/edit.tpl', this, 'pumaCtrl');
    self.parseDateIfNecessary();
    self.preInitUsers();
    
    isNotLoaded = self.positionManager.positions.length == 0;
    if (isNotLoaded) {
        self.loadPurchase($stateParams.pumaId);
    }
}

function DatePicker(controller) {
    var self = this;
    this.opened = false;
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 1);
    this.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    this.today = function() {
        controller.dt = new Date();
    };

    this.open = function($event) {
        self.opened = true;
    };

}

PositionManagerFactory.$inject = ['$timeout', '$parse', '$filter'];
function PositionManagerFactory($timeout, $parse, $filter) {
       
   this.build = function () {
       return new PositionManager($timeout, $parse, $filter);
   };
}

function PositionManager ($timeout, $parse, $filter) {
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
        self.focusFirstInput();
    };
    
    this.focusFirstInput = function () {
        $timeout(function() {
            focusOrScrollTo(document.getElementById('puma_expression0'));
        }, 10);
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


LoaderFactory.$inject = [
  '$q',
  'tutteli.puma.CategoryService',
  'tutteli.puma.UserService',
  'tutteli.alert.AlertService',
  'tutteli.puma.PurchaseService.alertId'];
function LoaderFactory($q, CategoryService, UserService, AlertService, alertId) {
    
    this.buildCategoriesLoader = function (controller) {
        return new CategoriesLoader($q, CategoryService, AlertService, alertId, controller);
    };
    
    this.buildUsersLoader = function (controller) {
        return new UsersLoader($q, UserService, AlertService, alertId, controller);
    };
}

function CategoriesLoader($q, CategoryService, AlertService, alertId, controller) {
    var self = this;
    this.load = function() {
        return CategoryService.getCategories().then(function(data) {
            if (data.categories.length == 0) {
                var alertIdCategories = alertId + '-categories';
                AlertService.add(alertIdCategories,
                        'No categories are defined yet, adding/updating pumas is not yet possible. '
                        + 'Please inform your administrator. '
                        + '<a '+ closeAlertAndCall(alertIdCategories, 'loadCategories') + '>'
                            + 'Click then here once the categories have been created'
                        + '</a>.');
                return $q.reject(data);
            }
            return $q.resolve(data);
        }, function(errorResponse) {
            var alertIdUsers = alertId + '-users';
            var reportId = '_puma_categories_report';
            var report = AlertService.getHttpErrorReport(errorResponse);
            if (errorResponse.status == 404) {
                var msg = 'Categories could not been loaded, adding/updating pumas is thus not possible at the moment. '
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

function UsersLoader($q, UserService, AlertService, alertId, controller) {
    var self = this;
    this.load = function() {
        return UserService.getUsers().then(null, function(errorResponse) {
            controller.disabled = true;
            var alertIdUsers = alertId + '-users';
            var reportId = '_puma_categories_report';
            var report = AlertService.getHttpErrorReport(errorResponse);
            if (errorResponse.status == 404) {
                var msg = 'Users could not been loaded, gathering pumas is thus not possible at the moment. '
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

PurchasesMonthController.$inject = [
    '$state',
    '$stateParams',
    'tutteli.puma.PurchaseService',
    'tutteli.puma.UserService',
    '$filter',
    'tutteli.helpers.InitHelper'];
function PurchasesMonthController($state, $stateParams, PurchaseService, UserService, $filter, InitHelper) {
    var self = this;
    
    this.pumas = null;
    this.usersTotal = null;
    this.monthTotal = 0;
    this.numberOfUsers = -1;
    
    this.initPurchases = function(data) {
        InitHelper.initTableData('pumas', self, data);
        initUsersTotal();
    };
    
    function initUsersTotal() {
        var totals = getTotalPerUser();
        if (self.pumas.length > 0) {
            self.usersTotal = [];
            self.monthTotal = 0;
            for (var username in totals) {
                self.usersTotal.push({username: username, total: totals[username]});
                self.monthTotal += totals[username];
            }
            document.querySelector('.overview.month').style.display = 'block'; 
        }
    }
    
    function getTotalPerUser() {
        var totals = {};
        for (var i = 0; i < self.pumas.length; ++i) {
            var puma = self.pumas[i];
            var username = puma.user.username;
            if (!totals[username]) {
                totals[username] = 0;
            }
            var total = parseFloat(puma.total);
            totals[username] += total;
        }
        return totals;
    }
    
    this.changeState = function() {
        $state.transitionTo('pumas_monthAndYear', {month: self.chosenMonth, year: self.chosenYear});
    };
    
    // ----------------
    
    InitHelper.initTableBasedOnPreWork('pumas/month.tpl', 'pumas', this, function() {
       return PurchaseService.getPurchases($stateParams.month, $stateParams.year);
    });
    if (!self.chosenMonth) {
       self.chosenMonth = $stateParams.month;
       self.chosenYear =  $stateParams.year;
    }
    
    UserService.getUsers().then(function(users) {
        var filteredUsers = $filter('filter')(users.users, {isReal:'1'}, true);
        self.numberOfUsers = filteredUsers.length;
    });
}

PurchaseService.$inject = ['$http', '$q', '$timeout', 'tutteli.puma.ROUTES', 'tutteli.helpers.ServiceHelper'];
function PurchaseService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getPurchases = function(month, year) {
        var url = ROUTES.get_pumas_monthAndYear_json
            .replace(':month', month)
            .replace(':year', year);
        return ServiceHelper.cget(url, 'pumas');
    };
    
    this.getPurchase = function(pumaId) {
        return ServiceHelper.get(ROUTES.get_puma_json.replace(':pumaId', pumaId), 'puma');
    };
    
    function validatePurchase(puma) {
        var errors = validateDate(puma);
        var positionDtos = [];
        errors += validateExpressions(puma, positionDtos);
        return {errors: errors, positions: positionDtos};
    }
    
    function validateDate(puma) {
        var errors = '';
        
        var template = 'The <a href="#" onclick="document.getElementById(\'puma_pumaDate\').focus(); return false">'
            + 'puma date'
            + '</a> ';
        
        if (!puma.dt) {
            var date = document.getElementById('puma_pumaDate').value;
            try {
                puma.dt = parseDateIfNecessary(date);
            } catch(err) {
                errors += template + 'was erroneous, check for mistakes like 30.02.2016<br/>';
                puma.dt = new Date();
            }
        }
        var nowInAYear = new Date();
        nowInAYear.setFullYear(nowInAYear.getFullYear() + 1);
        if (!(puma.dt instanceof Date)) {
            errors +=  template + 'is invalid, please enter a date in the format dd.mm.yyyy<br/>';
        } else if(puma.dt > nowInAYear) {
            errors += template + 'cannot be more than one year in the future.<br/>';
        } else {
            puma.dt = puma.dt.toLocaleDateString('de-ch');
        }
        return errors;
    }
    
    function validateExpressions(puma, positionDtos) {
        var errors = '';
        for (var i = 0; i < puma.positions.length; ++i) {
            var position = puma.positions[i];
            if (position.expression == '0') {
                errors += 'The <a href="#" onclick="document.getElementById(\'puma_expression' + i + '\').focus(); return false">'
                            + 'price of position ' + (i + 1) 
                        + '</a> needs to be greater than 0.<br/>';
            } else if (!position.expression.match(/^[0-9]+(.[0-9]{1,2})?(\s*(\+|-|\*)\s*[0-9]+(.[0-9]{1,2})?)*$/)) {
                errors += 'The <a href="#" onclick="document.getElementById(\'puma_expression' + i + '\').focus(); return false">'
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
        return errors;
    }
    
    function createOrUpdate(puma, callback) {
        var result = validatePurchase(puma);
        if (result.errors == '') {
            puma.positions = result.positions;
            return callback(puma);
        }
        // delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function() {
            delay.reject({error: result.errors});
        }, 1);
        return delay.promise;
    }
    
    this.createPurchase = function(puma) {
        return createOrUpdate(puma, function(pumaDto) {
            return $http.post(ROUTES.post_puma, pumaDto);
        });
    };
    
    this.updatePurchase = function(puma) {
        return createOrUpdate(puma, function(pumaDto) {
           return $http.put(ROUTES.put_puma.replace(':pumaId', pumaDto.id), pumaDto);
        });
    };
    
}

})();