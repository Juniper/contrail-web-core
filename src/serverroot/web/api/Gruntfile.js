/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
'use strict';
var config = require('../../../../tests/defQUnitRunnerConfig');

var testRes = {};
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('../../../../package.json'),
        'node-qunit': {
            'oStackApi': {
                code: '../../orchestration/plugins/openstack/openstack.api.js',
                tests: './test/openstack.api_test.js',
                setup: config.qUnitRunnerConfig,
                callback: function(status, stats) {
                    grunt.log.write("Completed oStackApi Test.");
                    return true;
                }
            },
            'httpsOp': {
                code: '../../common/httpsoptions.api.js',
                tests: './test/httpsoptions.api_test.js',
                setup: config.qUnitRunnerConfig,
                callback: function(status, stats) {
                    grunt.log.write("Completed httpsOp Test.");
                    return true;
                }
            },
            'restApi': {
                code: '../../common/rest.api.js',
                tests: './test/rest.api_test.js',
                setup: config.qUnitRunnerConfig,
                callback: function(status, stats) {
                    grunt.log.write("Completed restApi Test.");
                    return true;
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', '*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-node-qunit');

    grunt.registerTask('default', ['node-qunit'])
    grunt.registerTask('test', ['node-qunit']);
};
