/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/angular-auth
 */
'use strict';
    
describe('AlertService', function() {
    var element = null;
    var AlertService = null;
    var UtilsService = null;
    var createController = null;
    
    beforeEach(function() {
       angular.module('tutteli.utils', []);
       module('tutteli.alert', function($provide) {
           UtilsService = jasmine.createSpyObj('UtilsService', ['selectText']);
           $provide.value('tutteli.UtilsService', UtilsService);
       });
    });
    
    beforeEach(inject(
      ['$controller', 'tutteli.alert.AlertService', 
      function($controller, _AlertService_) {
        element = jasmine.createSpyObj('$element', ['css']);
        AlertService = _AlertService_;
        createController = function() {
            return $controller('tutteli.alert.AlertController', {
                '$element' : element,
                'AlertService' : AlertService
            });
        };
      }]
    ));
    
    it('sets display block on the passed $element', function() {
        createController();
        expect(element.css).toHaveBeenCalledWith('display', 'block');
    });
    
    it('uses AlertService.getAlerts() for the alerts', function() {
        var dummy = {'dummyAlert': {key:'dummy', msg:'dummy', type:'warning'}};
       spyOn(AlertService, 'getAlerts').and.returnValue(dummy);
       
       var controller = createController();
       
       expect(AlertService.getAlerts).toHaveBeenCalled();
       expect(controller.alerts).toBe(dummy);
    });
    
    it('close() is AlertService.close()', function() {
        var controller = createController();
        
        expect(controller.close).toBe(AlertService.close);
    });
    
    
    it('openErrorReport() is AlertService.openErrorReport()', function() {
        var controller = createController();
        
        expect(controller.openErrorReport).toBe(AlertService.openErrorReport);
    });
});