var httpsOp = require('../../../common/httpsoptions.api');
var global = require('../../../common/global');
var mockData = require('./httpsoptions.api_mock');
var config = require('../../../../../config/config.global');

function initIdentityHttpsConfig ()
{
    config.identityManager.authProtocol = 'https';
    config.identityManager.strictSSL = false;
    config.identityManager.ca = '';
}

test('updateHttpsSecureOptions', function() {
    var options = {};
    options['headers'] = {};
    initIdentityHttpsConfig();
    options = httpsOp.updateHttpsSecureOptions(global.label.IDENTITY_SERVER,
                                               options);
    deepEqual(options, mockData.updateHttpsOptions_OUT, 
              "https options for Identity Server");
});

test('getProtocolByAPIType', function() {
    initIdentityHttpsConfig();
    var proto = getProtocolByAPIType(global.label.IDENTITY_SERVER);
    equal(proto, 'https', "Expecting Identity Server protocol 'https'");
    delete config.identityManager.authProtocol;
    var proto = getProtocolByAPIType(global.label.IDENTITY_SERVER);
    equal(proto, 'http', "Expecting Identity Server protocol 'http'");
});

test('getOrchModuleByAPIType', function() {
    equal(httpsOp.getOrchModuleByAPIType(global.label.COMPUTE_SERVER), 
          'computeManager', "Expecting to be OrchModel - Compute");
    equal(httpsOp.getOrchModuleByAPIType("abc"),
          null, "Expecting to be OrchModel - Compute");
});

