/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var config = process.mainModule.exports['config'];

function getOrchestrationModel ()
{
    var orchModel = null;
    if ((null != config.orchestration) &&
        (null != config.orchestration.Manager)) {
        orchModel = config.orchestration.Manager;
    }
    return orchModel;
}

exports.getOrchestrationModel = getOrchestrationModel;

