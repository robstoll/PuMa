/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma.accounting',  [

])
    .controller('tutteli.puma.TerminateMonthController', TerminateMonthController)
    .service('tutteli.puma.AccountingService', AccountingService)
    .constant('tutteli.puma.AccountingService.alertId', 'tutteli-ctrls-Accounting');

TerminateMonthController.$inject = [
    'tutteli.puma.ROUTES',          
    'tutteli.PreWork',
    'tutteli.puma.AccountingService',
    'tutteli.puma.AccountingService.alertId',
    'tutteli.helpers.FormHelperFactory',
];
function TerminateMonthController(
        ROUTES, 
        PreWork, 
        AccountingService,
        alertId,
        FormHelperFactory) {
    var self = this;
    var currentMonth = null;
    var currentYear = null;
    var showTerminateButton = null;
    var disableTerminateButton = false;
    var accountings = [];
    var month = null;
    var year = null;    

    this.formHelper = FormHelperFactory.build(self, ROUTES.get_accounting_csrf);
    
    this.init = function(aMonth, aYear) {
        month = aMonth;
        year = aYear;
        self.loadAccountings();
    };
    
    this.showButton = function() {
        if (showTerminateButton == null || currentMonth != month || currentYear != year) {
            currentMonth = month;
            currentYear = year;
            var today = new Date();
            showTerminateButton = today.getFullYear() == year && today.getMonth() + 1 > month 
                || today.getFullYear() > year;
        }
        return showTerminateButton;
    };
    
    this.isButtonDisabled = function() {
        if (currentMonth != month || currentYear != year) {
            //TODO check whether given month/year is already terminated
        }
        return disableTerminateButton;
    };
    
    this.loadAccountings = function() {
        AccountingService.getAccountings(year).then(function(data) {
            accountings = data;
        });
    };
    
    this.terminate = function($event) {
        var data = {
                month: month,
                year: year,
                csrf_token: self.csrf_token
        };
        self.formHelper.call('terminateMonth', $event, alertId, data, AccountingService);
    };
    
    // -------------------
    
    PreWork.merge('purchases/month.tpl', this, 'accountingCtrl');
    self.formHelper.reloadCsrfIfNecessary();
}

AccountingService.$inject = ['$http', '$q', '$timeout', 'tutteli.puma.ROUTES', 'tutteli.helpers.ServiceHelper'];
function AccountingService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getAccountings = function(year) {
        var url = ROUTES.get_accountings_year_json.replace(':year', year);
        return ServiceHelper.cget(url, 'accountings');
    };
    
    this.terminateMonth = function(data) {
        var url = ROUTES.put_accounting_terminateMonth.replace(':month', data.month).replace(':year', data.year);
        return $http.put(url, {csrf_token: data.csrf_token});
    };
}

})();