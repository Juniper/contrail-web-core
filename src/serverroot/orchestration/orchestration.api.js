/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var config = process.mainModule.exports['config'];

function getOrchestrationModels ()
{
    var orchModels = [];
    if ((null != config.orchestration) &&
        (null != config.orchestration.Manager)) {
        orchModel = config.orchestration.Manager;
    }
    orchModels = orchModel.split(',');
    var len = orchModels.length;
    if (len <= 1) {
        return orchModels;
    }
    for (var i = 0; i < len; i++) {
        orchModels[i] = orchModels[i].trim();
    }
    return orchModels;
}

var associatedOrchModels = ['vcenter'];

function getOrchestrationModelsByReqURL (reqURL, req)
{
    /* For logout in vcenter, we send only /logout, so if vcenter or not, check
     * the referer header in req objct
     */
    if (null != req) {
        var referer = req.headers['referer'];
        if ((null != referer) && (-1 != referer.indexOf('/vcenter'))) {
            reqURL = '/vcenter';
        }
    }
    var model = 'openstack';
    var orchModels = getOrchestrationModels();
    console.log("orchModels as:", orchModels);
    if (!orchModels.length) {
        logutils.logger.error("Specify the orchestration model in config file");
        assert(0);
    }
    //If only one orchestration is configured
    if (1 == orchModels.length) {
        //If vCenter is the only orchestration mode and user accesses via '/login',set orchestration as 'none'
        if(orchModels[0] == 'vcenter' && reqURL.indexOf('/vcenter') == -1)
            return 'none';
        return orchModels[0];
    }
    var associatedOrchModelsCnt = associatedOrchModels.length;
    if (-1 != reqURL.indexOf('/vcenter')) {
        return 'vcenter';
    } 
    return model;
}

function getLoggedInOrchestrationMode (req)
{
    var commonUtils = require('../utils/common.utils');
    return commonUtils.getValueByJsonPath(req, 'session;loggedInOrchestrationMode',
                                          'openstack', false);
}

exports.getOrchestrationModels = getOrchestrationModels;
exports.getOrchestrationModelsByReqURL = getOrchestrationModelsByReqURL;
exports.getLoggedInOrchestrationMode = getLoggedInOrchestrationMode;
