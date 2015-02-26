var jsondiffpatch = require('jsondiffpatch');
var configApiServer = require('./configServer.api');
var commonUtils = require('../utils/common.utils');
var configDeltaUtils = require('./configDelta.utils');
var logutils = require('../utils/log.utils');
var appErrors = require('../errors/app.errors');

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

function getConfigJSONDiff (type, oldJson, newJson)
{
    var optFields = [];
    var mandateFields = [];

    var fieldsObj = getConfigFieldsByType(type);
    if (null != fieldsObj.error) {
        logutils.logger.error("Config Diff: Not found the type: " + type);
        return null;
    }
    optFields = fieldsObj['optFields'];
    mandateFields = fieldsObj['mandateFields'];
    var delta = diffpatcher.diff(oldJson, newJson);
    if ((null == delta) || (undefined == delta) ||
        ('undefined' == delta)) {
        return null;
    }
    if ((null != configDeltaUtils.configJsonModifyObj[type]) &&
        (null !=
         configDeltaUtils.configJsonModifyObj[type]['preProcessJSONDiff'])) {
        var jsonModCB =
            configDeltaUtils.configJsonModifyObj[type]['preProcessJSONDiff'];
        oldJson = jsonModCB(type, oldJson, optFields, mandateFields);
    }

    return buildConfigDeltaJson(delta, oldJson, newJson, type, optFields,
                                mandateFields);
}

function getConfigFieldsByType (type)
{
    var error = null;
    var optFields = [];
    var mandateFields = [];
    if (null == configDeltaUtils.configJsonModifyObj[type]) {
        error = new appErrors.RESTServerError('type ' + type + ' not ' +
                                              'specified in ' +
                                              'configJsonModifyObj');
        return {'error': error};
    }
    var configTypeObj = configDeltaUtils.configJsonModifyObj[type];
    if (null == configTypeObj['optFields']) {
        error = new appErrors.RESTServerError('fields not ' +
                                              'specified in ' +
                                              'configJsonModifyObj');
        return {'error': error};
    }
    optFields = configTypeObj['optFields'];
    if (null != configTypeObj['mandateFields']) {
        mandateFields = configTypeObj['mandateFields'];
    }
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

exports.getConfigJSONDiff = getConfigJSONDiff;
exports.getJSONDiffByConfigUrl = getJSONDiffByConfigUrl;

