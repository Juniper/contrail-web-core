/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var rest        = require('../../../common/rest.api');
var mockData    = require('./rest.api_mock');

var restAPI = new rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                                     server:'test', port:'test'});

test('sendParsedDataToApp', function() {
    restAPI.sendParsedDataToApp(mockData.restAPIJSONResp, mockData.xml2jsSettings, null,
                                function(err, data) {
        deepEqual(data, mockData.restAPIJSONResp, "Expecting the JSON data Parse");
    });
});

