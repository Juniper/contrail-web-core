/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var parseJobsReq = {};
parseJobsReq.config         = process.mainModule.exports['config'];
parseJobsReq.jobsApi        = require('../jobs/core/jobs.api');
parseJobsReq.commonUtils    = require('../utils/common.utils');

module.exports = parseJobsReq;

