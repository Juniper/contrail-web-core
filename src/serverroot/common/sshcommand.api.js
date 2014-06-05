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

function getServiceStatus (req, res, appData)
{
    var data = req.body;
    var username = data['username'];
    var password = data['password'];
    var host = req.param('ip');
    var cmdObj = [];

    var cmdList = ['contrail-status', 'openstack-status'];        
    var len = cmdList.length;
    for (var i = 0; i < len; i++) {
        cmdObj[i] ={};
        cmdObj[i]['host'] = host;
        cmdObj[i]['username'] = username;
        cmdObj[i]['password'] = password;
        cmdObj[i]['cmd'] = cmdList[i];
    }
    async.mapSeries(cmdObj, issueSSHCmd, function(err, result) {
        if ((null == err) && (null != result)) {
            commonUtils.handleResponse(err, res, result.toString());
        } else {
            try {
                error = new appErrors.RESTServerError((err.toString()));
            } catch(e) {
                error = new appErrors.RESTServerError("Error in fetching" +
                                                      " service status");
            }
            commonUtils.handleJSONResponse(error, res, null);
        }
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
        callback(null, result);
    });
}

exports.getServiceStatus = getServiceStatus;
