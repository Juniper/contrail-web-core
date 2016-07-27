/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/** 
 * This file contains utility functions for Openstack components 
 */

var authApi = require('../../../common/auth.api');
var config = process.mainModule.exports['config'];
var httpsOp = require('../../../common/httpsoptions.api');
var logutils = require('../../../utils/log.utils');
var commonUtils = require('../../../utils/common.utils');

/* Function: getIpProtoByServCatPubUrl
    This function is used to parse the publicURL/internalURL got from keystone catalog,
    And returns protocol (http/https), IP and port of the service 
    publicURL/internalURL can be any of below formats:
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

function getServiceApiVersionObjByPubUrl (pubUrl, type)
{
    if (null == pubUrl) {
        return null;
    }
    var ipProtoObj = getIpProtoByServCatPubUrl(pubUrl);
    var reqProto = ipProtoObj['protocol'];
    var ipAddr = ipProtoObj['ipAddr'];
    var port = ipProtoObj['port'];
    var version = null;

    switch (type) {
    case 'compute':
    case 'volume':
        try {
            var idx = pubUrl.lastIndexOf('/');
            if (-1 == idx) {
                return null;
            }
            var str = pubUrl.substr(0, idx);
            idx = str.lastIndexOf('/');
            if (-1 == idx) {
                return null;
            }
            version = str.slice(idx + 1);
        } catch(e) {
            logutils.logger.error('volume|compute pubUrl parse error' + e);
        }
        break;
    case 'image':
    case 'identity':
        try {
            var defVer = getDfltEndPointValueByType(type, 'version');
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
        } catch(e) {
            logutils.logger.error(type +' pubUrl parse error' + e);
        }
        break;
    default:
        break;
    }
    return {version: version, ip: ipAddr, protocol: reqProto, port: port};
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
    case global.SERVICE_ENDPT_TYPE_VOLUME:
        return global.label.STORAGE_SERVER;
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
    case 'identity':
        if ('version' == type) {
            return 'v2.0';
        }
        break;
    default:
        break;
    }
    return null;
}

/* Function: getServiceAPIVersionByReqObj
    Get openStack Module API Version, IP, Port, Protocol from
    publicURL/internalURL in keystone catalog response
 */
function getServiceAPIVersionByReqObj (req, type, callback, reqBy)
{
    var redirectToLogout = true;
    var dataObjArr = [];
    var endPtList = [];

    var endPtFromConfig = config.serviceEndPointFromConfig;
    if (null == endPtFromConfig) {
        endPtFromConfig = true;
    }
    if (true == endPtFromConfig) {
        if ((type ==
             authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_API_IDENTIFIER)) ||
            (type ==
             authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER))) {
            /* for opServer and apiServer, we will be getting directly from
             * apiRestApi
             */
            callback(null);
            return;
        }
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
    var regionCookie =
        commonUtils.getValueByJsonPath(req, 'cookies;region', null, false);
    if (null == regionCookie) {
        callback(null, null, redirectToLogout);
        return;
    }
    var regionName = authApi.getCurrentRegion(req);
    if ((null != regionName) && ('undefined' != regionName)) {
        serviceCatalog =
            commonUtils.getValueByJsonPath(req, 'session;serviceCatalog;' +
                                           regionName, null, false);
    } else {
        serviceCatalog = commonUtils.getValueByJsonPath(req,
                                                        'session;serviceCatalog',
                                                        null, false);
        if (null != serviceCatalog) {
            for (var key in serviceCatalog) {
                regionName = key;
                req.session.regionname = regionName;
                serviceCatalog = serviceCatalog[key];
                break;
            }
        }
    }
    if (null != serviceCatalog) {
        mappedObj = null;
        try {
            mappedObjs = serviceCatalog[type].maps;
        } catch(e) {
            mappedObjs = null;
        }
        if ((null != mappedObjs) && (null != mappedObjs[0])) {
            callback(mappedObjs, regionName);
            return;
        }
    }
    authApi.getServiceCatalog(req, function(accessData) {
        if ((null == accessData) || (null == accessData.serviceCatalog)) {
            callback(null, null, redirectToLogout);
            return;
        }
        var keySt = require('./keystone.api');
        var svcCatalog =
            keySt.getServiceCatalogByRegion(req, regionName, accessData);
        var firstRegion = null;
        if (null != svcCatalog) {
            for (var key in svcCatalog) {
                if (null == firstRegion) {
                    firstRegion = key;
                }
                req.session.serviceCatalog[key] = svcCatalog[key];
            }
        }
        var mappedObjs = null;
        if (-1 != global.keystoneServiceListByProject.indexOf(type)) {
            var domProject = req.cookies.domain + ':' + req.cookies.project;
            mappedObjs =
                commonUtils.getValueByJsonPath(svcCatalog, regionName + ';' +
                                               domProject + ';' + type +
                                               ';maps', null);
        } else {
            mappedObjs =
                commonUtils.getValueByJsonPath(svcCatalog, regionName + ';' + type +
                                               ';maps', null);
        }
        if ((null == mappedObjs) && (global.service.MAINSEREVR == reqBy)) {
            /* We did not find this region in the service catalog */
            var secureCookieStr = (false == config.insecure_access) ? "; secure"
                : "";
            req.res.setHeader('Set-Cookie', 'region=' +  firstRegion +
                              '; expires=Sun, 17 Jan 2038 00:00:00 UTC; path=/'
                              + secureCookieStr);
            callback(null, null, redirectToLogout);
            return;
        }
        callback(mappedObjs, regionName);
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

function getPublicUrlByRegionName (regionname, serviceName, req)
{
    if (false == authApi.isMultiRegionSupported()) {
        return null;
    }
    if (true == authApi.isRegionListFromConfig()) {
        var pubUrl = null;
        if (null == config.regions) {
            return null;
        }
        for (var region in config.regions) {
            if (regionname == region) {
                return config.regions[region];
            }
        }
    } else if (true == authApi.isRegionListFromIdentity()) {
        var takeUrlStr = (true == config.serviceEndPointTakePublicURL) ?
            'publicURL': 'internalURL';
        var pubUrl =
            commonUtils.getValueByJsonPath(req, 'session;serviceCatalog;' +
                                           regionname + ';' + serviceName +
                                           ';values;0;' + takeUrlStr, null,
                                           false);
        return pubUrl;
    }
    return null;
}

function shiftServiceEndpointList (req, serviceType, regionName)
{
    if (false == authApi.isMultiRegionSupported()) {
        return;
    }
    var mappedObjs =
        commonUtils.getValueByJsonPath(req,
                                       'session;serviceCatalog;' +
                                       regionName + ';' + serviceType +
                                       ';maps', null, false);
    if (null == mappedObjs) {
        logutils.logger.error('We did not get the mapped values for Service: ' +
                              serviceType);
        return;
    }
    var mapObj = mappedObjs.shift();
    mappedObjs.push(mapObj);
    req['session']['serviceCatalog'][regionName][serviceType]['maps'] = mappedObjs;
}

exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.getApiVersion = getApiVersion;
exports.getIpProtoByServCatPubUrl = getIpProtoByServCatPubUrl;
exports.getServiceApiVersionObjByPubUrl = getServiceApiVersionObjByPubUrl;
exports.getPublicUrlByRegionName = getPublicUrlByRegionName;
exports.shiftServiceEndpointList = shiftServiceEndpointList;
