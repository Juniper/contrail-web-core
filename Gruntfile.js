/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks('grunt-contrib-jshint');

    var UI_THIRD_PARTY = './web-third-party/';
    function process( code ) {
        return code

            // Embed version
            .replace( /@VERSION/g, grunt.config( "pkg" ).version )

            // Embed date (yyyy-mm-ddThh:mmZ)
            .replace( /@DATE/g, ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON( "package.json" ),
        concat: {
            "qunit-js": {
                options: { process: process },
                src: [
                    UI_THIRD_PARTY + "qunit/src/intro.js",
                    UI_THIRD_PARTY + "qunit/src/core.js",
                    UI_THIRD_PARTY + "qunit/src/test.js",
                    UI_THIRD_PARTY + "qunit/src/assert.js",
                    UI_THIRD_PARTY + "qunit/src/equiv.js",
                    UI_THIRD_PARTY + "qunit/src/dump.js",
                    UI_THIRD_PARTY + "qunit/src/diff.js",
                    UI_THIRD_PARTY + "qunit/src/export.js",
                    UI_THIRD_PARTY + "qunit/src/outro.js"
                ],
                dest: "webroot/assets/qunit/qunit.js"
            },
            "qunit-css": {
                options: { process: process },
                src: [
                    UI_THIRD_PARTY + "qunit/src/qunit.css"
                ],
                dest: "webroot/assets/qunit/qunit.css"
            },
            "sinon-js" : {
                options: {process: process},
                src: [
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/spy.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/call.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/behavior.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/stub.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/mock.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/collection.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/assert.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/sandbox.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/test.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/test_case.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/assert.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/match.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/util/event.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/util/fake_timers.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/util/fake_server_with_clock.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/util/fake_xml_http_request.js",
                    UI_THIRD_PARTY + "Sinon.JS/lib/sinon/util/fake_server.js",
                ],
                dest: "webroot/assets/sinon/sinon.js"
            }
        },
        jshint: {
            options: {
                ignores: [
                    "../contrail-web-ui/**/node_modules/**/*.js",
                ]
            },
            all: ['../contrail-web-ui/**/js/*.js']
        }
    });

    grunt.registerTask("build", ["concat"]);
    grunt.registerTask("default", ["jshint", "build"]);
};
