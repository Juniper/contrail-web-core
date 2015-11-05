/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'page-list-view-mock-data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite',
    'page-list-view-custom-test-suite'
], function (cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite,
             CustomTestSuite) {

    var moduleId = "Sample page test module";

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];
        /*
        //sample GET and POST fakeserver response configs.

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS),
            body: JSON.stringify(TestMockdata.networksMockData)
        }));
        */
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'page_hash',
        q: {
            view: 'viewName',
            type: 'viewType'
        }
    };
    pageConfig.loadTimeout = 2000;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'view-grid-id',
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                        {
                            class: GridListModelTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
                            /*
                            //sample model config with Fns
                            modelConfig: {
                                dataGenerator: cttu.commonGridDataGenerator,
                                dataParsers: {
                                    mockDataParseFn: cttu.deleteSizeField,
                                    gridDataParseFn: cttu.deleteSizeField
                                }
                            }*/
                        },
                        {
                            class: CustomTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                    ]
                },
                {
                    viewId: 'view-chart-id',
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        }
                    ]

                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});