/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jsondiffpatch = require('jsondiffpatch');
var configApiServer = require('./configServer.api');
var configServerUtils = require('./configServer.utils');
var commonUtils = require('../utils/common.utils');
var logutils = require('../utils/log.utils');
var appErrors = require('../errors/app.errors');
var configUtils = require('./config.utils');
var fs = require("fs");
var path = require("path");
var _ = require('lodash');

var defMandateObjs = ['fq_name', 'uuid', 'display_name', 'parent_type',
                      'parent_uuid'];

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
    var optFieldsCnt = 0;
    if (null != optFields) {
        optFieldsCnt = optFields.length;
    }
    resultJSON[type] = {};
    var splitArrParams = [];
    var tmpOldJson = commonUtils.cloneObj(oldJson);
    for (var i = 0; i < optFieldsCnt; i++) {
        var splitArr = optFields[i].split(':');
        var splitArrLen = splitArr.length;
        if (splitArrLen > 1) {
            if (!(splitArr[0] in newJson)) {
                continue;
            }
            if (splitArr[0] in delta) {
                if (delta[splitArr[0]] instanceof Array) {
                    resultJSON[type][splitArr[0]] = delta[splitArr[0]][0];
                } else {
                    if (splitArr[1] in delta[splitArr[0]]) {
                        if (splitArr[0] in newJson) {
                            if (null == resultJSON[type][splitArr[0]]) {
                                resultJSON[type][splitArr[0]] = {};
                            }
                            resultJSON[type][splitArr[0]][splitArr[1]] =
                                newJson[splitArr[0]][splitArr[1]];
                            if (-1 == splitArrParams.indexOf(splitArr[0])) {
                                splitArrParams.push(splitArr[0]);
                            }
                        }
                    }
                }
            }
            continue;
        }
        if ((optFields[i] in delta) && (null != newJson)) {
            if (optFields[i] in newJson) {
                resultJSON[type][optFields[i]] = newJson[optFields[i]];
            }
        }
    }
    /* Now add all other missing values from oldJson */
    var splitArrParamsLen = splitArrParams.length;
    for (var i = 0; i < splitArrParamsLen; i++) {
        var param = splitArrParams[i];
        resultJSON[type][param] =
            configUtils.mergeObjects(oldJson[param],
                                     resultJSON[type][param]);
    }
    if (null == mandateFields) {
        return resultJSON;
    }
    var mandateFieldsCnt = mandateFields.length;
    for (var i = 0; i < mandateFieldsCnt; i++) {
        if (mandateFields[i] in newJson) {
            resultJSON[type][mandateFields[i]] = newJson[mandateFields[i]];
        } else if (mandateFields[i] in oldJson) {
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

function isConfigFlagSet (type)
{
    var configJsonObj = process.mainModule.exports['configJsonModifyObj'];
    var splitArr = type.split(':');
    return configJsonObj[splitArr[0]]['isConfig'];
}

function getConfigJSONDiff (type, oldJson, newJson)
{
    var typeNotFoundInJson = true;
    var tmpOldJson = {};
    var tmpNewJson = {};
    var optFields = [];
    var mandateFields = [];
    oldJson = (null != oldJson) ? oldJson : {};
    newJson = (null != newJson) ? newJson : {};

    var fieldsObj = getConfigFieldsByType(type);
    var parentType = fieldsObj['parentType'];
    var childType = fieldsObj['childType'];
    if (null == childType) {
        childType = parentType;
    }
    if (null != fieldsObj.error) {
        logutils.logger.debug("Config Diff: Not found the type: " + type);
        return newJson;
    }
    optFields = fieldsObj['optFields'];
    mandateFields = fieldsObj['mandateFields'];
    if (null != fieldsObj['preProcessCB']) {
        var preProcessCB = fieldsObj['preProcessCB'];
        var preProcessOldJsonCB = preProcessCB['applyOnOldJSON'];
        var preProcessNewJsonCB = preProcessCB['applyOnNewJSON'];
        if (null != preProcessOldJsonCB) {
            oldJson = preProcessOldJsonCB(childType, oldJson, optFields,
                                          mandateFields);
        }
        if (null != preProcessNewJsonCB) {
            newJson = preProcessNewJsonCB(childType, newJson, optFields,
                                          mandateFields);
        }
    }
    if (null == oldJson[childType]) {
        tmpOldJson[childType] = commonUtils.cloneObj(oldJson);
    } else {
        tmpOldJson = commonUtils.cloneObj(oldJson);
    }
    if (null == newJson[childType]) {
        typeNotFoundInJson = false;
        tmpNewJson[childType] = commonUtils.cloneObj(newJson);
    } else {
        tmpNewJson = commonUtils.cloneObj(newJson);
    }
    var delta = diffpatcher.diff(tmpOldJson, tmpNewJson);
    if ((null == delta) || (undefined == delta) ||
        ('undefined' == delta)) {
        return null;
    }
    var isConfig = isConfigFlagSet(type);
    if ((null == isConfig) || (false == isConfig)) {
        return (false == typeNotFoundInJson) ? delta[childType] : delta;
    }
    /* For config, we need to send the diff in a different way, so proceed
     * further
     */
    if ((null != fieldsObj) &&
        (null != fieldsObj['postProcessCB'])) {
        var postProcess = fieldsObj['postProcessCB'];
        var postProcessOldJsonCB = fieldsObj['postProcessCB']['applyOnOldJSON'];
        var postProcessNewJsonCB = fieldsObj['postProcessCB']['applyOnNewJSON'];
        if (null != postProcessOldJsonCB) {
            oldJson = postProcessOldJsonCB(childType, oldJson, optFields,
                                           mandateFields);
        }
        if (null != postProcessNewJsonCB) {
            newJson = postProcessNewJsonCB(childType, newJson, optFields,
                                           mandateFields);
        }
    }
    if (null == oldJson[childType]) {
        tmpOldJson[childType] = commonUtils.cloneObj(oldJson);
    } else {
        tmpOldJson = commonUtils.cloneObj(oldJson);
    }
    if (null == newJson[childType]) {
        tmpNewJson[childType] = commonUtils.cloneObj(newJson);
    } else {
        tmpNewJson = commonUtils.cloneObj(newJson);
    }
    delta = buildConfigDeltaJson(delta, tmpOldJson, tmpNewJson, childType, optFields,
                                 mandateFields);
    return (false == typeNotFoundInJson) ? delta[childType] : delta;
}

function getConfigJsonModifyByType (type)
{
    var configJsonModifyObj = process.mainModule.exports['configJsonModifyObj'];
    return configJsonModifyObj[type];
}

function getConfigFieldsByType (type, isArray)
{
    var error = null;
    var configJsonModifyObj = process.mainModule.exports['configJsonModifyObj'];

    if ((null != isArray) || (true == isArray)) {
        if ((null == configJsonModifyObj['arrayDiff']) ||
            (null == configJsonModifyObj['arrayDiff'][type])) {
            error = new appErrors.RESTServerError('type ' + type + ' not ' +
                                                  'specified in ' +
                                                  'configJsonModifyObj');
            return {'error': error};
        }
        return configJsonModifyObj['arrayDiff'][type];
    }
    var typeSplit = type.split(':');
    if (!((typeSplit.length == 1) || (typeSplit.length == 2))) {
        error = new appErrors.RESTServerError('type not correct ' + type);
        return {'error': error};
    }
    var configJsonObj = null;
    if (2 == typeSplit.length) {
        type = typeSplit[1];
        configJsonObj = configJsonModifyObj[typeSplit[0]]['subType'];
    } else {
        configJsonObj = configJsonModifyObj;
    }
    if ((null == configJsonObj) || (null == configJsonObj[type])) {
        error = new appErrors.RESTServerError('type ' + type + ' not ' +
                                              'specified in ' +
                                              'configJsonModifyObj');
        return {'error': error};
    }
    var configTypeObj = configJsonObj[type];
    configTypeObj['error'] = error;
    configTypeObj['parentType'] = typeSplit[0];
    configTypeObj['childType'] = typeSplit[1];
    if (null == configTypeObj.mandateFields) {
        configTypeObj.mandateFields = defMandateObjs;
    }
    return configTypeObj;
}

function getJSONDiffByConfigUrl (url, appData, newJson, callback, uuid)
{
    var error = null;
    var optFields = [];
    var mandateFields = [];
    if (null == url) {
        error = new appErrors.RESTServerError('URL not specified');
        callback(error, null, configData);
        return;
    }
    var urlArrStr = url.split(/[/]/);
    if ((null == urlArrStr) || (urlArrStr.length < 2)) {
        error =
            new appErrors.RESTServerError('URL ' + url + ' format not ' +
                                          'correct.');
        callback(error, null, configData);
        return;
    }
    var type = urlArrStr[1];

    var fieldsObj = getConfigFieldsByType(type);
    var fieldsArr = [];
    if (null == fieldsObj.error) {
        if ((null != fieldsObj['optFields']) &&
            (fieldsObj['optFields'].length > 0)) {
            fieldsArr = fieldsArr.concat(fieldsObj['optFields']);
        }
        if ((null != fieldsObj['mandateFields']) &&
            (fieldsObj['mandateFields'].length > 0)) {
            fieldsArr = fieldsArr.concat(fieldsObj['mandateFields']);
        }
    }
    if (fieldsArr.length > 0) {
        url = url + '?fields=' + fieldsArr.join(',');
    }

    configApiServer.apiGet(url, appData, function(err, configData) {
        if ((null != err) || (null == configData)) {
            callback(err, null, configData);
            return;
        }
        var delta = getConfigJSONDiff(type, configData, newJson);
        if(uuid) {
            //prepare refs array delta map
            var refsDeltaArrayMap = {};
            var optFields = _.get(fieldsObj, 'optFields', []);
            var exceptionList = _.get(fieldsObj, 'exception_list', []);
            _.forEach(optFields, function(optField) {
                if(_.endsWith(optField, "_refs")
                        && _.indexOf(exceptionList, optField) === -1){
                    var oldRefs = _.get(configData, type + '.' + optField, null);
                    var newRefs = _.get(newJson, type + '.' + optField, null);
                    var refDelta  = getConfigJSONArrayDelta(type, oldRefs, newRefs);
                    if(refDelta) {
                        refsDeltaArrayMap[optField] = refDelta;
                    }
                    if(delta[type]) {
                        delete delta[type][optField];
                    }
                }
            });
            configServerUtils.setRefUpdates(appData, refsDeltaArrayMap, type, uuid,
                    delta, configData, callback);
        } else {
            callback(err, delta, configData);
        }
    });
}

function getConfigDiffAndMakeCall (url, appData, newJson, callback, headers, uuid)
{
    getJSONDiffByConfigUrl(url, appData, newJson, function(err, configDelta,
                                                           configData) {
        if ((null != err) || (null == configDelta)) {
            callback(err, configDelta);
            return;
        }
        configApiServer.apiPut(url, configDelta, appData, function(err, data) {
            callback(err, data);
        }, headers);
    }, uuid);
}

function doFeatureJsonDiffParamsInit ()
{
    var configJsonModifyObj = {},
        config = configUtils.getConfig(),
        featurePkgList = config.featurePkg;
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
                if (('arrayDiff' == key) || ('configDelete' == key)) {
                    for (tmpKey in jsonDiffApi[key]) {
                        if (null == configJsonModifyObj[key]) {
                            configJsonModifyObj[key] = {};
                        }
                        configJsonModifyObj[key][tmpKey] =
                            jsonDiffApi[key][tmpKey];
                    }
                }
            }
        }
    }
    /* Now merge both the UI Default and auto generated schemas */
    var cfgSchemaFound = false;
    var cfgJsonSchemaPath = path.resolve(config.jsonSchemaPath +
                                         "/uiConfigSchema.json");
    if (false == fs.existsSync(cfgJsonSchemaPath)) {
        cfgJsonSchemaPath =
            path.resolve("src/serverroot/configJsonSchemas/sample/uiConfigSchema.json");
        if (true == fs.existsSync(cfgJsonSchemaPath)) {
            cfgSchemaFound = true;
        }
    } else {
        cfgSchemaFound = true;
    }
    if (true == cfgSchemaFound) {
        configJsonModifyObj =
            configUtils.mergeObjects(require(cfgJsonSchemaPath),
                                     configJsonModifyObj);
    }
    process.mainModule.exports.configJsonModifyObj = configJsonModifyObj;
    exports.configJsonModifyObj = configJsonModifyObj;
}

