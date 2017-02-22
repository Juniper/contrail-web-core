/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var config = {};

config.orchestration = {};
config.orchestration.Manager = 'openstack';

/****************************************************************************
 * This boolean flag indicates to communicate with Orchestration
 * modules(networkManager, imageManager, computeManager, identityManager,
 * storageManager), should the webServer communicate using the
 * ip/port/authProtocol/apiVersion as specified in this file, or as returned
 * from auth catalog list.
 * Note: config.identityManager.apiVersion is not controlled by this boolean
 * flag.
 *
 * true  - These values should be taken from this config
 *         file.
 * false - These values should be taken from auth catalog list 
 *
*****************************************************************************/
config.serviceEndPointFromConfig = true;

/****************************************************************************
 * This boolean flag specifies wheather region list should be taken from config
 * file or from keystone endpoint
 * true  - If set as true, then keystone endpoint is taken from
 *         config.regions
 * false - If set as false, then keystone endpoint is taken from
 *         config.identityManager
 *
 ****************************************************************************/
config.regionsFromConfig = false;

/****************************************************************************
 * Below are the configs for Api Server and analytics Service type & name as
 * provisioned in keystone
 *
 * apiServiceType - Service Type for apiServer, default value is apiServer
 * opServiceType  - Service Type for analytics, default value is opServer
 *
 * Note: If there are multiple api server or analytices nodes in a specific
 *       region, then provision service type/name as ApiServer0, ApiServer1,
 *       ApiServer2 etc, similarly for analytics node: OpServer0, OpServer1,
 *       OpServer2 etc.
 *
 ****************************************************************************/
config.endpoints = {};
config.endpoints.apiServiceType = 'ApiServer';
config.endpoints.opServiceType = 'OpServer';

/****************************************************************************
 * Mapping to region name with keystone endpoint
 *
 * For example:
 * config.regions.RegionOne = 'http://nodeIp:5000/v2.0';
 * config.regions.RegionTwo = 'http://nodeIp:5000/v3';
 *
 ****************************************************************************/
config.regions = {};
config.regions.RegionOne = 'http://127.0.0.1:5000/v2.0';

/****************************************************************************
 * This boolean flag indicates if serviceEndPointFromConfig is set as false,
 * then to take IP/Port/Protocol/Version information from auth catalog, 
 * should publicURL OR internalURL will be used.
 *
 * true  - publicURL in endpoint will be used to retrieve IP/Port/Protocol/
 *         Version information
 * false - internalURL in endpoint will be used to retrieve
 *         IP/Port/Protocol/Version information
 *
 * NOTE: if config.serviceEndPointFromConfig is set as true, then this flag
 *       does not have any effect.
 *
*****************************************************************************/
config.serviceEndPointTakePublicURL = true;

/****************************************************************************
 * Below are the config options for all Orchestration Modules below:
 *  - networkManager
 *  - imageManager
 *  - computeManager
 *  - identityManager
 *  - storageManager
 *  - cnfg
 *  - analytics
 *
 * Options:
 * ip:
 *      IP to connect to for this Server.
 * port:
 *      Port to connect to for this server
 * authProtocol:        
 *      Specify authProtocol either 'http' or 'https'
 * apiVersion:
 *      REST API Version for this server to connect to.
 *      Specify a list of Versions in array notation.
 *      Below are the supported list of apiVersion for the modules as of now:
 *      imageManager    -   ['v1', 'v2']
 *      computeManager  -   ['v1.1', 'v2']
 *      identityManager -   ['v2.0']
 *      storageManager  -   ['v1']
 *
 *      Not applicable for cnfg/analytics as of now
 * strictSSL:
 *      If true, requires certificates to be valid
 * ca: 
 *      An authority certificate to check the remote host against,
 *      if you do not want to specify then use ''
*****************************************************************************/
config.networkManager = {};
config.networkManager.ip = '127.0.0.1';
config.networkManager.port = '9696'
config.networkManager.authProtocol = 'http';
config.networkManager.apiVersion = [];
config.networkManager.strictSSL = false;
config.networkManager.ca = '';

config.imageManager = {};
config.imageManager.ip = '127.0.0.1';
config.imageManager.port = '9292';
config.imageManager.authProtocol = 'http';
config.imageManager.apiVersion = ['v1', 'v2'];
config.imageManager.strictSSL = false;
config.imageManager.ca = '';

