/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.bill', [
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
    .controller('tutteli.purchase.BillsController', BillsController)
    .service('tutteli.purchase.BillService', BillService);

BillsController.$inject = [
    '$state',
    '$stateParams',
    'tutteli.purchase.BillService',
    'tutteli.helpers.InitHelper'];
function BillsController($state, $stateParams, BillService, InitHelper) {
    var self = this;
    
    this.bills = null;
    this.openAmounts = null;
    
    this.initBills = function(data) {
        InitHelper.initTableData('bills', self, data);
        document.querySelector('.overview.bill').style.display = 'block';
    };
    
    this.changeState = function() {
        $state.transitionTo('bills_year', {year: self.chosenYear});
    };
    
    // ----------------
    
    InitHelper.initTableBasedOnPreWork('accounting/bills.tpl', 'bills', this, function() {
       return BillService.getBills($stateParams.year);
    });
    if (!self.chosenYear) {
       self.chosenYear =  $stateParams.year;
    }
}

BillService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES', 'tutteli.helpers.ServiceHelper'];
function BillService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getBills = function(year) {
        var url = ROUTES.get_bills_year_json
            .replace(':year', year);
        return ServiceHelper.cget(url, 'bills');
    };
}

})();