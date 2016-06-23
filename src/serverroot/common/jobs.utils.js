/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jobTaskDataChanges = {};
var jobTaskDataRequiresFields = {};
var eventEmitter = require('events').EventEmitter;
var jobKueEventEmitter = new eventEmitter();
var commonUtils = require('./../utils/common.utils');

var authParams = null;
try {
        authParams = require('../../../config/userAuth');
} catch(e) {
        authParams = null;
}

function registerForJobTaskDataChange (jobData, field)
{
    if ((null == field) || (null == jobData)) {
        return;
    }
    field = field.toString();
    var jobName = jobData['title'];
    if ((null != jobName) && (null != jobData.taskData) &&
        (null != jobData.taskData[field])) {
        if (null == jobTaskDataChanges[jobName]) {
            jobTaskDataChanges[jobName] = [];
        }
        jobTaskDataChanges[jobName].push(
            {'field': field, 'data':
            JSON.parse(JSON.stringify(jobData.taskData[field]))});
        if (null == jobTaskDataRequiresFields[field]) {
            jobTaskDataRequiresFields[field] = field;
        }
    }
}

function updateJobDataRequiresField (jobData, taskData)
{
    if ((null == jobData) || (null == jobData.taskData)) {
        for (key in jobTaskDataRequiresFields) {
            if ((null == taskData[key]) &&
                (null != jobData.taskData[key])) {
                taskData[key] = jobData.taskData[key];
            }
        }
    }
    return taskData;
}

function getChangedJobTaskData (jobName)
{
    return jobTaskDataChanges[jobName];
}

function getAndUpdateChangedJobTaskData (jobName, jobTaskData)
{
    var taskDataChanges = getChangedJobTaskData(jobName);
    if (null == taskDataChanges) {
        return jobTaskData;
    }
    var taskDataChangesCnt = taskDataChanges.length;
    for (var i = 0; i < taskDataChangesCnt; i++) {
        jobTaskData[taskDataChanges[i]['field'].toString()] =
            taskDataChanges[i]['data'];
    }
    return jobTaskData;
}

function deleteChangedJobTaskData (jobName)
{
    delete jobTaskDataChanges[jobName];
}

function buildDummyReqObjByJobData (jobData)
{
    var session = commonUtils.getValueByJsonPath(jobData, 'taskData;session',
                                                 null);
    var cookies = commonUtils.getValueByJsonPath(jobData, 'taskData;cookies',
                                                 null);
    var req = null;
    if (null != session) {
        req = {
            session: session
        };
        if (null != cookies) {
            req['cookies'] = cookies;
        }
    }
    return req;
}

function buildAuthObjByJobData (jobData)
{
    var userAuthObj = {};

    if (null != authParams) {
        if ((null != authParams.admin_user) &&
            (null != authParams.admin_password)) {
            userAuthObj['username'] = authParams.admin_user;
            userAuthObj['password'] = authParams.admin_password;
        }
        if (null != authParams.admin_tenant_name) {
            userAuthObj['tenant'] = authParams.admin_tenant_name;
        }
    }
    if (null != jobData.taskData.reqBy) {
        userAuthObj['reqBy'] = jobData.taskData.reqBy;
    }
    /* Create a dummy req object and encapsulate region inside it */
    var req = buildDummyReqObjByJobData(jobData);
    if (null != req) {
        userAuthObj['req'] = req;
    }
    return userAuthObj;
}

function getHeaders (dataObj, callback)
{
    var jobData = dataObj['jobData'];
    var apiName = dataObj['apiName'];
    var headers = {};
    headers = configAppHeaders(headers, jobData);
    var appHeaders = dataObj['appHeaders'];

    var req = buildDummyReqObjByJobData(jobData);

    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    dataObj['headers'] = headers;
    if (null == req) {
        callback(null, dataObj);
        return;
    }
    var authApi = require('./auth.api');
    var apiId = null;
    switch(apiName) {
    case global.label.VNCONFIG_API_SERVER:
    case global.label.API_SERVER:
        apiId = global.DEFAULT_CONTRAIL_API_IDENTIFIER;
        break;
    case global.label.OPS_API_SERVER:
    case global.label.OPSERVER:
        apiId = global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER
        break;
    default:
        break;
    }
    var apiServiceType = authApi.getEndpointServiceType(apiId);
    authApi.getServiceAPIVersionByReqObj(req, apiServiceType,
                                         function(verObjs) {
        var verObj = null;
        if ((null != verObjs) && (null != verObjs[0])) {
            verObj = verObjs[0];
        }
        if ((null == verObj) || (null == verObj['protocol']) ||
            (null == verObj['ip']) || (null == verObj['port'])) {
            callback(null, dataObj);
            return;
        }
        headers['protocol'] = verObj['protocol'];
        var configServerRestInst =
            rest.getAPIServer({apiName: dataObj['apiName'],
                               server: verObj['ip'], port: verObj['port']});
        dataObj['headers'] = headers;
        dataObj['apiRestApi'] = configServerRestInst;
        callback(null, dataObj);
    }, global.service.MIDDLEWARE);
}

function getAuthTokenByJobData (jobData)
{
    if ((null != jobData) && (null != jobData['taskData']) &&
        (null != jobData['taskData']['tokenid'])) {
        return jobData['taskData']['tokenid'];
    }

    if (true == commonUtils.isMultiTenancyEnabled()) {
        /* If multi-tenancy is disabled, then this is not error, so do not log
         */
        logutils.logger.error("We did not get tokenid in taskData");
    }
    return null;
}

function configAppHeaders (headers, jobData)
{
    try {
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
    } catch(e) {
        headers['X-Auth-Token'] = null;
    }
    if (true == commonUtils.isMultiTenancyEnabled()) {
        /* As we are sending with admin_user, so set the role as 'admin' */
        headers['X_API_ROLE'] = 'admin';
    }
    return headers;
}

function updateJobDataAuthObjToken (jobData, token)
{
    jobData['taskData']['tokenid'] = token.id;
    registerForJobTaskDataChange(jobData, 'tokenid');
}

exports.registerForJobTaskDataChange = registerForJobTaskDataChange;
exports.getChangedJobTaskData = getChangedJobTaskData;
exports.deleteChangedJobTaskData = deleteChangedJobTaskData;
exports.getAndUpdateChangedJobTaskData = getAndUpdateChangedJobTaskData;
exports.updateJobDataRequiresField = updateJobDataRequiresField;
exports.jobKueEventEmitter = jobKueEventEmitter;
exports.buildAuthObjByJobData = buildAuthObjByJobData;
exports.buildDummyReqObjByJobData = buildDummyReqObjByJobData;
exports.updateJobDataAuthObjToken = updateJobDataAuthObjToken;
exports.getHeaders = getHeaders;
