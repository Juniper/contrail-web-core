/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var config = {};

config.ceph={}

config.ceph.enabled=true;

/*Stroage Rest API Server and port */
config.ceph.server_ip='127.0.0.1';

config.ceph.server_port='5005';

/* Storage Web UI HTTP port for NodeJS Server. */
config.ceph.http_port = '9090';

/* Storage Web UI HTTPS port for NodeJS Server. */
config.ceph.https_port = '9143';


/* Configure level of logs */
config.logs = {};
config.logs.level = 'debug';

// Export this as a module.
module.exports = config;