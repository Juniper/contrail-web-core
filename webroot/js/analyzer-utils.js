/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var DEFAULT_INTERFACE_PCAP_ANALYZER = 'interface-packet-capture';

function startPacketCapture4Interface(interfaceUUID, vnFQN, vmName) {
    var postData = {
        'action': 'start',
        'interfaceUUID': interfaceUUID,
        'vnFQN': vnFQN,
        'direction': 'both',
        'pcapUpdateFunction': 'updatePacketCapture4Interface'
    };
    if (vmName != null && vmName.indexOf(DEFAULT_INTERFACE_PCAP_ANALYZER) != -1) {
        showInfoWindow('Packet capture for default analyzer interface is not available.', 'Message');
        return;
    }
    var closePostData = {'interfaceUUID': interfaceUUID, 'action': 'stop'};
    createPCAPModal('stopPacketCapture4Interface', closePostData, 'Interface Packet Capture');
    doAjaxCall("/api/tenants/config/interface/packet-capture", "POST", JSON.stringify(postData), "getAnalyzerVNCUrl", "startPCAP4InterfaceFailureCB", null, postData);
};

function createPCAPModal(closeClickAction, closePostData, title) {
    var modalLoadingBody = '<i id="pcap-loading" class="icon-spinner icon-spin blue bigger-125 offset4"></i> &nbsp; Starting Packet Capture ...';
    $.contrailBootstrapModal({
        id: 'pcapModal',
        title: title,
        body: modalLoadingBody,
        className: 'modal-1120',
        closeClickAction: closeClickAction,
        closeClickParams: closePostData,
        footer: [
            {
                title: 'Close',
                onclick: closeClickAction,
                className: 'btn-primary',
                onClickParams: closePostData
            }
        ]
    });
    $('#pcapModal').css('z-index', 1051);
}

function getAnalyzerVNCUrl(respose, cbParams) {
    if (respose.message != null) {
        $('#pcapModal').modal('hide');
        showInfoWindow(respose.message, 'Message');
    } else {
        var projectFQN = respose['projectFQN'];
        var projectArray = projectFQN.split(':');
        setCookie('project', projectArray[1]);
        var url = "/api/tenants/config/service-instance-vm?project_id=" + projectArray[1] + "&vm_id=" + respose['vmUUID'];
        doAjaxCall(url, "GET", null, "getAnalyzerVNCUrlSuccessCB", "getAnalyzerVNCUrlFailureCB", false, cbParams);
    }
};

function getFlowAnalyzerVNCUrl(response, cbParams) {
    var firstCBParams = cbParams['firstCBParams'],
        secondCBParams = cbParams['secondCBParams'],
        closePostData;
    if (firstCBParams['defaultPCAPAnalyzerPolicyUUID'] == null) {
        closePostData = cbParams['closePostData'];
        closePostData['defaultPCAPAnalyzerPolicyUUID'] = response['network-policy']['uuid'];
        secondCBParams['defaultPCAPAnalyzerPolicyUUID'] = response['network-policy']['uuid'];
        createPCAPModal('editPacketCapture4Flows', closePostData, 'Flow Packet Capture');
    }
    var projectFQN = firstCBParams['projectFQN'];
    var projectArray = projectFQN.split(':');
    setCookie('project', projectArray[1]);
    var url = "/api/tenants/config/service-instance-vm?project_id=" + projectArray[1] + "&vm_id=" + firstCBParams['vmUUID'];
    doAjaxCall(url, "GET", null, "getAnalyzerVNCUrlSuccessCB", "getAnalyzerVNCUrlFailureCB", false, secondCBParams);
};

