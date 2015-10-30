/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.services', ['ngResource', 'ui.router', 'tutteli.ctrls'])
  .factory('tutteli.LoginModal', 
  ['$rootScope','$uibModal','$location', 
  function ($rootScope, $uibModal, $location) {

    function assignCurrentUser (user) {
      $rootScope.currentUser = user;
      return user;
    }

    return function() {
      var instance = $uibModal.open({
        templateUrl: 'login.tpl',
        controller: 'tutteli.LoginModalCtrl',
        backgrop: false
      });

      return instance.result.then(assignCurrentUser);
    };

  }
]);