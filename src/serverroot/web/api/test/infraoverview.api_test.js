/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var infra = require('../infraoverview.api');
var infraCmn = require('../../../common/infra.common.api');
var jsonData = require('./infraoverview.api_mock');

test('postProcessConfigNodeSummary', function() {
     var configSummWOGenData_OP =
        infra.postProcessConfigNodeSummary(jsonData.configSummWOGenData);
     deepEqual(configSummWOGenData_OP, jsonData.configSummWOGenData_OP, 
               "Config Summary W/O Gen");
     var configSummWGenData_OP =
        infra.postProcessConfigNodeSummary(jsonData.configSummWGenData);
     deepEqual(configSummWGenData_OP, jsonData.configSummWGenData_OP, 
               "Config Summary With Gen");
});

test('postProcessConfigNodeDetails', function() {
    var configDetailsData_OP =
        infra.postProcessConfigNodeDetails(jsonData.configDetailsData, 'nodeg2');
    deepEqual(configDetailsData_OP, jsonData.configDetailsData_OP, 
              "Config Details Data");
});

test('postProcessAnalyticsNodeSummaryJSON', function() {
    var analyticsSummWOGenData_OP =
        infra.postProcessAnalyticsNodeSummaryJSON(jsonData.analyticsSummWOGenData,
                                                  null);
    deepEqual(analyticsSummWOGenData_OP, jsonData.analyticsSummWOGenData_OP,
              "Analytics Summary W/O Gen");
    var analyticsSummWGenData_OP =
        infra.postProcessAnalyticsNodeSummaryJSON(jsonData.analyticsSummWGenData,
                                                  jsonData.analyticsGenData);
    deepEqual(analyticsSummWGenData_OP, jsonData.analyticsSummWGenData_OP,
              "Analytics Summary With Gen");
});

