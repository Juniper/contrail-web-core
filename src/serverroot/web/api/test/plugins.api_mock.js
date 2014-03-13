/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var servCatRespData = 
[
    {
        "endpoints": [
            {
                "adminURL": "http://10.204.217.42:8774/v1.1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "id": "b8ff35b7f97b4f4f9dfafc1b39738ab2", 
                "internalURL": "http://10.204.217.42:8774/v1.1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "publicURL": "http://10.204.217.42:8774/v1.1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "nova", 
        "type": "compute"
    }, 
    {
        "endpoints": [
            {
                "adminURL": "http://10.204.217.42:9696", 
                "id": "5ca991b809af4c4eac1b7c7759eb5f1d", 
                "internalURL": "http://10.204.217.42:9696", 
                "publicURL": "http://10.204.217.42:9696", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "quantum", 
        "type": "network"
    }, 
    {
        "endpoints": [
            {
                "adminURL": "http://10.204.217.42:9292/v1", 
                "id": "30274bcd7e824280a7f3e634f9ff5fd9", 
                "internalURL": "http://10.204.217.42:9292/v1", 
                "publicURL": "http://10.204.217.42:9292/v1", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "glance", 
        "type": "image"
    }, 
    {
        "endpoints": [
            {
                "adminURL": "http://10.204.217.42:8776/v1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "id": "12fa689e4a0c4851b0abbeafe8efd3e6", 
                "internalURL": "http://10.204.217.42:8776/v1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "publicURL": "http://10.204.217.42:8776/v1/f6a480d7c45e420eb92a3f3b9f10cc83", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "cinder", 
        "type": "volume"
    }, 
    {
        "endpoints": [
            {
                "adminURL": "http://localhost:8773/services/Admin", 
                "id": "e90a636b1d824edd995da3745f627cf8", 
                "internalURL": "http://localhost:8773/services/Cloud", 
                "publicURL": "http://localhost:8773/services/Cloud", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "ec2", 
        "type": "ec2"
    }, 
    {
        "endpoints": [
            {
                "adminURL": "http://10.204.217.42:35357/v2.0", 
                "id": "caf347f329ea402da2e068ea603dfc5c", 
                "internalURL": "http://10.204.217.42:35357/v2.0", 
                "publicURL": "http://10.204.217.42:5000/v2.0", 
                "region": "RegionOne"
            }
        ], 
        "endpoints_links": [], 
        "name": "keystone", 
        "type": "identity"
    }
];

var compEndPoint_IN = 
{
    "adminURL": "https://10.204.217.42:8774/v2/f6a480d7c45e420eb92a3f3b9f10cc83",
    "id": "b8ff35b7f97b4f4f9dfafc1b39738ab2",
    "internalURL": "https://10.204.217.42:8774/v2/f6a480d7c45e420eb92a3f3b9f10cc83",
    "publicURL": "https://10.204.217.42:8774/v2/f6a480d7c45e420eb92a3f3b9f10cc83",
    "region": "RegionOne"
};

var servCatRespComputeData_OP =
[
    {
        "protocol": "http", 
        "version": "v1.1"
    }
];

var servCatRespVolData_OP =
[
    {
        "protocol": "http",
        "version": "v1"
    }
];

var servCatRespImageData_OP =
[
    {
        "protocol": "http", 
        "version": "v1"
    }
];

var servCatRespCompMultData_OP =
[ 
    { version: 'v1.1', protocol: 'http' },
    { version: 'v2', protocol: 'https' } 
];

var getServiceCatalogCompDataWithNoHTTP_OP = 
[ 
    { version: 'v1.1', protocol: 'http' } 
];

exports.servCatRespData = servCatRespData;
exports.servCatRespComputeData_OP = servCatRespComputeData_OP;
exports.servCatRespImageData_OP = servCatRespImageData_OP;
exports.servCatRespVolData_OP = servCatRespVolData_OP;
exports.servCatRespCompMultData_OP = servCatRespCompMultData_OP;
exports.getServiceCatalogCompDataWithNoHTTP_OP = getServiceCatalogCompDataWithNoHTTP_OP;
exports.compEndPoint_IN = compEndPoint_IN;

