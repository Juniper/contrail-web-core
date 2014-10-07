/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* Function: compareAndMergeDefaultConfig
   This function is used to compare and merge missing configuration from
   default.config.global.js with config file
 */
function compareAndMergeDefaultConfig ()
{
    var confFile = __dirname + '/../../../config/config.global.js';//'/etc/contrail/config.global.js';
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
    var oldConfig = require(fileToCmp);
    var defConfig = require(fileWithCmp);
    var config = mergeObjects(defConfig, oldConfig);
    return config;
}

exports.compareAndMergeDefaultConfig = compareAndMergeDefaultConfig;
exports.mergeObjects = mergeObjects;
