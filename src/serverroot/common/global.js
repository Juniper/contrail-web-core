/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

if (!module.parent) {
    console.log("Please don't call me directly.");
    process.exit(1);
}

global = {};

global.service = {};
global.service.MAINSEREVR = 'mainServer';
global.service.MIDDLEWARE = 'middleware';

global.STR_MAIN_WEB_SERVER_READY = 'mainWebServerReady';

/* JOB */
global.FLOW_CACHE_DATA_SORT = 'flowCacheSortJSONData';
global.STR_JOB_RUN_COUNT = 'runCount';
global.STR_JOB_RUN_DELAY = 'runDelay';
global.STR_JOB_DEF_CALLBACK = 'defCallback';
global.STR_JOB_PRIORITY = 'jobPriority';
global.STR_JOB_SUMMARY = 'jobSummary';
global.STR_JOB_PRIORITY_NORMAL = 'normal';
global.STR_URL = 'URL';
global.MIN_JOB_PARAMS_COUNT = 8;

global.IPADDR_ANY = '0.0.0.0';

/* VM Status */
global.STR_VM_STATE_SPAWNING = 'Spawning';
global.STR_VM_STATE_ACTIVE = 'Active';
global.STR_VM_STATE_INACTIVE = 'Inactive';
global.STR_VM_STATE_PARTIALLY_ACTIVE = 'Partially Active';

/* ZMQ */
global.ZWQ_MSG_SEPERATOR = '@';

global.WEBUI_SESSION_REDIS_DB = 2;
global.WEBUI_DFLT_REDIS_DB = 3;
global.QE_DFLT_REDIS_DB = 4;
global.SM_DFLT_REDIS_DB = 5;

/* Generic Caching related global variables */
global.STR_JOB_TYPE_CACHE = 'cache';
global.STR_SEND_TO_JOB_SERVER = 'sendToJobServer';
global.STR_DISCOVERY_SERVICE_RESPONSE = 'discoveryServiceResponse';
global.DISC_SERVICE_TYPE_OP_SERVER = 'OpServer';
global.DISC_SERVICE_MAX_INST_COUNT_OP_SERVER = 20;
global.DISC_SERVICE_TYPE_API_SERVER = 'ApiServer';
global.DISC_SERVICE_MAX_INST_COUNT_API_SERVER = 20;
global.DISC_SERVER_SUB_CLINET = 'discoveryServiceSubscribeClient';
global.DISC_SERVER_SUB_CLIENT_RESPONSE = 'discoveryServiceSubscribeClientResp';
global.DISC_SERVICE_MAX_INST_COUNT = 20;

/* Topology tree caching */
global.STR_GET_PROJECTS_TREE = 'getProjectsTree';
global.STR_GET_NETWORK_TOPOLOGY = 'getNetworkTopology'

/* Flow Stat Caching */
global.STR_GET_FLOW_STAT = 'getFlowStat';
global.STR_GET_FLOW_STAT_BG_JOB = 'getFlowStatBackJob';
global.STR_FLOW_STAT_TIME_SLICE = 'time_slice';
global.STR_FLOW_STAT_START_TIME = 'start_time';
global.STR_FLOW_STAT_END_TIME = 'end_time';
global.STR_FLOW_STAT = 'flow-statistics';
global.FLOW_STAT_GRANULITY_PARAMS = 1000;
global.STR_FLOW_STAT_SRC_VIRT_NW = 'source_virtual_network';
global.STR_FLOW_STAT_DEST_VIRT_NW = 'destination_virtual_network';
global.STR_FLOW_STAT_DIRECTION = 'direction';
global.STR_FLOW_STAT_MIN_OR_HRS = 'min/hrs';
global.STR_FLOW_STAT_TIME_SLICE = 'time_slice';
global.FLOW_STAT_CACHE_PURGE_INIT = 0;
global.FLOW_STAT_CACHE_PURGE_ON_PROGRESS = 1;
global.FLOW_STAT_CACHE_PURGE_COMPLETE = 2;
global.STR_FLOW_STAT_ABS_URL = '/flow-statistics';

global.REQ_BY_UI = 'ReqByUI';
global.REQ_AT_SYS_INIT = 'ReqAtInit';

