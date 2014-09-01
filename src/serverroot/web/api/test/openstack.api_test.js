/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var oStack = require('../../../orchestration/plugins/openstack/openstack.api');
var authApi = require('../../../common/auth.api');
var mockData = require('./openstack.api_mock');
var commonUtils = require('../../../utils/common.utils');
var config = require('../../../../../config/config.global');

function getServiceCatalogData (req, callback)
{
    callback(mockData.servCatRespData);
}

function getServiceCatalogCompData (req, callback)
{
    var data = commonUtils.cloneObj(mockData.servCatRespData);
    data[0]['endpoints'][1] = mockData.compEndPoint_IN;
    
    callback(data);
}

function getServiceCatalogCompDataWithNoHTTP (req, callback)
{
    var data = commonUtils.cloneObj(mockData.servCatRespData);
    data[0]['endpoints']['publicURL'] =
        "10.204.217.42:8774/v1.1/f6a480d7c45e420eb92a3f3b9f10cc83";
    callback(data);
}

function initIPs ()
{
    config.computeManager.ip = '10.204.217.42';
    config.imageManager.ip = '10.204.217.42';
    config.storageManager.ip = '10.204.217.42';
}

QUnit.module("openStackAPI", {
    setup: function () {
        initIPs();
    },
    teardown: function() {
    }
});

test('getServiceAPIVersionByReqObj', function() {
    authApi.getServiceCatalog = getServiceCatalogData;
    oStack.getServiceAPIVersionByReqObj(null, global.SERVICE_ENDPT_TYPE_COMPUTE,
                                        function(data) {
        deepEqual(data, mockData.servCatRespComputeData_OP,
                  'Expecting Compute Data Match');
    });
    oStack.getServiceAPIVersionByReqObj(null, global.SERVICE_ENDPT_TYPE_IMAGE,
                                        function(data) {
        deepEqual(data, mockData.servCatRespImageData_OP,
                  'Expecting Image Data Match');
    });
    oStack.getServiceAPIVersionByReqObj(null, global.SERVICE_ENDPT_TYPE_VOLUME,
                                        function(data) {
        deepEqual(data, mockData.servCatRespVolData_OP, 
                  'Expecting Volume Data Match');
    });
    /* Test for multiple entries in endpoint for 'compute' node */
    authApi.getServiceCatalog = getServiceCatalogCompData;
    oStack.getServiceAPIVersionByReqObj(null, 'compute', function(data) {
        deepEqual(data, mockData.servCatRespCompMultData_OP,
                  'Expecting Compute Multiple Data Match');
    });
    /* Test for compute node with no http keywork in publicURL */
    authApi.getServiceCatalog = getServiceCatalogCompDataWithNoHTTP; 
    oStack.getServiceAPIVersionByReqObj(null, 'compute', function(data) {
        deepEqual(data, mockData.getServiceCatalogCompDataWithNoHTTP_OP,
                  'Expecting Compute Default HTTP Match');
    });
});

test('getApiVersion', function() {
    var suppVerList = [ 'v1.1', 'v2' ];
    var verList = [ { version: 'v1.1', protocol: 'http' , 'port': 8787, 'ip': '10.204.216.42'} ];
    var index = 0;
    config.serviceEndPointFromConfig = false;

    var verObj = oStack.getApiVersion(suppVerList, verList, index);
    deepEqual(verObj, mockData.suppVerList_OP, 'Expecting Version to match');
    var suppVerList = [ 'v3' ];
    var verObj = oStack.getApiVersion(suppVerList, verList, index);
    deepEqual(verObj, null, 'Expecting to return null');
});

test('getIpProtoByServCatPubUrl', function() {
    var pubUrl = 'http://10.204.216.46:9292/v1';
    var ipObj = oStack.getIpProtoByServCatPubUrl(pubUrl);
    var ipObj_OP = {'ipAddr': '10.204.216.46', 'port': '9292', 'protocol':
                    'http'};
    deepEqual(ipObj, ipObj_OP, 'With htpp ');
    var pubUrl = '10.204.216.46:9292/v1';
    var ipObj = oStack.getIpProtoByServCatPubUrl(pubUrl);
    deepEqual(ipObj, ipObj_OP, 'Without htpp ');
});

