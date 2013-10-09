/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @projectconfig.api.js
 *     - Handlers for Project Configuration
 *     - Interfaces with config api server
 */

var rest             = require('../../common/rest.api');
var projectconfigapi = module.exports;
var logutils         = require('../../utils/log.utils');
var commonUtils      = require('../../utils/common.utils');
var config           = require('../../../../config/config.global.js');
var messages         = require('../../common/messages');
var global           = require('../../common/global');
var appErrors        = require('../../errors/app.errors.js');
var util             = require('util');
var url              = require('url');
var authApi          = require('../../common/auth.api');
var configApiServer = require('../../common/configServer.api');

/**
 * Bail out if called directly as "nodejs projectconfig.api.js"
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listProjectsCb
 * private function
 * 1. Munges data from Keystone to api server equivalent output
 */
function listProjectsCb (error, apiProjects, projectLists, response)
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    authApi.formatTenantList (projectLists, apiProjects, 
                              function(projects) {
        commonUtils.handleJSONResponse(error, response, projects);
    });
}

/**
 * @listProjectsAPIServer
 * private function
 * 1. Gets list of projects from API server
 */
function listProjectsAPIServer (error, projectLists, response, appData)
{
    var projects   = {'projects':[]};
    var projectURL = '/projects';
 
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(projectURL, appData,
                         function(error, data) {
                         listProjectsCb(error, data,
                                        projectLists, response)
                         });

}

/**
 * @listProjects
 * public function
 * 1. URL /api/tenants/config/projects
 * 2. Gets list of projects for the user, domain support
 *    to be added
 * 3. Plumbed with Keystone for now
 */
function listProjects (request, response, appData)
{

    authApi.getTenantList(request,
                         function(error, data) {
                         listProjectsAPIServer(error, data, response, appData);
                         });

}

/**
 * @listDomainsCb
 * private function
 */
function listDomainsCb (error, domainList, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, domainList);
    }
}

/**
 * @listDomains
 * public function
 * 1. URL /api/tenants/config/domains
 * 2. Gets list of domains for the user, domain support
 *    to be added
 * 3. Keystone doesn't support domains as of now so we
 *    pick up domain from api server
 */
function listDomains (request, response, appData)
{
    var domainsURL = '/domains';

    configApiServer.apiGet(domainsURL, appData,
                         function(error, data) {
                         listDomainsCb(error, data, response)
                         });
}

exports.listDomains  = listDomains;
exports.listProjects = listProjects;