function getAnalyzerVNCUrlSuccessCB(result, cbParams) {
    var href = jsonPath(result, "$.console.url")[0];
    var modalBody = '<div class="row-fluid">' +
        '<div class="span10"><p>If console is not responding to keyboard input: click the grey status bar below.&nbsp;&nbsp;<a href="' + href + '" style="text-decoration: underline" target=_blank>Click here to show only console</a></p></div>' +
        '<div id="pcap-direction" class="span2 pull-right"></div>' +
        '<i id="pcap-direction-loading" class="icon-spinner icon-spin blue bigger-150 pull-right hide"></i>' +
        '</div>' +
        '<br>' +
        '<div class="row-fluid">' +
        '<iframe id="vnc-console-frame" src="" class="span12 height-840"></iframe>' +
        '</div>';
    $('#pcapModal .modal-body').html(modalBody);
    $("#vnc-console-frame").attr("src", href);
    var dropdownlist = $("#pcap-direction").contrailDropdown({
        data: [
            {text: 'Ingress & Egress', value: 'both'},
            {text: 'Ingress', value: 'ingress'},
            {text: 'Egress', value: 'egress'}
        ],
        dataTextField: "text",
        dataValueField: "value",
        index: 0,
        change: function (e) {
            var direction = $("#pcap-direction").data("contrailDropdown").value();
            cbParams['direction'] = direction;
            cbParams['action'] = 'update';
            onChangePCAPDirection(cbParams);
        }
    }).data("contrailDropdown");

    dropdownlist.value(cbParams['direction']);
}

function getDirectionText(direction) {
    if(direction == '>' || direction == 'egress') {
        return 'egress';
    } else if(direction == '<' || direction == 'ingress') {
        return 'ingress';
    } else {
        return 'both';
    }
}

function onChangePCAPDirection(postData) {
    $("#pcap-direction-loading").show();
    $('#pcap-direction').data('contrailDropdown').enable(false);
    window[postData['pcapUpdateFunction']](postData);
};

function getAnalyzerVNCUrlFailureCB(error) {
    $('#pcapModal').modal('hide');
}

function startPCAP4InterfaceFailureCB(error) {
    $('#pcapModal').modal('hide');
};

function stopPacketCapture4Interface(postData) {
    $('#pcapModal').modal('hide');
    doAjaxCall("/api/tenants/config/interface/packet-capture", "POST", JSON.stringify(postData));
}

function editPacketCapture4Flows(cbParams) {
    var action = cbParams['action'], params, policyUrl,
        analyzerRuleParams, policyUUID;
    if (action != 'start') {
        params = cbParams;
    } else {
        params = cbParams['secondCBParams'];
    }
    policyUUID = params['defaultPCAPAnalyzerPolicyUUID'];
    policyUrl = '/api/tenants/config/policy/' + policyUUID;
    analyzerRuleParams = params['analyzerRuleParams'];
    $.ajax({
        url: policyUrl,
        dataType: "json",
        success: function (response) {
            var policyRules = response['network-policy']['network_policy_entries']['policy_rule'],
                index, analyzerPolicy = response;
            ;
            if (action == 'start') {
                createPCAPAnalyzerPolicyRule(analyzerPolicy, analyzerRuleParams);
                doAjaxCall(policyUrl, "PUT", JSON.stringify(analyzerPolicy), "getFlowAnalyzerVNCUrl", "createPCAPRuleFailureCB", null, cbParams);
            } else if (action == 'update') {
                index = getPolicyRuleIndex(policyRules, analyzerRuleParams);
                if (index != -1) {
                    policyRules[index]['direction'] = getDirection4Policy(params['direction']);
                    doAjaxCall(policyUrl, "PUT", JSON.stringify(analyzerPolicy), "updatePCAPDirectionSuccessCB", "editPCAP4FlowsFailureCB");
                } else {
                    updatePCAPDirectionSuccessCB();
                }
            } else if (action == 'stop') {
                $('#pcapModal').modal('hide');
                index = getPolicyRuleIndex(policyRules, analyzerRuleParams);
                if (index != -1) {
                    policyRules.splice(index, 1);
                    doAjaxCall(policyUrl, "PUT", JSON.stringify(analyzerPolicy), null, "editPCAP4FlowsFailureCB");
                }
            }
        },
        error: function () {
            $('#pcapModal').modal('hide');
        }
    });
};

