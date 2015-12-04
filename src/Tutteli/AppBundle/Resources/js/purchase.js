/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.core', [])
    .controller('tutteli.purchase.PurchaseController', PurchaseController);

PurchaseController.$inject = ['$parse', '$filter', 'tutteli.PreWork'];
function PurchaseController($parse, $filter, PreWork) {
    var self = this;
    
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
        return ['Lebensmittel'];
    };
    
    this.getUsers = function() {
        //TODO replace dummy users
        return ['admin'];
    };
    
    this.addPosition = addPosition;
    function addPosition() {
      self.positions.push(new Position($parse, $filter));  
    }
    
    this.removePosition = function(index) {
        self.positions.splice(index, 1);  
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

})();