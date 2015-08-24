/*/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function (config) {
    config.set({
        basePath: __dirname + '/../../../..',
        autoWatch: false,
        frameworks: ['qunit', 'sinon', 'requirejs'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-qunit',
            'karma-sinon',
            'karma-htmlfile-reporter',
            //'karma-html-reporter',
            'karma-requirejs',
            'karma-junit-reporter',
            'karma-html2js-preprocessor',
            'karma-firefox-launcher',
            'karma-chrome-launcher',
        ],
        browsers: [
            'PhantomJS',
            //'PhantomJS_custom',
            //'Firefox',
            //'Chrome'
        ],
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    viewportSize: {
                        width: 1280,
                        height: 1024
                    }
                }
            }
        },

        //port: 8143,

        reporters: ['progress', 'html', 'coverage', 'junit'],
        // the default configuration
        junitReporter: {
            outputFile: __dirname + '/reports/test-results.xml',
            suite: ''
        },
        preprocessors: {
            '*.view': ['html2js'],
            '*.tmpl': ['html2js']
        },
        htmlReporter: {
            outputFile: __dirname + '/reports/test-results.html'
        },
        coverageReporter: {
            type : 'html',
            dir : __dirname + '/reports/coverage/'
        },
        singleRun: false,
        colors: true
    });
};

