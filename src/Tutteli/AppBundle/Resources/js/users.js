/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.users', [
    'tutteli.preWork', 
    'tutteli.auth', 
    'tutteli.purchase.routing', 
    'tutteli.utils'
])
    .controller('tutteli.purchase.UsersController', UsersController)
    .controller('tutteli.purchase.NewUserController', NewUserController)
    .controller('tutteli.purchase.EditUserController', EditUserController)
    .service('tutteli.purchase.UserService', UserService)
    .constant('tutteli.purchase.NewUserController.alertId', 'tutteli-ctrls-NewUserController')
    .constant('tutteli.purchase.EditUserController.alertId', 'tutteli-ctrls-EditUserController');

UsersController.$inject = ['tutteli.PreWork', 'tutteli.purchase.UserService'];
function UsersController(PreWork, UserService) {
    var self = this;
    
    this.users = null;
    
    this.loadUsers = function() {
        UserService.getUsers().then(self.initUsers);
    };
  
    this.initUsers = function(data) {
        self.users = data;
        document.getElementById('users_rows').className = '';
        document.getElementById('users_load').style.display = 'none';
    };
    
    // ----------------
    
    PreWork.merge('users.tpl', this, 'usersCtrl');
    if (self.usersInit !== undefined) {
        self.initUsers(JSON.parse(self.usersInit));
    } else {
        document.getElementById('users_load').style.display = 'block';
        self.loadUsers();
    }
}

NewUserController.$inject = [
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.UserService', 
    'tutteli.alert.AlertService',
    'tutteli.purchase.NewUserController.alertId',
    'tutteli.csrf.CsrfService',
    'tutteli.utils.ErrorHandler'];
function NewUserController(ROUTES, PreWork, UserService, AlertService, alertId, CsrfService, ErrorHandler) {
    var self = this;
    
    this.addUser = function($event) {
        $event.preventDefault();
        AlertService.close(alertId);
        UserService.addUser(self.username, self.email, self.role, self.csrf_token).then(function() {
            AlertService.add(alertId, 'User successfully added.', 'success');
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, reloadCsrfToken);
        });
    };
    
    function reloadCsrfToken() {
        CsrfService.reloadToken(ROUTES.get_user_csrf, self);
    }
    
    // ----------------
    
    PreWork.merge('users/new.tpl', this, 'userCtrl');    
    
    if (self.csrf_token === undefined || self.csrf_token === '') {
        reloadCsrfToken();
    }
}



EditUserController.$inject = [
    '$stateParams',
    'tutteli.PreWork',
    'tutteli.purchase.UserService'];
function EditUserController($stateParams, PreWork, UserService) {
    var self = this;
    
    this.loadUser = function(userId) {
        UserService.getUser(userId).then(function(user) {
            self.id = user.id;
            self.username = user.username;
            self.email = user.email;
            self.role = user.roleId;
            document.querySelector('#user_role > option').remove();
        });
    };
    
    // ----------------
    
    PreWork.merge('users/edit.tpl', this, 'userCtrl');    
    self.loadUser($stateParams.userId);
}

UserService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES'];
function UserService($http, $q, $timeout, ROUTES) {
    
    this.getUsers = function() {
        return $http.get(ROUTES.get_users_json).then(function(response) {
            if (response.data.users === undefined) {
                return $q.reject({msg:'The property "users" was not defined in the returned data.', data: response.data});
            }
            return $q.resolve(response.data.users);
        });
    };
    
    this.getUser = function(userId) {
        return $http.get(ROUTES.get_user_json.replace(':userId', userId)).then(function(response) {
            if (response.data.user === undefined) {
                return $q.reject({msg:'The property "user" was not defined in the returned data.', data: response.data});
            }
            return $q.resolve(response.data.user);
        });
    };
    
    this.addUser = function(username, email, roleId, csrf_token) {
        var errors = '';
        var emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (email != '' && !emailRegExp.test(email)) {
            errors = '<a href="#" onclick="document.getElementById(\'user_email\').focus(); return false">' 
                + 'Invalid email provided'
                + '</a>, please check it for writing mistakes.';
        }
        if (errors == '') {
            var data = {
                username: username, 
                email: email, 
                roleId: roleId, 
                csrf_token: csrf_token
            };
            return $http.post(ROUTES.post_user, data);
        }
        // delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function() {
            delay.reject({error: errors});
        }, 1);
        return delay.promise;
    };
}

})();