/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var opApiServer = require('./opServer.api');
var commonUtils = require('../utils/common.utils');
var sseApi = require('./sse.api');

function getUVEStream (req, res, appData)
{
    var reqUrl = '/analytics/uve-stream?cfilt=NodeStatus&tablefilt=vrouter';
    sseApi.subscribeToUVEStream(req, reqUrl, null, appData,
                                function(data) {
        console.log("Getting data as:", JSON.stringify(data));
    });
}

exports.getUVEStream = getUVEStream;

