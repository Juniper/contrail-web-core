/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

fs = require('fs'),
xml2js = require('xml2js'),
g = require('./global'),
cut = require('./cutils'),
util = require('util');

var GLOBAL_CONFIG_FILE = "webroot/js/config_global.js"

createIncludeFile();

function createIncludeFile() {
    fs.stat(GLOBAL_CONFIG_FILE, function(a) {
        var str = getToBeIncluded();
        fs.writeFile(GLOBAL_CONFIG_FILE,
            str, function(err) {
            if (err) throw err;
        });
    });
}

function getToBeIncluded() {
    var global_str = "";
    global_str += 
    '/*\n' +
    ' * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.\n' + 
    ' */\n' +
    '\n';

    for (var key in global) {
        if (global.hasOwnProperty(key)) {
            if(cut.isNumber(global[key]))
                global_str += "var " + key + " = " + global[key] + ";\n";
            else
                global_str += "var " + key + " = " + "\"" +
                    global[key] + "\";\n";
        }
    }
    global_str += "\n\n";
    for (var key in cut) {
        if (cut.hasOwnProperty(key)) {
            global_str += cut[key].toString() + "\n";            
        }
    }
 
    return global_str;
}

