/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var util = require('util'),
    global = require('../common/global'),
	appErrors = module.exports;

// Abstract Error
var AbstractError = function (msg, constr) {
	Error.captureStackTrace(this, constr || this);
	this.message = msg || 'Error';
	this.custom = true;
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

// Connection Error
appErrors.ConnectionError = function (msg, url) {
	this.url = url;
	appErrors.ConnectionError.super_.call(this, msg, this.constructor);
};
util.inherits(appErrors.ConnectionError, AbstractError);
appErrors.ConnectionError.prototype.name = 'Connection Error';

// REST Server Error
appErrors.RESTServerError = function (msg) {
	appErrors.RESTServerError.super_.call(this, msg, this.constructor);
};
util.inherits(appErrors.RESTServerError, AbstractError);
appErrors.RESTServerError.prototype.name = 'REST Server Error';
appErrors.RESTServerError.prototype.responseCode =
    global.HTTP_STATUS_INTERNAL_ERROR;

// SOAP Server Error
appErrors.SOAPServerError = function (msg) {
    appErrors.SOAPServerError.super_.call(this, msg, this.constructor);
};
util.inherits(appErrors.SOAPServerError, AbstractError);
appErrors.SOAPServerError.prototype.name = 'SOAP Server Error';
appErrors.SOAPServerError.prototype.responseCode =
    global.HTTP_STATUS_INTERNAL_ERROR;

