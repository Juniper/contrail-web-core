/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/** 
 * This file contains utility functions for Openstack components 
 */

var authApi = require('../../../common/auth.api');
var config = require('../../../../../config/config.global');
var httpsOp = require('../../../common/httpsoptions.api');
var logutils = require('../../../utils/log.utils');

/* Function: getIpProtoByServCatPubUrl
    This function is used to parse the publicURL got from keystone catalog,
    And returns protocol (http/https), IP and port of the service 
    publicURL can be any of below formats:
    http://xxx.xxx.xxx.xxx:xxxx/v2.0 and
    xxx.xxx.xxx.xxx:xxxx/v2.0 and
 */
function getIpProtoByServCatPubUrl (pubUrl)
{
    var ipAddr = null;
    var port = null;
    var reqProto = global.PROTOCOL_HTTP;
    var ipAddrStr = pubUrl, portStr = null;
    var ipIdx = -1, portIdx = -1;

    ipIdx = pubUrl.indexOf(global.HTTPS_URL);
    if (ipIdx >= 0) {
        reqProto = global.PROTOCOL_HTTPS;
        ipAddrStr = pubUrl.slice(ipIdx + (global.HTTPS_URL).length);
    }
    ipIdx = pubUrl.indexOf(global.HTTP_URL);
    if (ipIdx >= 0) {
        ipAddrStr = pubUrl.slice(ipIdx + (global.HTTP_URL).length);
    }

    /* Format is http://<ip/host>:<port>/XXXX */
    portIdx = ipAddrStr.indexOf(':');
    if (-1 != portIdx) {
        ipAddr = ipAddrStr.substr(0, portIdx);
        portStr = ipAddrStr.slice(portIdx + 1);
        portIdx = portStr.indexOf('/');
        if (-1 != portIdx) {
            port = portStr.substr(0, portIdx);
        } else {
            port = portStr;
        }
    }
    return {'ipAddr': ipAddr, 'port': port, 'protocol': reqProto};
}

/* Function: getApiTypeByServiceType
   Maps service type to webServer Server type
 */
function getApiTypeByServiceType (servType)
{
    switch (servType) {
    case global.SERVICE_ENDPT_TYPE_COMPUTE:
        return global.label.COMPUTE_SERVER;
    case global.SERVICE_ENDPT_TYPE_IMAGE:
        return global.label.IMAGE_SERVER;
    case global.SERVICE_ENDPT_TYPE_NETWORK:
        return global.label.NETWORK_SERVER;
    case global.SERVICE_ENDPT_TYPE_IDENTITY:
        return global.label.IDENTITY_SERVER;
    default:
        return servType;
    }
}

/* Function: getOStackModuleApiVersion
   Get the API Version from Config File, if not specified then take default 
   suppoted API Versions
 */
function getOStackModuleApiVersion (apiType)
{
    var version = httpsOp.getHttpsOptionsByAPIType(apiType, 'apiVersion');
    if (null == version) {
        switch (apiType) {
        case global.label.IMAGE_SERVER:
            return glanceApi.imageListVerList;
        case global.label.COMPUTE_SERVER:
            return novaApi.novaAPIVerList;
        default:
            return null;
        }
    }
    return version;
}

/* Function: getDfltEndPointValueByType
   Get the version etc info by end point module types
 */
function getDfltEndPointValueByType (module, type)
{
    switch (module) {
    case 'image':
        if ('version' == type) {
            return 'v1';
        }
        break;
    case 'nova':
        if ('version' == type) {
            return 'v1.1';
        }
        break;
    default:
        break;
    }
    return null;
}

/* Function: getServiceAPIVersionByReqObj
    Get openStack Module API Version, IP, Port, Protocol from publicURL in
    keystone catalog response
 */
