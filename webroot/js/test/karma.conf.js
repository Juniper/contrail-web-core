/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function(config) {
  config.set({
    basePath: '../../..',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        //{pattern:"webroot/monitor/bgp/test/monitor_infra_dashboard.html",watched:false},
        "webroot/js/contrail-all-1.js",
        "webroot/js/contrail-all-2.js",
        "webroot/js/contrail-all-3.js",
        "webroot/js/contrail-all-4.js",
        "webroot/js/bootstrap-utils.js",
        "webroot/js/topology_api.js",
        "webroot/js/web-utils.js",
        "webroot/js/contrail-layout.js",
        "webroot/js/protocol.js",
        "webroot/js/qe-utils.js",
        "webroot/js/nvd3-plugin.js",
        "webroot/js/d3-utils.js",
        "webroot/js/analyzer-utils.js",
        "webroot/js/qtip.js",
        "webroot/js/cytoscape.min.js",
        "webroot/js/config_global.js",
        "webroot/js/test/config_global_mock.js",
        "webroot/js/test/utils_mock.js",        
        "webroot/js/test/config_global_test.js",
    ],
    plugins:[
        'karma-phantomjs-launcher',
        'karma-coverage',
        'karma-qunit',
        'karma-htmlfile-reporter',
        'karma-junit-reporter',
        'karma-html2js-preprocessor',
        'karma-firefox-launcher',
        'karma-chrome-launcher',
    ],
    browsers: [
        'PhantomJS'
        //'Firefox',
        //'Chrome'
        ],

    reporters: ['progress','html','coverage','junit'],
    // the default configuration
    junitReporter: {
      outputFile: 'test-results.xml',
      suite: ''
    },
    preprocessors: { 
        'webroot/js/config_global.js': ['coverage'],
        '*.html': []
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