config.computeManager = {};
config.computeManager.ip = '127.0.0.1';
config.computeManager.port = '8774';
config.computeManager.authProtocol = 'http';
config.computeManager.apiVersion = ['v1.1', 'v2'];
config.computeManager.strictSSL = false;
config.computeManager.ca = '';

config.identityManager = {};
config.identityManager.ip = '127.0.0.1';
config.identityManager.port = '5000';
config.identityManager.authProtocol = 'http';
/******************************************************************************
 * Note: config.identityManager.apiVersion is not controlled by boolean flag 
 * config.serviceEndPointFromConfig. If specified apiVersion here, then these
 * API versions will be used while using REST API to identityManager.
 * If want to use with default apiVersion(v2.0), then can specify it as 
 * empty array.
******************************************************************************/
config.identityManager.apiVersion = ['v2.0'];
config.identityManager.strictSSL = false;
config.identityManager.ca = '';
/******************************************************************************
 * The hash algorithm to use for PKI tokens. This can be set to any algorithm
 * that keystone hashlib supports, this should match with value of
 * hash_algorithm in keystone.conf.
 *
 * default: 'md5'
 *
******************************************************************************/
config.identityManager.pkiTokenHashAlgorithm = 'md5';

config.storageManager = {};
config.storageManager.ip = '127.0.0.1';
config.storageManager.port = '8776';
config.storageManager.authProtocol = 'http';
config.storageManager.apiVersion = ['v1'];
config.storageManager.strictSSL = false;
config.storageManager.ca = '';

// VNConfig API server and port.
config.cnfg = {};
config.cnfg.server_ip = ['127.0.0.1'];
config.cnfg.server_port = '8082';
config.cnfg.authProtocol = 'http';
config.cnfg.strictSSL = false;
config.cnfg.ca = '';
config.cnfg.statusURL = "/global-system-configs";

// Analytics API server and port.
config.analytics = {};
config.analytics.server_ip = ['127.0.0.1'];
config.analytics.server_port = '8081';
config.analytics.authProtocol = 'http';
config.analytics.strictSSL = false;
config.analytics.ca = '';
config.analytics.statusURL = "/analytics/uves/bgp-peers";

//DNS API Server and port.
config.dns = {};
config.dns.server_ip = ['127.0.0.1'];
config.dns.server_port = '8092';
config.dns.authProtocol = 'http';
config.dns.strictSSL = false;
config.dns.ca = '';
config.dns.statusURL = "/Snh_PageReq?x=AllEntries%20VdnsServersReq";

/* Job Server */
config.jobServer = {};
config.jobServer.server_ip = '127.0.0.1';
config.jobServer.server_port = '3000';

/* Upload/Download Directory */
config.files = {};
config.files.download_path = '/tmp';

/* Cassandra Server */
config.cassandra = {};
config.cassandra.server_ips = ['127.0.0.1'];
config.cassandra.server_port = '9042';
config.cassandra.enable_edit = false;

/* KUE Job Scheduler */
config.kue = {};
config.kue.ui_port = '3002'

/* IP List to listen on */
config.webui_addresses = ['0.0.0.0'];

/* Is insecure access to WebUI? 
 * If set as false, then all http request will be redirected
 * to https, if set true, then no https request will be processed, but only http
 * request
 */
config.insecure_access = false;

// HTTP port for NodeJS Server.
config.http_port = '8080';

// HTTPS port for NodeJS Server.
config.https_port = '8143';

// Activate/Deactivate Login.
config.require_auth = false;

/* Number of node worker processes for cluster. */
config.node_worker_count = 1;

/* Number of Parallel Active Jobs with same type */
config.maxActiveJobs = 10;

/* Redis DB index for Web-UI */
config.redisDBIndex = 3;

/* WebUI Redis Server */
config.redis_server_port = '6379';
config.redis_server_ip = '127.0.0.1';
config.redis_dump_file = '/var/lib/redis/dump-webui.rdb';

/* Logo File: Use complete path of logo file location */
config.logo_file = '/usr/src/contrail/contrail-web-core/webroot/img/juniper-networks-logo.png';

/* Favicon File: Use complete path of favicon file location */
config.favicon_file = '/usr/src/contrail/contrail-web-core/webroot/img/juniper-networks-favicon.ico';