/* Openstack Components */
global.SERVICE_ENDPT_TYPE_COMPUTE = 'compute';
global.SERVICE_ENDPT_TYPE_NETWORK = 'network';
global.SERVICE_ENDPT_TYPE_IMAGE = 'image';
global.SERVICE_ENDPT_TYPE_VOLUME = 'volume';
global.SERVICE_ENDPT_TYPE_EC2 = 'ec2';
global.SERVICE_ENDPT_TYPE_IDENTITY = 'identity';

/* http status codes
 */
global.HTTP_REQUEST_GET = 'get';
global.HTTP_REQUEST_PUT = 'put';
global.HTTP_REQUEST_POST = 'post';
global.HTTP_REQUEST_DEL = 'delete';

global.HTTP_STATUS_RESP_OK = 200;
global.HTTP_STATUS_BAD_REQUEST = 400;
global.HTTP_STATUS_FORBIDDEN = 403;
global.HTTP_STATUS_AUTHORIZATION_FAILURE = 401;
global.HTTP_STATUS_PAGE_NOT_FOUND = 404;
global.HTTP_STATUS_FORBIDDEN_STR = 'Unauthorized access';
global.HTTP_STATUS_INTERNAL_ERROR = 500;
global.HTTP_STATUS_GATEWAY_TIMEOUT = 504;
global.STR_CACHE_RETRIEVE_ERROR = 'Server data retrieval error';
global.STR_HTTP_REQ_INTERNAL_ERROR = 'Internal error occurred';
global.STR_JOB_TYPE_CACHE_FLOW_DATA = 'cacheFlowData';
global.STR_JOB_TYPE_CACHE_FLOW_DATA_TIME = 'cacheFlowDataTime';
global.STR_GET_CTRL_NODES = 'getControlNodes';
global.STR_GET_CTRL_NODES_SUMMARY = 'getControlNodesSummary';
global.STR_GET_NODES_TREE = 'getNodesTree';
global.STR_GET_CTRL_NODES_DETAIL = 'getControlNodesDetail';
global.STR_GET_CTRL_NODE_BGPPEER = 'getControlNodeBgpPeer';
global.STR_GET_NODES = 'getNodes';
global.STR_GET_COMPUTE_NODE_INTERFACE = 'getComputeNodeInterface';
global.STR_GET_COMPUTE_NODE_ACL = 'getComputeNodeAcl';
global.STR_GET_COMPUTE_NODE_ACL_FLOWS = 'getComputeNodeAclFlows';
global.STR_GET_CTRL_NODES_COMBOLIST = 'getControlNodeAutoCompleteList';
global.STR_PROJECT_DETAILS = 'getProjectDetails';
global.STR_NW_DOMAIN_SUMMARY = 'getNetworkDomainSummary';
global.STR_GET_TOP_NW_BY_PROJECT = 'getTopNetworkDetailsByProject';
global.STR_GET_TOP_NW_BY_DOMAIN = 'getTopNetworkDetailsByDomain';
global.STR_GET_TOP_PROJECT_BY_DOMAIN = 'getTopProjectDetailsByDomain';
global.STR_GET_TOP_PORT_BY_DOMAIN = 'getTopPortByDomain';
global.STR_GET_TOP_PORT_BY_PROJECT = 'getTopPortByProject';
global.STR_GET_TOP_PORT_BY_NW = 'getTopPortByNetwork';
global.STR_GET_TOP_FLOWS_BY_PROJECT = 'getTopFlowsByProject';
global.STR_GET_TOP_FLOWS_BY_DOMAIN = 'getTopFlowsByDomain';
global.STR_GET_TOP_FLOWS_BY_NW = 'getTopFlowsByNetwork';
global.STR_GET_TOP_PEER_BY_PROJECT = 'getTopPeerByProject';
global.GET_FLOW_SERIES_BY_VN = 'getVNFlowSeriesData';
global.GET_FLOW_SERIES_BY_VM = 'getVMFlowSeriesData';
global.GET_FLOW_SERIES_BY_VNS = 'getVNsFlowSeriesData';
global.STR_FLOW_SERIES_BY_VM = 'getFlowSeriesByVM';
global.STR_GET_TOP_PEER_BY_DOMAIN = 'getTopPeerByDomain';
global.STR_GET_TOP_PEER_BY_NW = 'getTopPeerByNetwork';
global.STR_GET_TOP_PORT_BY_VM = 'getTopPortByVM';
global.STR_GET_TOP_PEER_BY_VM = 'getTopPeerByVM';
global.STR_GET_TOP_FLOWS_BY_VM = 'getTopFlowsByVM';
global.GET_STAT_SUMMARY_BY_VM = 'getVMStatSummary';
global.GET_STAT_SUMMARY_BY_CONN_NWS = 'getConnNetStatsSummary';
global.STR_GET_TOP_PORT_BY_CONN_NW = 'getTopPortByConnNet';
global.STR_GET_TOP_PEER_BY_CONN_NW = 'getTopPeerByConnNet';
global.STR_GET_TOP_FLOWS_BY_CONN_NW = 'getTopFlowsByConnNet';
global.STR_GET_TOP_DETAILS = 'getTopDetails';
global.STR_GET_TOP_PEER_DETAILS_BY_PORT = 'getTopPeerDetailsByPort';
global.STR_GET_PORT_LEVEL_FLOW_SERIES = 'getPortLevelFlowSeries';
global.STR_GET_FLOW_DETAILS_BY_FLOW_TUPLE = 'getFlowDetailsByFlowTuple';
global.STR_GET_CPU_FLOW_SERIES = 'getCPULoadFlowSeries';
global.INTERNAL_VENDOR_TYPE = 'contrail';
global.MSG_REDIRECT_TO_LOGOUT = 'redirectToLogout';
global.STR_NODE_TYPE_SERVICE_CHAIN = 'service-instance';
global.STR_NODE_TYPE_VIRTUAL_NETWORK = 'virtual-network';

