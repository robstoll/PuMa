/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/angular-auth
 */
'use strict';

describe('AlertService', function() {
    var AlertService = null;
    var UtilsService = null;
    var timeout = null;
    
    beforeEach(function() {
       angular.module('tutteli.utils', []);
       module('tutteli.alert', function($provide) {
           UtilsService = jasmine.createSpyObj('UtilsService', ['selectText']);
           $provide.value('tutteli.UtilsService', UtilsService);
           timeout = jasmine.createSpy('timeout');
           $provide.value('$timeout', timeout);
       });
    });
    
    beforeEach(inject(['tutteli.alert.AlertService', function(_AlertService_) {
        AlertService = _AlertService_;
    }])); 
    
    describe('getAlerts:', function() {
       
        it('is empty object at first', function() {
           expect(AlertService.getAlerts()).toEqual({}); 
        });
        
        it('contains property according to key added', function() {
            var key = 'test';
            
            AlertService.add(key, 'dummy', 'danger');
            
            expect(AlertService.getAlerts()).toHaveMember(key);
        });
        
        it('does not contain closed alert', function() {
            var key = 'test';
            AlertService.add(key, 'dummy', 'danger');
            
            AlertService.close(key);
            
            expect(AlertService.getAlerts()).toEqual({});
        });
    });
    
    describe('add:', function() {
        
        it('calls $timeout if timeout is provided', function() {
            AlertService.add('dummy', 'text', 'warning', 100);
            expect(timeout).toHaveBeenCalledWith(jasmine.any(Function), 100);
        });
        
        it('timeout provided - timeout function calls close', function() {
            AlertService.add('dummy', 'text', 'warning', 100);
            expect(AlertService.getAlerts()).toHaveMember('dummy');
            
            timeout.calls.mostRecent().args[0]();
            
            expect(AlertService.getAlerts()).toEqual({});
        });
    });
    
    describe('clear:', function(){
        it('resets alerts to {} when already {}', function(){
            expect(AlertService.getAlerts()).toEqual({});
            
            AlertService.clear();
            
            expect(AlertService.getAlerts()).toEqual({});
        });
        
        it('resets alerts to {} when one was added', function(){
            AlertService.add('dummy', 'text', 'warning');
            
            AlertService.clear();
            
            expect(AlertService.getAlerts()).toEqual({});
        });
        
        it('resets alerts to {} when two were added', function(){
            AlertService.add('dummy', 'text', 'warning');
            AlertService.add('dummy2', 'text', 'warning');
            
            AlertService.clear();
            
            expect(AlertService.getAlerts()).toEqual({});
        });
    });
});