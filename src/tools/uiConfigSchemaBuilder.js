/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */
var _       = require("lodash");
var fs      = require("fs");
var args    = process.argv.slice(2);
var path    = require("path");
var config  = require("../../config/config.global");
var assert  = require("assert");

var idPermsExcludeFields = ["uuid", "created", "creator", "last_modified"];

function buildUIConfigSchema ()
{
    var fromSampleSchema = false;
    var includeReqds = ["required", "optional"];
    var jsonSchemaPath = args[0];
    var objListPath = jsonSchemaPath + "/objectList.json";
    var configJsonSchemaPath = path.resolve(config.jsonSchemaPath);
    if (false == fs.existsSync(objListPath)) {
        jsonSchemaPath = path.resolve("src/serverroot/configJsonSchemas/sample");
        objListPath = jsonSchemaPath + "/objectList.json";
        assert(fs.existsSync(objListPath));
        console.error("Config Pages Schema from sample schema");
        fromSampleSchema = true;
    }
    var uiConfigSchema = {};
    var schemaObjects = require(objListPath);
    var objects = _.result(schemaObjects, "objects", []);
    var objsCnt = objects.length;
    for (var i = 0; i < objsCnt; i++) {
        var resType = objects[i];
        var resPath = jsonSchemaPath + "/" + resType + "-schema.json";
        var resObj = require(resPath);
        var properties = _.result(resObj, "properties." + resType +
                                  ".properties", {});
        if (null == uiConfigSchema[resType]) {
            uiConfigSchema[resType] = {isConfig: true};
        }
        if (null == uiConfigSchema[resType]["optFields"]) {
            uiConfigSchema[resType]["optFields"] = [];
        }
        for (var key in properties) {
            if ("id_perms" == key) {
                var idPermsProperties = _.result(properties, key +
                                                 ".properties", {});
                for (var idPermsProp in idPermsProperties) {
                    if (idPermsExcludeFields.indexOf(idPermsProp) > -1) {
                        /* in id_perms, uuid value is in long, which JS can not
                         * represent, so skip
                         */
                        continue;
                    }
                    var idPermsKey = key + ":" + idPermsProp;
                    uiConfigSchema[resType]["optFields"] =
                        uiConfigSchema[resType]["optFields"].concat(idPermsKey);
                }
                continue;
            }
            uiConfigSchema[resType]["optFields"].push(key);
            if ("parent_type" == key) {
                var parentEnum = _.result(properties[key], "enum", []);
                var parentEnumLen = parentEnum.length;
                for (var j = 0; j < parentEnumLen; j++) {
                    var parent = parentEnum[j];
                    if (null == uiConfigSchema[parent]) {
                        uiConfigSchema[parent] = {isConfig: true};
                    }
                    if (null == uiConfigSchema[parent].children) {
                        uiConfigSchema[parent].children = {};
                    }
                    var uiChildName = resType.replace(/-/g, "_");
                    uiConfigSchema[parent].children[uiChildName] =
                        {"comparators": ["to"]};
                }
            }
        }
    }
    var uiSchemaFilePath = jsonSchemaPath + "/uiConfigSchema.json";
    var uiConfileSchemaFilePath =
        path.resolve(__dirname +
                     "/../../src/serverroot/configJsonSchemas/uiConfigSchema.json");
    fs.writeFileSync(uiSchemaFilePath,
                     JSON.stringify(uiConfigSchema, null, 4));
    console.log("Done, creating file: " + uiSchemaFilePath);
    if (true == fromSampleSchema) {
        fs.renameSync(uiSchemaFilePath, uiConfileSchemaFilePath);
        console.log("Moved the uiConfigSchema from " + uiSchemaFilePath + " to "
                    + uiConfileSchemaFilePath);
    }
}

buildUIConfigSchema();

exports.buildUIConfigSchema = buildUIConfigSchema;

