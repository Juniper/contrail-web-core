/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var cluster = require('cluster');
var global = require('../common/global');
var config = process.mainModule.exports['config'];

var clusterEventRegistered = false;
var workers = [];
var timeouts = [];

function forkWorkers ()
{
    if (false == cluster.isMaster) {
        /* Only master can fork workers */
        return;
    }
    var nodeWorkerCnt =
        (null != config.node_worker_count) ? config.node_worker_count : 1;
    
    for (var i = 0; i < nodeWorkerCnt; i++) {
        var worker = cluster.fork();
        workers[i] = worker;
    }
}

function killAllWorkers ()
{
    var workersCnt = workers.length;
    for (var i = 0; i < workersCnt; i++) {
        workers[i].kill();
    }
}

function addClusterEventListener (messageHandler)
{
    var logutils = require('./log.utils');
    if (true == clusterEventRegistered) {
        return;
    }
    clusterEventRegistered = true;
    cluster.on('fork', function (worker) {
        logutils.logger.info('Forking worker #' + worker.id);
        cluster.workers[worker.id].on('message', messageHandler);
        timeouts[worker.id] = setTimeout(function () {
            logutils.logger.error(['Worker taking too long to start.']);
        }, 2000);
    });
    cluster.on('listening', function (worker, address) {
        logutils.logger.info('Worker #' + worker.id + ' listening on port: '
                             + address.port);
        clearTimeout(timeouts[worker.id]);
    });
    cluster.on('online', function (worker) {
        logutils.logger.info('Worker #' + worker.id + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        logutils.logger.error(['The worker #' + worker.id +
                              ' has exited with exit code ' +
                              worker.process.exitCode]);
        clearTimeout(timeouts[worker.id]);
        var worker = cluster.fork();
        workers.push(worker);
    });
    cluster.on('disconnect', function (worker) {
        logutils.logger.debug('The worker #' + worker.id + ' has disconnected.');
    });
}

exports.addClusterEventListener = addClusterEventListener;
exports.forkWorkers = forkWorkers;
exports.killAllWorkers = killAllWorkers;
