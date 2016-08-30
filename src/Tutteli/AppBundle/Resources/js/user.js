/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
(function(){
'use strict';

angular.module('tutteli.puma.user', [
    'tutteli.preWork', 
    'tutteli.auth', 
    'tutteli.puma.routing', 
    'tutteli.helpers'
])
    .controller('tutteli.puma.UsersController', UsersController)
    .controller('tutteli.puma.NewUserController', NewUserController)
    .controller('tutteli.puma.EditUserController', EditUserController)
    .controller('tutteli.puma.ChangePasswordController', ChangePasswordController)
    .controller('tutteli.puma.ResetPasswordController', ResetPasswordController)
    .service('tutteli.puma.UserService', UserService)
    .service('tutteli.puma.ChangePasswordService', ChangePasswordService)
    .service('tutteli.puma.ResetPasswordService', ResetPasswordService)
    .constant('tutteli.puma.NewUserController.alertId', 'tutteli-ctrls-NewUserController')
    .constant('tutteli.puma.EditUserController.alertId', 'tutteli-ctrls-EditUserController')
    .constant('tutteli.puma.ChangePasswordController.alertId', 'tutteli-ctrls-ChangePasswordController')
    .constant('tutteli.puma.ResetPasswordController.alertId', 'tutteli-ctrls-ResetPasswordController');

UsersController.$inject = ['tutteli.PreWork', 'tutteli.puma.UserService', 'tutteli.helpers.InitHelper'];
function UsersController(PreWork, UserService, InitHelper) {
    var self = this;
    
    this.users = null;
    
    this.initUsers = function(data) {
        InitHelper.initTableData('users', self, data);
    };
    
    // ----------------
    
    InitHelper.initTable('users', this, function(){
        return UserService.getUsers();
    });
}

var ASavingController = tutteliSavingController();
tutteliExtends(AUserController, ASavingController);
function AUserController(ROUTES, FormHelperFactory) {
    ASavingController.call(this);
    var self = this;
    
    this.formHelper = FormHelperFactory.build(self, ROUTES.get_user_csrf);
    
    // ----------------
    
    self.formHelper.reloadCsrfIfNecessary();
}

NewUserController.$inject = [
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.UserService', 
    'tutteli.puma.NewUserController.alertId',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(NewUserController, AUserController);
function NewUserController(ROUTES, PreWork, UserService, alertId, FormHelperFactory) {
    AUserController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    self.isReal = false;
    
    this.createUser = function($event) {
        self.startSaving();
        var user = {
            username: self.username, 
            email: self.email, 
            roleId: self.role, 
            isReal: self.isReal,
            csrf_token: self.csrf_token
        };
        self.formHelper.create($event, alertId, user, 'User', 'username', UserService)
            .then(self.endSaving, self.endSaving);
    };
    
    this.clearForm = function() {
        self.username = '';
        self.email = '';
        self.role = '';
        self.isReal = false;
        document.getElementById('user_username').focus();
    };
    
    // ----------------
    
    PreWork.merge('users/new.tpl', this, 'userCtrl');    
}

EditUserController.$inject = [
    '$stateParams',
    '$timeout',
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.UserService',
    'tutteli.puma.EditUserController.alertId',
    'tutteli.auth.AuthService', 
    'tutteli.auth.USER_ROLES',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(EditUserController, AUserController);
function EditUserController(
        $stateParams, 
        $timeout,
        ROUTES, 
        PreWork,  
        UserService, 
        alertId,        
        AuthService, 
        USER_ROLES, 
        FormHelperFactory) {
    AUserController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    var isNotLoaded = true;
    
    this.loadUser = function(userId) {
        UserService.getUser(userId).then(function(user) {
            self.id = user.id;
            self.username = user.username;
            self.email = user.email;
            self.role = user.roleId;
            self.isReal = user.isReal == "1";
            document.querySelector('#user_role > option').remove();
            self.updatedAt = user.updatedAt;
            self.updatedBy = user.updatedBy;
            isNotLoaded = false;
            $timeout(function(){
                document.getElementById('user_username').focus();  
            }, 10);
        });
    };
    
    this.updateUser = function($event) {
        this.startSaving();
        var user = {
            id: self.id,
            username: self.username, 
            email: self.email, 
            roleId: self.role, 
            isReal: self.isReal,
            csrf_token: self.csrf_token
        };
    
        $event.preventDefault();
        self.formHelper.update($event, alertId, user, 'User', user.username, UserService)
            .then(self.endSaving, self.endSaving);
    };
    
    var isDisabledParent = this.isDisabled;
    this.isDisabled = function() {
        return isNotLoaded 
            || !AuthService.isAuthorised(USER_ROLES.admin) 
            || isDisabledParent();
    };
    
    // ----------------
    
    PreWork.merge('users/edit.tpl', this, 'userCtrl');
    
    isNotLoaded = self.username === undefined;
    if (isNotLoaded) {
        self.loadUser($stateParams.userId);
    }
}

ChangePasswordController.$inject = [
    '$stateParams',
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.ChangePasswordService',
    'tutteli.puma.ChangePasswordController.alertId',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(ChangePasswordController, AUserController);
function ChangePasswordController($stateParams, ROUTES, PreWork, ChangePasswordService, alertId, FormHelperFactory) {
    AUserController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    
    this.changePassword = function($event) {
        self.startSaving();
        var data = {
            id: self.id,
            oldPw: self.oldPw,
            newPw: self.newPw,
            repeatPw: self.repeatPw,
            csrf_token: self.csrf_token
        };
        self.formHelper.update($event, alertId, data, 'Password', null, ChangePasswordService)
            .then(self.endSaving, self.endSaving);
    };
    
    this.clearForm = function() {
        self.oldPw = '';
        self.newPw = '';
        self.repeatPw = '';
        document.getElementById('password_oldPw').focus();
    };
    
    // -------------
    
    PreWork.merge('users/change-password.tpl', this, 'passwordCtrl');
    if (this.id === undefined || this.id == '') {
        this.id = $stateParams.userId;
    }

}


ResetPasswordController.$inject = [
    '$stateParams',
    'tutteli.puma.ROUTES',
    'tutteli.PreWork',
    'tutteli.puma.UserService',
    'tutteli.puma.ResetPasswordService',
    'tutteli.puma.ResetPasswordController.alertId',
    'tutteli.helpers.FormHelperFactory'];
tutteliExtends(ResetPasswordController, AUserController);
function ResetPasswordController(
        $stateParams, 
        ROUTES, 
        PreWork, 
        UserService, 
        ResetPasswordService, 
        alertId, 
        FormHelperFactory) {
    AUserController.call(this, ROUTES, FormHelperFactory);
    var self = this;
    
    var username = null;
    
    this.getUsername = function() {
        return username;
    };
    
    this.resetPassword = function($event) {
        self.startSaving();
        var data = {
            id: self.id,
            csrf_token: self.csrf_token
        };
        self.formHelper.update($event, alertId, data, 'Password', null, ResetPasswordService)
            .then(self.endSaving, self.endSaving);
    };
    
    // -------------
    
    PreWork.merge('users/reset-password.tpl', this, 'passwordCtrl');
    if (this.id === undefined || this.id == '') {
        this.id = $stateParams.userId;
    }
    UserService.getUser(this.id).then(function(user) {
        username = user.username;
    });
}

ChangePasswordService.$inject = ['$http', '$q', '$timeout', 'tutteli.puma.ROUTES'];
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

ResetPasswordService.$inject = ['$http','tutteli.puma.ROUTES'];
function ResetPasswordService($http, ROUTES) {
    
    this.updatePassword = function(data) {
        return $http.put(ROUTES.put_reset_user_password.replace(':userId', data.id), data);
    };
    
}



UserService.$inject = ['$http', '$q', '$timeout', 'tutteli.puma.ROUTES', 'tutteli.helpers.ServiceHelper'];
function UserService($http, $q, $timeout, ROUTES, ServiceHelper) {
    
    this.getUsers = function() {
        return ServiceHelper.cget(ROUTES.get_users_json, 'users');
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