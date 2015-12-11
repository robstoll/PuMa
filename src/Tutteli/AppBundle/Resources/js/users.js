/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
(function(){
'use strict';

angular.module('tutteli.purchase.users', ['tutteli.preWork', 'tutteli.auth', 'tutteli.purchase.routing'])
    .controller('tutteli.purchase.UsersController', UsersController)
    .controller('tutteli.purchase.UserController', UserController)
    .service('tutteli.purchase.UserService', UserService);

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

UserController.$inject = [
    '$stateParams',
    'tutteli.PreWork',
    'tutteli.auth.USER_ROLES',
    'tutteli.purchase.UserService'];
function UserController($stateParams, PreWork, USER_ROLES, UserService) {
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
    self.loadUser($stateParams.userId);
    PreWork.merge('users/edit.tpl', this, 'userCtrl');    
}

UserService.$inject = ['$http', '$q', 'tutteli.purchase.ROUTES'];
function UserService($http, $q, ROUTES) {
    
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
}

})();