/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
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
    //Add SM app paths.
    var smApp = require('./../../../contrail-web-server-manager/webroot/common/ui/js/sm.app')
    var smAppPaths = smApp.getSMAppPaths(confGenConst.defaultBaseDir, '');
    for (var path in smAppPaths) {
        if (smAppPaths.hasOwnProperty(path)) {
            this.configJSON.paths[path] = smAppPaths[path];
        }
    }
    // Remove core modules.
    this.configJSON.modules = [];
};

SMConfigGenerator.prototype.addSMInitModule = function() {
    var smInitModule = {};

    if (confGenConst.smInitModuleName)
        smInitModule.name = confGenConst.smInitModuleName;

    if (confGenConst.smInitModuleInclude)
        smInitModule.include = confGenConst.smInitModuleInclude;

    if (confGenConst.smInitModuleExclude)
        smInitModule.exclude = confGenConst.smInitModuleExclude;

    this.configJSON.modules.push(smInitModule);
};

SMConfigGenerator.prototype.updateConfig = function() {
    // Call parent class method to update the basic configs.
    this.updateBaseConfig();

    //override with sm specific values.
    this.overrideBaseConfig();

    // Add modules if any requires unification.
    this.addSMInitModule();
};

module.exports = SMConfigGenerator;
