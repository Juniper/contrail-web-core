/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = require('../../../../config/config.global');
var configMainServer = require('../../web/api/configServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var assert = require('assert');
var authApi = require('../../common/auth.api');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

function getApiServerRequestedByData (appData)
{
    var defproject = null;
    switch (orchModel) {
    case 'openstack':
        /* Openstack auth is keystone based, as config Server does not do
         * authentication using cloudstack, so for now add check
         */
        try {
            defProject = appData['authObj']['defTokenObj']['tenant']['name'];
            return configMainServer;
        } catch(e) {
            try {
                defProject =
                    appData['taskData']['authObj']['token']['tenant']['name'];
                return configJobServer;
            } catch(e) {
                /* Nothing specified, assert */
                if (global.REQ_AT_SYS_INIT == appData['taskData']['reqBy']) {
                    return configJobServer;
                } else {
                    assert(0);
                }
            }
        }
        break;
    default:
        /* If authentication is done via cloudstack, we can not have
         * multi_tenancy, as config Server does not do authentication through
         * cloudstack now */
        try {
            sessionKey = appData['authObj']['defTokenObj']['sessionkey'];
            return configMainServer;
        } catch(e) {
            return configJobServer;
        }
        break;
    }
}

function getServiceAPIVersionByReqObj (req, type, callback)
{
    var dataObjArr = [];
    var endPtList = [];
    authApi.getServiceCatalog(req, function(servCat) {
        if (null == servCat) {
            callback(null);
            return;
        }
        try {
            var servCatCnt = servCat.length;
        } catch(e) {
            callback(null);
            return;
        }
        for (var i = 0; i < servCatCnt; i++) {
            try {
                if (type == servCat[i]['type']) {
                    try {
                        var endPt = servCat[i]['endpoints'];
                        var endPtCnt = endPt.length;
                    } catch(e) {
                        continue;
                    }
                    for (var j = 0; j < endPtCnt; j++) {
                        endPtList[endPtList.length] = {};
                        endPtList[endPtList.length] = servCat[i]['endpoints'][j];
                    }
                }
            } catch(e) {
                continue;
            }
        }

        if (0 == endPtList.length) {
            callback(null);
            return;
        }
        try {
            var endPtCnt = endPtList.length;
        } catch(e) {
            callback(null);
            return;
        }

        for (i = 0; i < endPtCnt; i++) {
            try {
                var reqProto = global.PROTOCOL_HTTP;
                var pubUrl = endPtList[i]['publicURL'];
                var protoIdx = pubUrl.indexOf(':');
                if (-1 != protoIdx) {
                    reqProto = pubUrl.substr(0, protoIdx);
                }
                switch (type) {
                case 'compute':
                case 'volume':
                    var idx = pubUrl.lastIndexOf('/');
                    if (-1 == idx) {
                        continue;
                    }
                    var str = pubUrl.substr(0, idx);
                    idx = str.lastIndexOf('/');
                    if (-1 == idx) {
                        continue;
                    }
                    dataObjArr.push({'version': str.slice(idx + 1), 
                                    'protocol': reqProto});
                    break;
                case 'image':
                    var idx = pubUrl.lastIndexOf('/');
                    dataObjArr.push({'version': pubUrl.slice(idx + 1),
                                    'protocol': reqProto});
                    break;
                default:
                    break;
                }
            } catch(e) {
                continue;
            }
        }
        if (!dataObjArr.length) {
            logutils.logger.error('apiVersion for ' + type + ' is NULL');
            callback(null);
        } else {
            dataObjArr.sort(function(a, b) {return (b['version'] - a['version'])});
            callback(dataObjArr);
        }
    });
}

function getApiVersion (suppVerList, verList, index)
{
    try {
        var verCnt = verList.length;
        var suppVerCnt = suppVerList.length;
    } catch(e) {
        return null;
    }
    for (var i = index; i < verCnt; i++) {
        for (var j = 0; j < suppVerCnt; j++) {
            try {
                if (verList[i]['version'] != suppVerList[j]) {
                    continue;
                } else {
                    return {'version': verList[i]['version'], 'index': i,
                            'protocol': verList[i]['protocol']};
                }
            } catch(e) {
                continue;
            }
        }
    }
    return null;
}

function getOrchestrationPluginModel ()
{
    return {'orchestrationModel' : orchModel}
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.getApiVersion = getApiVersion;

