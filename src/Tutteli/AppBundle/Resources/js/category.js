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
    .controller('tutteli.purchase.NewCategoryController', NewCategoryController)
    .service('tutteli.purchase.CategoryService', CategoryService)
    .constant('tutteli.purchase.NewCategoryController.alertId', 'tutteli-ctrls-NewCategoryController');

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


NewCategoryController.$inject = [
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.CategoryService', 
    'tutteli.purchase.NewCategoryController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function NewCategoryController(ROUTES, PreWork, CategoryService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_category_csrf);
    
    this.addCategory = function($event) {
        var category = {name: self.name, csrf_token: self.csrf_token};
        formHelper.create($event, alertId, category, 'Category', CategoryService);
    };
        
    this.isAdmin = function() {
        //must be admin, is secured via auth routing
        return true;
    };
    
    this.isDisabled = function() {
        //no need to load data when creating an new user hence can always be enabled
        return false;
    };
    
    // ----------------
    
    PreWork.merge('categories/new.tpl', this, 'categoryCtrl');
    formHelper.reloadCsrfIfNecessary();
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
    
    this.createCategory = function(category) {
        return $http.post(ROUTES.post_category, category);
    };
    
}

})();