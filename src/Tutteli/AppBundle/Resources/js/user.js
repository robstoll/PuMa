/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.user', [
    'tutteli.preWork', 
    'tutteli.auth', 
    'tutteli.purchase.routing', 
    'tutteli.helpers'
])
    .controller('tutteli.purchase.UsersController', UsersController)
    .controller('tutteli.purchase.NewUserController', NewUserController)
    .controller('tutteli.purchase.EditUserController', EditUserController)
    .controller('tutteli.purchase.ChangePasswordController', ChangePasswordController)
    .service('tutteli.purchase.UserService', UserService)
    .service('tutteli.purchase.ChangePasswordService', ChangePasswordService)
    .constant('tutteli.purchase.NewUserController.alertId', 'tutteli-ctrls-NewUserController')
    .constant('tutteli.purchase.EditUserController.alertId', 'tutteli-ctrls-EditUserController')
    .constant('tutteli.purchase.ChangePasswordController.alertId', 'tutteli-ctrls-ChangePasswordController');

UsersController.$inject = ['tutteli.PreWork', 'tutteli.purchase.UserService', 'tutteli.helpers.InitHelper'];
function UsersController(PreWork, UserService, InitHelper) {
    var self = this;
    
    this.users = null;
    
    this.initUsers = function(data) {
        InitHelper.initTableData('users', self, data);
    };
    
    // ----------------
    
    InitHelper.initTable('users', this, function(){
        UserService.getUsers().then(self.initUsers);
    });
}

NewUserController.$inject = [
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.UserService', 
    'tutteli.purchase.NewUserController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function NewUserController(ROUTES, PreWork, UserService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_user_csrf);
    
    this.createUser = function($event) {
        var user = {
            username: self.username, 
            email: self.email, 
            roleId: self.role, 
            csrf_token: self.csrf_token
        };
        formHelper.create($event, alertId, user, 'User', 'username', UserService);
    };
    
    this.clearForm = function() {
        document.getElementById('user_username').focus();
        self.username = '';
        self.email = '';
        self.role = '';
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
    
    PreWork.merge('users/new.tpl', this, 'userCtrl');    
    formHelper.reloadCsrfIfNecessary();
}

EditUserController.$inject = [
    '$stateParams',
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.UserService',
    'tutteli.purchase.EditUserController.alertId',
    'tutteli.auth.AuthService', 
    'tutteli.auth.USER_ROLES',
    'tutteli.helpers.FormHelperFactory'];
function EditUserController(
        $stateParams, 
        ROUTES, 
        PreWork,  
        UserService, 
        alertId,        
        AuthService, 
        USER_ROLES, 
        FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_user_csrf);
    var isNotLoaded = true;
    
    this.loadUser = function(userId) {
        UserService.getUser(userId).then(function(user) {
            self.id = user.id;
            self.username = user.username;
            self.email = user.email;
            self.role = user.roleId;
            document.querySelector('#user_role > option').remove();
            self.updatedAt = user.updatedAt;
            self.updatedBy = user.updatedBy;
            isNotLoaded = false;
        });
    };
    
    this.updateUser = function($event) {
        var user = {
            id: self.id,
            username: self.username, 
            email: self.email, 
            roleId: self.role, 
            csrf_token: self.csrf_token
        };
    
        $event.preventDefault();
        formHelper.update($event, alertId, user, 'User', 'username', UserService);
    };
    
    this.isDisabled = function() {
        return isNotLoaded;
    };
    
    this.isAdmin = function() {
        return AuthService.isAuthorised(USER_ROLES.admin);
    };
    
    // ----------------
    
    PreWork.merge('users/edit.tpl', this, 'userCtrl');
    
    isNotLoaded = self.username === undefined;
    if (isNotLoaded) {
        self.loadUser($stateParams.userId);
    }
    
    formHelper.reloadCsrfIfNecessary();
}

ChangePasswordController.$inject = [
    '$stateParams',
    'tutteli.purchase.ROUTES',
    'tutteli.PreWork',
    'tutteli.purchase.ChangePasswordService',
    'tutteli.purchase.ChangePasswordController.alertId',
    'tutteli.helpers.FormHelperFactory'];
function ChangePasswordController($stateParams, ROUTES, PreWork, ChangePasswordService, alertId, FormHelperFactory) {
    var self = this;
    var formHelper = FormHelperFactory.build(self, ROUTES.get_user_csrf);
    
    this.changePassword = function($event) {
        var data = {
            id: self.id,
            oldPw: self.oldPw,
            newPw: self.newPw,
            repeatPw: self.repeatPw,
            csrf_token: self.csrf_token
        };
        formHelper.update($event, alertId, data, 'Password', null, ChangePasswordService).then(function(){
           self.clearForm(); 
        });
    };
    
    this.clearForm = function() {
        document.getElementById('password_oldPw').focus();
        self.oldPw = '';
        self.newPw = '';
        self.repeatPw = '';
    };
    
    // -------------
    
    PreWork.merge('users/password.tpl', this, 'passwordCtrl');
    if (this.id === undefined || this.id == '') {
        this.id = $stateParams.userId;
    }
    formHelper.reloadCsrfIfNecessary();
}

ChangePasswordService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES'];
function ChangePasswordService($http, $q, $timeout, ROUTES) {
    
    this.updatePassword = function(data) {
        var errors = '';
        var pwRegExp = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{7,}/;
        if (data.oldPw == data.newPw) {
            errors = 'The <a href="#" onclick="document.getElementById(\'password_newPw\').focus(); return false">'
                + 'new password'
                + '</a> cannot be the same as the old password.';
        } else if(!pwRegExp.test(data.newPw)) {
            errors = 'The <a href="#" onclick="document.getElementById(\'password_newPw\').focus(); return false">'
                + 'new password'
                + '</a> must be seven or more characters long and '
                + 'contain at least one digit, one upper- and one lowercase character.';
        } else if (data.newPw != data.repeatPw) {
            errors = 'The two <a href="#" onclick="document.getElementById(\'password_newPw\').focus(); return false">' 
                + 'passwords do not match'
                + '</a>.';
        }
        if (errors == '') {
            return $http.put(ROUTES.put_user_password.replace(':userId', data.id), data);
        }
        return getError($q, $timeout, errors);
    };
    
}

function getError($q, $timeout, errors) {
    // delay is necessary in order that alert is removed properly
    var delay = $q.defer();
    $timeout(function() {
        delay.reject({error: errors});
    }, 1);
    return delay.promise;
}

UserService.$inject = ['$http', '$q', '$timeout', 'tutteli.purchase.ROUTES', 'tutteli.helpers.ServiceHelper'];
function UserService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getUsers = function() {
        return ServiceHelper.get(ROUTES.get_users_json, 'users');
    };
    
    this.getUser = function(userId) {
        return ServiceHelper.get(ROUTES.get_user_json.replace(':userId', userId), 'user');
    };
    
    this.createUser = function(user) {
        var errors = validateUser(user);
        if (errors == '') {
            return $http.post(ROUTES.post_user, user);
        }
        return getError($q, $timeout, errors);
    };
    
    
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
    
    this.updateUser = function(user) {
        var errors = validateUser(user);
        if (errors == '') {
            return $http.put(ROUTES.put_user.replace(':userId', user.id), user);
        }
        return getError(errors);
    };
}

})();