function getPolicyRuleIndex(policyRules, analyzerRuleParams) {
    var count = policyRules.length, index = -1;
    for (var i = 0; i < count; i++) {
        if (isMatchedPolicyRule(policyRules[i], analyzerRuleParams)) {
            index = i;
            break;
        }
    }
    return index;
}

function isMatchedPolicyRule(policyRule, analyzerRuleParams) {
    var isMatched = false;
    if (policyRule['protocol'] != analyzerRuleParams.protocol) {
        return isMatched;
    } else if (policyRule['action_list']['mirror_to']['analyzer_name'] != analyzerRuleParams.analyzerNameFQN) {
        return isMatched;
    } else if (policyRule['src_addresses'][0]['virtual_network'] != analyzerRuleParams.srcVN) {
        return isMatched;
    } else if (policyRule['src_ports'][0]['start_port'] != analyzerRuleParams.srcPorts || policyRule['src_ports'][0]['end_port'] != analyzerRuleParams.srcPorts) {
        return isMatched;
    } else if (policyRule['dst_addresses'][0]['virtual_network'] != analyzerRuleParams.destVN) {
        return isMatched;
    } else if (policyRule['dst_ports'][0]['start_port'] != analyzerRuleParams.destPorts || policyRule['dst_ports'][0]['end_port'] != analyzerRuleParams.destPorts) {
        return isMatched;
    } else {
        isMatched = true;
        return isMatched;
    }
}

function updatePacketCapture4Interface(postData) {
    doAjaxCall("/api/tenants/config/interface/packet-capture", "POST", JSON.stringify(postData), 'updatePCAPDirectionSuccessCB', 'updatePCAP4InterfaceFailureCB');
}

function updatePCAPDirectionSuccessCB(params) {
    $("#pcap-direction-loading").hide();
    $('#pcap-direction').data('contrailDropdown').enable(true);
}

function updatePCAP4InterfaceFailureCB(error) {
    $('#pcapModal').modal('hide');
}

function startPacketCapture4Flow(gridId, rowIndex, ruleParamsParser) {
    var dataItem = $('#' + gridId).data('contrailGrid')._grid.getDataItem(rowIndex),
        analyzerRuleParams = window[ruleParamsParser](dataItem),
        postData = {
            action: 'start',
            vnFQN: analyzerRuleParams.srcVN,
            direction: analyzerRuleParams.direction,
            pcapUpdateFunction: 'editPacketCapture4Flows',
            analyzerRuleParams: analyzerRuleParams
        },
        cbParams = {secondCBParams: postData};

    doAjaxCall("/api/tenants/config/flow/packet-capture", "POST", JSON.stringify(postData), "getUUID4PolicyVNCallback", "startPCAP4FlowFailureCB", null, cbParams);
};

function parseAnalyzerRuleParams4Flow(dataItem) {
    var analyzerRuleParams;
    analyzerRuleParams = {
        protocol: getProtocolName(dataItem.protocol).toLowerCase(),
        srcVN: dataItem.src_vn,
        sip: dataItem.sip,
        srcPorts: (dataItem.src_port != '0' && dataItem.src_port != '') ? parseInt(dataItem.src_port) : -1,
        destVN: dataItem.dst_vn,
        dip: dataItem.dip,
        destPorts: (dataItem.dst_port != '0' && dataItem.dst_port != '') ? parseInt(dataItem.dst_port) : -1,
        direction: 'both'
    };
    return analyzerRuleParams;
}

function parseAnalyzerRuleParams4FlowByPort(dataItem) {
    var analyzerRuleParams;
    analyzerRuleParams = {
        protocol: getProtocolName(dataItem.protocol).toLowerCase(),
        srcVN: dataItem.sourcevn,
        sip: dataItem.sourceip,
        srcPorts: (dataItem.sport != '0' && dataItem.sport != '') ? parseInt(dataItem.sport) : -1,
        destVN: dataItem .destvn,
        dip: dataItem.destip,
        destPorts: (dataItem.dport != '0' && dataItem.dport != '') ? parseInt(dataItem.dport) : -1,
        direction: 'both'
    };
    return analyzerRuleParams;
}

