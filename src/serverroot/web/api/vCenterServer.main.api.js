/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = require('../../../../config/config.global.js'),
    authApi = require('../../common/auth.api'),
    commonUtils = require('../../utils/common.utils'),
    vcenterApi = require('../../common/vcenter.api'),
    logutils = require('../../utils/log.utils'),
    configServer;

var SoapApi = vcenterApi.createvCenterSoapApi('vcenter');
function getHeaders(defHeaders, appHeaders)
{
    var headers = defHeaders;
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    return headers;
}

function getVMWareSoapSessionCookie (appData)
{
    var soapSessCookie = null;
    try {
        soapSessCookie =
            appData['authObj']['req']['session']['vmware_soap_session'];
    } catch(e) {
        logutils.logger.debug("Have not got vmware_soap_session cookie yet");
    }
    return soapSessCookie;
}

function doCall (userData, appData, callback, appHeaders)
{
    var defProject = null;
    var headers = {};
    if(userData['headers'] != null)
        headers = userData['headers'];
    var authObj;
    var vmWareSoapSessCookie = getVMWareSoapSessionCookie(appData); 
    if (null != vmWareSoapSessCookie) {
        headers['Cookie'] = vmWareSoapSessCookie;
    }
    if (null == userData['rejectUnauthorized']) {
        userData['rejectUnauthorized'] = false;
    }
    SoapApi.api.doCall(userData, function(err, resData, resHeaders) {
        //If vmwareSession is expired,redirect to Login page
        if(err != null && resData != null && resData['Fault'] != null && resData['Fault']['detail'] != null && resData['Fault']['detail']['NotAuthenticatedFault'] != null) {
            var req = appData['authObj']['req'];
            var res = appData['authObj']['req']['res'];
            commonUtils.redirectToLogout(req,res);
        } else {
            callback(err, resData, resHeaders);
        }
    }, headers);
}

exports.doCall = doCall;

