/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var path = require('path');

var fileReadOptions = {encoding: "utf8"};
var defaultMotdFilePath = "/etc/contrail/contrail-webui-motd";
var contrailConfig = {};

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
    var contents = null;
    var filePath = null;
    var motdFilePath =
        commonUtils.getValueByJsonPath(process.mainModule.exports.config,
                                       "motd;file_path", "");
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

function getConfig()
{
    return contrailConfig;
}

exports.compareAndMergeDefaultConfig = compareAndMergeDefaultConfig;
exports.mergeObjects = mergeObjects;
exports.subscribeMOTDFileChange = subscribeMOTDFileChange;
exports.getConfig = getConfig;