function parseAnalyzerRuleParams4FlowRecord(dataItem) {
    var analyzerRuleParams;
    analyzerRuleParams = {
        protocol: getProtocolName(dataItem.protocol).toLowerCase(),
        srcVN: dataItem.sourcevn,
        sip: dataItem.sourceip,
        srcPorts: (dataItem.sport != '0' && dataItem.sport != '') ? parseInt(dataItem.sport) : -1,
        destVN: dataItem.destvn,
        dip: dataItem.destip,
        destPorts: (dataItem.dport != '0' && dataItem.dport != '') ? parseInt(dataItem.dport) : -1,
        direction: dataItem.direction_ing == 0 ? '>' : '<>'

    };
    return analyzerRuleParams;
}

function getUUID4PolicyVNCallback(response, cbParams) {
    var url = "/api/tenants/config/virtual-networks",
        analyzerRuleParams = cbParams['secondCBParams']['analyzerRuleParams'],
        srcVN = analyzerRuleParams.srcVN.split(':'), destVN = analyzerRuleParams.destVN.split(':'),
        srcProject = srcVN[0] + ':' + srcVN[1], destProject = destVN[0] + ':' + destVN[1],
        srcUrl = url + '?tenant_id=' + srcProject, destUrl = url + '?tenant_id=' + destProject,
        isSameProject = (srcProject == destProject) ? true : false,
        srcUUID, destUUID;
    if (response.message == null) {
        cbParams['firstCBParams'] = response;
        $.ajax({
            url: srcUrl,
            dataType: "json",
            success: function (response) {
                srcUUID = fetchUUID4VN(response, srcVN.join(':'));
                if (srcUUID == null) {
                    $('#pcapModal').modal('hide');
                    showInfoWindow('UUID of virtual network not found.', 'Error');
                } else if (isSameProject) {
                    destUUID = fetchUUID4VN(response, destVN.join(':'));
                    if (destUUID == null) {
                        $('#pcapModal').modal('hide');
                        showInfoWindow('UUID of virtual network not found.', 'Error');
                    } else {
                        analyzerRuleParams['srcVNUUID'] = srcUUID;
                        analyzerRuleParams['destVNUUID'] = destUUID;
                        startPCAP4FlowSuccessCB(cbParams);
                    }
                } else {
                    $.ajax({
                        url: destUrl,
                        dataType: "json",
                        success: function (response) {
                            destUUID = fetchUUID4VN(response, destVN.join(':'));
                            if (destUUID == null) {
                                $('#pcapModal').modal('hide');
                                showInfoWindow('UUID of virtual network not found.', 'Error');
                            } else {
                                analyzerRuleParams['srcVNUUID'] = srcUUID;
                                analyzerRuleParams['destVNUUID'] = destUUID;
                                startPCAP4FlowSuccessCB(cbParams);
                            }
                        },
                        error: function () {
                            $('#pcapModal').modal('hide');
                            showInfoWindow('Error in getting UUID of virtual network.', 'Error');
                        }
                    });
                }
            },
            error: function () {
                $('#pcapModal').modal('hide');
                showInfoWindow('Error in getting UUID of virtual network.', 'Error');
            }
        });
    } else {
        $('#pcapModal').modal('hide');
        showInfoWindow(response.message, 'Message');
    }
}

