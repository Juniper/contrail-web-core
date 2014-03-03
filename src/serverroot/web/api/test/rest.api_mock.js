var restAPIJSONResp = 
{
    "virtual-router": {
        "fq_name": [
            "default-global-system-config", 
            "nodeg4"
        ], 
        "href": "http://10.204.217.42:9100/virtual-router/7efa6ef9-a052-43d8-96dc-cd278fde53b2", 
        "id_perms": {
            "created": "2014-02-26T06:27:59.778795", 
            "description": null, 
            "enable": true, 
            "last_modified": "2014-02-26T06:27:59.778795", 
            "permissions": {
                "group": "cloud-admin-group", 
                "group_access": 7, 
                "other_access": 7, 
                "owner": "cloud-admin", 
                "owner_access": 7
            }, 
            "uuid": {
                "uuid_lslong": 10870789170366665000, 
                "uuid_mslong": 9149747611372242000
            }
        }, 
        "name": "nodeg4", 
        "parent_href": "http://10.204.217.42:9100/global-system-config/f6caa9d4-0217-448f-9a7c-efcbdf08b54c", 
        "parent_type": "global-system-config", 
        "parent_uuid": "f6caa9d4-0217-448f-9a7c-efcbdf08b54c", 
        "uuid": "7efa6ef9-a052-43d8-96dc-cd278fde53b2", 
        "virtual_router_ip_address": "10.204.217.44"
    }
};

var restAPIXMLResp = 
'<?xml-stylesheet type="text/xsl" href="/universal_parse.xsl"?><VnListResp type="sandesh"><vn_list type="list" identifier="1"><list type="struct" size="3"><VnSandeshData><name type="string" identifier="1">default-domain:admin:vn4</name><uuid type="string" identifier="2">714242a1-9f22-4011-9bfa-d8cadb1cb0a1</uuid><acl_uuid type="string" identifier="3" link="AclReq">c608e827-b9aa-4090-b36a-ef2c5f3db754</acl_uuid><mirror_acl_uuid type="string" identifier="4" link="AclReq"></mirror_acl_uuid><mirror_cfg_acl_uuid type="string" identifier="5" link="AclReq"></mirror_cfg_acl_uuid><vrf_name type="string" identifier="6" link="VrfListReq">default-domain:admin:vn4:vn4</vrf_name><ipam_data type="list" identifier="7"><list type="struct" size="1"><VnIpamData><ip_prefix type="string" identifier="1">192.168.2.0</ip_prefix><prefix_len type="i32" identifier="2">24</prefix_len><gateway type="string" identifier="3">192.168.2.254</gateway><ipam_name type="string" identifier="4">default-domain:admin:ipam1</ipam_name></VnIpamData></list></ipam_data><ipam_host_routes type="list" identifier="8"><list type="struct" size="1"><VnIpamHostRoutes><ipam_name type="string" identifier="1">default-domain:admin:ipam1</ipam_name><host_routes type="list" identifier="2"><list type="string" size="0"></list></host_routes></VnIpamHostRoutes></list></ipam_host_routes><layer2_forwarding type="bool" identifier="9">true</layer2_forwarding><ipv4_forwarding type="bool" identifier="10">true</ipv4_forwarding></VnSandeshData><VnSandeshData><name type="string" identifier="1">default-domain:admin:vn1</name><uuid type="string" identifier="2">7389c750-6a70-4b4a-95bc-9af94925cef2</uuid><acl_uuid type="string" identifier="3" link="AclReq">292f2610-3c1d-4f24-a2d4-a4bfe66ab10b</acl_uuid><mirror_acl_uuid type="string" identifier="4" link="AclReq"></mirror_acl_uuid><mirror_cfg_acl_uuid type="string" identifier="5" link="AclReq"></mirror_cfg_acl_uuid><vrf_name type="string" identifier="6" link="VrfListReq">default-domain:admin:vn1:vn1</vrf_name><ipam_data type="list" identifier="7"><list type="struct" size="1"><VnIpamData><ip_prefix type="string" identifier="1">1.1.1.0</ip_prefix><prefix_len type="i32" identifier="2">24</prefix_len><gateway type="string" identifier="3">1.1.1.254</gateway><ipam_name type="string" identifier="4">default-domain:admin:ipam1</ipam_name></VnIpamData></list></ipam_data><ipam_host_routes type="list" identifier="8"><list type="struct" size="1"><VnIpamHostRoutes><ipam_name type="string" identifier="1">default-domain:admin:ipam1</ipam_name><host_routes type="list" identifier="2"><list type="string" size="0"></list></host_routes></VnIpamHostRoutes></list></ipam_host_routes><layer2_forwarding type="bool" identifier="9">true</layer2_forwarding><ipv4_forwarding type="bool" identifier="10">true</ipv4_forwarding></VnSandeshData><VnSandeshData><name type="string" identifier="1">default-domain:admin:vn5</name><uuid type="string" identifier="2">9630f4e1-af02-464e-bf37-151c167b72bd</uuid><acl_uuid type="string" identifier="3" link="AclReq">c6bd1503-c038-449f-a987-a7ed1bf32b7f</acl_uuid><mirror_acl_uuid type="string" identifier="4" link="AclReq"></mirror_acl_uuid><mirror_cfg_acl_uuid type="string" identifier="5" link="AclReq"></mirror_cfg_acl_uuid><vrf_name type="string" identifier="6" link="VrfListReq">default-domain:admin:vn5:vn5</vrf_name><ipam_data type="list" identifier="7"><list type="struct" size="1"><VnIpamData><ip_prefix type="string" identifier="1">10.10.16.0</ip_prefix><prefix_len type="i32" identifier="2">24</prefix_len><gateway type="string" identifier="3">10.10.16.254</gateway><ipam_name type="string" identifier="4">default-domain:admin:ipam1</ipam_name></VnIpamData></list></ipam_data><ipam_host_routes type="list" identifier="8"><list type="struct" size="1"><VnIpamHostRoutes><ipam_name type="string" identifier="1">default-domain:admin:ipam1</ipam_name><host_routes type="list" identifier="2"><list type="string" size="0"></list></host_routes></VnIpamHostRoutes></list></ipam_host_routes><layer2_forwarding type="bool" identifier="9">true</layer2_forwarding><ipv4_forwarding type="bool" identifier="10">true</ipv4_forwarding></VnSandeshData></list></vn_list><more type="bool" identifier="0">false</more></VnListResp>';