function getServiceAPIVersionByReqObj (req, type, callback)
{
    var dataObjArr = [];
    var endPtList = [];

    var endPtFromConfig = config.serviceEndPointFromConfig;
    if (null == endPtFromConfig) {
        endPtFromConfig = true;
    }
    if (true == endPtFromConfig) {
        var apiType = getApiTypeByServiceType(type);
        ip = httpsOp.getHttpsOptionsByAPIType(apiType, 'ip');
        port = httpsOp.getHttpsOptionsByAPIType(apiType, 'port');
        version = getOStackModuleApiVersion(apiType);
        protocol = httpsOp.getHttpsOptionsByAPIType(apiType, 'authProtocol');
        if ((null == ip) || (null == port) || (null == version) ||
            (null == protocol)) {
            logutils.logger.error("ip/port/apiVersion/authProtocol not found in" +
                                  " config file for:" + apiType);
            callback(null);
            return;
        }
        var verLen = version.length;
        for (var i = 0; i < verLen; i++) {
            dataObjArr.push({'version': version[i], 'protocol': protocol, 'ip': ip,
                            'port': port});
        }
        if (!dataObjArr.length) {
            logutils.logger.error('apiVersion for ' + type + ' is NULL');
            callback(null);
        } else {
            dataObjArr.sort(function(a, b) {return (b['version'] - a['version'])});
            callback(dataObjArr);
        }
        return;
    }
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
                        var endPtLen = endPtList.length;
                        endPtList[endPtLen] = {};
                        endPtList[endPtLen] = servCat[i]['endpoints'][j];
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
                var pubUrl = endPtList[i]['publicURL'];
                var ipProtoObj = getIpProtoByServCatPubUrl(pubUrl);
                var reqProto = ipProtoObj['protocol'];
                var ipAddr = ipProtoObj['ipAddr'];
                var port = ipProtoObj['port'];

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
                                    'protocol': reqProto, 'ip': ipAddr,
                                    'port': port});
                    break;
                case 'image':
                    var defVer = getDfltEndPointValueByType('image', 'version');
                    var version = null;
                    var protoIdx = pubUrl.indexOf('://');
                    if (protoIdx >= 0) {
                        pubUrl = pubUrl.slice(protoIdx + '://'.length);
                    }
                    var idx = pubUrl.indexOf('/');
                    if (idx >= 0) {
                        pubUrl = pubUrl.slice(idx + 1);
                        idx = pubUrl.indexOf('/');
                        if (idx >= 0) {
                            /* Format: http://localhost:9292/v1/ or
                             * localhost:9292/v1/
                             */
                            version = pubUrl.substr(0, idx);
                        } else {
                            if (!pubUrl.length) {
                                /* Format: http://localhost:9292/ or
                                 * localhost:9292/
                                 */
                                version = defVer;
                            } else {
                                /* Format: http://localhost:9292/v1 or
                                 * localhost:9292/v1
                                 */
                                version = pubUrl;
                            }
                        }
                    } else {
                        /* Format: http://localhost:9292 or localhost:9292 */
                        version = defVer;
                    }
                    dataObjArr.push({'version': version,
                                    'protocol': reqProto, 'ip': ipAddr,
                                    'port': port});
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

/* Function: getApiVersion
    Get the next available version from suppVerList out of verList starting from
    index with api type as apiType
    verList is the return value from getServiceAPIVersionByReqObj()
 */
function getApiVersion (suppVerList, verList, index, fallbackIndex, apiType)
{
    var ip = null;
    var port = null;
    var endPtFromConfig = config.serviceEndPointFromConfig;
    
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
                            'protocol': verList[i]['protocol'], 
                            'ip': verList[i]['ip'], 'port': verList[i]['port'],
                            'fallbackIndex': -1};
                }
            } catch(e) {
                continue;
            }
        }
    }
    /* We are done with all versions in catalog, so now fall back to next
     * available supported list 
     */
    for (var i = fallbackIndex; i >= 0; i--) {
        for (var j = 0; j < verCnt; j++) {
            if (suppVerList[i] != verList[j]) {
                /* Put index verCnt, such that next time, it does not fall into
                 * earlier loop
                 */
                return {'version': suppVerList[i], 'index': verCnt,
                        'protocol': verList[j]['protocol'],
                        'ip': verList[j]['ip'], 
                        'port': verList[j]['port'], 'fallbackIndex': i};
            }
        }
    }
    return null;
}

exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.getApiVersion = getApiVersion;
exports.getIpProtoByServCatPubUrl = getIpProtoByServCatPubUrl;
