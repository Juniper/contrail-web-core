/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var assert = require('assert');
var config = require('../../config/config.global');
var args = process.argv.slice(2);
var parsePkg = require('./parsePackage.js');
var async = require('async');
var exec = require('child_process').exec;

if ('prod-env' == args[0]) {
    /* In make package, whole directory itself is being passed */
    parsePkg.readAndProcessPkgXMLFiles(args[1]);
} else {

    var pkgList = args[1];
    if (null == pkgList) {
        parsePkg.readAndProcessPkgXMLFiles(process.cwd());
        return;
    }
    var pkgsToBuild = pkgList.split(',');
    var pkgsToBuildCnt = pkgsToBuild.length;
    var pkgsDirList = [];
    pkgsDirList.push(process.cwd());
    for (var i = 0; i < pkgsToBuildCnt; i++) {
        if (config.featurePkg && config.featurePkg[pkgsToBuild[i]] &&
            config.featurePkg[pkgsToBuild[i]]['path']) {
            pkgsDirList.push(config.featurePkg[pkgsToBuild[i]]['path']);
        } else {
            console.error("Package directory does not exist in config under " +
                          "config.featurePkg for: " + pkgsToBuild[i]);
            assert(0);
        }
    }
    async.map(pkgsDirList, parsePackage, function(err) {
    });
}

function parsePackage (pkgDir, callback)
{
    if (pkgDir == process.cwd()) {
        parsePkg.readAndProcessPkgXMLFiles(pkgDir, callback);
        return;
    }
    var splitArr = pkgDir.split('/');
    var arrLen = splitArr.length;
    var idx = pkgDir.lastIndexOf('/');
    if (idx == pkgDir.length - 1) {
        arrLen--;
    }
    var cmd = 'ln -sf ';
    for (var i = 0; i < arrLen - 1; i++) {
        cmd += '../';
    }
    cmd += process.cwd() + '/node_modules ' + pkgDir + '/node_modules';
    exec(cmd, function(err, stdout, stderr) {
        parsePkg.readAndProcessPkgXMLFiles(pkgDir, callback);
    });
}

