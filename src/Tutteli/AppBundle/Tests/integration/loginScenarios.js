/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
'use strict';
require('jasmine-expect');

describe('login scenarios:', function () {
    var loginPage = null;
    var httpMock = null;
    
    beforeEach(function () {
        loginPage = require('../objects/LoginPage.js')(browser);
        loginPage.clearCookie();
        httpMock = require('../objects/HttpMock.js');
    });

    it('should redirect to the login page if not logged in', function () {
        loginPage.navigateToPage();
        var loginURL = browser.getCurrentUrl();
        browser.get('');
        
        expect(browser.getCurrentUrl()).toEqual(loginURL);
    });

    it('returns wrong data - error message is shown', function () {
        var response = {userObjectIsMissing: true};
        loginPage.createMockedHttpResponse(response);
        httpMock.finalise();
        
        loginPage.navigateToPage();
        loginPage.login({username: 'test', password: 'test'});
        
        var alerts = require('../objects/Alerts.js');
        var alert = alerts.get(0);
        expect(alert.getText()).toStartWith('Unexpected error occured. Please log in again in a few minutes.');
        expect(alert.getErrorReport()).toBe('msg: user was not defined in the returned data<br>response: {<br>&nbsp;&nbsp;userObjectIsMissing: true<br>}');           
    });
    
    it('login fails - shows error message', function () {
        var message = 'bad credentials';
        loginPage.createMockedHttpResponse(message, 401);
        httpMock.finalise();
        
        loginPage.navigateToPage();
        loginPage.login({username: 'test', password: 'test'});
        
        var alerts = require('../objects/Alerts.js');
        var alert = alerts.get(0);
        expect(alert.getText()).toBe(message);
    });
    
    it('redirects to purchase if no redirect url is provided by login response', function () {
        var payload = 'hello';
        httpMock.get('purchase.tpl', payload);
        loginPage.createMockedHttpResponse({user:{role: 'admin'}});
        httpMock.finalise();
        
        loginPage.navigateToPage();
        loginPage.login({username: 'test', password: 'test'});
        
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'purchase');
        expect(element(by.css('div[ui-view]')).getText()).toBe(payload);
    });
    
    it('cannot load next state - stays on login page', function () {
        httpMock.get('purchase.tpl', 'Not Found', 404);
        loginPage.createMockedHttpResponse({user:{role: 'admin'}});
        httpMock.finalise();
        
        loginPage.navigateToPage();
        loginPage.login({username: 'test', password: 'test'});
        
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'login');
        var alerts = require('../objects/Alerts.js');
        var alert = alerts.get(0);
        expect(alert.getText()).toBe('Error while loading the new state "purchase" - could not load "purchase.tpl".\n'
                + 'Please check your internet-connection and click here to repeat the action.');
    });
    
    it('click on "purchase" link - shows an alert that the user is not yet logged in.', function() {
        loginPage.navigateToPage();
        
        element(by.css('a.navbar-brand')).click();
        
        var alerts = require('../objects/Alerts.js');
        var alert = alerts.get(0);
        expect(alert.getText()).toBe('You are not yet logged in, please use the form below.');
    });
});