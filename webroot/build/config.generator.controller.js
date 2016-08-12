/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
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

module.exports = ControllerConfigGenerator;
