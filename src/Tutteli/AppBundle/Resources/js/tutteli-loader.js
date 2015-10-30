/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';
(function(){
    
function HttpInterceptorProvider() {
    var selector = '#loader';
    var className = 'loading';
    var bodyClassName = 'waiting';
    
    this.setSelector = function (newSelector) {
        selector = newSelector;
    };
    
    this.setClassName = function (newClassName) {
        className = newClassName;
    };
    
    this.setBodyClassName = function (newBodyClassName) {
        bodyClassName = newBodyClassName;
    };
    
    this.$get = $get;
    $get.$inject = ['$q'];
    function $get($q) { return{
        
        request: function(config){
            angular.element(selector).addClass(className);
            angular.element(document.body).addClass(bodyClassName);
            return config;
        },

        response: function(response) {
            angular.element(selector).removeClass(className);
            angular.element(document.body).removeClass(bodyClassName);
            return response;
        },
        
        responseError: function(rejection) {
            angular.element(selector).removeClass(className);
            angular.element(document.body).removeClass(bodyClassName);
            return $q.reject(rejection);
        }
    
    };}
}

angular.module('tutteli.loader', [])
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
      return $injector.get('tutteli.loader.HttpInterceptor');
    }]);
}]).provider('tutteli.loader.HttpInterceptor', HttpInterceptorProvider);

})();