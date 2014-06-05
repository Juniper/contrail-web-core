/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var getOpServPagedRespData = 
[
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/__UNKNOWN__?flat",
        "name": "__UNKNOWN__"
    },
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/default-domain:admin:test?flat",
        "name": "default-domain:admin:test"
    },
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/default-domain:admin:test-net?flat",
        "name": "default-domain:admin:test-net"
    },
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/default-domain:default-project:__link_local__?flat",
        "name": "default-domain:default-project:__link_local__"
    },
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/default-domain:default-project:default-virtual-network?flat",
        "name": "default-domain:default-project:default-virtual-network"
    },
    {
        "href": "http://10.84.5.33:8081/analytics/uves/virtual-network/default-domain:default-project:ip-fabric?flat",
        "name": "default-domain:default-project:ip-fabric"
    }
];

var vnListAPIServerRespData = 
{
    "virtual-networks": [
        {
            "fq_name": [
                "default-domain",
                "admin",
                "vn1"
            ],
            "href": "http://nodec17:8082/virtual-network/92e16019-e862-4f9a-9333-9e1f0a0d7e5b",
            "uuid": "92e16019-e862-4f9a-9333-9e1f0a0d7e5b"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "vn2"
            ],
            "href": "http://nodec17:8082/virtual-network/f4a5bcc5-3c00-4ab3-ac90-2df9d1d88b35",
            "uuid": "f4a5bcc5-3c00-4ab3-ac90-2df9d1d88b35"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "svc-vn-left"
            ],
            "href": "http://nodec17:8082/virtual-network/2c1f7783-7147-421b-baef-4647dac0250f",
            "uuid": "2c1f7783-7147-421b-baef-4647dac0250f"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "public"
            ],
            "href": "http://nodec17:8082/virtual-network/2f5c9356-8e42-4988-b43c-2b812f3d1d39",
            "uuid": "2f5c9356-8e42-4988-b43c-2b812f3d1d39"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "svc-vn-mgmt"
            ],
            "href": "http://nodec17:8082/virtual-network/37d5bcff-a28b-45b5-9be3-4c21588f80d2",
            "uuid": "37d5bcff-a28b-45b5-9be3-4c21588f80d2"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_108"
            ],
            "href": "http://nodec17:8082/virtual-network/b60aa366-b13a-4d8c-91f5-3a2ddb56910f",
            "uuid": "b60aa366-b13a-4d8c-91f5-3a2ddb56910f"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "svc-vn-right"
            ],
            "href": "http://nodec17:8082/virtual-network/4ec75908-bca6-4b70-a0d5-aced935252cc",
            "uuid": "4ec75908-bca6-4b70-a0d5-aced935252cc"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_505"
            ],
            "href": "http://nodec17:8082/virtual-network/52563929-1187-489f-9ad0-038493ebc5c1",
            "uuid": "52563929-1187-489f-9ad0-038493ebc5c1"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_501"
            ],
            "href": "http://nodec17:8082/virtual-network/08fb03a0-f3df-45d4-8b3f-671abb65252d",
            "uuid": "08fb03a0-f3df-45d4-8b3f-671abb65252d"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_814"
            ],
            "href": "http://nodec17:8082/virtual-network/b190ce00-50dc-4ea9-b8dd-55d970cbe13f",
            "uuid": "b190ce00-50dc-4ea9-b8dd-55d970cbe13f"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_91"
            ],
            "href": "http://nodec17:8082/virtual-network/29d8fd4f-65f1-4c8f-bce3-fdbdbab60ade",
            "uuid": "29d8fd4f-65f1-4c8f-bce3-fdbdbab60ade"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_22"
            ],
            "href": "http://nodec17:8082/virtual-network/12fe5b52-e426-4a32-9b15-20c6c0084e5f",
            "uuid": "12fe5b52-e426-4a32-9b15-20c6c0084e5f"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_3"
            ],
            "href": "http://nodec17:8082/virtual-network/3fb9498c-05aa-4907-8a94-d4294bb7c04d",
            "uuid": "3fb9498c-05aa-4907-8a94-d4294bb7c04d"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_907"
            ],
            "href": "http://nodec17:8082/virtual-network/747e16f6-f5ee-4c2e-a0e7-8c20d1afa056",
            "uuid": "747e16f6-f5ee-4c2e-a0e7-8c20d1afa056"
        },
        {
            "fq_name": [
                "default-domain",
                "admin",
                "TEST_NW_179"
            ],
            "href": "http://nodec17:8082/virtual-network/d97f819a-a859-41b1-9adb-cd6ce66fb8bd",
            "uuid": "d97f819a-a859-41b1-9adb-cd6ce66fb8bd"
        }
    ]
};

var opServPagedfiltUrl =
    '/analytics/uves/virtual-network/*?cfilt=UveVirtualNetworkAgent:interface_list,UveVirtualNetworkAgent:in_bandwidth_usage,UveVirtualNetworkAgent:out_bandwidth_usage,UveVirtualNetworkAgent:in_bytes,UveVirtualNetworkAgent:out_bytes,UveVirtualNetworkConfig:connected_networks,UveVirtualNetworkAgent:virtualmachine_list';

var getOpServPagedRespMockData = {
    'count': 5, 'fromConfigList': false,
    'list': getOpServPagedRespData, 'type': 'virtual-network',
    'filtUrl':opServPagedfiltUrl
}

exports.getOpServPagedRespMockData = getOpServPagedRespMockData;
exports.vnListAPIServerRespData = vnListAPIServerRespData;
