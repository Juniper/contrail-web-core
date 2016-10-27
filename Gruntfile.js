/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function( grunt ) {
  grunt.loadNpmTasks("grunt-contrib-csslint");

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    csslint: {
      options: {
        useBuiltInFormatter: false,
        csslintrc: ".csslintrc",
        formatters: [
          {id: require("csslint-stylish")}
        ]
      },
      dev: {
        src: grunt.option("src") || "./webroot/**/*.css"
      }
    }
  });

  grunt.registerTask("default", ["csslint"]);
};
