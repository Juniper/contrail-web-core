/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @policyconfig.api.js
 *     - Handlers for Policy Configuration
 *     - Interfaces with config api server
 */

var rest = require('../../common/rest.api');
var async = require('async');
var policyconfigapi = module.exports;
var logutils = require('../../utils/log.utils');
var commonUtils = require('../../utils/common.utils');
var config = require('../../../../config/config.global.js');
var messages = require('../../common/messages');
var global = require('../../common/global');
var appErrors = require('../../errors/app.errors.js');
var util = require('util');
var url = require('url');
var configApiServer = require('../../common/configServer.api');

/**
 * Bail out if called directly as "nodejs policyconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listPolicysCb
 * private function
 * 1. Callback for listPolicys
 * 2. Reads the response of per project policies from config api server
 *    and sends it back to the client.
 */
function listPolicysCb(error, polListData, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, polListData);
}

/**
 * @listPolicys
 * public function
 * 1. URL /api/tenants/config/policys
 * 2. Gets list of policies from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listPolicysCb that process data from config
 *    api server and sends back the http response.
 */
function listPolicys(request, response, appData) 
{
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var polListURL = '/network-policys';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        polListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(polListURL, appData,
        function (error, data) {
            listPolicysCb(error, data, response)
        });
}

/**
 * @setPolicyRulesSequence
 * private function
 * 1. Run through all rules and set fake sequence id.
 */
function setPolicyRulesSequence(polConfig) 
{
    var ruleLen = 0, i = 0;
    var ruleRef = [];

    if ('network-policy' in polConfig &&
        'network_policy_entries' in polConfig['network-policy'] &&
        'policy_rule' in polConfig['network-policy']
            ['network_policy_entries']) {
        ruleRef = polConfig['network-policy']
            ['network_policy_entries']
            ['policy_rule'];
        ruleLen = ruleRef.length;
    }

    for (i = 0; i < ruleLen; i++) {
        if (!('rule_sequence' in ruleRef[i])) {
            ruleRef[i]['rule_sequence'] = {};
        }
        ruleRef[i]['rule_sequence'] = {'major':i + 1,
            'minor':0}
    }
    return polConfig;
}

/**
 * @getPolicyCb
 * private function
 * 1. Callback for getPolicy
 * 2. Reads the response of policy get from config api server
 *    and sends it back to the client.
 */
function getPolicyCb(error, polConfig, callback) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    delete polConfig['network-policy']['id_perms'];
    delete polConfig['network-policy']['href'];
    delete polConfig['network-policy']['_type'];

    polConfig = setPolicyRulesSequence(polConfig);
    callback(error, polConfig);
}

/**
 * @getPolicy
 * public function
 * 1. URL /api/tenants/config/policy/:id
 * 2. Gets  policy config from config api server
 * 3. Needs policy id
 * 4. Calls getPolicyCb that process data from config
 *    api server and sends back the http response.
 */
function getPolicy(request, response, appData) 
{
    var policyId = null;
    var requestParams = url.parse(request.url, true);
    var polGetURL = '/network-policy';

    if ((policyId = request.param('id'))) {
        getPolicyAsync({uuid:policyId, appData:appData}, 
                       function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
}

function getPolicyAsync (policyObj, callback)
{
    var policyId = policyObj['uuid'];
    var appData = policyObj['appData'];

    var reqUrl = '/network-policy/' + policyId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getPolicyCb(err, data, callback);
    });
}

function readPolicys (policyObj, callback)
{
    var dataObjArr = policyObj['reqDataArr'];
    console.log("Getting dataObjArr:", dataObjArr);
    async.map(dataObjArr, getPolicyAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @policySendResponse
 * private function
 * 1. Sends back the response of Policy read to clients.
 */
function policySendResponse(error, polConfig, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, polConfig);
    }
    return;
}

/**
 * @setPolicyRead
 * private function
 * 1. Callback for createPolicy
 * 2. Reads the response of policy get from config api server
 *    and sends it back to the client.
 */
function setPolicyRead(error, polConfig, response, appData) 
{
    var polGetURL = '/network-policy/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    polGetURL += polConfig['network-policy']['uuid'];
    configApiServer.apiGet(polGetURL, appData,
        function (error, data) {
            policySendResponse(error, data, response)
        });
}

/**
 * @policyReadSendResponse
 * private function
 * 1. Callback for createPolicy
 * 2. Reads the response of policy get from config api server by policy id
 *    and sends it back to the client.
 */
