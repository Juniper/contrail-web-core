'use strict';
var config = require('../../../../tests/defQUnitRunnerConfig');

var testRes = {};
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('../../../../package.json'),
        'node-qunit': {
            'networkMon': {
                code: './network.mon.api.js',
                tests: './test/network.mon.api_test.js',
                setup: config.qUnitRunnerConfig,
                callback: function(status, stats) {
                    grunt.log.write("Completed networkMon Test.");
                    return true;
                }
            },
            'infraOverview': {
                code: 'infraoverview.api.js',
                tests: './test/infraoverview.api_test.js',
                setup: config.qUnitRunnerConfig,
                callback: function(status, stats) {
                    grunt.log.write("Completed infraOverview Test.");
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