var arrayDiffpatcher = jsondiffpatch.create({
    objectHash: function(obj) {
        return JSON.stringify(obj);
    },
    arrays: {
        detectMove:true
    }
});

function filterFieldsByComparators (arrayJson, comparators)
{
    var len = arrayJson.length;
    for (var i = 0; i < len; i++) {
        for (var key in arrayJson[i]) {
            /* If key is not found in comparators, then delete that object */
            if (-1 == comparators.indexOf(key)) {
                delete arrayJson[i][key];
            }
        }
    }
}

function getConfigArrayDelta (type, oldArrayJson, newArrayJson)
{
    if (null == oldArrayJson) {
        oldArrayJson = [];
    }
    if (null == newArrayJson) {
        newArrayJson = [];
    }
    var origOldArrayJson = commonUtils.cloneObj(oldArrayJson);
    var origNewArrayJson = commonUtils.cloneObj(newArrayJson);
    oldArrayJson = commonUtils.doDeepSort(oldArrayJson);
    newArrayJson = commonUtils.doDeepSort(newArrayJson);
    var resultJSON = {'addedList': [], 'deletedList': []};
    var fieldsType = getConfigFieldsByType(type, true);

    if (null != fieldsType) {
        if (null != fieldsType['preProcessCB']) {
            var preProcessOnOldJsonCB =
                fieldsType['preProcessCB']['applyOnOldJSON'];
            var preProcessOnNewJsonCB =
                fieldsType['preProcessCB']['applyOnNewJSON'];
            if (null != preProcessOnOldJsonCB) {
                oldArrayJson = preProcessOnOldJsonCB(oldArrayJson);
            }
            if (null != preProcessOnNewJsonCB) {
                newArrayJson = preProcessOnNewJsonCB(newArrayJson);
            }
            var comparators = fieldsType['preProcessCB']['comparators'];
            if ((null != comparators) && (comparators.length > 0)) {
                filterFieldsByComparators(oldArrayJson, comparators);
                filterFieldsByComparators(newArrayJson, comparators);
            }
        }
    }
    var delta = arrayDiffpatcher.diff(oldArrayJson, newArrayJson);
    if ((null == delta) || (undefined == delta) ||
        ('undefined' == delta)) {
        return null;
    }
    if ((null != delta['_t']) && ('a' != delta['_t'])) {
        return null;
    }

    var oldArrayLen = oldArrayJson.length;
    var newArrayLen = newArrayJson.length;
    var maxArrLen = oldArrayLen + newArrayLen;
    for (var i = 0; i < maxArrLen; i++) {
        var deltaI = delta[i.toString()];
        var delta_I = delta['_' + i.toString()];
        if ((null == deltaI) && (null == delta_I)) {
            continue;
        }
        if (null != delta_I) {
            if (3 == delta_I[2]) {
                /* Array Move, do not do anything */
            }
            if (0 == delta_I[2]) {
                /* Deleted entry */
                resultJSON['deletedList'].push(origOldArrayJson[i]);
            }
        }
        if (null != deltaI) {
            resultJSON['addedList'].push(origNewArrayJson[i]);
        }
    }
    return resultJSON;
}

