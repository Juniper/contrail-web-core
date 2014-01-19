/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = require('../../../../config/config.global');
var configMainServer = require('../../web/api/configServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var assert = require('assert');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

function getApiServerRequestedByData (appData)
{
    var defproject = null;
    switch (orchModel) {
    case 'openstack':
        /* Openstack auth is keystone based, as config Server does not do
         * authentication using cloudstack, so for now add check
         */
        try {
            defProject = appData['authObj']['defTokenObj']['tenant']['name'];
            return configMainServer;
        } catch(e) {
            try {
                defProject =
                    appData['taskData']['authObj']['token']['tenant']['name'];
                return configJobServer;
            } catch(e) {
                /* Nothing specified, assert */
                if (global.REQ_AT_SYS_INIT == appData['taskData']['reqBy']) {
                    return configJobServer;
                } else {
                    assert(0);
                }
            }
        }
        break;
    default:
        /* If authentication is done via cloudstack, we can not have
         * multi_tenancy, as config Server does not do authentication through
         * cloudstack now */
        try {
            sessionKey = appData['authObj']['defTokenObj']['sessionkey'];
            return configMainServer;
        } catch(e) {
            return configJobServer;
        }
        break;
    }
}

function getOrchestrationPluginModel ()
{
    return {'orchestrationModel' : orchModel}
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;

