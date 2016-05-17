/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.billing', [
     'tutteli.purchase.routing', 
     'tutteli.preWork',
     'tutteli.alert',
     'tutteli.csrf',
     'tutteli.purchase.category',
     'tutteli.purchase.user',
     'tutteli.helpers',
     'tutteli.utils',
     'ui.bootstrap',
 ])
     .controller('tutteli.purchase.BillingsController', BillingsController)
     .service('tutteli.purchase.BillingService', BillingService);

BillingsController.$inject = [
    '$state',
    '$stateParams',
    'tutteli.purchase.BillingService',
    'tutteli.helpers.InitHelper'];
function BillingsController($state, $stateParams, BillingService, InitHelper) {
    var self = this;
    
    this.billings = null;
    this.openAmounts = null;
    
    this.initBillings = function(data) {
        InitHelper.initTableData('billings', self, data);
        document.querySelector('.overview.billing').style.display = 'block';
    };
    
    this.changeState = function() {
        $state.transitionTo('billings_year', {year: self.chosenYear});
    };
    
    // ----------------
    
    InitHelper.initTableBasedOnPreWork('accounting/billing.tpl', 'billings', this, function() {
       return BillingService.getBillings($stateParams.year);
    });
    if (!self.chosenYear) {
       self.chosenYear =  $stateParams.year;
    }
}

BillingService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES', 'tutteli.helpers.ServiceHelper'];
function BillingService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getBillings = function(year) {
        var url = ROUTES.get_billings_year_json
            .replace(':year', year);
        return ServiceHelper.cget(url, 'billings');
    };
}

})();