config.featurePkg = {};
/* Add new feature Package Config details below */
config.featurePkg.webController = {};
config.featurePkg.webController.path = '/usr/src/contrail/contrail-web-controller';
config.featurePkg.webController.enable = true;

/* Enable/disable Stat Query Links in Sidebar*/
config.qe = {};
config.qe.enable_stat_queries = false;

/* Configure level of logs, supported log levels are:
   debug, info, notice, warning, error, crit, alert, emerg
 */
config.logs = {};
config.logs.level = 'debug';

/******************************************************************************
 * Boolean flag getDomainProjectsFromApiServer indicates wheather the project
 * list should come from API Server or Identity Manager.
 * If Set 
 *      - true, then project list will come from API Server
 *      - false, then project list will come from Identity Manager
 * Default: false
 *
******************************************************************************/
config.getDomainProjectsFromApiServer = false;

/******************************************************************************
 * Below are the config options to bypass authentication when
 * config.orchestration.Manager is set to 'none', specifies array of username,
 * password details.
 *
 * Add new user details in next array index.
 *
 * username - This username required while login.
 * password - This password required while login.
 * roles    - User role, options are 'cloudAdmin' and 'member';
 *
 * NOTE: This username and password is not used to authenticate using some
 *       identity manager.
 *       If config.orchestration.Manager is set other than 'none', this config
 *       option does not have any effect.
 *
 ******************************************************************************/
config.staticAuth = [];
config.staticAuth[0] = {};
config.staticAuth[0].username = 'admin';
config.staticAuth[0].password = 'contrail123';
config.staticAuth[0].roles = ['cloudAdmin'];

/*****************************************************************************
 * Below are the mappings from external roles provided by identity manager
 * to UI roles. Currently from UI, we have only cloudAdmin role.
 *
 * If any of the external role matches with the list as mapped with cloudAdmin,
 * the user is treated as cloudAdmin, else if any of the external member role
 * matches with the UI member role, user is treated as member.
 *
 * '*' in config.roleMaps.cloudAdmin signifies that if a user role does not
 * match with any role in config.roleMaps.member, then it is treated as
 * non-member role
 *
 * Please note that for orchestration model, no-orch, vcenter and cloudstack, we
 * assume UI role as cloudAdmin
 *
 *****************************************************************************/
config.roleMaps = {};
config.roleMaps.cloudAdmin = ['admin', 'KeystoneAdmin',
    'KeystoneServiceAdmin', 'netadmin', 'sysadmin', '*'];
config.roleMaps.member = ['Member', '_member_'];

/*****************************************************************************
* Below are the delimiter list for physical/logical interface creation.
* Allowed values : [',', ':']
*****************************************************************************/
config.physicaldevices = {};
config.physicaldevices.interface_delimiters = ['.', ':'];

/*****************************************************************************
* Below are the optional feature list which can be enabled/disabled from
* UI Menu.
*
*****************************************************************************/
config.optFeatureList = {};
config.optFeatureList.mon_infra_underlay = false;
config.optFeatureList.mon_infra_mx = false;

/*****************************************************************************
* Below are the configurations used only for ui
*****************************************************************************/
config.ui = {};

/*****************************************************************************
* Below is the flag to indicate UI that node manager is installed or not.
*****************************************************************************/
config.ui.nodemanager = {};
config.ui.nodemanager.installed = true;

/*****************************************************************************
* Below is the delimiter for contrail dropdown.
* By using this able to store more information in dropdown value,
* later used this information in post payload.
* Default value : [';']
*****************************************************************************/
config.ui.dropdown_value_separator = ";";

// vcenter related parameters
config.vcenter = {};
config.vcenter.server_ip = '127.0.0.1';      //vCenter IP
config.vcenter.server_port = '443';             //Port
config.vcenter.authProtocol = 'https';          //http or https
config.vcenter.datacenter = 'vcenter';          //datacenter name
config.vcenter.dvsswitch = 'vswitch';           //dvsswitch name
config.vcenter.strictSSL = false;               //Strictly Validate the certificate
config.vcenter.ca = '';                         //specify the certificate key file

