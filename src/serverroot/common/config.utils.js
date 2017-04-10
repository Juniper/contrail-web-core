/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    contrailConfig,
    args = process.argv.slice(2),
    argsCnt = args.length,
    configFile = null;
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
    delete require.cache[fileToCmp];
    var oldConfig = require(fileToCmp);
    var defConfig = require(fileWithCmp);
    var config = mergeObjects(defConfig, oldConfig);
    return config;
}

/* Function: subscribeAutoDetectConfig, implements fs.watchFile
 * This function detects changes in config.global.js
 * and updates contrailConfig variable
 */
function subscribeAutoDetectConfig()
{
    fs.watchFile('./config/config.global.js', function(curr, prev){
        contrailConfig = compareAndMergeDefaultConfig(configFile);
    });
}

/* Function: getConfig
 * This function gets the latest config
 */
function getConfig()
{
  return contrailConfig;
}

for (var i = 0; i < argsCnt; i++) {
    if (('--c' == args[i]) || ('--conf_file' == args[i])) {
        if (null == args[i + 1]) {
            console.error('Config file not provided');
            assert(0);
        } else {
            configFile = args[i + 1];
            try {
                var tmpConfig = require(configFile);
                if ((null == tmpConfig) || (typeof tmpConfig !== 'object')) {
                    console.error('Config file ' + configFile + ' is not valid');
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
contrailConfig = compareAndMergeDefaultConfig(configFile);

exports.compareAndMergeDefaultConfig = compareAndMergeDefaultConfig;
exports.mergeObjects = mergeObjects;
exports.subscribeAutoDetectConfig = subscribeAutoDetectConfig;
exports.getConfig = getConfig;
