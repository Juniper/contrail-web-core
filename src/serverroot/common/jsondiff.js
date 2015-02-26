/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jsondiffpatch = require('jsondiffpatch');
var configApiServer = require('./configServer.api');
var commonUtils = require('../utils/common.utils');
var configDeltaUtils = require('./configDelta.utils');
var logutils = require('../utils/log.utils');
var appErrors = require('../errors/app.errors');
var config = process.mainModule.exports.config;

var diffpatcher = jsondiffpatch.create({
    objectHash: function(obj, index) {
        // try to find an id property, otherwise just use the index in the array
        return obj.name || obj.id || obj._id || obj._id || '$$index:' + index;
    },
    arrays: {
        detectMove: true,
        includeValueOnMove: true
    }
});

function buildConfigDeltaJson (delta, oldJson, newJson, type, optFields,
                               mandateFields)
{
    if ((null == optFields) && (null == mandateFields)) {
        /* App is interested on all the diffs */
        return delta;
    }
    var resultJSON = {};

    if (null != delta) {
        delta = delta[type];
    }
    if (null != oldJson) {
        oldJson = oldJson[type];
    }
    if (null != newJson) {
        newJson = newJson[type];
    }
    var optFieldsCnt = optFields.length;
    resultJSON[type] = {};
    for (var i = 0; i < optFieldsCnt; i++) {
        if ((null != delta[optFields[i]]) && (null != newJson) &&
            (null != newJson[optFields[i]])) {
            resultJSON[type][optFields[i]] = newJson[optFields[i]];
        }
    }
    if (null == mandateFields) {
        return resultJSON;
    }
    var mandateFieldsCnt = mandateFields.length;
    for (var i = 0; i < mandateFieldsCnt; i++) {
        if (null != newJson[mandateFields[i]]) {
            resultJSON[type][mandateFields[i]] = newJson[mandateFields[i]];
        } else if (null != oldJson[mandateFields[i]]) {
            resultJSON[type][mandateFields[i]] = oldJson[mandateFields[i]];
        }
    }
    return resultJSON;
}

function getJsonDiff (type, oldJson, newJson)
{
    var delta = diffpatcher.diff(oldJson, newJson);
    return delta;
}

function getConfigJSONDiff (type, oldJson, newJson)
{
    var typeNotFoundInJson = true;
    var tmpOldJson = {};
    var tmpNewJson = {};
    var configJsonModifyObj = process.mainModule.exports['configJsonModifyObj'];
    var optFields = [];
    var mandateFields = [];

    var fieldsObj = getConfigFieldsByType(type);
    if (null != fieldsObj.error) {
        logutils.logger.error("Config Diff: Not found the type: " + type);
        return null;
    }
    optFields = fieldsObj['optFields'];
    mandateFields = fieldsObj['mandateFields'];
    if ((null != configJsonModifyObj[type]) &&
        (null != configJsonModifyObj[type]['preProcessCB'])) {
        var preProcessCB = configJsonModifyObj[type]['preProcessCB'];
        var preProcessOldJsonCB = preProcessCB['applyOnOldJSON'];
        var preProcessNewJsonCB = preProcessCB['applyOnNewJSON'];
        if (null != preProcessOldJsonCB) {
            oldJson = preProcessOldJsonCB(type, oldJson, optFields,
                                          mandateFields);
        }
        if (null != preProcessNewJsonCB) {
            newJson = preProcessNewJsonCB(type, newJson, optFields,
                                          mandateFields);
        }
    }

    if (null == oldJson[type]) {
        typeNotFoundInJson = false;
        tmpOldJson[type] = commonUtils.cloneObj(oldJson);
    } else {
        tmpOldJson = commonUtils.cloneObj(oldJson);
    }
    if (null == newJson[type]) {
        tmpNewJson[type] = commonUtils.cloneObj(newJson);
    } else {
        tmpNewJson = commonUtils.cloneObj(newJson);
    }
    var delta = diffpatcher.diff(tmpOldJson, tmpNewJson);
    if ((null == delta) || (undefined == delta) ||
        ('undefined' == delta)) {
        return null;
    }
    var isConfig = configJsonModifyObj[type]['isConfig'];
    if ((null == isConfig) || (false == isConfig)) {
        return (false == typeNotFoundInJson) ? delta[type] : delta;
    }
    /* For config, we need to send the diff in a different way, so proceed
     * further
     */
    if ((null != configJsonModifyObj[type]) &&
        (null != configJsonModifyObj[type]['postProcessCB'])) {
        var postProcess = configJsonModifyObj[type]['postProcessCB'];
        var postProcessOldJsonCB =
            configJsonModifyObj[type]['postProcessCB']['applyOnOldJSON'];
        var postProcessNewJsonCB =
            configJsonModifyObj[type]['postProcessCB']['applyOnNewJSON'];
        if (null != postProcessOldJsonCB) {
            oldJson = postProcessOldJsonCB(type, oldJson, optFields,
                                           mandateFields);
        }
        if (null != postProcessNewJsonCB) {
            newJson = postProcessNewJsonCB(type, newJson, optFields,
                                           mandateFields);
        }
    }
    if (null == oldJson[type]) {
        tmpOldJson[type] = commonUtils.cloneObj(oldJson);
    } else {
        tmpOldJson = commonUtils.cloneObj(oldJson);
    }
    if (null == newJson[type]) {
        tmpNewJson[type] = commonUtils.cloneObj(newJson);
    } else {
        tmpNewJson = commonUtils.cloneObj(newJson);
    }
    delta = buildConfigDeltaJson(delta, tmpOldJson, tmpNewJson, type, optFields,
                                 mandateFields);
    return (false == typeNotFoundInJson) ? delta[type] : delta;
}

