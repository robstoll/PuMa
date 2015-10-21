/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

describe('login scenarios:', function () {
    
    var username = element(by.id('form_username'));
    var password = element(by.id('form_password'));
    var loginButton = element(by.id('form_login'));
    var fail = function() { expect(true).toBe(false); }

    it('should redirect to the login page if not logged in', function(){
        browser.get('login');   
        var loginURL = browser.getCurrentUrl();
        
        browser.get('');
        expect(browser.getCurrentUrl()).toEqual(loginURL);
    });
   
    
    it('admin should be able to login with tutteli-purchase', function () {
        browser.get('login');        
        username.sendKeys('admin');
        password.sendKeys('tutteli-purchase');
        loginButton.click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl);
    });
});