global.MILLISEC_IN_SEC = 1000;
global.MICROSECS_IN_MILL = 1000;
global.FLOW_TIME_SLICE_FOR_10_MINS = 1000;
global.FLOW_TIME_SLICE_FOR_1_HR = 10000;
global.FLOW_TIME_SLICE_FOR_24_HRS = 86400000;
global.FLOW_TIME_SLICE_FOR_1_HR = 3600000;
global.FLOW_TIME_SLICE_FOR_60_MIN = 60000;
global.MAX_AGE_SESSION_ID = 365 * 24 * 60 * 60 * 1000;
/* 24 Hrs, In Milliseconds */
global.STR_REDIS_STORE_SESSION_ID_PREFIX = 'mySession:';
global.STR_SESSION_AUTHENTICATED = 'sessAuthenticated';
global.STR_AUTH_KEY = 'authenticationKey';
global.DEMO_USER_MAX_AGE_SESSION = 2 * 60 * 60 * 1000;
/* 2 Hrs */

/* UI Roles */
global.STR_ROLE_USER = 'member';
global.STR_ROLE_ADMIN = 'superAdmin';

global.DFLT_REDIS_SERVER_PORT = '6379';
global.DFLT_REDIS_SERVER_IP = '127.0.0.1';
global.DFLT_UPLOAD_PATH = '/tmp';
/** nodeJS timeout is 2 minutes, so set the timeout less than that, as when we
 *  set the timer in our APP, before that nodejs middleware already has set its
 *  own timer
 */

global.DFLT_SERVER_IP = '127.0.0.1';
/* 1 Minute 55 Seconds */
global.DFLT_HTTP_REQUEST_TIMEOUT_TIME = 115 * 1000;
/* 5 minutes 10 secs */
global.NODEJS_HTTP_REQUEST_TIMEOUT_TIME = (5 * 60 + 10) * 1000; 
/* 20 Minutes - From Middleware, do callback timeout of 20 minutes */
global.DEFAULT_MIDDLEWARE_API_TIMEOUT = 20 * 60 * 1000;

global.EMPTY_BGP_PEER_ATTR_JSON = {"session": [
    {"attributes": [
        {"bgp_router": null, "address_families": {"family": ["inet-vpn"]}}
    ], "uuid": null}
]};
global.TOKEN_URL = '/v2.0/tokens';

