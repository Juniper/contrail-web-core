/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var nwMonApi = require('../network.mon.api');
var rest = require('../../../common/rest.api');
var configApiServer = require('../../../common/configServer.api');
var jsonData = require('./network.mon.api_mock');

opServer = rest.getAPIServer({apiName: 'test',//global.label.OPS_API_SERVER,
                              server: 'test',//config.analytics.server_ip,
                              port: 'test'});//config.analytics.server_port });

function getOpServerPagedResp (url, postData, callback)
{
    equal(5, postData['kfilt'].length, "We expect kfilt length as 5");
    equal(7, postData['cfilt'].length, "We expect cfilt length as 7");
    equal('__UNKNOWN__', postData['kfilt'][0], "We expect kfilt[0] as " +
          "__UNKNOWN__");
    equal('default-domain:admin:test', postData['kfilt'][1], "We expect kfilt[1] as " +
          "default-domain:admin:test");
    equal('default-domain:admin:test-net', postData['kfilt'][2], "We expect " +
          "kfilt[2] as default-domain:admin:test-net");
    equal('default-domain:default-project:__link_local__', postData['kfilt'][3],
          "We expect kfilt[3] as " +
          "default-domain:default-project:default-virtual-network");
    equal('default-domain:default-project:default-virtual-network',
          postData['kfilt'][4], "We expect kfilt[4] as " +
          "default-domain:default-project:default-virtual-network");
    callback(url, postData);
}

function getMockVNList (url, appData, callback)
{
    callback(null, jsonData.vnListAPIServerRespData);
}

test("network.mon.api API sortUVEList", function(assert) {
    var val1 = {};
    var val2 = {};
    val1['name'] = 'default-domain:demo:vn1';
    val2['name'] = 'default-domain:demo:vn2';
    var value = nwMonApi.sortUVEList(val1, val2);
    equal(-1, value, "We expect to be -1");
});
test("network.mon.api API getOpServerPagedResponseByLastKey", function(assert) {
    /* Override the opServer.api.post call */
    opServer.api.post = getOpServerPagedResp;
    var data = jsonData.getOpServPagedRespMockData;
    // Call the actual API to test 
    nwMonApi.getOpServerPagedResponseByLastKey(null, data['count'], data['fromConfigList'],
        data['list'], data['type'], data['filtUrl'],
        function(url, postData) {
    });
});

test("network.mon.api API getVNListByProject", function(assert) {
    configApiServer.apiGet = getMockVNList;
    var projectFqn = 'default-domain:admin';
    nwMonApi.getVNListByProject(projectFqn, null, function(err, data) {
        equal(true, data instanceof Array, "We are expecting to be of type Array");
        equal(15, data.length, "VNList count expected 15");
    });
});

test("network.mon.api API isAllowedVN", function(assert) {
    equal(true, nwMonApi.isAllowedVN('default-domain:admin', 'default-domain:admin:vn1',
                            'We expect default-domain:admin:vn1 is with fqn ' +
                            'default-domain:admin'));
});


