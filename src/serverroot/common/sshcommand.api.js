/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @sshcommand.api
 *     - Handlers for SSH Commands to Remote Device
 */
var Connection  = require('ssh2');
var async       = require('async');
var commonUtils = require('../utils/common.utils');
var appErrors   = require('../errors/app.errors.js');
var configUtils = require('./config.utils');

var defDockerContNames = ["controller", "analytics", "analyticsdb"];
var containerNotFoundStr = "Error response from daemon: No such container";
var contrailStatusNotFoundStr = "contrail-status: command not found";
var dockerNotFoundStr = "docker: command not found";
var openstackStatusNotFoundStr = "openstack-status: command not found";

function fillSSHDockerCmdObjs (cmdObjs, req, cmd)
{
    var config = configUtils.getConfig();
    var data = req.body;
    var username = data['username'];
    var password = data['password'];
    var host = req.param('ip');
    if (null == cmdObjs) {
        cmdObjs = [];
    }
    var dockerContNames = commonUtils.getValueByJsonPath(config,
                                                         "docker;container_list",
                                                         defDockerContNames);
    switch (cmd) {
    case "contrail-status":
        var dockerContNamesLen = dockerContNames.length;
        var startLen = cmdObjs.length;
        for (var i = startLen; i < startLen + dockerContNamesLen; i++) {
            if (null == cmdObjs[i]) {
                cmdObjs[i] = {};
            }
            cmdObjs[i]["cmd"] = "docker exec " + dockerContNames[i - startLen] +
                " " + cmd;
            cmdObjs[i]['host'] = host;
            cmdObjs[i]['username'] = username;
            cmdObjs[i]['password'] = password;
        }
        break;
    case "openstack-status":
        var host = commonUtils.getValueByJsonPath(config, "identityManager;ip",
                                                  null);
        /* In Docker environment, openstack does not run in container */
        if (null == cmdObjs) {
            cmdObjs = [];
        }
        cmdObjs.push({cmd: cmd, host: host, username: username,
                      password: password});
        break;
    }
}

function getServiceStatus (req, res, appData)
{
    var data = req.body;
    var username = data['username'];
    var password = data['password'];
    var host = req.param('ip');
    var cmdObjs = [];

    var cmdList = ['contrail-status', 'openstack-status'];        
    var len = cmdList.length;
    for (var i = 0; i < len; i++) {
        cmdObjs[i] ={};
        cmdObjs[i]['host'] = host;
        cmdObjs[i]['username'] = username;
        cmdObjs[i]['password'] = password;
        cmdObjs[i]['cmd'] = cmdList[i];
    }
    /* In Docker environment, openstack and vrouter does not run in
     * container, so we need to merge all the contents
     */
    var config = configUtils.getConfig();
    fillSSHDockerCmdObjs(cmdObjs, req, "contrail-status");
    var idHost = commonUtils.getValueByJsonPath(config, "identityManager;ip",
                                                null);
    if (idHost != host) {
        fillSSHDockerCmdObjs(cmdObjs, req, "openstack-status");
    }
    async.map(cmdObjs, issueSSHCmd, function(err, result) {
        if ((null != err) || (null == result)) {
            try {
                error = new appErrors.RESTServerError((err.toString()));
            } catch(e) {
                error = new appErrors.RESTServerError("Error in fetching" +
                                                      " service status");
            }
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        var totalCnt = result.length;
        var contrailStatusData = result[0];
        var openstackStatusData = result[1];
        var openstackStatusContData = result[totalCnt - 1];

        var finalResult = "";
        if ((null != contrailStatusData) && (contrailStatusData.length > 0)) {
            if (-1 == contrailStatusData.indexOf(contrailStatusNotFoundStr)) {
                finalResult += contrailStatusData.toString();
            }
        }
        for (i = cmdList.length; i < totalCnt - 1; i++) {
            var partialData = result[i];
            if ((null != partialData) && (partialData.length > 0)) {
                var dockerContrailStatusFoundIdx =
                    partialData.indexOf(contrailStatusNotFoundStr);
                var containerFoundIdx = partialData.indexOf(containerNotFoundStr);
                var dockerFoundIdx = partialData.indexOf(dockerNotFoundStr);
                if ((-1 == dockerContrailStatusFoundIdx) &&
                    (-1 == containerFoundIdx) && (-1 == dockerFoundIdx)) {
                    finalResult += partialData.toString();
                }
            }
        }
        if ((null != openstackStatusData) && (openstackStatusData.length > 0)) {
            if (-1 == openstackStatusData.indexOf(openstackStatusNotFoundStr)) {
                finalResult += "\nopenstack-status on host:" + idHost + "\n";
                finalResult += openstackStatusData.toString();
            }
        }
        var dockerOpenstackStatusData = result[totalCnt - 1];
        if ((null != dockerOpenstackStatusData) &&
            (dockerOpenstackStatusData.length > 0) && (idHost != host)) {
            if (-1 == dockerOpenstackStatusData.indexOf(openstackStatusNotFoundStr)) {
                finalResult += "\nopenstack-status on host:" + host + "\n";
                finalResult += dockerOpenstackStatusData.toString();
            }
        }
        commonUtils.handleResponse(null, res, finalResult);
    });
}

function issueSSHCmd (cmdObj, callback)
{
    var cmd = cmdObj['cmd'];
    var host = cmdObj['host'];
    var username = cmdObj['username'];
    var password = cmdObj['password'];
    var c = new Connection();
    var result = '';
    c.connect({
        host: host,
        port: 22,
        username: username,
        password: password
    });
    c.on('ready', function() {
        c.exec(cmd, function(err, stream) {
            if (err) {
                callback(err, stream);
                return;
            }
            stream.on('data', function(data, extended) {
                result += data;
            });
            stream.on('end', function() {
            });
            stream.on('close', function() {
            });
            stream.on('exit', function(code, signal) {
                c.end();
            });
        });
    });
    c.on('error', function(err) {
        callback(err, null);
    });
    c.on('end', function() {
    });
    c.on('close', function(had_error) {
        if (false == had_error) {
            callback(null, result);
        }
    });
}

exports.getServiceStatus = getServiceStatus;
