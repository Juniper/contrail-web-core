/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* This file uses pareseURL.xml and creates the file urlRoutes.api.js */
var fs = require('fs'),
    async = require('async'),
    xml2js = require('xml2js'),
    jsonPath = require('JSONPath').eval,
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
                console.log("Error while parsing XML: " + pkgXMLFilePath + " " +  err);
                assert(0);
            }
            callback(err, result);
        });
    });
}

function readXMLFile (xmlTagData, callback)
{
    var rootDir = xmlTagData['rootDir'];
    var srcPath = xmlTagData['path'][0];
    var srcArrPath = srcPath.split(':');
    if (srcArrPath.length > 1) {
        srcPath = rootDir + '/' + srcArrPath[1];
    }
    try {
        var destPath = xmlTagData['output'][0];
        var destArrPath = destPath.split(':');
        if (destArrPath.length > 1) {
            destPath = rootDir + '/' + destArrPath[1];
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

function readAndProcessPkgXMLFiles (srcDir, callback)
{
    var srcXMLPath = srcDir + '/webroot/pkgxml/';

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
            var parseURLDataLen = 0;
            if (null != parseURLData) {
                parseURLDataLen = parseURLData.length;
            }
            var featureListData = jsonPath(result, "$..featureList[0]");
            var featureListDataLen = 0;
            if (null != featureListData) {
                featureListDataLen = featureListData.length;
            }
            var jobProcessData = jsonPath(result, "$..jobProcess[0]");
            var jobProcessDataLen = 0;
            if (null != jobProcessData) {
                jobProcessDataLen = jobProcessData.length;
            }
            for (var i = 0; i < parseURLDataLen; i++) {
                parseURLData[i]['rootDir'] = srcDir;
            }
            for (i = 0; i < featureListDataLen; i++) {
                featureListData[i]['rootDir'] = srcDir;
            }
            for (i = 0; i < jobProcessDataLen; i++) {
                jobProcessData[i]['rootDir'] = srcDir;
            }
            var pkgStr = "var pkgList = " + JSON.stringify(result);
            pkgStr += '\nexports.pkgList = pkgList';
            fs.writeFileSync(srcXMLPath + 'package.js', pkgStr);
            async.map(parseURLData, applyURLParser, function(err) {
                async.map(featureListData, applyFeatureListParser, function(err) {
                    async.map(jobProcessData, applyJobListParser, function(err) {
                    });
                });
            });
        });
    });
}

readAndProcessPkgXMLFiles();
exports.readAndProcessPkgXMLFiles = readAndProcessPkgXMLFiles;
