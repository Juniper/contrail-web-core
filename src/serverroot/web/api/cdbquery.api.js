/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var cdbqueryapi = module.exports,
    commonUtils = require('../../utils/common.utils'),
    config = require('../../../../config/config.global'),
    editEnabled = config.cassandra.enable_edit,
    logutils = require('../../utils/log.utils');

var helenus = require('helenus'),
    hosts = getCassandraHostList(config.cassandra.server_ips, config.cassandra.server_port),
    pool = new helenus.ConnectionPool({
        hosts:hosts,
        keyspace:'config_db_uuid',
        timeout:3000
    });

pool.on('error', function (err) {
    logutils.logger.error(err.stack);
});

cdbqueryapi.listKeys4Table = function (req, res) {
    var table = req.param('table'),
        responseJSON = {"table":table, "keys":[], "editEnabled":editEnabled};
    pool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            pool.cql("SELECT key FROM " + table, [], function (err, results) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    results.forEach(function (row) {
                        responseJSON.keys.push({"table":table, "key":(row.get('key').value).toString()});
                    });
                    commonUtils.handleJSONResponse(null, res, responseJSON);
                }
            });

        }
    });
};

cdbqueryapi.listValues4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        responseJSON = {"editEnabled":editEnabled, "keyvalues":[]};
    pool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            keyspace.get(table, function (err, cf) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    cf.get(key, {consistency:helenus.ConsistencyLevel.ONE}, function (err, results) {
                        if (err) {
                            logutils.logger.error(err.stack);
                            commonUtils.handleJSONResponse(err, res, null);
                        } else {
                            results.forEach(function (row) {
                                responseJSON.keyvalues.push({"key":key, "table":table, "keyvalue":row.toString()});
                            });
                            commonUtils.handleJSONResponse(null, res, responseJSON);
                        }
                    });
                }
            });
        }
    });
};

cdbqueryapi.deleteValue4Key = function (req, res) {
    var key = req.param("key"),
        table = req.param("table"),
        value = req.param("value");
    if(value && value == "") {
        value = null;
    }
    pool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            keyspace.get(table, function (err, cf) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    cf.remove(key, value, null, {consistency:helenus.ConsistencyLevel.ONE}, function (err) {
                        if (err) {
                            commonUtils.handleJSONResponse(err, res, null);
                        } else {
                            commonUtils.handleJSONResponse(null, res, {"success":1});
                        }
                    });
                }
            });
        }
    });
};

cdbqueryapi.deleteKeyFromTable = function (req, res) {
    var table = req.param('table'),
        key = req.param('key'),
        hexKey = new Buffer(key).toString('hex');
    pool.connect(function (err, keyspace) {
        if (err) {
            logutils.logger.error(err.stack);
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            pool.cql("DELETE FROM " + table + " WHERE KEY = ?", [hexKey], function (err, results) {
                if (err) {
                    logutils.logger.error(err.stack);
                    commonUtils.handleJSONResponse(err, res, null);
                } else {
                    commonUtils.handleJSONResponse(null, res, results);
                }
            });
        }
    });
};

function getCassandraHostList(serverIPs, port) {
    var hosts = [];
    for(var i = 0; i < serverIPs.length; i++) {
        hosts.push(serverIPs[i] + ":" + port);
    }
    return hosts;
};