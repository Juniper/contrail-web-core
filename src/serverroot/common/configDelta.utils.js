var commonUtils = require('../utils/common.utils');

var configJsonModifyObj = {
    'virtual-network': {
        'preProcessJSONDiff': modifyConfigData,
        'optFields': ['virtual_network_properties',
            'network_ipam_refs', 'network_policy_refs',
            'route_target_list', 'floating_ip_pools'],
        'mandateFields': ['fq_name', 'uuid']
    },
    'network-ipam': {
        'optFields': ['network_ipam_mgmt', 'virtual_DNS_refs'],
        'mandateFields': ['fq_name', 'uuid']
    }
};

var configArrSkipObjs = ['href', 'uuid'];

function configArrAttrFound (configObj)
{
    for (key in configObj) {
        if (key == 'attr') {
            return true;
        }
    }
    return false;
}

function modifyConfigData (type, configData, optFields, mandateFields)
{
    var newConfigData = commonUtils.cloneObj(configData[type]);
    var optFieldsLen = 0;
    if (null != optFields) {
        optFieldsLen = optFields.length;
    }
    var configArrSkipObjsLen = configArrSkipObjs.length;
    for (var i = 0; i < optFieldsLen; i++) {
        if (newConfigData[optFields[i]] instanceof Array) {
            var newConfigDataFieldsLen = newConfigData[optFields[i]].length;
            for (var j = 0; j < newConfigDataFieldsLen; j++) {
                if (false ==
                        configArrAttrFound(newConfigData[optFields[i]][j])) {
                    continue;
                }
                for (var k = 0; k < configArrSkipObjsLen; k++) {
                    if (null != newConfigData[optFields[i]][j][configArrSkipObjs[k]]) {
                        delete newConfigData[optFields[i]][j][configArrSkipObjs[k]];
                    }
                }
            }
        }
    }
    var resultJSON = {};
    resultJSON[type] = newConfigData;
    return resultJSON;
}

exports.configJsonModifyObj = configJsonModifyObj;

