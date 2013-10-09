/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var winston = require('winston'),
	logutils = module.exports,
	messages = require('../common/messages'),
	util = require('util');

/**
 * Constructor to create new Winston logger.
 */
logutils.logger = new (winston.Logger)({
	transports:[
		new (winston.transports.Console)({colorize:true, timestamp:true}),
		new (winston.transports.File)({filename:'/var/log/contrail-webui.log',
                                      level: 'error'})
	]
});

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

