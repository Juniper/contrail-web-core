/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @configschema.api.js
 *     - Handler to fetch the json schema, list of objects and list of
 *     properties for an object
 */
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var appErrors   = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/errors/app.errors');
var fs = require('fs');
var path = require('path');
var configUtils = require('./config.utils');

var defaultSchemaDir = process.mainModule.exports["corePath"] +
                          '/src/serverroot/configJsonSchemas/sample/';

function validateId (request)
{
    var id = null;
    if (!(id = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add required object name');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return id;
}

/**
 * readFileAndReturnData
 * reads the data from the given filepath and returns it
 * @param filePath
 * @param callback
 */
function readFileAndReturnData (filePath, callback)
{
    fs.readFile(filePath, 'utf8', function (error,data) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, data);
    });
}

/**
 * getJsonSchema
 * @param request
 * @param response
 * @param appData
 */
function getJsonSchema (request, response, appData)
{
    var id = validateId(request),
        config = configUtils.getConfig();
    var schemaDir = commonUtils.getValueByJsonPath(config,"jsonSchemaPath",
            defaultSchemaDir);
    var filePath = path.join(schemaDir, id + '-schema.json');
    readFileAndReturnData (filePath, function(error,data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, JSON.parse(data));
    });
}

/**
 * getObjectList
 * @param request
 * @param response
 * @param appData
 */
function getObjectList (request, response, appData)
{
    var config = configUtils.getConfig();
    var schemaDir = commonUtils.getValueByJsonPath(config,"jsonSchemaPath",
            defaultSchemaDir);
    var filePath = path.join(schemaDir + '/objectList.json');
    readFileAndReturnData (filePath, function(error,data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        var dataObj = JSON.parse(data),
            objects =
                commonUtils.getValueByJsonPath(dataObj, 'objects', [], false),
            formattedObjs =  objects.map(function(object){
                return object + 's';
            });
        commonUtils.handleJSONResponse(error,
                response, { objects: formattedObjs});
    });
}

/**
 * getPropertiesForObject
 * @param request
 * @param response
 * @param appData
 */
function getPropertiesForObject (request, response, appData)
{
    var id = validateId(request),
        config = configUtils.getConfig();;
    var schemaDir = commonUtils.getValueByJsonPath(config,"jsonSchemaPath",
        defaultSchemaDir);
    var filePath = path.join(schemaDir, id + '-schema.json');
    fs.readFile(filePath, 'utf8', function (error,data) {
        if (error) {
            console.log("Error getting properties for " + id);
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        var jsonObj = JSON.parse(data);
        var objectProps = commonUtils.getValueByJsonPath(jsonObj,'properties;' + id + ";properties");
        var properties = [];
        for (key in objectProps) {
            properties.push(key);
        }
        commonUtils.handleJSONResponse(error, response, properties);
    });
}

 /* List all public function here */
 exports.getJsonSchema           = getJsonSchema;
 exports.getPropertiesForObject  = getPropertiesForObject;
 exports.getObjectList           = getObjectList;