function getConfigJSONArrayDelta (type, oldArrayJson, newArrayJson)
{
    var resultJSON = {'addedList': [], 'deletedList': []};
    if (null == newArrayJson) {
        //No changes to refs return
        return resultJSON;
    }
    if (null == oldArrayJson) {
        oldArrayJson = [];
    }
    var origOldArrayJson = commonUtils.cloneObj(oldArrayJson);
    var origNewArrayJson = commonUtils.cloneObj(newArrayJson);
    oldArrayJson = commonUtils.doDeepSort(oldArrayJson);
    newArrayJson = commonUtils.doDeepSort(newArrayJson);
    var fieldsType = getConfigJsonModifyByType(type);

    if (null != fieldsType) {
        if (null != fieldsType['preProcessCB']) {
            var comparators = fieldsType['preProcessCB']['comparators'];
            if ((null != comparators) && (comparators.length > 0)) {
                filterFieldsByComparators(oldArrayJson, comparators);
                filterFieldsByComparators(newArrayJson, comparators);
            }
        }
    }
    var delta = arrayDiffpatcher.diff(oldArrayJson, newArrayJson);
    if ((null == delta) || (undefined == delta) ||
        ('undefined' == delta)) {
        return null;
    }
    if ((null != delta['_t']) && ('a' != delta['_t'])) {
        return null;
    }

    var oldArrayLen = oldArrayJson.length;
    var newArrayLen = newArrayJson.length;
    var maxArrLen = oldArrayLen + newArrayLen;
    for (var i = 0; i < maxArrLen; i++) {
        var deltaI = delta[i.toString()];
        var delta_I = delta['_' + i.toString()];
        if ((null == deltaI) && (null == delta_I)) {
            continue;
        }
        if (null != delta_I) {
            if (3 == delta_I[2]) {
                /* Array Move, do not do anything */
            }
            if (0 == delta_I[2]) {
                /* Deleted entry */
                resultJSON['deletedList'].push(origOldArrayJson[i]);
            }
        }
        if (null != deltaI) {
            resultJSON['addedList'].push(origNewArrayJson[i]);
        }
    }
    return resultJSON;
}

