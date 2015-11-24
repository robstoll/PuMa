/* 
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../src/**/Tests/integration/*.js',
    '../src/**/Tests/e2e/*.js',
  ],

  capabilities: {
    'browserName': 'firefox'
  },

  chromeOnly: true,

  baseUrl: 'https://localhost/tutteli.ch/purchase/web/app_dev.php/',

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    isVerbose: true,
    includeStackTrace: true
  }
};