/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';


var tutteliPurchase = angular.module('tutteli-purchase', [ 'ngRoute','tutteli-purchase-ctrls' ]);
tutteliPurchase.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl : 'partial/login.html',
		controller : 'LoginCtrl'
	}).otherwise({ redirectTo: '/login' });
} ]);

