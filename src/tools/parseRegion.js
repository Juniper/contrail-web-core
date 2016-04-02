/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var config = process.mainModule.exports.config;
var fs = require('fs');
var logutils = require('../serverroot/utils/log.utils');

function createRegionFile (callback)
{
    var commentStr = "";
    commentStr += "/*\n";
    commentStr += " * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.\n";
    commentStr += " */\n";
    commentStr += "\n";
    var date = new Date();
    commentStr +=  "/* This file is automatically generated at\n";
    commentStr += "   " + date;
    commentStr += "\n";
    commentStr += "   Please do not edit this file.";
    commentStr += "\n"
    commentStr += " */";
    commentStr += "\n";
    commentStr += "\n";

    var regionStr = "";
    regionStr += 'var config = {};\n';
    regionStr += 'config.regionsFromConfig = ';
    regionStr += (true == config.regionsFromConfig) ? 'true;' : 'false;';
    regionStr += '\n';
    if ('regions' in config) {
        regionStr += 'config.regions = {};\n';
        for (var key in config['regions']) {
            regionStr += 'config.regions.' + key + " = '" +
                config['regions'][key] + "';\n";
        }
    }
    if (true == config.regionsFromConfig) {
        regionStr +=
            'var regionList = [];\n' +
            'for (var key in config.regions) {\n' +
            '   regionList.push({text: key, id: key})\n' +
            '}\n' +
            '$(document).ready(function () {\n' +
            '   $("#region_id").select2({placeholder: "Select the Region", data: regionList, width: "283px"});\n' +
            '})\n';
    } else {
        regionStr +=
            '$(document).ready(function () {\n' +
            '   $("#region_id").select2({placeholder: "Select the Region", data: [], width: "283px"});\n' +
            '})\n';
    }

    var fileToGen = process.mainModule.exports.corePath +
        '/webroot/common/api/regions.js';
    var finalStr = commentStr + regionStr;
    fs.writeFile(fileToGen, finalStr, function(err) {
        logutils.logger.error('Region file creation error: ' + err);
        console.log("Done, creating file: " + fileToGen);
        callback(err);
    });
}

exports.createRegionFile = createRegionFile;

