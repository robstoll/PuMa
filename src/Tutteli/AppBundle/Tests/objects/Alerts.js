/* 
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
'use strict';

function Alerts(){
    var self = this;
    this.get = function(index){
        var elem = element(by.repeater('alert in alertCtrl.alerts').row(index));
        return {
            elem: elem,
            
            getText:function() {
                return elem.$('div[compile]').getText();
            },
            
            getErrorReport: function() {
                return elem.$('.error-report').getInnerHtml();
            },
            
            clickRepeatUrl: function() {
                elem.$('a').click();
            }
        }; 
    };
}

module.exports = new Alerts();