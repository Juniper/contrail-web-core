/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var config = process.mainModule.exports['config'],
	messages = require('../common/messages'),
	logutils = require('./log.utils'),
	util = require('util');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

/**
 * Check if user is logged in: If yes, handle HTTP request. If no, go to login page.
 */
exports.checkAuth = function (req, res, next) {
	if (config.require_auth && !req.session.userid) {
		res.redirect('/');
	} else {
		next();
	}
};
