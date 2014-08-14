/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-karma');
    grunt.option('stack',true);
    //These will be included for all unit test targets
    var commonFiles = [
        "contrail-web-core/webroot/js/contrail-all-1.js",
        "contrail-web-core/webroot/js/contrail-all-2.js",
        "contrail-web-core/webroot/js/contrail-all-3.js",
        "contrail-web-core/webroot/js/contrail-all-4.js",
        "contrail-web-core/webroot/js/contrail-all-5.js",
        "contrail-web-core/webroot/js/test/utils_mock.js",
        ];
    var karmaCfg = {
                options:{
                    configFile:'karma.conf.js',
                },
                config_global: {
                    options: {
                        files:[
                            "contrail-web-core/webroot/js/test/config_global.js",
                            "contrail-web-core/webroot/js/test/config_global_mock.js",
                            "contrail-web-core/webroot/js/test/config_global_test.js",
                            ],
                        preprocessors: {
                            'contrail-web-controller/webroot/js/config_global.js': ['coverage'],
                        }
                    }
                },
                web_utils: {
                    options: {
                        files:[
                            "contrail-web-core/webroot/js/test/web-utils.js",
                            ],
                        preprocessors: {
                            'contrail-web-controller/webroot/js/config_global.js': ['coverage'],
                        }
                    }
                }
        };

        /* Start - Create all target that will run unit test cases from all features */
        var allCfg = {'options':{
                files:commonFiles,
                preprocessors:{}
            }};
        for(var feature in karmaCfg) {
            if(feature != 'options') {
                allCfg['options']['files'] = allCfg['options']['files'].concat(karmaCfg[feature]['options']['files']);
                for(var path in karmaCfg[feature]['options']['preprocessors'])
                    allCfg['options']['preprocessors'][path] = karmaCfg[feature]['options']['preprocessors'][path];
                karmaCfg[feature]['options']['files'] = commonFiles.concat(karmaCfg[feature]['options']['files']);
            }
        }
        karmaCfg['all'] = allCfg;
        /* End - Create all target that will run unit test cases from all features */
    

    grunt.initConfig({
        pkg: grunt.file.readJSON( __dirname + "/../../../contrail-web-core/package.json" ),
        karma: karmaCfg,
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: [ "Gruntfile.js"]
        },
    });
};
