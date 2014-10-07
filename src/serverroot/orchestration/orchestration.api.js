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

exports.getOrchestrationModels = getOrchestrationModels;