function startPCAP4FlowSuccessCB(cbParams) {
    var analyzerPolicy, analyzerRuleParams = cbParams['secondCBParams']['analyzerRuleParams'],
        closePostData = {'action': 'stop', 'analyzerRuleParams': analyzerRuleParams},
        secondCBParams = cbParams['secondCBParams'],
        firstCBParams = cbParams['firstCBParams'];
    cbParams['closePostData'] = closePostData;
    analyzerRuleParams['domain'] = firstCBParams['domain'];
    analyzerRuleParams['project'] = firstCBParams['project'];
    analyzerRuleParams['analyzerNameFQN'] = firstCBParams['defaultPCAPAnalyzerFQN'];
    analyzerRuleParams['analyzerName'] = firstCBParams['defaultPCAPAnalyzer'];
    if (firstCBParams['defaultPCAPAnalyzerPolicyUUID'] == null) {
        analyzerPolicy = getNewPCAPAnalyzerPolicy(analyzerRuleParams);
        doAjaxCall("/api/tenants/config/policys", "POST", JSON.stringify(analyzerPolicy), "getFlowAnalyzerVNCUrl", "createPCAPRuleFailureCB", null, cbParams);
    } else {
        closePostData['defaultPCAPAnalyzerPolicyUUID'] = firstCBParams['defaultPCAPAnalyzerPolicyUUID'];
        secondCBParams['defaultPCAPAnalyzerPolicyUUID'] = firstCBParams['defaultPCAPAnalyzerPolicyUUID'];
        createPCAPModal('editPacketCapture4Flows', closePostData, 'Flow Packet Capture');
        cbParams['action'] = 'start';
        editPacketCapture4Flows(cbParams);
    }
};

function fetchUUID4VN(vnJSON, vn) {
    var vnList = vnJSON['virtual-networks'],
        count = vnList.length, vnName, uuid = null;
    for (var i = 0; i < count; i++) {
        vnName = vnList[i]['fq_name'].join(':');
        if (vnName == vn) {
            uuid = vnList[i]['uuid'];
            break;
        }
    }
    return uuid;
};

function startPCAP4FlowFailureCB() {
    $('#pcapModal').modal('hide');
};

function editPCAP4FlowsFailureCB(error) {
    $('#pcapModal').modal('hide');
    console.log('Error: ' + JSON.stringify(error));
    showInfoWindow('Error in editing configuration of packet-capture for flow.', 'Error');
};

function createPCAPRuleFailureCB() {
    $('#pcapModal').modal('hide');
};

function getNewPCAPAnalyzerPolicy(analyzerPolicyParams) {
    var domain = analyzerPolicyParams.domain, project = analyzerPolicyParams.project,
        srcVN = analyzerPolicyParams.srcVN, destVN = analyzerPolicyParams.destVN,
        srcPort = analyzerPolicyParams.srcPorts, destPort = analyzerPolicyParams.destPorts,
        srcVNUUID = analyzerPolicyParams.srcVNUUID, destVNUUID = analyzerPolicyParams.destVNUUID,
        protocol = getProtocolName(analyzerPolicyParams.protocol),
        direction = analyzerPolicyParams.direction, vnBackrefs, srcPorts, destPorts;

    srcPorts = (srcPort != 0) ? (srcPort + '-' + srcPort) : 'any';
    destPorts = (destPort != 0) ? (destPort + '-' + destPort) : 'any';

    var mirrorTo = analyzerPolicyParams.analyzerNameFQN;

    var analyzerPolicy = {}, rule = {};

    analyzerPolicy["network-policy"] = {};
    analyzerPolicy["network-policy"]["parent_type"] = "project";
    analyzerPolicy["network-policy"]["fq_name"] = [];
    analyzerPolicy["network-policy"]["fq_name"][0] = domain;
    analyzerPolicy["network-policy"]["fq_name"][1] = project;
    analyzerPolicy["network-policy"]["fq_name"][2] = getDefaultAnalyzerPolicyName(analyzerPolicyParams.analyzerName);

    analyzerPolicy["network-policy"]["virtual_network_back_refs"] = [];
    vnBackrefs = analyzerPolicy["network-policy"]["virtual_network_back_refs"];
    createPolicyVNBackrefs(vnBackrefs, srcVNUUID, srcVN);
    createPolicyVNBackrefs(vnBackrefs, destVNUUID, destVN);

    analyzerPolicy["network-policy"]["network_policy_entries"] = {};
    analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"] = [];
    analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"][0] = rule;

    if (direction != "<>" && direction != ">") {
        direction = "<>";
    }

    rule["application"] = [];
    rule["rule_sequence"] = {};
    rule["rule_sequence"]["major"] = -1;
    rule["rule_sequence"]["minor"] = -1;
    rule["direction"] = direction;
    rule["protocol"] = protocol.toLowerCase();
    rule["action_list"] = {};
    rule["action_list"]["simple_action"] = null;
    rule["action_list"]["gateway_name"] = null;
    rule["action_list"]["service_chain_type"] = null;

    rule["action_list"]["mirror_to"] = {};
    rule["action_list"]["mirror_to"]["analyzer_name"] = mirrorTo;

    populateAddressesInRule("src", rule, srcVN);
    populateAddressesInRule("dst", rule, destVN);
    populatePortsInRule("src", rule, srcPorts);
    populatePortsInRule("dst", rule, destPorts);

    return analyzerPolicy;
};

