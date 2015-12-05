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
.service('tutteli.LoginModalService', LoginModalService);

LoginController.$inject = ['tutteli.PreWork', 'tutteli.auth.AuthService','tutteli.alert.AlertService'];
function LoginController(PreWork, AuthService, AlertService) {
    var self = this;
    
    this.credentials = {
        username: '',
        password: '',
        csrf_token: ''
    };
    
    this.login = login;
    
    PreWork.merge('login.tpl', this, 'loginCtrl');
    
    function login($event) {
        var alertId = 'tutteli-ctrls-Login';
        AlertService.close(alertId);
        $event.preventDefault();
        AuthService.login(self.credentials).then(null, function(error){
            if (error.status == 401) {
                AlertService.add(alertId, error.data, 'danger');
            } else {
                var msg = 'Unexpected error occured. '
                    + 'Please log in again in a few minutes. If the error should occurr again (this message does not disappear), '
                    + 'then please {{reportLink}} and report the shown error to the admin.<br/>'
                    + '{{reportContent}}';
                
                var report = AlertService.getHttpErrorReport(error);
                AlertService.addErrorReport(alertId, msg, 'warning', 
                        null, null, 
                        '_login_report', 'click here', report);                            
            }
        });
    }
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

    return function() {
      var instance = $uibModal.open({
        templateUrl: 'login.tpl',
        controller: 'tutteli.LoginModalCtrl',
        backgrop: false
      });

      return instance.result.then(function(){
          console.error('TODO not yet implemented, LoginModalService.js');
      });
    };

}

})();