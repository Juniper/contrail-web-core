/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var args = process.argv.slice(2),
    async = require('async'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

var confGenConst = require('./config.generator.constants'),
    coAppUtils = require('../js/common/core.app.utils');

/**
 * Base Config Generator Class.
 * Use this base class to create core, controller and other feature config generator class.
 */
var ConfigGenerator = function(type, configFile) {
    this.type = type;
    this.configFile = configFile;
    this.configJSON = confGenConst.buildBaseConfJson;
};

ConfigGenerator.prototype.generate = function() {
    // update the config with all the custom updates
    this.updateConfig();
    // write to config file.
    this.writeConfigFile();
};

ConfigGenerator.prototype.updateConfig = function() {
    // Empty function. extend this on inherited instances.
    // Update this.configJSON;
};

ConfigGenerator.prototype.getConfig = function() {
    return this.configJSON;
};

ConfigGenerator.prototype.writeConfigFile = function(file, content) {
    var self = this;
    if (!file)
        file = self.configFile;
    if (!content)
        content = self.getStringifiedConfig();

    fs.stat(file, function(a) {
        console.log("Writing Build Config file for " + self.type + " : " + file);
        fs.writeFile(file, content, function(err) {
            if (err) throw err;
        });
    });
};

ConfigGenerator.prototype.jsonFormat = function(attr, val, stringifyPrettify) {
    if (stringifyPrettify) {
        return "\n" + attr + ": " + JSON.stringify(val, null, 4);
    } else {
        return "\n" + attr + ": " + val ;
    }

}

ConfigGenerator.prototype.getStringifiedConfig = function() {
    var configStrArr = [
        '/*\n',
        ' * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.\n',
        ' */\n'];

    /**
     * Prettify, Stringify and return the string.
     * Since we need to preserve the RegExp as it is, and to avoid stringification,
     * we will construct the output string one by one from the config and add fileExclusionRegExp after.
     */
    configStrArr.push("({");
    var configJSON = this.getConfig(),
        configArr = [];
    for (var config in configJSON) {
        if (config !== 'fileExclusionRegExp') {
            configArr.push(this.jsonFormat(config, configJSON[config], true));
        } else {
            configArr.push(this.jsonFormat(config, configJSON[config], false))
        }
    }
    configStrArr.push(configArr.join());
    configStrArr.push("\n})\n");
    return configStrArr.join("");
};


/**
 * Core Config Generator Class. Extends base class ConfigGenerator.
 */
var CoreConfigGenerator = function(type, configFile) {
    this.type = type;
    this.configFile = configFile;
};

CoreConfigGenerator.prototype = new ConfigGenerator();

CoreConfigGenerator.prototype.updateBaseConfig = function() {
    var coreAppPaths = coAppUtils.getCoreAppPaths(confGenConst.defaultBaseDir, ''),
        coreAppMap = coAppUtils.coreAppMap,
        coreAppShim = coAppUtils.coreAppShim;

    this.configJSON.paths = coreAppPaths;
    this.configJSON.map = coreAppMap;
    this.configJSON.shim = coreAppShim;

    if (confGenConst.coreAppDir) this.configJSON.appDir = confGenConst.coreAppDir;
    if (confGenConst.coreOutDir) this.configJSON.dir = confGenConst.coreOutDir;
    if (confGenConst.coreBaseUrl) this.configJSON.baseUrl = confGenConst.coreBaseUrl;

    if (confGenConst.coreFileExclusionRegExp) this.configJSON.fileExclusionRegExp =  unescape(confGenConst.coreFileExclusionRegExp);
}

CoreConfigGenerator.prototype.addCoreInitModule = function () {
    var coreInitModule = {};

    if (confGenConst.coreInitModuleName)
        coreInitModule.name = confGenConst.coreInitModuleName;

    if (confGenConst.coreInitModuleInclude)
        coreInitModule.include = confGenConst.coreInitModuleInclude;

    if (confGenConst.coreInitModuleExclude)
        coreInitModule.exclude = confGenConst.coreInitModuleExclude;

    this.configJSON.modules.push(coreInitModule);
};

CoreConfigGenerator.prototype.updateConfig = function () {
    // Add the basic stuff to config.
    this.updateBaseConfig();

    // Currently we're doing only core.init
    this.addCoreInitModule();
};


/**
 * Controller config generator class.
 * will extend CoreConfigClass as we need the paths. overwrite the other config fields as required.
 */
var ControllerConfigGenerator = function(type, configFile) {
    this.type = type;
    this.configFile = configFile;
};

ControllerConfigGenerator.prototype = new CoreConfigGenerator();

ControllerConfigGenerator.prototype.overrideBaseConfig = function() {
    // Update core app paths with relative paths.
    for (var path in this.configJSON.paths) {
        this.configJSON.paths[path] = confGenConst.controllerCoreRelativePath + this.configJSON.paths[path];
    }
    // Add controller paths.
    var controllerApp = require('./../../../contrail-web-controller/webroot/common/ui/js/controller.app')
    var controllerAppPaths = controllerApp.getControllerAppPaths(confGenConst.defaultBaseDir, '');
    for (var path in controllerAppPaths) {
        if (controllerAppPaths.hasOwnProperty(path)) {
            this.configJSON.paths[path] = controllerAppPaths[path];
        }
    }
    // Remove core modules.
    this.configJSON.modules = [];
};

ControllerConfigGenerator.prototype.addControllerInitModule = function() {
    var controllerInitModule = {};

    if (confGenConst.controllerInitModuleName)
        controllerInitModule.name = confGenConst.controllerInitModuleName;

    if (confGenConst.controllerInitModuleInclude)
        controllerInitModule.include = confGenConst.controllerInitModuleInclude;

    if (confGenConst.controllerInitModuleExclude)
        controllerInitModule.exclude = confGenConst.controllerInitModuleExclude;

    this.configJSON.modules.push(controllerInitModule);
};

ControllerConfigGenerator.prototype.updateConfig = function() {
    // Call parent class method to update the basic configs.
    this.updateBaseConfig();

    //override with controller specific values.
    this.overrideBaseConfig();

    // Add modules if any requires unification.
    this.addControllerInitModule();
};

/**
 * SM build config generator class.
 */
var SMConfigGenerator = function (type, configFile) {
    this.type = type;
    this.configFile = configFile;
};

SMConfigGenerator.prototype = new CoreConfigGenerator();

SMConfigGenerator.prototype.overrideBaseConfig = function() {
    // Update core app paths with relative paths.
    for (var path in this.configJSON.paths) {
        this.configJSON.paths[path] = confGenConst.smCoreRelativePath + this.configJSON.paths[path];
    }
    // Remove core modules.
    this.configJSON.modules = [];
};

SMConfigGenerator.prototype.updateConfig = function() {
    // Call parent class method to update the basic configs.
    this.updateBaseConfig();

    //override with controller specific values.
    this.overrideBaseConfig();

    // Add modules if any requires unification.
};

var repo = args[0],
    file = args[1];

if (repo == 'webCore') {
    var coreConfigGenerator = new CoreConfigGenerator(repo, file);
    coreConfigGenerator.generate();
} else if(repo == 'webController') {
    var controllerConfigGenerator = new ControllerConfigGenerator(repo, file);
    controllerConfigGenerator.generate();
} else if(repo == 'serverManager') {
    var smConfigGenerator = new SMConfigGenerator(repo, file);
    smConfigGenerator.generate();
} else {}

