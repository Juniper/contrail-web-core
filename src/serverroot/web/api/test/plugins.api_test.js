/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */
var plugins = require('../../../orchestration/plugins/plugins.api');
var authApi = require('../../../common/auth.api');
var mockData = require('./plugins.api_mock');
var commonUtils = require('../../../utils/common.utils');

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

test('getServiceAPIVersionByReqObj', function() {
    authApi.getServiceCatalog = getServiceCatalogData;
    plugins.getServiceAPIVersionByReqObj(null, 'compute', function(data) {
        deepEqual(data, mockData.servCatRespComputeData_OP,
                  'Expecting Compute Data Match');
    });
    plugins.getServiceAPIVersionByReqObj(null, 'image', function(data) {
        deepEqual(data, mockData.servCatRespImageData_OP,
                  'Expecting Image Data Match');
    });
    plugins.getServiceAPIVersionByReqObj(null, 'volume', function(data) {
        deepEqual(data, mockData.servCatRespVolData_OP, 
                  'Expecting Volume Data Match');
    });
    /* Test for multiple entries in endpoint for 'compute' node */
    authApi.getServiceCatalog = getServiceCatalogCompData;
    plugins.getServiceAPIVersionByReqObj(null, 'compute', function(data) {
        deepEqual(data, mockData.servCatRespCompMultData_OP,
                  'Expecting Compute Multiple Data Match');
    });
    /* Test for compute node with no http keywork in publicURL */
    authApi.getServiceCatalog = getServiceCatalogCompDataWithNoHTTP; 
    plugins.getServiceAPIVersionByReqObj(null, 'compute', function(data) {
        deepEqual(data, mockData.getServiceCatalogCompDataWithNoHTTP_OP,
                  'Expecting Compute Default HTTP Match');
    });
});

test('getApiVersion', function() {
    var suppVerList = [ 'v1.1', 'v2' ];
    var verList = [ { version: 'v1.1', protocol: 'http' } ];
    var index = 0;
    var suppVerList_OP = { version: 'v1.1', index: 0, protocol: 'http' };

    var verObj = plugins.getApiVersion(suppVerList, verList, index);
    deepEqual(verObj, suppVerList_OP, 'Expecting Version to match');
    var suppVerList = [ 'v3' ];
    var verObj = plugins.getApiVersion(suppVerList, verList, index);
    deepEqual(verObj, null, 'Expecting to return null');
});

