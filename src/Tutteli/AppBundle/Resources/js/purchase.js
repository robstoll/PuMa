/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.core', ['tutteli.purchase.routing'])
    .controller('tutteli.purchase.PurchaseController', PurchaseController)
    .service('tutteli.purchase.PurchaseService', PurchaseService);

PurchaseController.$inject = ['$parse', '$filter', 'tutteli.PreWork', 'tutteli.purchase.PurchaseService', 'tutteli.alert.AlertService'];
function PurchaseController($parse, $filter, PreWork, PurchaseService, AlertService) {
    var self = this;
    var categories = [{id: '1', text: 'Lebensmittel'}];
    var users = [{id: 1, name: 'admin'}];
    
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
        //TODO replace dummy categories
        return categories;
    };
    
    this.getUsers = function() {
        //TODO replace dummy users
        return users;
    };
    
    this.selectUser = function(id) {
        this.user = id;
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
        var alertId = 'tutteli-ctrls-Purchase';
        AlertService.close(alertId);
        PurchaseService.add(self.user, self.dt, self.positions).then(function() {
            AlertService.add(alertId, 'Purchase successfully added', 'success');
        }, function(errorResponse) {
            if (errorResponse.status == 400) {
                var data = errorResponse.data;
                var err = '';
                if (angular.isObject(data)) {
                    for (var prop in data) {
                        err += data[prop];
                    }
                } else {
                    err = data;
                }
                AlertService.add(alertId, err, 'danger');
            } else {
                AlertService.add(alertId, 'Unknown error occurred. Please try again.', 'danger');
            }
        });
    };
    
    //-------------------
    
    self.addPosition();
    var position = {};
    if (PreWork.merge('purchase.tpl', position,  'position')) {
        self.positions[0].price = position.price;
        self.positions[0].notice = position.notice;
    }
    PreWork.merge('purchase.tpl', this, 'purchaseCtrl');
    
}

function Position($parse, $filter) {
    var self = this;
    this.price = null;
    this.category = null;
    this.notice = '';
    this.calc = function() {
        var val = 0;
        if (self.price) {
            try{
                val = $parse(self.price)(this);
            } catch(err){
                //that's fine
            }
        }
        return $filter('currency')(val, 'CHF ');
    };
}

PurchaseService.$inject = ['$http', 'tutteli.purchase.ROUTES'];
function PurchaseService($http, ROUTES) {
    this.add = function(userId, date, positions) {
        var positionDtos = [];
        for (var i = 0; i < positions.length; ++i) {
            positionDtos[i] = {
                    price: positions[i].price,
                    categoryId: positions[i].category,
                    notice: positions[i].notice
            };
        }
        return $http.post(ROUTES.post_purchase, {userId: userId, dt: date, positions: positionDtos});
    };
}

})();