/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
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

module.exports = CoreConfigGenerator;
