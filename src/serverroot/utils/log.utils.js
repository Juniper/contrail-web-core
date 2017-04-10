/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var winston = require('winston'),
	logutils = module.exports,
	messages = require('../common/messages'),
	util = require('util'),
    moment = require('moment'),
    configUtils = require('../common/config.utils'),
    commonUtils = require('./common.utils');

function getLoggingTime ()
{
    return moment().format('MM/DD/YYYY hh:mm:ss A');
}

function getLogLevel ()
{
    var config = configUtils.getConfig(),
        logLevel = commonUtils.getValueByJsonPath(config,
                'logs;level', 'debug');
    return logLevel;
}

/**
 * Constructor to create new Winston logger.
 */
logutils.logger = new (winston.Logger)({
	transports:[
		new (winston.transports.Console)({colorize:true,
                              timestamp:getLoggingTime, level: getLogLevel()})
	]
});

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

