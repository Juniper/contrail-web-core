/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var dir         = require('node-dir');
var fs          = require('fs');
var exec        = require('child_process').exec;
var mime        = require('mime');
var async       = require('async');
var jobPr       = require('./jobProcess');
var regURL      = require('./registerURL');
var xml2js      = require('xml2js');
var config      = require('../../config/config.global');
var assert      = require('assert');
var featurePr   = require('./parseFeature');
var fileListObj = {};

var parser = new xml2js.Parser();

function getAutoGenFileByFileMatch (filePath, match)
{
    if ('/parseURL.xml/' == match) {
        return filePath + '/url.routes.js';
    } else if ('/jobProcess.xml/' == match) {
        return filePath + '/jobsCb.api.js';
    } else if ('/featureList.xml/' == match) {
        return filePath + '/feature.list.js';
    }
    assert(0);
}

function getAutoGenFileByXMLFilePath (xmlFilePath, match)
{
    var idx = xmlFilePath.lastIndexOf('/');
    var filePath = xmlFilePath.substr(0, idx);

    return getAutoGenFileByFileMatch(filePath, match);
}

function parseXMLAndWriteFile (content, filePath, match, callback)
{
    parser.parseString(content, function(err, content) {
        var filename = getAutoGenFileByXMLFilePath(filePath, match);
        if ('/parseURL.xml/' == match) {
            regURL.parseURLFile(content, filename, callback);
        } else if ('/jobProcess.xml/' == match) {
            jobPr.parseJobListFile(content, filename, callback);
        } else if ('/featureList.xml/' == match) {
            featurePr.parseFeatureFile(content, filename, callback);
        }
    });
}

function readAndProcessPkgXMLFiles (pkgDir, callback)
{
    var fileListArr = [];
    fileListArr.push({'pkgDir': pkgDir, 'match': /parseURL.xml/});
    fileListArr.push({'pkgDir': pkgDir, 'match': /jobProcess.xml/});
    fileListArr.push({'pkgDir': pkgDir, 'match': /featureList.xml/});
    var str = "var pkgList = {};\n";
    str += "exports.pkgList = pkgList;\n";
    str += "pkgList['dirPath'] = '" + pkgDir + "';\n";
    writeToPkgFile(pkgDir, false, str, function() {
        async.map(fileListArr, processXMLFiles, function(err) {
            callback();
        });
    });
}

function writeToPkgFile (pkgDir, isAppend, str, callback)
{
    var webPkgFilePath = pkgDir + '/webroot/common/api';
    var webPkgFile = webPkgFilePath + '/package.js';
    var cmd = 'mkdir -p -m 0777 ' + webPkgFilePath;
    fs.exists(webPkgFilePath, function(exists) {
        if (false == exists) {
            exec(cmd, function(error, stdout, strerr) {
                if (false == isAppend) {
                    fs.writeFileSync(webPkgFile, str);
                } else {
                    fs.appendFileSync(webPkgFile, str);
                }
                callback();
            });
        } else {
            if (false == isAppend) {
                fs.writeFileSync(webPkgFile, str);
            } else {
                fs.appendFileSync(webPkgFile, str);
            }
            callback();
        }
    });
}

function processXMLFiles (fileObj, callback)
{
    var pkgDir = fileObj['pkgDir'];
    var match = fileObj['match'];

    var arrStr = match.toString().split('/');
    var str = "";
    str += "pkgList['" + arrStr[1] + "'] = [];\n";
    writeToPkgFile(pkgDir, true, str, function() {
        dir.readFiles(pkgDir, {
            match: match, excludeDir: /node_modules/}, function(err, content, filename, next) {
            if (err) throw err;
            if ('application/xml' != mime.lookup(filename)) {
                next();
            } else {
                var autoGenFile = getAutoGenFileByXMLFilePath(filename, match);
                str = "pkgList['" + arrStr[1] + "'].push('" + autoGenFile + "');\n";
                writeToPkgFile(pkgDir, true, str, function() {
                    parseXMLAndWriteFile(content, filename, match, function() {
                        next();
                    });
                });
            }
        });
    });
}

function deleteAllAutoGenFiles (callback)
{
    var dirPath = null;
    var fearutePkgDirList = [];
    for (key in config.featurePkg) {
        fearutePkgDirList.push({'pkgDir': config.featurePkg[key]['path'], 
                               'match': /parseURL.xml/});
        fearutePkgDirList.push({'pkgDir': config.featurePkg[key]['path'], 
                               'match': /jobProcess.xml/});
        fearutePkgDirList.push({'pkgDir': config.featurePkg[key]['path'], 
                               'match': /featureList.xml/});
    }
    fearutePkgDirList.push({'pkgDir': __dirname + '/../..', 
                           'match': /parseURL.xml/});
    fearutePkgDirList.push({'pkgDir': __dirname + '/../..',
                           'match': /jobProcess.xml/});
    fearutePkgDirList.push({'pkgDir': __dirname + '/../..',
                           'match': /featureList.xml/});
    async.map(fearutePkgDirList, deleteAutoGenFiles, function(err) {
        callback(err);
    });
}

function deleleAutoGenFile (xmlFilePath, callback)
{
    if ('application/xml' != mime.lookup(xmlFilePath)) {
        callback(null);
        return;
    }
    var idx = xmlFilePath.lastIndexOf('/');
    var match = '/' + xmlFilePath.slice(idx + 1) +'/';
    var xmlFilePath = xmlFilePath.substr(0, idx);
    var filePath = getAutoGenFileByFileMatch(xmlFilePath, match);
    cmd = 'rm -f ' + filePath;
    exec(cmd, function(err, stdout, stderr) {
        callback(null);
    });
}

function deleteAutoGenFiles (pkgDirObj, callback)
{
    var pkgDir = pkgDirObj['pkgDir'];
    var match = pkgDirObj['match'];

    dir.readFiles(pkgDir, {
        match: match, excludeDir: /node_modules/}, 
        function(err, content, next) {
            if (err) throw err;
            next();
        }, function(err, files) {
            async.map(files, deleleAutoGenFile, function(err) {
                cmd = 'rm -f ' + pkgDir + '/webroot/common/api/package.js';
                exec(cmd, function(err, stdout, stderr) {
                    callback(err);
                });
            });
    });

}

exports.readAndProcessPkgXMLFiles = readAndProcessPkgXMLFiles;
exports.deleteAllAutoGenFiles = deleteAllAutoGenFiles;

