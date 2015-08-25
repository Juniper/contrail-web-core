/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-karma');
    //this option is to avoid interruption of test case execution on failure of one in sequence
    //grunt.option('force',true);
    grunt.option('stack', true);

    var commonFiles = [
        {pattern: 'contrail-web-core/webroot/assets/**/!(tests)/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/font/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.ttf', included: false},

        {pattern: 'contrail-web-core/webroot/img/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/assets/select2/styles/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.gif', included: false},

        {pattern: 'contrail-web-core/webroot/test/ui/js/co.test.app.js'},
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/co.test.*.js', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/*.lib.test.suite.js', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/*.lib.test.js', included: false},
        //{pattern: 'contrail-web-core/webroot/test/ui/js/**/*.lib.test.js', included: false},
        //{pattern: 'contrail-web-core/webroot/test/ui/js/**/*.lib.test.suite.js', included: false},
        //{pattern: 'contrail-web-core/webroot/test/ui/js/**/{!(*.lib.test.js), !(*.test.suite.js)}', included: false},
        //{pattern: 'contrail-web-core/webroot/test/ui/js/**/*.js', included: false},

        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/templates/*.tmpl', included: false}
    ];

    var karmaConfig = {
        options: {
            configFile: 'karma.config.js',
        },
        grid: {
            options: {
                files: [
                    //{pattern: 'contrail-web-core/webroot/assets/slickgrid/js/slick.*.js'},
                    {pattern: 'contrail-web-core/webroot/test/ui/js/grid/GridView.lib.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-core/webroot/assets/slickgrid/js/slick.*.js': ['coverage']
                }
            }
        }
    };

    for (var feature in karmaConfig) {
        if (feature != 'options') {
            karmaConfig[feature]['options']['files'] = commonFiles.concat(karmaConfig[feature]['options']['files']);
        }
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON(__dirname + "/../../../../contrail-web-core/package.json"),
        karma: karmaConfig,
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: ["Gruntfile.js"]
        },
        api: {
            grid: 'grid'
        }

    });

    grunt.registerMultiTask('api', 'Core libs API Test Cases', function () {
        if (this.target == 'grid') {
            grunt.task.run('karma:grid');

        }
    });
};
