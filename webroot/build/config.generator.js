/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var args = process.argv.slice(2),
    async = require('async'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

var ControllerConfigGenerator = require('./config.generator.controller'),
    CoreConfigGenerator = require('./config.generator.core'),
    StorageConfigGenerator = require('./config.generator.storage'),
    SMConfigGenerator = require('./config.generator.sm'),
    confGenConst = require('./config.generator.constants'),
    coApp = require('../js/common/core.app');

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

ConfigGenerator.prototype.addModules = function(modules) {
    if (modules.length > 0) {
        for (var i=0; i<modules.length; i++) {
            if (modules[i].enabled) {
                var module = {};
                module.name = modules[i].name;
                module.include = modules[i].include;
                module.exclude = modules[i].exclude;
                this.configJSON.modules.push(module);
            }
        }
    }
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
} else if(repo == 'webStorage') {
    var storageConfigGenerator = new StorageConfigGenerator(repo, file);
    storageConfigGenerator.generate();
} else {}
