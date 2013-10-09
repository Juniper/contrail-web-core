/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var config = {};

config.orchestration = {};
config.orchestration.Manager = 'openstack'

config.networkManager = {};
config.networkManager.ip = '127.0.0.1';
config.networkManager.port = '9696'

config.imageManager = {};
config.imageManager.ip = '127.0.0.1';
config.imageManager.port = '9292';

config.computeManager = {};
config.computeManager.ip = '127.0.0.1';
config.computeManager.port = '8774';

config.identityManager = {};
config.identityManager.ip = '127.0.0.1';
config.identityManager.port = '5000';

config.storageManager = {};
config.storageManager.ip = '127.0.0.1';
config.storageManager.port = '8776';

// VNConfig API server and port.
config.cnfg = {};
config.cnfg.server_ip = '127.0.0.1';
config.cnfg.server_port = '8082';

// Analytics API server and port.
config.analytics = {};
config.analytics.server_ip = '127.0.0.1';
config.analytics.server_port = '8081';

/* Job Server */
config.jobServer = {};
config.jobServer.server_ip = '127.0.0.1';
config.jobServer.server_port = '3000';

/* Upload/Download Directory */
config.files = {};
config.files.download_path = '/tmp';

/* Redis Server */
config.redis = {};
config.redis.server_port = '6379';
config.redis.server_ip = '127.0.0.1';

/* Cassandra Server */
config.cassandra = {};
config.cassandra.server_ips = ['127.0.0.1'];
config.cassandra.server_port = '9160';
config.cassandra.enable_edit = false;

/* KUE Job Scheduler */
config.kue = {};
config.kue.ui_port = '3002'

/* IP List to listen on */
config.webui_addresses = ['0.0.0.0'];

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
config.redisDBIndex = 1;

/* WebUI Redis Server */
config.redis_server_port = '6383';
config.redis_server_ip = '127.0.0.1';

/* Cache Expiry Time */
config.cacheExpire = {};
config.cacheExpire.flow_stat_time = 600; /* Seconds */
config.cacheExpire.topo_tree_time = 600; /* Seconds */
// Export this as a module.
module.exports = config;