global.label = {};
global.label.VNCONFIG_API_SERVER = 'vnconfig-api-server';
global.label.OPS_API_SERVER = 'ops-api-server';
global.label.IDENTITY_SERVER = 'identity-server';
global.label.NETWORK_SERVER = 'network-server';
global.label.IMAGE_SERVER = 'image-server';
global.label.STORAGE_SERVER = 'storage-server';
global.label.COMPUTE_SERVER = 'compute-server';
global.label.DISCOVERY_SERVER = 'discovery-server';
global.label.API_SERVER = 'api-server'
global.label.VCENTER_SERVER = 'vCenter-server'
global.label.VROUTER = 'vrouter';
global.label.CONTROL_NODE = 'control-node';
global.SANDESH_CONTROL_NODE_PORT = '8083';
global.SANDESH_COMPUTE_NODE_PORT = '8085';
global.SANDESH_DNS_AGENT_PORT = '8092';
global.SANDESH_API = 'Sandesh-API';
global.PROTOCOL_HTTP = 'http';
global.PROTOCOL_HTTPS = 'https';
global.HTTP_URL = 'http://';
global.HTTPS_URL = 'https://';

global.RESP_DATA_NOT_AVAILABLE = '-';
global.GET_VROUTERS_LIST = 'getVRoutersList';
global.GET_VIRTUAL_ROUTERS = 'getVirtualRouters';
global.STR_GET_VROUTERS_SUMMARY = 'getVRoutersSummary';
global.STR_GET_VROUTERS_GENERATORS = 'getVRoutersGenerators';
global.VROUTER_COUNT_IN_JOB = 100;

global.VROUTER_SUMM_JOB_REFRESH_TIME = 5 * 60 * 1000;
global.VROUTER_GENR_JOB_REFRESH_TIME = 4 * 60 * 1000;
global.MAX_INT_VALUE = 429496729;

global.RUN_QUERY_URL = '/analytics/query';
global.GET_TABLES_URL = '/analytics/tables';
global.GET_TABLE_INFO_URL = '/analytics/table';