function getConfigFieldsByType (type)
{
    var error = null;
    var optFields = [];
    var mandateFields = [];
    var configJsonModifyObj = process.mainModule.exports['configJsonModifyObj'];
    if (null == configJsonModifyObj[type]) {
        error = new appErrors.RESTServerError('type ' + type + ' not ' +
                                              'specified in ' +
                                              'configJsonModifyObj');
        return {'error': error};
    }
    var configTypeObj = configJsonModifyObj[type];
    /*
    if (null == configTypeObj['optFields']) {
        error = new appErrors.RESTServerError('fields not ' +
                                              'specified in ' +
                                              'configJsonModifyObj');
        return {'error': error};
    }
    */
    optFields = configTypeObj['optFields'];
    mandateFields = configTypeObj['mandateFields'];
    /*
    if (null != configTypeObj['mandateFields']) {
        mandateFields = configTypeObj['mandateFields'];
    }
    */
    return {'error': error, 'optFields': optFields, 'mandateFields': mandateFields};
}

function getJSONDiffByConfigUrl (url, appData, newJson, callback)
{
    var error = null;
    var optFields = [];
    var mandateFields = [];
    if (null == url) {
        error = new appErrors.RESTServerError('URL not specified');
        callback(error, null);
        return;
    }
    var urlArrStr = url.split(/[/]/);
    if ((null == urlArrStr) || (urlArrStr.length < 2)) {
        error =
            new appErrors.RESTServerError('URL ' + url + ' format not ' +
                                          'correct.');
        callback(error, null);
        return;
    }
    var type = urlArrStr[1];

    configApiServer.apiGet(url, appData, function(err, configData) {
        if ((null != err) || (null == configData)) {
            callback(err, configData);
            return;
        }
        var delta = getConfigJSONDiff(type, configData, newJson);
        callback(err, delta);
    });
}

function doFeatureJsonDiffParamsInit ()
{
    var configJsonModifyObj = {};
    var featurePkgList = config.featurePkg;
    for (key in featurePkgList) {
        if ((config.featurePkg[key]) && (config.featurePkg[key]['path']) &&
            ((null == config.featurePkg[key]['enable']) ||
             (true == config.featurePkg[key]['enable'])) &&
            (true == fs.existsSync(config.featurePkg[key]['path'] +
                                   '/webroot/common/api/jsonDiff.helper.js'))) {
            var jsonDiffApi = require(config.featurePkg[key]['path'] +
                                   '/webroot/common/api/jsonDiff.helper.js');
            jsonDiffApi = jsonDiffApi.configJsonModifyObj;
            for (key in jsonDiffApi) {
                configJsonModifyObj[key] = jsonDiffApi[key];
            }
        }
    }
    process.mainModule.exports.configJsonModifyObj = configJsonModifyObj;
    exports.configJsonModifyObj = configJsonModifyObj;
}

exports.getConfigJSONDiff = getConfigJSONDiff;
exports.getJSONDiffByConfigUrl = getJSONDiffByConfigUrl;
exports.getJsonDiff = getJsonDiff;
exports.doFeatureJsonDiffParamsInit = doFeatureJsonDiffParamsInit;

