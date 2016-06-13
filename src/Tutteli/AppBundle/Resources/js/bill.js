/* 
 * This file is part of the project tutteli-puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma.bill', [
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
    .controller('tutteli.puma.BillsController', BillsController)
    .service('tutteli.puma.BillService', BillService);

BillsController.$inject = [
    '$state',
    '$stateParams',
    'tutteli.puma.BillService',
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

BillService.$inject = ['$http', '$q', '$timeout', 'tutteli.puma.ROUTES', 'tutteli.helpers.ServiceHelper'];
function BillService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getBills = function(year) {
        var url = ROUTES.get_bills_year_json
            .replace(':year', year);
        return ServiceHelper.cget(url, 'bills');
    };
}

})();