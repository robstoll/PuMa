/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
'use strict';

function LoginPage(browser){
    var username = element(by.model('loginCtrl.credentials.username'));
    var password = element(by.model('loginCtrl.credentials.password'));
    var loginButton = element(by.id('login_form_submit'));
    
    this.navigateToPage = function(){
        browser.get('login');
    };
    
    this.clearCookie = function() {
        var cookieMock  = function(){
            angular.module('_test_LoginPage_cookieMock', ['ngMockE2E'])
            .run(['$cookies','tutteli.auth.Session', function($cookies, Session) {
                Session.destroy();
                $cookies.remove('user');
            }]);
        };
        browser.addMockModule('_test_LoginPage_cookieMock', cookieMock);
    };
    
    this.login = function(credentials){
        username.sendKeys(credentials.username);
        password.sendKeys(credentials.password);
        loginButton.click();
    };
    
    this.createMockedHttpResponse = function(response, code){
        var httpBackendMock  = function(){
            angular.module('_test_LoginPage_httpBackendMock', ['ngMockE2E'])
            .value('_test_LoginPage_httpBackendMock_MockData', arguments[0])
            .run(
              ['$httpBackend','tutteli.auth.loginUrl', '_test_LoginPage_httpBackendMock_MockData', 
              function($httpBackend, loginUrl, MockData) {
                $httpBackend.whenPOST(loginUrl).respond(MockData.httpCode, MockData.response);
            }]);
        };
        var httpCode = code == undefined ? 200 : code;
        browser.addMockModule('_test_LoginPage_httpBackendMock', httpBackendMock , {httpCode: httpCode, response: response});
    };
}

module.exports = function(browser){
    return new LoginPage(browser);
};