function createPCAPAnalyzerPolicyRule(analyzerPolicy, analyzerPolicyParams) {
    var srcVN = analyzerPolicyParams.srcVN, destVN = analyzerPolicyParams.destVN,
        srcPort = analyzerPolicyParams.srcPorts, destPort = analyzerPolicyParams.destPorts,
        srcVNUUID = analyzerPolicyParams.srcVNUUID, destVNUUID = analyzerPolicyParams.destVNUUID,
        protocol = getProtocolName(analyzerPolicyParams.protocol),
        mirrorTo = analyzerPolicyParams.analyzerNameFQN,
        direction = analyzerPolicyParams.direction, vnBackrefs, srcPorts, destPorts, policyRules, newRule = {};

    srcPorts = (srcPort != 0) ? (srcPort + '-' + srcPort) : 'any';
    destPorts = (destPort != 0) ? (destPort + '-' + destPort) : 'any';

    vnBackrefs = analyzerPolicy["network-policy"]["virtual_network_back_refs"];

    createPolicyVNBackrefs(vnBackrefs, srcVNUUID, srcVN);
    createPolicyVNBackrefs(vnBackrefs, destVNUUID, destVN);

    policyRules = analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"];
    analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"][policyRules.length] = newRule;

    if (direction != "<>" && direction != ">") {
        direction = "<>";
    }

    newRule["application"] = [];
    newRule["rule_sequence"] = {};
    newRule["rule_sequence"]["major"] = -1;
    newRule["rule_sequence"]["minor"] = -1;
    newRule["direction"] = direction;
    newRule["protocol"] = protocol.toLowerCase();
    newRule["action_list"] = {};
    newRule["action_list"]["simple_action"] = null;
    newRule["action_list"]["gateway_name"] = null;
    newRule["action_list"]["service_chain_type"] = null;

    newRule["action_list"]["mirror_to"] = {};
    newRule["action_list"]["mirror_to"]["analyzer_name"] = mirrorTo;

    populateAddressesInRule("src", newRule, srcVN);
    populateAddressesInRule("dst", newRule, destVN);
    populatePortsInRule("src", newRule, srcPorts);
    populatePortsInRule("dst", newRule, destPorts);
};

function createPolicyVNBackrefs(vnBackrefs, vnUUID, vnFQN) {
    var counter = vnBackrefs.length, isPresent = false;
    for (var i = 0; i < counter; i++) {
        if (vnBackrefs[i]["attr"]["timer"] != null && vnBackrefs[i]["uuid"] == vnUUID) {
            isPresent = true;
            break;
        }
    }
    if (!isPresent) {
        vnBackrefs[counter] = {};
        vnBackrefs[counter]["attr"] = {};
        vnBackrefs[counter]["attr"]["timer"] = {"start_time": ""};
        vnBackrefs[counter]["attr"]["sequence"] = null;
        vnBackrefs[counter]["uuid"] = vnUUID;
        vnBackrefs[counter]["to"] = vnFQN.split(':');
    }
};

