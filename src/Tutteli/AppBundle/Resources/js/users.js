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
        UserService.createUser(self.username, self.email, self.role, self.csrf_token).then(function() {
            AlertService.add(alertId, 'User successfully added.', 'success');
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, reloadCsrfToken);
        });
    };
    
    function reloadCsrfToken() {
        CsrfService.reloadToken(ROUTES.get_user_csrf, self);
    }
    
    this.isAdmin = function() {
        //must be admin, is secured via auth routing
        return true;
    };
    
    this.isDisabled = function() {
        //no need to load data when creating an new user hence can always be enabled
        return false;
    };
    
    // ----------------
    
    PreWork.merge('users/new.tpl', this, 'userCtrl');    
    
    if (self.csrf_token === undefined || self.csrf_token === '') {
        reloadCsrfToken();
    }
}



EditUserController.$inject = [
    '$stateParams',
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.UserService',
    'tutteli.alert.AlertService',
    'tutteli.purchase.EditUserController.alertId',
    'tutteli.csrf.CsrfService',
    'tutteli.utils.ErrorHandler', 
    'tutteli.auth.AuthService', 
    'tutteli.auth.USER_ROLES'];
function EditUserController(
        $stateParams, 
        ROUTES, 
        PreWork,  
        UserService, 
        AlertService, 
        alertId, 
        CsrfService, 
        ErrorHandler, 
        AuthService, 
        USER_ROLES) {
    var self = this;
    var isNotLoaded = true;
    
    this.loadUser = function(userId) {
        UserService.getUser(userId).then(function(user) {
            self.id = user.id;
            self.username = user.username;
            self.email = user.email;
            self.role = user.roleId;
            document.querySelector('#user_role > option').remove();
            isNotLoaded = false;
        });
    };
    
    this.saveUser = function($event) {
        $event.preventDefault();
        AlertService.close(alertId);
        UserService.updateUser(self.id, self.username, self.email, self.role, self.csrf_token).then(function() {
            AlertService.add(alertId, 'User ' + self.username + ' successfully updated.', 'success');
        }, function(errorResponse) {
            ErrorHandler.handle(errorResponse, alertId, reloadCsrfToken);
        });
    };
    
    this.isDisabled = function() {
        return isNotLoaded;
    };
    
    function reloadCsrfToken() {
        CsrfService.reloadToken(ROUTES.get_user_csrf, self);
    }
    
    this.isAdmin = function() {
        return AuthService.isAuthorised(USER_ROLES.admin);
    };
    
    // ----------------
    
    PreWork.merge('users/edit.tpl', this, 'userCtrl');
    
    isNotLoaded = self.username === undefined;
    if (isNotLoaded) {
        self.loadUser($stateParams.userId);
    }
    
    if (self.csrf_token === undefined || self.csrf_token === '') {
        reloadCsrfToken();
    }
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
    
    this.createUser = function(username, email, roleId, csrf_token) {
        var user = {
            username: username, 
            email: email, 
            roleId: roleId, 
            csrf_token: csrf_token
        };
        var errors = validateUser(user);
        if (errors == '') {
            return $http.post(ROUTES.post_user, user);
        }
        return getError(errors);
    };
    
    function getError(errors){
        // delay is necessary in order that alert is removed properly
        var delay = $q.defer();
        $timeout(function() {
            delay.reject({error: errors});
        }, 1);
        return delay.promise;
    }
    
    function validateUser(user) {
        var errors = '';
        var emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (user.email != '' && !emailRegExp.test(user.email)) {
            errors = '<a href="#" onclick="document.getElementById(\'user_email\').focus(); return false">' 
                + 'Invalid email provided'
                + '</a>, please check it for writing mistakes.';
        }
        return errors;
    }
    
    this.updateUser = function(id, username, email, roleId, csrf_token) {
        var user = {
            username: username, 
            email: email, 
            roleId: roleId, 
            csrf_token: csrf_token
        };
        var errors = validateUser(user);
        if (errors == '') {
            return $http.put(ROUTES.put_user.replace(':userId', id), user);
        }
        return getError(errors);
    };
}

})();