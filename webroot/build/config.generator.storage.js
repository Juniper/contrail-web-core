/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
/**
 * Storage build config generator class.
 */
var StorageConfigGenerator = function (type, configFile) {
    this.type = type;
    this.configFile = configFile;
};

StorageConfigGenerator.prototype = new CoreConfigGenerator();

StorageConfigGenerator.prototype.overrideBaseConfig = function() {
    // Update core app paths with relative paths.
    for (var path in this.configJSON.paths) {
        this.configJSON.paths[path] = confGenConst.storageCoreRelativePath + this.configJSON.paths[path];
    }
    //Add Storage app paths.
    var storageApp = require('./../../../contrail-web-storage/webroot/common/ui/js/storage.app')
    var storageAppPaths = storageApp.getStorageAppPaths(confGenConst.defaultBaseDir, '');
    for (var path in storageAppPaths) {
        if (storageAppPaths.hasOwnProperty(path)) {
            this.configJSON.paths[path] = storageAppPaths[path];
        }
    }
    // Remove core modules.
    this.configJSON.modules = [];
};

StorageConfigGenerator.prototype.addStorageInitModule = function() {
    var storageInitModule = {};

    if (confGenConst.storageInitModuleName)
        storageInitModule.name = confGenConst.storageInitModuleName;

    if (confGenConst.storageInitModuleInclude)
        storageInitModule.include = confGenConst.storageInitModuleInclude;

    if (confGenConst.storageInitModuleExclude)
        storageInitModule.exclude = confGenConst.storageInitModuleExclude;

    this.configJSON.modules.push(storageInitModule);
};

StorageConfigGenerator.prototype.updateConfig = function() {
    // Call parent class method to update the basic configs.
    this.updateBaseConfig();

    //override with storage specific values.
    this.overrideBaseConfig();

    // Add modules if any requires unification.
    this.addStorageInitModule();
};

module.exports = StorageConfigGenerator;