function policyReadSendResponse(error, polId, response, appData) 
{
    var polGetURL = '/network-policy/' + polId;
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(polGetURL, appData, function (error, data) {
        policySendResponse(error, data, response);
    });
}

/**
 * @createPolicy
 * public function
 * 1. URL /api/tenants/config/policys- Post
 * 2. Sets Post Data and sends back the policy to client
 */
function createPolicy(request, response, appData) 
{
    var polCreateURL = '/network-policys';
    var polPostData = request.body;

    if (typeof(polPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('network-policy' in polPostData)) ||
        (!('fq_name' in polPostData['network-policy'])) ||
        (!(polPostData['network-policy']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Enter Policy Name ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(polCreateURL, polPostData, appData,
        function (error, data) {
            try {
                policyId = data['network-policy']['uuid'];
                if ((policyId) && ('virtual_network_back_refs' in
                    polPostData['network-policy'])) {
                    updatePolicyWithVNs(polPostData, policyId, appData,
                        function (error, data) {
                            policyReadSendResponse(error, policyId, response, appData);
                        });
                } else {
                    commonUtils.handleJSONResponse(null, response, data);
                }
            } catch (e) {
                commonUtils.handleJSONResponse(error, response, data);
            }
        });
}

function updatePolicy(request, response, appData) 
{
    var policyId = request.param('id');
    var polPutData = request.body;
    var polPutURL = '/network-policy/' + policyId;

    if ((!('network-policy' in polPutData)) ||
        (!('fq_name' in polPutData['network-policy'])) ||
        (!(polPutData['network-policy']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Enter Policy Name ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var uiAnalyzerFlag = polPutData['ui_analyzer_flag'];;
    setPolicyEntries(polPutData, policyId, appData, function(err, data) {
        if (err || (null == uiAnalyzerFlag) || (false == uiAnalyzerFlag)) {
            policyReadSendResponse(err, policyId, response, appData);
            return;
        }
        delete polPutData['ui_analyzer_flag'];
        updatePolicyWithVNs(polPutData, policyId, appData, 
                            function (err, data) {
            policyReadSendResponse(err, policyId, response, appData);
        });
    });
}

/**
 * @setPolicyEntries
 * private function
 * 1. Callback for updatePolicyEntries
 * 2. Updates the Policy Rules.
 */
function setPolicyEntries(polPostData, policyId, appData, callback) 
{
    var entryLen = 0, i = 0;
    var ruleLen = 0;
    var ruleOffset = 0;
    var ruleRef = [];
    var ruleUIRef = {};
    var polPostURL = '/network-policy/' + policyId;

    try {
        ruleRef =
            polPostData['network-policy']['network_policy_entries']['policy_rule'];
        entryLen = ruleRef.length;
    } catch(e) {
        polPostData['network-policy']['network_policy_entries'] = {};
        polPostData['network-policy']['network_policy_entries']
            ['policy_rule'] = [];
        entryLen = 0;
    }
    for (i = 0; i < entryLen; i++) {
        ruleUIRef = polPostData['network-policy']['network_policy_entries']
            ['policy_rule'][i];
        if (ruleUIRef['src_addresses'][0]['subnet'] &&
            'ip_prefix' in ruleUIRef['src_addresses'][0]['subnet'] &&
            ruleUIRef['src_addresses'][0]['subnet'] &&
            ruleUIRef['src_addresses'][0]['subnet']['ip_prefix'] &&
            ruleUIRef['src_addresses'][0]['subnet']['ip_prefix'].length) {
            polPostData['network-policy']['network_policy_entries']
                ['policy_rule'][i]['src_addresses'][0]['virtual_network'] = null;
        } else {
            polPostData['network-policy']['network_policy_entries']
                ['policy_rule'][i]['src_addresses'][0]['subnet'] = null;
        }
        if (ruleUIRef['dst_addresses'][0]['subnet'] &&
            'ip_prefix' in ruleUIRef['dst_addresses'][0]['subnet'] &&
            ruleUIRef['dst_addresses'][0]['subnet']['ip_prefix'] &&
            ruleUIRef['dst_addresses'][0]['subnet']['ip_prefix'].length) {
            polPostData['network-policy']['network_policy_entries']
                ['policy_rule'][i]['dst_addresses'][0]['virtual_network'] = null;
        } else {
            polPostData['network-policy']['network_policy_entries']
                ['policy_rule'][i]['dst_addresses'][0]['subnet'] = null;
        }
    }

    configApiServer.apiPut(polPostURL, polPostData, appData,
        function (error, data) {
            callback(error, data);
        });
}

/**
 * @addPolicyEntry
 * public function
 * 1. URL /api/tenants/config/policy/:id/network-policy-entries - Post
 * 2. Sets Post Data and sends back the policy to client
 */
function addPolicyEntry(request, response, appData) 
{
    var policyId = null;
    var polGetURL = '/network-policy/';
    var polPostData = request.body;

    if (typeof(polPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (policyId = request.param('id').toString()) {
        polGetURL += policyId;
    } else {
        error = new appErrors.RESTServerError('Add Policy ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!('network-policy' in polPostData &&
        'network_policy_entries' in polPostData['network-policy'] &&
        'policy_rule' in polPostData['network-policy']
            ['network_policy_entries'])) {
        error = new appErrors.RESTServerError('Add Valid Rule');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(polGetURL, appData,
        function (error, data) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            setPolicyEntries(polPostData, policyId, appData,
                function (err, data) {
                });
        });
}

/**
 * @deletePolicyRule
 * private function
 * 1. Removes a given rule at an offset, later on will be uuid based.
 */
function deletePolicyRule(error, polConfig, ruleId, policyId, response, appData) 
{
    var polPutURL = '/network-policy/' + policyId;
    var ruleLen = 0, i = 0;
    var ruleRef = [];
    var ruleOffset = 0;

    if (!('network-policy' in polConfig &&
        'network_policy_entries' in polConfig['network-policy'] &&
        'policy_rule' in polConfig['network-policy']
            ['network_policy_entries'])) {
        error = new appErrors.RESTServerError('Config Mismatch,' +
            'update client view');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    ruleRef = polConfig['network-policy']
        ['network_policy_entries']
        ['policy_rule'];

    ruleLen = ruleRef.length;

    ruleOffset = parseInt(ruleId);

    if (ruleLen < ruleOffset) {
        error = new appErrors.RESTServerError('Config Mismatch,' +
            'update client view');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    ruleRef.splice(ruleOffset - 1, 1);

    configApiServer.apiPut(polPutURL, polConfig, appData,
        function (error, data) {
            policyReadSendResponse(error, policyId, response, appData);
        });
}

/**
 * @deletePolicyEntry
 * public function
 * 1. URL - Delete
 *  /api/tenants/config/policy/:id/network-policy-entries/ruleid
 * 2. Sets Post Data and sends back the policy to client
 */
function deletePolicyEntry(request, response, appData) 
{
    var policyId = null;
    var ruleId = null;
    var polGetURL = '/network-policy/';

    if (policyId = request.param('id').toString()) {
        polGetURL += policyId;
    } else {
        error = new appErrors.RESTServerError('Add Policy ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(ruleId = request.param('ruleid').toString())) {
        error = new appErrors.RESTServerError('Add Rule ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(polGetURL, appData,
        function (error, data) {
            deletePolicyRule(error, data, ruleId,
                policyId, response, appData);
        });
}

/**
 * @deletePolicyCb
 * private function
 * 1. Return back the response of policy delete.
 */
function deletePolicyCb(error, policyDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, policyDelResp);
}

/**
 * @deletePolicy
 * public function
 * 1. URL /api/tenants/config/policy/:id
 * 2. Deletes the policy from config api server
 */
function deletePolicy(request, response, appData) 
{
    var polDelURL = '/network-policy/';
    var policyId = null;
    var requestParams = url.parse(request.url, true);

    if (policyId = request.param('id').toString()) {
        polDelURL += policyId;
    } else {
        error = new appErrors.RESTServerError('Provide Policy Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(polDelURL, appData, function (err, configData) {
        if ('virtual_network_back_refs' in configData['network-policy']) {
            delete configData['network-policy']['virtual_network_back_refs'];
            updatePolicyWithVNs(configData, policyId, appData,
                function (err, data) {
                    configApiServer.apiDelete(polDelURL, appData,
                        function (error, data) {
                            deletePolicyCb(error, data, response)
                        });
                });
        } else {
            configApiServer.apiDelete(polDelURL, appData,
                function (error, data) {
                    deletePolicyCb(error, data, response)
                });
        }
    });
}

/**
 * @updatePolicyUpdateNets
 * private function
 * Updates Network Policy references from VNs
 */
function updatePolicyUpdateNets(error, results, polConfig, policyId, appData, callback) 
{
    var vnRef = null;
    var polVNRef = {};
    var vnPolRef = [];
    var vnURL = null;
    var vnLen = 0, i = 0, j = 0;
    var polVNRefLen = [];
    var polVNRefObj = {};
    var vnUUID = null;
    var dataObjArr = [];

    if (error) {
        callback(error, null);
        return;
    }

    vnLen = results.length;

    for (i = 0; i < vnLen; i++) {
        vnUUID = results[i]['virtual-network']['uuid'];
        polVNRef = polConfig['network-policy']['net_uuid'][vnUUID];
        vnURL = '/virtual-network/' + vnUUID;
        if (!('network_policy_refs' in results[i]['virtual-network'])) {
            results[i]['virtual-network']['network_policy_refs'] = [];
        }

        vnPolRef = results[i]['virtual-network']['network_policy_refs'];
        if (polVNRef['oper'] == 'add') {
            polVNRef['attr']['sequence'] = { 'major':vnPolRef.length, 'minor':0};
            polVNRefObj =
            {
                to:polConfig['network-policy']['fq_name'],
                attr:polVNRef['attr'],
                uuid:polConfig['network-policy']['uuid']
            };
            vnPolRef.push(polVNRefObj);
        } else {
            vnPolRefLen = vnPolRef.length;
            for (j = 0; j < vnPolRefLen; j++) {
                if (polConfig['network-policy']['uuid']
                    == vnPolRef[j]['uuid']) {
                    vnPolRef.splice(j, 1);
                    break;
                }
            }
        }
        commonUtils.createReqObj(dataObjArr, vnURL, global.HTTP_REQUEST_PUT,
            results[i], null, null, appData);
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
        function (error, results) {
            callback(error, results);
        });

    return;
}

/**
 * @updatePolicyAssocNetRead
 * private function
 */
function updatePolicyAssocNetRead(error, polConfig, polPostData, policyId, appData, callback) 
{
    var url = null;
    var vnRef = [];
    var vnURL = [];
    var vnRefLen = 0, i = 0;
    var vnUIRef = [];
    var vnUIRefLen = 0;
    var dataObjArr = [];
    var curCfgAllDel = false;

    if (error) {
        callback(error, null);
        return;
    }

    polConfig['network-policy']['net_uuid'] = {};

    if ((!('virtual_network_back_refs' in polPostData['network-policy'])) ||
        (!polPostData['network-policy']['virtual_network_back_refs']
            [0]['uuid'].length)) {
        curCfgAllDel = true;
    }


    if ((!(['virtual_network_back_refs'] in polConfig['network-policy']) ||
        (!polConfig['network-policy']['virtual_network_back_refs'].length))
        && curCfgAllDel) {
        /* No VN Associated, so just return */
        callback(null, null);
        return;
    }

    if ((!['virtual_network_back_refs'] in polConfig['network-policy']) && !curCfgAllDel) {
        polConfig['network-policy']['virtual_network_back_refs'] = [];
        vnUIRef = polPostData['network-policy']['virtual_network_back_refs'];
        vnUIRefLen = vnUIRef.length;
        for (i = 0; i < vnUIRefLen; i++) {
            uuid = vnUIRef[i]['uuid'];
            polConfig['network-policy']['net_uuid'][uuid] =
            {'to':vnUIRef[i]['to'],
                'attr':vnUIRef[i]['attr'],
                'uuid':uuid,
                'oper':'add'
            };
            url = '/virtual-network/' + uuid;
            commonUtils.createReqObj(dataObjArr, url,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);
        }
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet,
                false),
            function (error, results) {
                updatePolicyUpdateNets(error, results, polConfig, policyId,
                    appData, callback);
            });
        return;
    }

    if (['virtual_network_back_refs'] in polConfig['network-policy'] &&
        polConfig['network-policy']['virtual_network_back_refs'].length) {
        vnRef = polConfig['network-policy']['virtual_network_back_refs'];
        vnRefLen = vnRef.length;
        for (i = 0; i < vnRefLen; i++) {
            uuid = vnRef[i]['uuid'];
            if (polConfig['network-policy']['net_uuid'][uuid] == null) {
                url = '/virtual-network/' + uuid;
                commonUtils.createReqObj(dataObjArr, url,
                    global.HTTP_REQUEST_GET, null, null,
                    null, appData);
            }
            polConfig['network-policy']['net_uuid'][uuid] =
            {'to':vnRef[i]['to'],
                'attr':null,
                'uuid':vnRef[i]['attr'],
                'oper':'delete'
            };
        }
        if (curCfgAllDel) {
            async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiGet,
                    false),
                function (error, results) {
                    updatePolicyUpdateNets(error, results, polConfig, policyId,
                        appData, callback);
                });
            return;
        }
    }

    vnUIRef = polPostData['network-policy']['virtual_network_back_refs'];
    vnUIRefLen = vnUIRef.length;
    for (i = 0; i < vnUIRefLen; i++) {
        uuid = vnUIRef[i]['uuid'];
        if (polConfig['network-policy']['net_uuid'][uuid] == null) {
            url = '/virtual-network/' + uuid;
            commonUtils.createReqObj(dataObjArr, url,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);
        }
        polConfig['network-policy']['net_uuid'][uuid] =
        {'to':vnUIRef[i]['to'],
            'attr':vnUIRef[i]['attr'],
            'uuid':uuid,
            'oper':'add'
        };
    }
    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (error, results) {
            updatePolicyUpdateNets(error, results, polConfig, policyId, appData,
                callback);
        });
    return;
}

/**
 * @updatePolicyAssociatedNets
 * public function
 * 1. URL /api/tenants/config/policy/:id/associated-networks
 * 2. Gets policy object and figures the diff for association.
 * 3. Resets the policy references from / to virtual-networks.
 * 4. Reads updated policy config and sends it back to client
 */
function updatePolicyAssociatedNets(request, response, appData) 
{
    var policyId = null;
    var polPostData = request.body;

    if (!(policyId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Policy id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    updatePolicyWithVNs(polPostData, policyId, appData, function (err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
    });
}

function updatePolicyWithVNs(polPostData, policyId, appData, callback) 
{
    var policyURL = '/network-policy/' + policyId;
    configApiServer.apiGet(policyURL, appData, function (error, data) {
        updatePolicyAssocNetRead(error, data, polPostData, policyId, appData,
            function (err, data) {
                callback(err, data);
            });
    });
}

/**
 * @createDynamicPolicy
 * private function
 * 1. Create a dynamic policy for a new service instance using default analyzer-template
 */
function createDynamicPolicy(siPostData, appData) 
{
    var analyzerName = siPostData['service-instance']['fq_name'][2],
        polCreateURL = '/network-policys',
        defaultAnalyzerPolicy;
    analyzerName = analyzerName.trim().replace(' ', '-');
    defaultAnalyzerPolicy = {
        "network-policy":{
            "parent_type":"project",
            "fq_name":[
                siPostData['service-instance']['fq_name'][0],
                siPostData['service-instance']['fq_name'][1],
                'default-analyzer-' + analyzerName + '-policy'
            ]
        }
    };
    configApiServer.apiPost(polCreateURL, defaultAnalyzerPolicy, appData,
        function (error, data) {
            if (error) {
                logutils.logger.error(error.stack);
            }
        });
}


/**
 * @deleteAnalyzerPolicy
 * private function
 * 1. Delete a dynamic policy when a service instance of default analyzer-template is deleted
 */
function deleteAnalyzerPolicy(policyId, appData, deleteAnalyzerCB) 
{
    var polDelURL = '/network-policy/' + policyId;
    configApiServer.apiGet(polDelURL, appData, function (err, configData) {
        if ('virtual_network_back_refs' in configData['network-policy']) {
            delete configData['network-policy']['virtual_network_back_refs'];
            updatePolicyWithVNs(configData, policyId, appData, function (err, data) {
                    if(err) {
                        deleteAnalyzerCB(err, data);
                    } else {
                        configApiServer.apiDelete(polDelURL, appData, function (error, data) {
                            deleteAnalyzerCB(error, data);
                        });
                    }
            });
        } else {
            configApiServer.apiDelete(polDelURL, appData, function (error, data) {
                    deleteAnalyzerCB(error, data);
            });
        }
    });
}

exports.listPolicys = listPolicys;
exports.getPolicy = getPolicy;
exports.readPolicys = readPolicys;
exports.createPolicy = createPolicy;
exports.updatePolicy = updatePolicy;
exports.createDynamicPolicy = createDynamicPolicy;
exports.deletePolicy = deletePolicy;
exports.deletePolicyEntry = deletePolicyEntry;
exports.deleteAnalyzerPolicy = deleteAnalyzerPolicy;
exports.addPolicyEntry = addPolicyEntry;
exports.updatePolicyAssociatedNets = updatePolicyAssociatedNets;
