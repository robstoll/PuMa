/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.category', [
    'tutteli.preWork', 
    'tutteli.purchase.routing',
    'tutteli.helpers'
])
    .controller('tutteli.purchase.CategoriesController', CategoriesController)
    .service('tutteli.purchase.CategoryService', CategoryService);

CategoriesController.$inject = ['tutteli.PreWork', 'tutteli.purchase.CategoryService', 'tutteli.helpers.InitHelper'];
function CategoriesController(PreWork, CategoryService, InitHelper) {
    var self = this;
    
    this.categories = null;
    
    this.initCategories = function(data) {
        InitHelper.initTableData('categories', self, data);
    };
    
    // ----------------
    
    InitHelper.initTable('categories', this, function(){
       CategoryService.getCategories().then(self.initCategories);
    });
}

CategoryService.$inject = ['$http', '$q', 'tutteli.purchase.ROUTES'];
function CategoryService($http, $q, ROUTES) {
    
    this.getCategories = function() {
        return $http.get(ROUTES.get_categories_json).then(function(response) {
            if (response.data.categories === undefined) {
                return $q.reject({msg:'The property "categories" was not defined in the returned data.', data: response.data});
            }
            return $q.resolve(response.data.categories);
        });
    };
    
}

})();