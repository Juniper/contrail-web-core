/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore'], function (_) {

    //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
    var webServerInfoMockData = {
        "orchestrationModel": [
            "openstack"
        ],
        "serverUTCTime": new Date().getTime(),
        "hostName": "phantomjs",
        "role": [
            "superAdmin",
            "member"
        ],
        "featurePkg": {
            "webController": false,
            "webStorage": false,
            "serverManager": false
        },
        "uiConfig": {
            "nodemanager": {
                "installed": true
            }
        },
        "loggedInOrchestrationMode": "openstack"
    };

    var disabledFeatureMockData = {"disabled":["config_alarms","mon_infra_mx"]},
        webControllerMockData = {"webController": true},
        webStorageMockData = {"webStorage": true},
        serverManagerMockData = {"serverManager": true},
        ctWebServerInfoMockData = _.extend({}, webServerInfoMockData, {"featurePkg": { "webController": true }},{"featurePkgsInfo": { "webController": true },disabledFeatures:["config_alarms","mon_infra_mx"]}),
        smWebServerInfoMockData = _.extend({}, webServerInfoMockData, {"featurePkg": { "serverManager": true }},{"featurePkgsInfo": { "serverManager": true },disabledFeatures:["config_alarms","mon_infra_mx"]}),
        sWebServerInfoMockData = _.extend({}, webServerInfoMockData, {"featurePkg": { "webStorage": true }},{"featurePkgsInfo": { "webStorage": true },disabledFeatures:["config_alarms","mon_infra_mx"]});

    return {
        ctWebServerInfoMockData: ctWebServerInfoMockData,
        smWebServerInfoMockData: smWebServerInfoMockData,
        sWebServerInfoMockData: sWebServerInfoMockData,
        disabledFeatureMockData: disabledFeatureMockData,
        webControllerMockData: webControllerMockData,
        webStorageMockData: webStorageMockData,
        serverManagerMockData: serverManagerMockData
    }
});