function getConfigArrayDeltaByURL (url, keyArr, appData, postData, callback)
{
    var oldArr = [];
    var newArr = [];
    var resultJSON = {};
    if (null == url) {
        error = new appErrors.RESTServerError('URL not specified');
        callback(error, null, null);
        return;
    }
    var urlArrStr = url.split(/[/]/);
    if ((null == urlArrStr) || (urlArrStr.length < 2)) {
        error =
            new appErrors.RESTServerError('URL ' + url + ' format not ' +
                                          'correct.');
        callback(error, null, null);
        return;
    }
    var type = urlArrStr[1];
    var tmpPostData = commonUtils.cloneObj(postData);
    if (null != tmpPostData[type]) {
        tmpPostData = tmpPostData[type];
    } else {
        error =
            new appErrors.RESTServerError('type ' + type + ' not found ' +
                                          'in postData');
        callback(error, null, null);
        return;
    }
    configApiServer.apiGet(url, appData, function(err, configData) {
        if ((null != err) || (null == configData) ||
            (null == configData[type])) {
            callback(err, null, configData);
            return;
        }
        configData = configData[type];
        var keyArrLen = keyArr.length;
        for (var i = 0; i < keyArrLen; i++) {
            oldArr = (null != configData[keyArr[i]]) ? configData[keyArr[i]] :
                [];
            newArr = (null != tmpPostData[keyArr[i]]) ? tmpPostData[keyArr[i]] :
                [];
            resultJSON[keyArr[i]] = getConfigArrayDelta(keyArr[i], oldArr,
                                                        newArr);
        }
        callback(null, resultJSON, configData);
    });
}

exports.getConfigJSONDiff = getConfigJSONDiff;
exports.getJSONDiffByConfigUrl = getJSONDiffByConfigUrl;
exports.getJsonDiff = getJsonDiff;
exports.doFeatureJsonDiffParamsInit = doFeatureJsonDiffParamsInit;
exports.getConfigDiffAndMakeCall = getConfigDiffAndMakeCall;
exports.getConfigArrayDeltaByURL = getConfigArrayDeltaByURL;
exports.getConfigArrayDelta = getConfigArrayDelta;
exports.filterFieldsByComparators = filterFieldsByComparators;

