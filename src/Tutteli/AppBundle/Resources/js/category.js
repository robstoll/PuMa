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
    .controller('tutteli.purchase.EditCategoryController', EditCategoryController)
    .service('tutteli.purchase.CategoryService', CategoryService)
    .constant('tutteli.purchase.NewCategoryController.alertId', 'tutteli-ctrls-NewCategoryController')
    .constant('tutteli.purchase.EditCategoryController.alertId', 'tutteli-ctrls-EditCategoryController');

CategoriesController.$inject = ['tutteli.purchase.CategoryService', 'tutteli.helpers.InitHelper'];
function CategoriesController(CategoryService, InitHelper) {
    var self = this;
    
    this.categories = null;
    
    this.initCategories = function(data) {
        InitHelper.initTableData('categories', self, data);
    };
    
    // ----------------
    
    InitHelper.initTable('categories', this, function() {
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
    
    this.createCategory = function($event) {
        var category = {name: self.name, csrf_token: self.csrf_token};
        formHelper.create($event, alertId, category, 'Category', 'name', CategoryService);
    };
    
    this.isDisabled = function() {
        //no need to load data when creating an new category hence can always be enabled
        return false;
    };
    
    this.clearForm = function() {
        self.name = '';
        document.getElementById('category_name').focus();
    };
    
    // ----------------
    
    PreWork.merge('categories/new.tpl', this, 'categoryCtrl');
    formHelper.reloadCsrfIfNecessary();
}


EditCategoryController.$inject = [
    '$stateParams',
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.CategoryService',
    'tutteli.purchase.EditCategoryController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function EditCategoryController(
        $stateParams, 
        ROUTES, 
        PreWork,  
        CategoryService,  
        alertId, 
        FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_category_csrf);
    var isNotLoaded = true;
    
    this.loadCategory = function(categoryId) {
        CategoryService.getCategory(categoryId).then(function(category) {
            self.id = category.id;
            self.name = category.name;
            self.updatedAt = category.updatedAt;
            self.updatedBy = category.updatedBy;
            isNotLoaded = false;
        });
    };
    
    this.updateCategory = function($event) {
        var category = {id: self.id, name: self.name, csrf_token: self.csrf_token};
        formHelper.update($event, alertId, category, 'Category', category.name, CategoryService);
    };
    
    this.isDisabled = function() {
        return isNotLoaded;
    };
    
    // ----------------
    
    PreWork.merge('categories/edit.tpl', this, 'categoryCtrl');
    
    isNotLoaded = self.name === undefined;
    if (isNotLoaded) {
        self.loadCategory($stateParams.categoryId);
    }
    
    formHelper.reloadCsrfIfNecessary();
}

CategoryService.$inject = ['$http', '$q', 'tutteli.purchase.ROUTES', 'tutteli.helpers.ServiceHelper'];
function CategoryService($http, $q, ROUTES, ServiceHelper) {
    
    this.getCategories = function() {
        return ServiceHelper.cget(ROUTES.get_categories_json, 'categories');
    };
    
    this.getCategory = function(categoryId) {
        return ServiceHelper.get(ROUTES.get_category_json.replace(':categoryId', categoryId), 'category');
    };
    
    this.createCategory = function(category) {
        return $http.post(ROUTES.post_category, category);
    };
    
    this.updateCategory = function(category) {
        return $http.put(ROUTES.put_category.replace(':categoryId', category.id), category);
    };
}

})();