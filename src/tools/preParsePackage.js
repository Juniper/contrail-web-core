/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var assert = require('assert');
var config = require('../../config/config.global');
var args = process.argv.slice(2);
var parsePkg = require('./parseXMLList.js');
var async = require('async');
var exec = require('child_process').exec;
var path = require('path');

if ('prod-env' == args[0]) {
    var pkg = args[1].split(',');
    /* pkg[0] -> pkg path , pkg[1] -> pkg name */
    parsePkg.readAndProcessPkgXMLFiles(path.normalize(pkg[0]), (pkg[1] == undefined) ? null :
                                       pkg[1]);
} else {
    parsePkg.deleteAllAutoGenFiles(function() {
        var pkgList = args[1];
        if (null == pkgList) {
            parsePkg.readAndProcessPkgXMLFiles(process.cwd(), null);
            return;
        }
        var pkgsToBuild = pkgList.split(',');
        var pkgsToBuildCnt = pkgsToBuild.length;
        var pkgsDirList = [];
        pkgsDirList.push({'path': process.cwd()});
        for (var i = 0; i < pkgsToBuildCnt; i++) {
            if (config.featurePkg && config.featurePkg[pkgsToBuild[i]] &&
                config.featurePkg[pkgsToBuild[i]]['path']) {
                pkgsDirList.push({'path':
                                 config.featurePkg[pkgsToBuild[i]]['path'],
                                 'pkg': pkgsToBuild[i]});
            } else {
                console.error("Package directory does not exist in config under " +
                              "config.featurePkg for: " + pkgsToBuild[i]);
                assert(0);
            }
        }
        async.map(pkgsDirList, parsePackage, function(err) {
        });
    });
}

function parsePackage (pkgObj, callback)
{
    var pkgDir = pkgObj['path'];
    var pkg = pkgObj['pkg'];

    if (pkgDir == process.cwd()) {
        parsePkg.readAndProcessPkgXMLFiles(pkgDir, pkg, callback);
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
        parsePkg.readAndProcessPkgXMLFiles(pkgDir, pkg, callback);
    });
}

