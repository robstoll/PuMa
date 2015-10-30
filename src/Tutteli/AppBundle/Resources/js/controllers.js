/* 
 * This file is part of the project tutteli-purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

angular.module('tutteli.ctrls', ['tutteli.preWork'])
  .controller('tutteli.LoginCtrl', 
    ['$scope', '$rootScope', '$cookies', 'tutteli.PreWork',
    function ($scope, $rootScope, $cookies, PreWork) {
    
        $scope.credentials = {
                username: '',
                password: '',
                csrf_token: ''
        };
        
        PreWork.merge('login.tpl', $scope);        
        
        $scope.login = function (credentials, $event) {
            //TODO
        };
    }
]).controller('tutteli.LoginModalCtrl',  
  ['$scope', function ($scope) {

    this.cancel = $scope.$dismiss;

    this.submit = function (credentials) {
        //TODO
    };
  }
]);
