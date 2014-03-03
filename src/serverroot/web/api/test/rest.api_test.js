var rest        = require('../../../common/rest.api');
var mockData    = require('./rest.api_mock');

var restAPI = new rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                                     server:'test', port:'test'});

test('sendParsedDataToApp', function() {
    restAPI.sendParsedDataToApp(mockData.restAPIJSONResp, mockData.xml2jsSettings, null,
                                function(err, data) {
        deepEqual(data, mockData.restAPIJSONResp, "Expecting the JSON data Parse");
    });
    restAPI.sendParsedDataToApp(mockData.restAPIXMLResp, mockData.xml2jsSettings, null,
                                function(err, data) {
        deepEqual(data, mockData.restAPIXMLResp_OP, 
                  'Expecting the xml->json parse fine');
    });
});

