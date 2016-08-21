/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
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
    'tutteli.puma.ROUTES',
    'tutteli.PreWork', 
    'tutteli.auth.AuthService',
    'tutteli.alert.AlertService', 
    'tutteli.LoginController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function LoginController($http, ROUTES, PreWork, AuthService, AlertService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_login_csrf);
        
    this.login = function ($event) {
        login(self, $event, formHelper, AuthService, AlertService, alertId);
    };
    
    // ------------------
    
    PreWork.merge('login.tpl', this, 'loginCtrl');
       
    formHelper.reloadCsrfIfNecessary();    
}

function login(self, $event, formHelper, AuthService, AlertService, alertId) {
    var credentials = {
        username: self.username,
        password: self.password,
        csrf_token: self.csrf_token
    };
    return formHelper.call('login', $event, alertId, credentials, AuthService, function unknownErrorHandler(errorResponse) {
        var msg = 'Unexpected error occured. Please log in again in a few minutes. '
            + 'If the error should occurr again (this message does not disappear), '
            + 'then please {{reportLink}} and report the shown error to the admin.<br/>'
            + '{{reportContent}}';
        
        var report = AlertService.getHttpErrorReport(errorResponse);
        AlertService.addErrorReport(alertId, msg, 'warning', 
                null, null, 
                '_login_report', 'click here', report);                            
        window.scroll(0, 0);
    });
}

LoginModalController.$inject = [
    '$scope', 
    'tutteli.puma.ROUTES',
    'tutteli.PreWork', 
    'tutteli.auth.AuthService', 
    'tutteli.alert.AlertService', 
    'tutteli.LoginController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function LoginModalController($scope, ROUTES, PreWork, AuthService, AlertService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_login_csrf);
    
    this.cancel = $scope.$dismiss;

    this.login = function ($event) {
        login(self, $event, formHelper, AuthService, AlertService, alertId).then(function() {
            $scope.$close();
            AlertService.clear();
            AlertService.add(alertId, 'Login successful, please repeat your last action.', 'success');
        }); 
    };
    
    // ------------------
    
    PreWork.merge('login.tpl', this, 'loginCtrl');
       
    formHelper.reloadCsrfIfNecessary(); 
}

LoginModalService.$inject = ['$uibModal'];
function LoginModalService($uibModal) {

    this.open = function() {
      var alerts = document.querySelector('div[ng-controller=\'tutteli.alert.AlertController as alertCtrl\']');
      var parent = alerts.parentElement;
      var instance = $uibModal.open({
        templateUrl: 'login.tpl',
        controller: 'tutteli.LoginModalController',
        controllerAs: 'loginCtrl',
        backdrop: 'static'
      });
      
      var dialog = null;
      instance.rendered.then(function() {
          dialog = document.querySelector('.modal-dialog');
          parent.removeChild(alerts);
          dialog.insertBefore(alerts, dialog.firstChild);
      });  
      
      function resetAlert() {
          dialog.removeChild(alerts);
          parent.insertBefore(alerts, parent.firstChild);
      }      
      
      return instance.result.then(function() {
          resetAlert();
      }, function() {
          resetAlert();
      });
    };

}

})();