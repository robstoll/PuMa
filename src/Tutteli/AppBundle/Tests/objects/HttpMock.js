/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
'use strict';

function HttpMock(){
    var self = this;
    var getRequests = [];
    var postRequests = [];
    var delay = 0;
    
    this.get = function(url, response, code) {
        getRequests.push({url: url, response: response, httpCode: getHttpCode(code)});
    };
    
    this.post = function (url, response, code) {
        postRequests.push({url: url, response: response, httpCode: getHttpCode(code)});
    };
    
    function getHttpCode(code) {
        return code === undefined ? 200 : code;
    }
    
    this.setDelay = function(timeout) {
        delay = timeout;
    };
    
    this.finalise = function(notEveryGet) {
        var httpBackendMock  = function(){
            angular.module('_test_httpBackendMock', ['ngMockE2E'])
            .constant('_test_httpBackendMock_data', arguments[0])
            .config(['$provide','_test_httpBackendMock_data', function($provide, mockData) {
                if (!isNaN(mockData.delay) && mockData.delay > 0){
                    $provide.decorator('$httpBackend', ['$delegate', function($delegate) {
                        var proxy = function(method, url, data, callback, headers) {
                            var interceptor = function() {
                                var _this = this,
                                    _arguments = arguments;
                                setTimeout(function() {
                                    callback.apply(_this, _arguments);
                                }, mockData.delay);
                            };
                            return $delegate.call(this, method, url, data, interceptor, headers);
                        };
                        for (var key in $delegate) {
                            proxy[key] = $delegate[key];
                        }
                        return proxy;
                    }]);
                }
            }])
            .run(
              ['$httpBackend','_test_httpBackendMock_data', 
              function($httpBackend, mockData) {
                var length = mockData.get.length;
                for (var i = 0; i < length; ++i) {
                    var request = mockData.get[i];
                    $httpBackend.whenGET(request.url).respond(request.httpCode, request.response);
                }
                length = mockData.post.length;
                for (var i = 0; i < length; ++i) {
                    $httpBackend.whenPOST(request.url).respond(request.httpCode, request.response);
                }
                if (!mockData.notEveryGet) {
                    $httpBackend.whenGET(/.*/).passThrough();
                }
            }]);
        };
        browser.addMockModule('_test_httpBackendMock', httpBackendMock, 
                {get: getRequests, post: postRequests, notEveryGet: notEveryGet, delay: delay});
    };
}

module.exports = new HttpMock();