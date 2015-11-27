/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
'use strict';

function HttpMock(){
    var self = this;
    var getRequests = [];
    var postRequests = [];
    
    this.get = function(url, response, code) {
        getRequests.push({url: url, response: response, httpCode: getHttpCode(code)});
    };
    
    this.post = function (url, response, code) {
        postRequests.push({url: url, response: response, httpCode: getHttpCode(code)});
    };
    
    function getHttpCode(code) {
        return code === undefined ? 200 : code;
    }
    
    this.finalise = function(notEveryGet) {
        var httpBackendMock  = function(){
            angular.module('_test_httpBackendMock', ['ngMockE2E'])
            .value('_test_httpBackendMock_data', arguments[0])
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
                {get: getRequests, post: postRequests, notEveryGet: notEveryGet});
    };
}

module.exports = new HttpMock();