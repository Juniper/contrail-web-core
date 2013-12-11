/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @servicetemplate.api.js
 *     - Handlers for Service Template Configuration
 *     - Interfaces with config api server
 */

var rest = require('../../common/rest.api');
var async = require('async');
var logutils = require('../../utils/log.utils');
var commonUtils = require('../../utils/common.utils');
var config = require('../../../../config/config.global.js');
var messages = require('../../common/messages');
var global = require('../../common/global');
var appErrors = require('../../errors/app.errors.js');
var util = require('util');
var url = require('url');
var imageApi = require('../../common/imagemanager.api');
var configApiServer = require('../../common/configServer.api');
var computeApi = require('../../common/computemanager.api');

/**
 * Bail out if called directly as "nodejs servicetemplateconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listServiceTemplates
 * public function
 * 1. URL /api/tenants/config/service-templates/:id
 * 2. Gets list of service templates for a given domain
 * 3. Needs domain  id as the id
 * 4. Calls listServiceTemplatesCb that process data from config
 *    api server and sends back the http response.
 */
function listServiceTemplates(request, response, appData) 
{
    var domainId = null;
    var requestParams = url.parse(request.url, true);
    var domainURL = '/domain';

    if ((domainId = request.param('id'))) {
        domainURL += '/' + domainId.toString();
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
    configApiServer.apiGet(domainURL, appData,
        function (error, data) {
            listServiceTemplatesCb(error, data, response, appData);
        });
}

/**
 * @listServiceTemplatesCb
 * private function
 * 1. Callback for listServiceTemplates
 * 2. Reads the response of per domain ST list from config api server
 *    and sends it back to the client.
 */
function listServiceTemplatesCb(error, stListData, response, appData) 
{
    var url = null;
    var dataObjArr = [];
    var i = 0, stLength = 0;
    var serviceTemplates = {};

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    serviceTemplates['service_templates'] = [];

    if ('service_templates' in stListData['domain']) {
        serviceTemplates['service_templates'] =
            stListData['domain']['service_templates'];
    }

    stLength = serviceTemplates['service_templates'].length;

    if (!stLength) {
        commonUtils.handleJSONResponse(error, response, serviceTemplates);
        return;
    }

    for (i = 0; i < stLength; i++) {
        var stRef = serviceTemplates['service_templates'][i];
        url = '/service-template/' + stRef['uuid'];
        commonUtils.createReqObj(dataObjArr, url,
            global.HTTP_REQUEST_GET, null, null, null,
            appData);
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (error, results) {
            stListAggCb(error, results, response)
        });
}

/**
 * @stListAggCb
 * private function
 * 1. Callback for the ST gets, sends all STs to client.
 */
function stListAggCb(error, results, response) 
{
    var serviceTemplates = {}, finalResults;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    finalResults = filterDefaultAnalyzerTemplate(results);
    serviceTemplates['service_templates'] = finalResults;
    commonUtils.handleJSONResponse(error, response, serviceTemplates);
}

/**
 * @filterDefaultAnalyzerTemplate
 * private function
 * 1. Filter Default Analyzer Template
 * 2. Required SI Template JSON
 */
function filterDefaultAnalyzerTemplate(serviceTemplates) 
{
    var name, filteredTemplates = [], j = 0;
    for (var i = 0; i < serviceTemplates.length; i++) {
        name = serviceTemplates[i]['service-template']['name'];
        if (name != 'analyzer-template') {
            filteredTemplates[j++] = serviceTemplates[i];
        }
    }
    return filteredTemplates;
}

/**
 * @createServiceTemplate
 * public function
 * 1. URL /api/tenants/config/service-templates - Post
 * 2. Sets Post Data and sends back the service template config to client
 */
function createServiceTemplate(request, response, appData) 
{
    var stCreateURL = '/service-templates';
    var stPostData = request.body;

    if (typeof(stPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-template' in stPostData)) ||
        (!('fq_name' in stPostData['service-template'])) ||
        (!(stPostData['service-template']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid Service template');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(stCreateURL, stPostData, appData,
        function (error, data) {
            setSTRead(error, data, response, appData);
        });

}

/**
 * @deleteServiceTemplateCb
 * private function
 * 1. Return back the response of service template delete.
 */
function deleteServiceTemplateCb(error, stDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, stDelResp);
}

/**
 * @deleteServiceTemplate
 * public function
 * 1. URL /api/tenants/config/service-template/:id
 * 2. Deletes the service template from config api server
 */
function deleteServiceTemplate(request, response, appData) 
{
    var stDelURL = '/service-template/';
    var stId = null;
    var requestParams = url.parse(request.url, true);

    if (stId = request.param('id').toString()) {
        stDelURL += stId;
    } else {
        error = new appErrors.RESTServerError('Service Template ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(stDelURL, appData,
        function (error, data) {
            deleteServiceTemplateCb(error, data, response)
        });
}

/**
 * @setSTRead
 * private function
 * 1. Callback for ST create / update operations
 * 2. Reads the response of ST get from config api server
 *    and sends it back to the client.
 */
function setSTRead(error, stConfig, response, appData) 
{
    var stGetURL = '/service-template/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    stGetURL += stConfig['service-template']['uuid'];
    console.log(stGetURL);
    configApiServer.apiGet(stGetURL, appData,
        function (error, data) {
            stSendResponse(error, data, response)
        });
}

/**
 * @stSendResponse
 * private function
 * 1. Sends back the response of service template read to clients after set operations.
 */
function stSendResponse(error, stConfig, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, stConfig);
    }
    return;
}

/**
 * @listServiceTemplateImages
 * public function
 * URL: /api/tenants/config/service-template-images/ - GET
 * 1. Gets the list of available images registed with Glance and sends back response to client.
 */
function listServiceTemplateImages(request, response, appData) 
{
    imageApi.getImageList(request, function (error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            commonUtils.handleJSONResponse(error, response, data);
        }
    });
}

/**
 * @getSystemFlavors
 * private function
 * 1.gets the list of system flavors with details and sends back response to client.
 */
function getSystemFlavors(request, response, appdata)
{
    console.log("SERVER HIT!!!");
    computeApi.getFlavors(request, function(err, data) {
        console.log("OUTPUT:"+JSON.stringify(data));                  
        commonUtils.handleJSONResponse(err, response, data);
    });
}

exports.listServiceTemplates = listServiceTemplates;
exports.listServiceTemplateImages = listServiceTemplateImages;
exports.createServiceTemplate = createServiceTemplate;
exports.deleteServiceTemplate = deleteServiceTemplate;
exports.getSystemFlavors = getSystemFlavors;
