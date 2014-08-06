/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var parseURLReq = {};
parseURLReq.rbac        = require('../web/core/rbac.api');
parseURLReq.global      = require('./global');
parseURLReq.timeout     = require('request-timeout');
parseURLReq.longPoll    = require('../web/core/longPolling.api');
parseURLReq.cacheApi    = require('../web/core/cache.api');
parseURLReq.timeout     = require('request-timeout');

module.exports = parseURLReq;

