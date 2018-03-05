/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    contrailConfig;

var fileReadOptions = {encoding: "utf8"};
var defaultMotdFilePath = "/etc/contrail/contrail-webui-motd";

/* Function: compareAndMergeDefaultConfig
   This function is used to compare and merge missing configuration from
   default.config.global.js with config file
 */
function compareAndMergeDefaultConfig (confFile)
{
    if (null == confFile) {
        confFile = __dirname + '/../../../config/config.global.js';
    }
    var confFile = path.normalize(confFile);
    var defConfFile = __dirname + '/../../../config/default.config.global.js';
    return compareAndMergeFiles(confFile, defConfFile);
}

/* Function: mergeObjects
    This function is used to merge default config with actual config, so any
    config is missed in actual config, that is added from default config.
 */
function mergeObjects (defaults, configs)
{
    if (null == configs) {
        return defaults;
    }
    if (null == defaults) {
        return configs;
    }
    Object.keys(defaults).forEach(function(keyDefault) {
        if (typeof configs[keyDefault] == "undefined") {
            configs[keyDefault] = defaults[keyDefault];
        } else if (isObject(defaults[keyDefault]) && isObject(configs[keyDefault])) {
            mergeObjects(defaults[keyDefault], configs[keyDefault]);
        }
    });

    function isObject(object) {
        return Object.prototype.toString.call(object) === '[object Object]';
    }

    return configs;
}

function updateMOTD (msg)
{
    if (null == msg) {
        delete contrailConfig.motd_string;
    } else {
        msg = msg.replace(/^\s+|\s+$/g, '');
        contrailConfig.motd_string= msg;
    }
}

/* Function: compareAndMergeFiles
   This function is used to mege two files line by line comparing the left
   porton of splitter of fileToCmp with fileWithCmp.

   args: 
    fileToCmp: The file to which comparison is done, finally the extra string in
               fileWithCmp gets copied in fileToCmp.
    fileWithCmp: The file with with comparison is done
 */
function compareAndMergeFiles (fileToCmp, fileWithCmp)
{
    var oldConfig = require(fileToCmp);
    var defConfig = require(fileWithCmp);
    var config = mergeObjects(defConfig, oldConfig);
    return config;
}

function subscribeMOTDFileChange ()
{
    var commonUtils = require("../utils/common.utils");
    var logutils = require('../utils/log.utils');
    var config = getConfig();
    var contents = null;
    var filePath = null;
    var motdFilePath =
        commonUtils.getValueByJsonPath(config, "motd;file_path", "");
    fs.readFile(motdFilePath, fileReadOptions, function(error, contents) {
        if ((null != error) && (null != error.errno)) {
            fs.readFile(defaultMotdFilePath, fileReadOptions, function(error, contents) {
                if ((null != error) && (null != error.errno)) {
                    logutils.logger.error("Configured/Default MOTD file " +
                                          "read error code", error.errno);
                    updateAndWatchMOTDFileChange(null, null);
                    return;
                }
                updateAndWatchMOTDFileChange(contents, defaultMotdFilePath);
                return;
            });
        }
        updateAndWatchMOTDFileChange(contents, motdFilePath);
    });
    return;
}

function updateAndWatchMOTDFileChange (contents, filePath)
{
    var logutils = require('../utils/log.utils');
    updateMOTD(contents);
    if (null == filePath) {
        return;
    }
    fs.watchFile(filePath, function(curr, prev) {
        fs.readFile(filePath, fileReadOptions, function(error, contents) {
            if ((null != error) && (null != error.errno)) {
                logutils.logger.error("Configured/Default MOTD file " +
                        "read error code", error.errno);
            }
            if ((null == error) && (null != contents)) {
                updateMOTD(contents);
            } else if (defaultMotdFilePath == filePath) {
                /* No MOTD Message to display */
                updateMOTD(null);
                return;
            } else {
                /* Try with default one now */
                fs.readFile(defaultMotdFilePath, fileReadOptions,
                            function(error, contents) {
                    if ((null == error) && (null != contents)) {
                        updateMOTD(contents);
                    } else {
                        /* No MOTD Message to display */
                        updateMOTD(null);
                    }
                });
            }
        });
    });
}

/* Function: subscribeAutoDetectConfig, implements fs.watchFile
 * This function detects changes in config.global.js
 * and updates contrailConfig variable
 */
function subscribeAutoDetectConfig(confFile)
{
    fs.watchFile(confFile, function(curr, prev){
        getActualPath(confFile, function(err, actPath){
            if(err){
                console.error("subscribeAutoDetectConfig " + err);
                return;
            }
            delete require.cache[actPath];
            updateConfig(actPath);
            var contrailServ = require('./contrailservice.api');
            contrailServ.getContrailServices();
            contrailServ.startWatchContrailServiceRetryList();
            subscribeMOTDFileChange();
        });
    });
}

/* Function: getActualPath
 * handling symlinks
*/
function getActualPath(path, callback) {
    // Check if it's a link
    fs.lstat(path, function(err, stats) {
        if(err) {
            // log errors
            callback(err, null);
            return;
        } else if(stats.isSymbolicLink()) {
            // Read symlink
            fs.readlink(path, function(err, realPath) {
                // Handle errors
                if(err) {
                    callback(err, null);
                    return;
                }
                // the real file
                callback(null, realPath);
            });
        } else {
            // It's not a symlink
            callback(null, path);
        }
    });
}

function updateConfig(confFile)
{
    contrailConfig = compareAndMergeDefaultConfig(confFile);
}

/* Function: getConfig
 * This function gets the latest config
 */
function getConfig()
{
  return contrailConfig;
}

/* Function:getConfigFile
 * It gets configFile with full path if it is provided through
 * command line arguments else from default path.
 */

function getConfigFile(args)
{
    var configFile = null,
        argsCnt = args.length;
    for (var i = 0; i < argsCnt; i++) {
        if (('--c' == args[i]) || ('--conf_file' == args[i])) {
            if (null == args[i + 1]) {
                console.error('Config file not provided');
                assert(0);
            } else {
                configFile = args[i + 1];
                try {
                    var tmpConfig = require(configFile);
                    if ((null == tmpConfig) ||
                            (typeof tmpConfig !== 'object')) {
                        console.error('Config file ' +
                                configFile + ' is not valid');
                        assert(0);
                    }
                    break;
                } catch(e) {
                    console.error('Config file ' + configFile + ' not found');
                    assert(0);
                }
            }
        }
    }
    if(configFile === null){
        configFile =
            path.normalize(__dirname + '/../../../config/config.global.js');
    }
    return configFile;
}

exports.compareAndMergeDefaultConfig = compareAndMergeDefaultConfig;
exports.mergeObjects = mergeObjects;
exports.subscribeAutoDetectConfig = subscribeAutoDetectConfig;
exports.updateConfig = updateConfig;
exports.getConfig = getConfig;
exports.getConfigFile = getConfigFile;
exports.subscribeMOTDFileChange = subscribeMOTDFileChange;

