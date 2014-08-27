/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function(config) {
  config.set({
    basePath: __dirname + '/../../..',    
    autoWatch: true,
    frameworks: ['qunit','sinon'],
    files: [],
    plugins:[
        'karma-phantomjs-launcher',
        'karma-coverage',
        'karma-qunit',
        'karma-sinon',
        'karma-htmlfile-reporter',
        //'karma-html-reporter',
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
        '*.html': []
        },
    htmlReporter: {
        /* outputDir: 'karma_html', */
        /* templatePath: __dirname+'/node_modules/karma-html-reporter/jasmine_template.html' */
      outputFile: __dirname + '/tests/units.html'
    },
    singleRun: true
  });
};
