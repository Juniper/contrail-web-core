/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var winston = require('winston'),
	logutils = module.exports,
	messages = require('../common/messages'),
	util = require('util'),
    moment = require('moment'),
    config = process.mainModule.exports.config;

var logLevel = ((null != config) && (null != config.logs) &&
                (null != config.logs.level) && ('' != config.logs.level))
                ? config.logs.level : 'debug';

function getLoggingTime ()
{
    return moment().format('MM/DD/YYYY HH:MM:SS A');
}

/**
 * Constructor to create new Winston logger.
 */
logutils.logger = new (winston.Logger)({
	transports:[
		new (winston.transports.Console)({colorize:true,
                                         timestamp:getLoggingTime, level: logLevel})
	]
});

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

