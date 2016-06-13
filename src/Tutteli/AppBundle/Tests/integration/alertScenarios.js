/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
'use strict';
require('jasmine-expect');

describe('alert scenarios:', function () {
    var EC = protractor.ExpectedConditions;
    var loginPage = null;
    var httpMock = null;
    
    beforeEach(function () {
        loginPage = require('../objects/LoginPage.js')(browser);
        loginPage.clearCookie();
        httpMock = require('../objects/HttpMock.js');
    });

    it('cannot load page, should show 404, click on repeat url should hide alert', function () {
        httpMock.get('purchase.tpl', 'Not Found', 404);
        loginPage.createMockedHttpResponse({user:{role: 'admin'}});
        httpMock.setDelay(100);
        httpMock.finalise();
        
        loginPage.navigateToPage();
        loginPage.login({username: 'test', password: 'test'});
        
        var alerts = require('../objects/Alerts.js');
        var alert = alerts.get(0);
        browser.wait(EC.presenceOf(alert.elem), 500);
        alert.clickRepeatUrl();
        var alert2 = alerts.get(0);
        expect(alert2.elem.isPresent()).toBeFalsy();
    });
});