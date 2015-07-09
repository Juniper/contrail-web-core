/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore'], function (_) {

    //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
    var webServerInfoMockData = {
        "orchestrationModel": [
            "openstack"
        ],
        "serverUTCTime": 1436203008000,
        "hostName": "a7s14",
        "role": [
            "superAdmin"
        ],
        "featurePkg": {
            "webController": true,
            "webStorage": true
        },
        "uiConfig": {
            "nodemanager": {
                "installed": true
            }
        },
        "loggedInOrchestrationMode": "openstack"
    };
    return {
        webServerInfoMockData: webServerInfoMockData
    }
});