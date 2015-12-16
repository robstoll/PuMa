/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.login', [
    'tutteli.preWork', 
    'tutteli.auth', 
    'tutteli.alert',
    
    'ui.bootstrap'
])
    .controller('tutteli.LoginController', LoginController)
    .controller('tutteli.LoginModalController', LoginModalController)
    .service('tutteli.LoginModalService', LoginModalService)
    .constant('tutteli.LoginController.alertId', 'tutteli-ctrls-Login');

LoginController.$inject = [
    '$http', 
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork', 
    'tutteli.auth.AuthService',
    'tutteli.alert.AlertService', 
    'tutteli.LoginController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function LoginController($http, ROUTES, PreWork, AuthService, AlertService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_user_csrf);
        
    this.login = function ($event) {
        var credentials = {
            username: self.username,
            password: self.password,
            csrf_token: self.csrf_token
        };
        formHelper.call('login', $event, alertId, credentials, AuthService, function unknownErrorHandler(errorResponse) {
            var msg = 'Unexpected error occured. Please log in again in a few minutes. '
                + 'If the error should occurr again (this message does not disappear), '
                + 'then please {{reportLink}} and report the shown error to the admin.<br/>'
                + '{{reportContent}}';
            
            var report = AlertService.getHttpErrorReport(errorResponse);
            AlertService.addErrorReport(alertId, msg, 'warning', 
                    null, null, 
                    '_login_report', 'click here', report);                            
        
        });
    };
    
    // ------------------
    
    PreWork.merge('login.tpl', this, 'loginCtrl');
       
    formHelper.reloadCsrfIfNecessary();    
}

LoginModalController.$inject = ['$scope', 'tutteli.auth.AuthService'];
function LoginModalController($scope, AuthService) {
    this.cancel = $scope.$dismiss;

    this.submit = function (credentials) {
        AuthService.login(credentials).then(function (user) {
            $scope.$close(user);
        }, function() {
            
        }); 
        
    };
}

LoginModalService.$inject = ['$rootScope','$uibModal'];
function LoginModalService($rootScope, $uibModal) {

    this.open = function() {
      var instance = $uibModal.open({
        templateUrl: 'login.tpl',
        controller: 'tutteli.LoginModalController',
        backgrop: false
      });

      return instance.result.then(function(){
          console.error('TODO not yet implemented, LoginModalService.js');
      });
    };

}

})();