/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* This file uses pareseURL.xml and creates the file urlRoutes.api.js */
var fs = require('fs'),
    async = require('async'),
    xml2js = require('xml2js'),
    jsonPath = require('JSONPath').eval,
    config = require('../../config/config.global'),
    regURL = require('./registerURL'),
    prseFeature = require('./parseFeature'),
    jobProc = require('./jobProcess'),
    mime = require('mime'),
    exec = require('child_process').exec,
    assert = require('assert');


var urlLists = [];

var parser = new xml2js.Parser();

function applyPackageParser (pkgFile, callback)
{
    fs.readFile(__dirname + '/../packageList/' + pkgFile, function(err, data) {
        parser.parseString(data, function(err, result) {
            if (err) {
                console.log("Error while parsing XML: " + pkgFile + " " +  err);
                assert(0);
            }
            callback(err, result);
        });
    });
}

function applyXMLPackageParser (pkgXMLFilePath, callback)
{
    fs.readFile(pkgXMLFilePath, function(err, data) {
        parser.parseString(data, function(err, result) {
            if (err) {
                console.log("Error while parsing XML: " + pkgFile + " " +  err);
                assert(0);
            }
            callback(err, result);
        });
    });
}

function readXMLFile (xmlTagData, callback)
{
    var args = process.argv.slice(2);
    var srcPath = xmlTagData['path'][0];
    var srcArrPath = srcPath.split(':');
    if (srcArrPath.length > 1) {
        srcPath = args[0] + '/' + srcArrPath[1];
    }
    try {
        var destPath = xmlTagData['output'][0];
        var destArrPath = destPath.split(':');
        if (destArrPath.length > 1) {
            destPath = args[0] + '/' + destArrPath[1];
        }
    } catch(e) {
        destPath = null;
    }
    fs.readFile(srcPath, function(err, data) {
        if (err) {
            console.log("readFile error:" + err);
            assert(0);
        }
        callback(err, data, destPath);
    });
}

function readXMLToJson (xmlTagData, callback)
{
    readXMLFile(xmlTagData, function(err, data, destPath) {
        parser.parseString(data, function(err, result) {
            if (err) {
                console.log("Error while parsing XML: " +  err);
                assert(0);
            }
            callback(err, result, destPath);
        });
    });
}

function applyURLParser (parseURLData, callback)
{
    readXMLToJson(parseURLData, function(err, result, destPath) {
        regURL.parseURLFile(result, destPath, function(err) {
            callback(err);
        });
    });
}

function applyFeatureListParser (featureListData, callback)
{
    readXMLToJson(featureListData, function(err, result, destPath) {
        prseFeature.parseFeatureFile(result, destPath, function(err) {
            callback(err);
        });
    });
}

function applyJobListParser (jobProcessData, callback)
{
    readXMLToJson(jobProcessData, function(err, result, destPath) {
        jobProc.parseJobListFile(result, destPath, function(err) {
            callback(err);
        });
    });
    return;
}

function copyPkgXMLFile (pkgXMLPath, callback)
{
    var cmd = 'rm -rf src/packageList';
    exec(cmd, function(error, stdout, stderr) {
         cmd = 'mkdir -p src/packageList';
        exec(cmd, function(error, stdout, stderr) {
            cmd = 'cp -f webroot/pkgxml/webCorePkg.xml src/packageList/.';
            exec(cmd, function(error, stdout, stderr) {
                cmd = 'cp -f ' + pkgXMLPath + 'webroot/pkgxml/* src/packageList/.';
                exec(cmd, function(error, stdout, stderr) {
                    callback(null);
                });
            });
        });
    });
}

function copyPackageXMLs (callback)
{
    var pkgArr = [];
    for (key in config.featurePkg) {
        pkgArr.push(config.featurePkg[key]['path']);
    }
    async.map(pkgArr, copyPkgXMLFile, function(err) {
        callback(null);
    });
}

function readAndProcessPkgXMLFiles (callback)
{
    var args = process.argv.slice(2);
    var srcDir = args[0];
    var srcXMLPath = srcDir + '/webroot/pkgxml/';

    //copyPackageXMLs(function(err) {
        fs.readdir(srcXMLPath, function(error, files) {
            var fileList = [];
            if (null == files) {
                return;
            }
            var fileCnt = files.length;
            for (var i = 0; i < fileCnt; i++) {
                if ('application/xml' == mime.lookup(files[i])) {
                    fileList.push(srcXMLPath + files[i]);
                }
            }
            async.map(fileList, applyXMLPackageParser, function(err, result) {
                var parseURLData = jsonPath(result, "$..parseURL[0]");
                var featureListData = jsonPath(result, "$..featureList[0]");
                var jobProcessData = jsonPath(result, "$..jobProcess[0]");
                async.map(parseURLData, applyURLParser, function(err) {
                    async.map(featureListData, applyFeatureListParser, function(err) {
                        async.map(jobProcessData, applyJobListParser, function(err) {
                        });
                        var pkgStr = "var pkgList = " + JSON.stringify(result);
                        pkgStr += '\nexports.pkgList = pkgList';
                        fs.writeFile(srcXMLPath + 'package.js', pkgStr,
                                     function(err) {
                        });
                    });
                });
            });
        });
    //});
}

function processPkgXMLFile (srcDir, pkgFileCreatePath)
{
	var args = process.argv.slice(2);
	var srcDir = args[0];
    var srcXMLPath = srcDir + '/webroot/pkgxml/package.xml';
    applyXMLPackageParser(srcXMLPath, function(err, result) {
        var parseURLData = jsonPath(result, "$..parseURL[0]");
        var featureListData = jsonPath(result, "$..featureList[0]");
        var jobProcessData = jsonPath(result, "$..jobProcess[0]");
        async.map(parseURLData, applyURLParser, function(err) {
            async.map(featureListData, applyFeatureListParser, function(err) {
                async.map(jobProcessData, applyJobListParser, function(err) {
                });
                var pkgStr = "var pkgList = " + JSON.stringify(result);
                pkgStr += '\nexports.pkgList = pkgList';
                var destPath = srcDir + '/webroot/pkgxml/package.js';
                fs.writeFile(destPath, pkgStr, function(err) {
                });
            });
        });
    }); 
}

readAndProcessPkgXMLFiles();
exports.readAndProcessPkgXMLFiles = readAndProcessPkgXMLFiles;
exports.processPkgXMLFile = processPkgXMLFile;