var xml2jsSettings = { ignoreAttrs: true, explicitArray: false };

var restAPIXMLResp_OP =
{
    "VnListResp": {
        "more": "false",
        "vn_list": {
            "list": {
                "VnSandeshData": [
                    {
                        "acl_uuid": "c608e827-b9aa-4090-b36a-ef2c5f3db754",
                        "ipam_data": {
                            "list": {
                                "VnIpamData": {
                                    "gateway": "192.168.2.254",
                                    "ip_prefix": "192.168.2.0",
                                    "ipam_name": "default-domain:admin:ipam1",
                                    "prefix_len": "24"
                                }
                            }
                        },
                        "ipam_host_routes": {
                            "list": {
                                "VnIpamHostRoutes": {
                                    "host_routes": {
                                        "list": {}
                                    },
                                    "ipam_name": "default-domain:admin:ipam1"
                                }
                            }
                        },
                        "ipv4_forwarding": "true",
                        "layer2_forwarding": "true",
                        "mirror_acl_uuid": {},
                        "mirror_cfg_acl_uuid": {},
                        "name": "default-domain:admin:vn4",
                        "uuid": "714242a1-9f22-4011-9bfa-d8cadb1cb0a1",
                        "vrf_name": "default-domain:admin:vn4:vn4"
                    },
                    {
                        "acl_uuid": "292f2610-3c1d-4f24-a2d4-a4bfe66ab10b",
                        "ipam_data": {
                            "list": {
                                "VnIpamData": {
                                    "gateway": "1.1.1.254",
                                    "ip_prefix": "1.1.1.0",
                                    "ipam_name": "default-domain:admin:ipam1",
                                    "prefix_len": "24"
                                }
                            }
                        },
                        "ipam_host_routes": {
                            "list": {
                                "VnIpamHostRoutes": {
                                    "host_routes": {
                                        "list": {}
                                    },
                                    "ipam_name": "default-domain:admin:ipam1"
                                }
                            }
                        },
                        "ipv4_forwarding": "true",
                        "layer2_forwarding": "true",
                        "mirror_acl_uuid": {},
                        "mirror_cfg_acl_uuid": {},
                        "name": "default-domain:admin:vn1",
                        "uuid": "7389c750-6a70-4b4a-95bc-9af94925cef2",
                        "vrf_name": "default-domain:admin:vn1:vn1"
                    },
                    {
                        "acl_uuid": "c6bd1503-c038-449f-a987-a7ed1bf32b7f",
                        "ipam_data": {
                            "list": {
                                "VnIpamData": {
                                    "gateway": "10.10.16.254",
                                    "ip_prefix": "10.10.16.0",
                                    "ipam_name": "default-domain:admin:ipam1",
                                    "prefix_len": "24"
                                }
                            }
                        },
                        "ipam_host_routes": {
                            "list": {
                                "VnIpamHostRoutes": {
                                    "host_routes": {
                                        "list": {}
                                    },
                                    "ipam_name": "default-domain:admin:ipam1"
                                }
                            }
                        },
                        "ipv4_forwarding": "true",
                        "layer2_forwarding": "true",
                        "mirror_acl_uuid": {},
                        "mirror_cfg_acl_uuid": {},
                        "name": "default-domain:admin:vn5",
                        "uuid": "9630f4e1-af02-464e-bf37-151c167b72bd",
                        "vrf_name": "default-domain:admin:vn5:vn5"
                    }
                ]
            }
        }
    }
};

exports.restAPIJSONResp = restAPIJSONResp;
exports.xml2jsSettings = xml2jsSettings;
exports.restAPIXMLResp = restAPIXMLResp;
exports.restAPIXMLResp_OP = restAPIXMLResp_OP;


