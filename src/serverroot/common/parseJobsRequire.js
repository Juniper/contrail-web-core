/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var parseJobsReq = {};
var jobKeysToCallbackMaps = {};
parseJobsReq.config         = process.mainModule.exports['config'];
parseJobsReq.jobsApi        = require('../jobs/core/jobs.api');
parseJobsReq.commonUtils    = require('../utils/common.utils');
parseJobsReq.jobKeysToCallbackMaps = jobKeysToCallbackMaps;

module.exports = parseJobsReq;

