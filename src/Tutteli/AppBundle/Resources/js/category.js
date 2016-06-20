/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma.category', [
    'tutteli.preWork', 
    'tutteli.puma.routing',
    'tutteli.helpers'
])
    .controller('tutteli.puma.CategoriesController', CategoriesController)
    .controller('tutteli.puma.NewCategoryController', NewCategoryController)
    .controller('tutteli.puma.EditCategoryController', EditCategoryController)
    .service('tutteli.puma.CategoryService', CategoryService)
    .constant('tutteli.puma.NewCategoryController.alertId', 'tutteli-ctrls-NewCategoryController')
    .constant('tutteli.puma.EditCategoryController.alertId', 'tutteli-ctrls-EditCategoryController');

CategoriesController.$inject = ['tutteli.puma.CategoryService', 'tutteli.helpers.InitHelper'];
function CategoriesController(CategoryService, InitHelper) {
    var self = this;
    
    this.categories = null;
    
    this.initCategories = function(data) {
        InitHelper.initTableData('categories', self, data);
    };
    
    // ----------------
    
    InitHelper.initTable('categories', this, function() {
       return CategoryService.getCategories();
    });
}

var ASavingController = tutteliSavingController();
tutteliExtends(ACategoryController, ASavingController);
function ACategoryController(ROUTES, FormHelperFactory) {
    ASavingController.call(this);
    var self = this;
    
    this.formHelper = FormHelperFactory.build(self, ROUTES.get_category_csrf);
    
    // ----------------
    
    self.formHelper.reloadCsrfIfNecessary();
}

NewCategoryController.$inject = [
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.CategoryService', 
    'tutteli.puma.NewCategoryController.alertId',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(NewCategoryController, ACategoryController);
function NewCategoryController(ROUTES, PreWork, CategoryService, alertId, FormHelperFactory) {
    ACategoryController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    
    this.createCategory = function($event) {
        self.startSaving();
        var category = {name: self.name, csrf_token: self.csrf_token};
        self.formHelper.create($event, alertId, category, 'Category', 'name', CategoryService)
            .then(self.endSaving, self.endSaving);
    };
    
    this.clearForm = function() {
        self.name = '';
        document.getElementById('category_name').focus();
    };
    
    // ----------------
    
    PreWork.merge('categories/new.tpl', this, 'categoryCtrl');
}


EditCategoryController.$inject = [
    '$stateParams',
    '$timeout',
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.CategoryService',
    'tutteli.puma.EditCategoryController.alertId',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(EditCategoryController, ACategoryController);
function EditCategoryController(
        $stateParams, 
        $timeout,
        ROUTES, 
        PreWork,  
        CategoryService,  
        alertId, 
        FormHelperFactory) {
    ACategoryController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    var isNotLoaded = true;
    
    this.loadCategory = function(categoryId) {
        CategoryService.getCategory(categoryId).then(function(category) {
            self.id = category.id;
            self.name = category.name;
            self.updatedAt = category.updatedAt;
            self.updatedBy = category.updatedBy;
            isNotLoaded = false;
            $timeout(function() {
                document.getElementById('category_name').focus();
            }, 10);
        });
    };
    
    this.updateCategory = function($event) {
        self.startSaving();
        var category = {
            id: self.id, 
            name: self.name, 
            csrf_token: self.csrf_token
        };
        self.formHelper.update($event, alertId, category, 'Category', category.name, CategoryService)
            .then(self.endSaving, self.endSaving);
    };
    
    var isDisabledParent = this.isDisabled;
    this.isDisabled = function() {
        return isNotLoaded || isDisabledParent();
    };
    
    // ----------------
    
    PreWork.merge('categories/edit.tpl', this, 'categoryCtrl');
    
    isNotLoaded = self.name === undefined;
    if (isNotLoaded) {
        self.loadCategory($stateParams.categoryId);
    }
    
}

CategoryService.$inject = ['$http', '$q', 'tutteli.puma.ROUTES', 'tutteli.helpers.ServiceHelper'];
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