function getDefaultAnalyzerPolicyName(analyzerName) {
    var policyName = null;
    if (analyzerName) {
        analyzerName = analyzerName.trim().replace(' ', '-');
        policyName = 'default-analyzer-' + analyzerName + '-policy';
    }
    return policyName;
};

function populateAddressesInRule(type, rule, vn) {
    var addressType = type + "_addresses";
    rule[addressType] = [];
    rule[addressType][0] = {};
    rule[addressType][0]["security_group"] = null;
    rule[addressType][0]["subnet"] = null;
    if (vn && vn !== "") {
        if ("any" === vn.toLowerCase()) {
            rule[addressType][0]["virtual_network"] = "any";
        } else {
            rule[addressType][0]["virtual_network"] = vn;
        }
    }
};

function getDirection4Policy(direction) {
    if (direction == 'egress') {
        return '>';
    } else {
        return '<>';
    }
}

function populatePortsInRule(type, rule, ports) {
    var portType = type + "_ports",
        startPortsArray = [], endPortsArray = [];
    var startPorts = getStartPort(ports);
    if (startPorts != -1) {
        startPortsArray = startPorts.split(",");
    }

    var endPorts = getEndPort(ports);
    if (endPorts != -1) {
        endPortsArray = endPorts.split(",");
    }

    if (startPortsArray != -1 && endPortsArray != -1 && startPortsArray.length > 0 && endPortsArray.length > 0) {
        rule[portType] = [];
        if (checkValidPortRange(startPortsArray, endPortsArray, type == 'src' ? true : false) === true) {
            for (var j = 0; j < startPortsArray.length; j++) {
                rule[portType][j] = {};
                rule[portType][j]["start_port"] = parseInt(startPortsArray[j]);
                rule[portType][j]["end_port"] = parseInt(endPortsArray[j]);
            }
        }
    } else {
        rule[portType] = [
            {}
        ];
        rule[portType][0]["start_port"] = -1;
        rule[portType][0]["end_port"] = -1;
    }
};

function showUnderlayPaths(data) {
    var currentUrlHashObj = layoutHandler.getURLHashObj(),
        currentPage = currentUrlHashObj.p,
        currentParams = currentUrlHashObj.q;
        var params = {};
        params.srcIP = data.sourceip;
        params.destIP = data.destip;
        params.srcVN = data.sourcevn;
        params.destVN = data.destvn;
        params.sport = data.sport;
        params.dport = data.dport;
        params.protocol = data.protocol;
        params.direction = (data.direction_ing === 0) ? "egress" : "ingress";
        if(data.hasOwnProperty('startTime') && data.hasOwnProperty('endTime')) {
            params['startTime'] = data['startTime'];
            params['endTime'] = data['endTime'];
        } else {
            params['minsSince'] = 300;
        }
        if(currentPage == 'mon_infra_underlay') {
            var progressBar = $("#network_topology").find('.topology-visualization-loading');
            $(progressBar).show();
            $(progressBar).css('margin-bottom',$(progressBar).parent().height());
            
        }
        switch(currentPage) {
            case 'mon_infra_underlay':
                var cfg = {
                    url     : "/api/tenant/networking/underlay-path",
                    type    : "POST",
                    data    : {data: params},
                    callback : function(response) {
                        $("#network_topology").find('.topology-visualization-loading').hide();
                        underlayRenderer.getView().highlightPath(response, {data: params});
                    },
                    failureCallback: function(err) {
                        $("#network_topology").find('.topology-visualization-loading').hide();
                        $("#underlay_topology").html('Error in fetching details');
                    }
                };
                underlayRenderer.getController().getModelData(cfg);
                break;
            case 'query_flow_records':
                layoutHandler.setURLHashParams(params,{p:'mon_infra_underlay',merge:false});
                break;
        }
}