/*****************************************************************************
 * The below configurations descibe the SSL options for connecting to different
 * Sandesh port.
 *
 * key:
 *      Private key to use for SSL
 * cert:
 *      Public x509 certificate to use
 * ca:
 *      A string, Buffer or array of strings or Buffers of trusted certificates
 *      in PEM format. These are used to authorize connections.
 * strictSSL:
 *      If true, the server certificate is verified against the list of
 *      supplied CAs
 *****************************************************************************/
config.introspect = {};
config.introspect.control = {};
config.introspect.control.authProtocol = 'http';
config.introspect.control.key = '';
config.introspect.control.cert = '';
config.introspect.control.ca = '';
config.introspect.control.strictSSL = false;

config.introspect.dns = {};
config.introspect.dns.authProtocol = 'http';
config.introspect.dns.key = '';
config.introspect.dns.cert = '';
config.introspect.dns.ca = '';
config.introspect.dns.strictSSL = false;

config.introspect.control_nodemgr = {};
config.introspect.control_nodemgr.authProtocol = 'http';
config.introspect.control_nodemgr.key = '';
config.introspect.control_nodemgr.cert = '';
config.introspect.control_nodemgr.ca = '';
config.introspect.control_nodemgr.strictSSL = false;

config.introspect.agent = {};
config.introspect.agent.authProtocol = 'http';
config.introspect.agent.key = '';
config.introspect.agent.cert = '';
config.introspect.agent.ca = '';
config.introspect.agent.strictSSL = false;

config.introspect.vrouter_nodemgr = {};
config.introspect.vrouter_nodemgr.authProtocol = 'http';
config.introspect.vrouter_nodemgr.key = '';
config.introspect.vrouter_nodemgr.cert = '';
config.introspect.vrouter_nodemgr.ca = '';
config.introspect.vrouter_nodemgr.strictSSL = false;

config.introspect.collector = {};
config.introspect.collector.authProtocol = 'http';
config.introspect.collector.key = '';
config.introspect.collector.cert = '';
config.introspect.collector.ca = '';
config.introspect.collector.strictSSL = false;

config.introspect.analytics_api = {};
config.introspect.analytics_api.authProtocol = 'http';
config.introspect.analytics_api.key = '';
config.introspect.analytics_api.cert = '';
config.introspect.analytics_api.ca = '';
config.introspect.analytics_api.strictSSL = false;

config.introspect.qe = {};
config.introspect.qe.authProtocol = 'http';
config.introspect.qe.key = '';
config.introspect.qe.cert = '';
config.introspect.qe.ca = '';
config.introspect.qe.strictSSL = false;

config.introspect.analytics_nodemgr = {};
config.introspect.analytics_nodemgr.authProtocol = 'http';
config.introspect.analytics_nodemgr.key = '';
config.introspect.analytics_nodemgr.cert = '';
config.introspect.analytics_nodemgr.ca = '';
config.introspect.analytics_nodemgr.strictSSL = false;

config.introspect.config = {};
config.introspect.config.authProtocol = 'http';
config.introspect.config.key = '';
config.introspect.config.cert = '';
config.introspect.config.ca = '';
config.introspect.config.strictSSL = false;

config.introspect.schema = {};
config.introspect.schema.authProtocol = 'http';
config.introspect.schema.key = '';
config.introspect.schema.cert = '';
config.introspect.schema.ca = '';
config.introspect.schema.strictSSL = false;

config.introspect.svc_monitor = {};
config.introspect.svc_monitor.authProtocol = 'http';
config.introspect.svc_monitor.key = '';
config.introspect.svc_monitor.cert = '';
config.introspect.svc_monitor.ca = '';
config.introspect.svc_monitor.strictSSL = false;

config.introspect.device_mgr = {};
config.introspect.device_mgr.authProtocol = 'http';
config.introspect.device_mgr.key = '';
config.introspect.device_mgr.cert = '';
config.introspect.device_mgr.ca = '';
config.introspect.device_mgr.strictSSL = false;

config.introspect.config_nodemgr = {};
config.introspect.config_nodemgr.authProtocol = 'http';
config.introspect.config_nodemgr.key = '';
config.introspect.config_nodemgr.cert = '';
config.introspect.config_nodemgr.ca = '';
config.introspect.config_nodemgr.strictSSL = false;