global.QUERY_JSON = {
    MessageTable: {"table": 'MessageTable', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Type", "Source", "ModuleId", "Messagetype", "Xmlmessage", "Level", "Category"], "filter": [
        {"name": "Type", "value": "1", "op": 1}
    ], "sort_fields": ['MessageTS'], "sort": 2},
    ObjectTableQueryTemplate: {"table": '', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectVNTable: {"table": 'ObjectVNTable', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectVMTable: {"table": 'ObjectVMTable', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectVRouter: {"table": 'ObjectVRouter', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectBgpPeer: {"table": 'ObjectBgpPeer', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectBgpRouter: {"table": 'ObjectBgpRouter', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectConfigNode: {"table": 'ObjectConfigNode', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectRoutingInstance: {"table": 'ObjectRoutingInstance', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectXmppConnection: {"table": 'ObjectXmppConnection', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectCollectorInfo: {"table": 'ObjectCollectorInfo', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    ObjectSITable: {"table": 'ObjectSITable', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []},
    FlowSeriesTable: {"table": 'FlowSeriesTable', "start_time": "", "end_time": "", "select_fields": ['flow_class_id', 'direction_ing']},
    FlowRecordTable: {"table": 'FlowRecordTable', "start_time": "", "end_time": "", "select_fields": ['vrouter', 'sourcevn', 'sourceip', 'sport', 'destvn', 'destip', 'dport', 'protocol', 'direction_ing']},
    StatTable_UveVirtualNetworkAgent_vn_stats: {
                                                    "table": 'StatTable.UveVirtualNetworkAgent.vn_stats',
                                                    "start_time": "",
                                                    "end_time": "", 
                                                    "select_fields": []
                                                },
    StatTable_VirtualMachineStats_if_stats: {
                                                    "table": 'StatTable.VirtualMachineStats.if_stats',
                                                    "start_time": "",
                                                    "end_time": "", 
                                                    "select_fields": []
                                             },
    StatTable_VirtualMachineStats_fip_stats: {
                                                    "table": 'StatTable.VirtualMachineStats.fip_stats',
                                                    "start_time": "",
                                                    "end_time": "", 
                                                    "select_fields": []
                                             },
    OverlayToUnderlayFlowMap: {"table": 'OverlayToUnderlayFlowMap', "start_time": "",
                            "end_time": "", "select_fields": ["u_prouter", "u_pifindex"]
    },
    StatTable_UveVMInterfaceAgent_if_stats: {
        "table": 'StatTable.UveVMInterfaceAgent.if_stats',
        "start_time": "",
        "end_time": "",
        "select_fields": []
    },
    StatTable_UveVMInterfaceAgent_fip_diff_stats: {
        "table": 'StatTable.UveVMInterfaceAgent.fip_diff_stats',
        "start_time": "",
        "end_time": "",
        "select_fields": []
    }
};

global.STATS_PROP = {
                    'vn': {
                            'inBytes':'SUM(vn_stats.in_bytes)',
                            'outBytes':'SUM(vn_stats.out_bytes)',
                            'inPkts':'SUM(vn_stats.in_tpkts)',
                            'outPkts':'SUM(vn_stats.out_tpkts)'
                          },
                    'conn-vn': {
                            'inBytes':'SUM(vn_stats.in_bytes)',
                            'outBytes':'SUM(vn_stats.out_bytes)',
                            'inPkts':'SUM(vn_stats.in_pkts)',
                            'outPkts':'SUM(vn_stats.out_pkts)'
                          },
                    'vm': {
                            'inBytes':'SUM(if_stats.in_bytes)',
                            'outBytes':'SUM(if_stats.out_bytes)',
                            'inPkts':'SUM(if_stats.in_pkts)',
                            'outPkts':'SUM(if_stats.out_pkts)'
                           },
                    'fip' : {
                            'inBytes':'SUM(fip_stats.in_bytes)',
                            'outBytes':'SUM(fip_stats.out_bytes)',
                            'inPkts':'SUM(fip_stats.in_pkts)',
                            'outPkts':'SUM(fip_stats.out_pkts)'
                           },
                 };
global.FORMAT_TABLE_COLUMNS = {
    'FlowSeriesTable': {"sum(bytes)": "sum_bytes", "sum(packets)": "sum_packets", "avg(bytes)": "avg_bytes", "avg(packets)": "avg_packets"}
};

global.VALID_LIKE_OPR_FIELDS = ['sourcevn', 'destvn'];
global.VALID_RANGE_OPR_FIELDS = ['protocol', 'sourceip', 'destip', 'sport', 'dport'];

/* Async URL Timeout */
global.DEFAULT_ASYNC_REQUEST_TIMEOUT = 30 * 1000;
/* 8 seconds */
global.BGP_NODE_SUMMARY_GET_TIMEOUT = 5 * 1000;
/* 5 Seconds */
global.DEFAULT_CB_TIMEOUT = 20 * 1000;

global.QUERY_STRING_SORT_ASC = 1;
global.QUERY_STRING_SORT_DESC = 2;

global.TRAFFIC_DIR_EGRESS = 0;
global.TRAFFIC_DIR_INGRESS = 1;

/* No Limit */
global.TRAFFIC_STAT_TOP_COUNT = -1;

global.FLOW_CLASS_FIELDS = ['sourcevn', 'destvn', 'sourceip', 'destip', 'sport', 'dport', 'protocol'];

global.STR_HOST_NOT_REACHABLE = 'Not Reachable';
/* MD5 */
global.MD5_ALGO_AES256 = 'aes256';
global.MD5_MY_KEY = 'gh6try8ghweR6Rqgt9opmn7Fe';

global.DEFAULT_INTERFACE_PCAP_ANALYZER = 'interface-packet-capture';
global.DEFAULT_ANALYZER_TEMPLATE = 'analyzer-template';
global.DEFAULT_FLOW_PCAP_ANALYZER = 'flow-packet-capture';

global.CONTRAIL_LOGIN_ERROR = 'ContrailLoginError';

/* Keystone */
global.KEYSTONE_V3_DEFAULT_DOMAIN = 'default';
global.KEYSTONE_V2_DEFAULT_DOMAIN = 'default-domain';
global.KEYSTONE_V3_TOKEN_URL = '/v3/auth/tokens';

/* vCenter Config */
global.VCENTER_SDK_PATH = '/sdk';
global.VCENTER_WSDL = 'webroot/js/vim.wsdl';

/* Async map limit Count */
global.ASYNC_MAP_LIMIT_COUNT = 100;

module.exports = global;
