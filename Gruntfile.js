/*jshint node:true */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks('grunt-contrib-jshint');

    var UI_THIRD_PARTY = '../contrail-web-third-party/';
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
            "src-js": {
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
            "src-css": {
                options: { process: process },
                src: [
                    UI_THIRD_PARTY + "qunit/src/qunit.css"
                ],
                dest: "webroot/assets/qunit/qunit.css"
            }
        },
        jshint: {
            src: ['*.js']
        }
    });

    grunt.registerTask("build", ["concat"]);
    grunt.registerTask("default", ["jshint", "build"]);
};