/*****************************************************************************
 * The below flag indicates wheather multi_tenancy is enabled or not.
 * If set
 *  true  - Only admin users can login to UI.
 *  false - All users are allowed to login to UI.
 *
 * NOTE: This flag does not implement multi_tenancy at API Server. This flag
 * needs to be in sync with API Server Config file multi_tenancy flag.
 * Default:  true
 */
config.multi_tenancy = {};
config.multi_tenancy.enabled = true;

/*****************************************************************************
 * timeout - Contrail UI Session timeout value in milli seconds
 *
 * NOTE: If the authentication is done via some identity manager (like
 * keystone), and if it is having some token expiry, then session timeout is set
 * to mimimum of token expiry and session.timeout config value
 *
 * secret_key - Session cookie is signed with this secret key to prevent
 * tampering
 *****************************************************************************/
config.session = {};
config.session.timeout = 1 * 60 * 60 * 1000;
config.session.secret_key =
'enterasupbK3xg8qescJK.dUbdgfVq0D70UaLTMGTzO4yx5vVJral2zIhVersecretkey';

/*****************************************************************************
 * router_L3Enable flag indicates whether to update external gateway 
 * information on router in neutron.
 *
 * true - Will update external gateway information on router in neutron.
 * false - Will not update external gateway information on router in neutron.
 *****************************************************************************/
config.network = {}
config.network.router_L3Enable = true;

/*****************************************************************************
 * The below section specifies the list of allowed ports when requested through
 * proxy.
 * enabled - if set true, proxy feature will be enabled, else will be disabled, and
 * all proxy request will be responded back with error.
 * vrouter_node_ports - the allowed port list when the ip/host in proxy URL
 *      used has role as vrouter/agent node
 * control_node_ports - the allowed port list when the ip/host in proxy URL
 *      used has role as control node
 * analytics_node_ports - the allowed port list when the ip/host in proxy URL
 *      used has role as analytics node
 * config_node_ports - the allowed port list when the ip/host in proxy URL
 *      used has role as config node
 *
 * Note: The process name keys agent, vrouter_nodemgr etc are same as defined
 *       under config.introspect.
 *
 *****************************************************************************/
config.proxy = {};
config.proxy.enabled = true;
config.proxy.vrouter_node_ports = {
    "agent":            ["8085"],   /* HttpPortAgent */
    "vrouter_nodemgr":  ["8102"]    /* HttpPortVRouterNodemgr */
};
config.proxy.control_node_ports = {
    "control":          ["8083"],   /* HttpPortControl */
    "dns":              ["8092"],   /* HttpPortDns */
    "control_nodemgr":  ["8101"]    /* HttpPortControlNodemgr */
};
config.proxy.analytics_node_ports = {
    "opserver":         ["8081"],   /* OpServerPort */
    "collector":        ["8089"],   /* HttpPortCollector */
    "analytics_api":    ["8090"],   /* HttpPortOpserver */
    "qe":               ["8091"],   /* HttpPortQueryEngine */
    "analytics_nodemgr":["8104"],   /* HttpPortAnalyticsNodemgr */
    "analytices_ha":    ["9081"]    /* HttpPortAnalyticsHA */
};
config.proxy.config_node_ports = {
    "cnfg":             ["8082"],   /* ApiServerPort */
    "config":           ["8084"],   /* HttpPortApiServer */
    "schema":           ["8087"],   /* HttpPortSchemaTransformer */
    "svc_monitor":      ["8088"],   /* HttpPortSvcMonitor */
    "device_mgr":       ["8096"],   /* HttpPortDeviceManager */
    "config_nodemgr":   ["8100"]    /* HttpPortConfigNodemgr */
};

/*****************************************************************************
 *
 * This section describes the various options for server configurations.
 *
 * ciphers:
 *      A string describing the ciphers to use or exclude. Consult
 *      <http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT> for
 *      details on the format.
 *
 *  key_file:
 *      Private key file path to use for SSL
 *  cert_file:
 *      Public x509 certificate file path to use
 *
 *****************************************************************************/
config.server_options = {};
config.server_options.ciphers =
    'ECDHE-RSA-AES256-SHA384:AES256-SHA256:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM';
config.server_options.key_file = '/usr/src/contrail/contrail-web-core/keys/cs-key.pem';
config.server_options.cert_file = '/usr/src/contrail/contrail-web-core/keys/cs-cert.pem';

// Export this as a module.
module.exports = config;
