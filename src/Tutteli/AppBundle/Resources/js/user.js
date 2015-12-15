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
    .service('tutteli.purchase.UserService', UserService)
    .constant('tutteli.purchase.NewUserController.alertId', 'tutteli-ctrls-NewUserController')
    .constant('tutteli.purchase.EditUserController.alertId', 'tutteli-ctrls-EditUserController');

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
    
    this.createUser = function(user) {
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
    
    this.updateUser = function(user) {
        var errors = validateUser(user);
        if (errors == '') {
            return $http.put(ROUTES.put_user.replace(':userId', user.id), user);
        }
        return getError(errors);
    };
}

})();