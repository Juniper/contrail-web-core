/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'jquery',
    'underscore',
    'co-test-utils',
    'co-test-constants'
], function ($, _, cotu, cotc) {

    var defaultTestSuiteConfig = {
        class: '',
        groups: [],
        severity: cotc.SEVERITY_LOW
    };

    var createTestSuiteConfig = function (testClass, groups, severity) {
        severity = ifNull(severity, cotc.SEVERITY_LOW);
        groups = ifNull(groups, ['all']);
        return $.extend({}, defaultTestSuiteConfig, {class: testClass, groups: groups, severity: severity});
    };

    var createViewTestConfig = function (viewId, testSuiteConfig, mokDataConfig) {
        var viewTestConfig = {};
        viewTestConfig.viewId = ifNull(viewId, "");
        viewTestConfig.testSuites = [];
        if (testSuiteConfig != null) {
            _.each(testSuiteConfig, function (suiteConfig) {
                viewTestConfig.testSuites.push(suiteConfig);
            });
        }
        viewTestConfig.mockDataConfig = ifNull(mokDataConfig, {});

        return viewTestConfig;
    };

    var defaultFakeServerConfig = {
        options: {
            autoRespondAfter: 100
        },
        responses: [],
        getResponsesConfig: function () {
            return [];
        }
    };

    this.getDefaultFakeServerConfig = function () {
        return defaultFakeServerConfig;
    };

    this.createFakeServerResponse = function (respObj) {
        var defaultResponse = {
            method: 'GET',
            url: '/',
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: ''
        };
        return $.extend({}, defaultResponse, respObj);
    }

    var defaultPageConfig = {
        hashParams: {
            p: ''
        },
        loadTimeout: cotc.PAGE_LOAD_TIMEOUT
    };

    this.getDefaultPageConfig = function () {
        return defaultPageConfig;
    }

    var defaultPageTestConfig = {
        moduleId: 'Set moduleId for your Test in pageTestConfig',
        testType: 'Set type of the test',
        fakeServer: this.getDefaultFakeServerConfig(),
        page: this.getDefaultPageConfig(),
        getTestConfig: function () {
            return {};
        },
        testInitFn: function(defObj, event) {
            if (defObj) defObj.resolve();
            if (event) event.notify();
            return;
        }
    };

    this.createPageTestConfig = function (moduleId, testType, fakeServerConfig, pageConfig, getTestConfigCB, testInitFn) {
        var pageTestConfig = $.extend(true, {}, defaultPageTestConfig);
        if (moduleId != null) {
            pageTestConfig.moduleId = moduleId;
        }
        if (testType != null) {
            pageTestConfig.testType = testType;
        }
        if (fakeServerConfig != null) {
            pageTestConfig.fakeServer = $.extend({}, pageTestConfig.fakeServer, fakeServerConfig);
        }
        if (pageConfig != null) {
            pageTestConfig.page = $.extend({}, pageTestConfig.page, pageConfig);
        }
        if (getTestConfigCB != null) {
            pageTestConfig.getTestConfig = getTestConfigCB;
        }
        if (testInitFn != null) {
            pageTestConfig.testInitFn = testInitFn;
        }
        return pageTestConfig;
    };

    this.cTest = function (message, callback, severity) {
        severity = ifNull(severity, cotc.SEVERITY_LOW);
        return {
            severity: severity,
            test: function () {
                return test(message, callback);
            },
            type: cotc.TYPE_CONTRAIL_TEST
        };
    };

    var testGroup = function (name) {
        this.name = ifNull(name, '');
        this.type = cotc.TYPE_CONTRAIL_TEST_GROUP; //set constant type.
        this.tests = [];

        /**
         * test is an object of CTest.
         * @param test
         */
        this.registerTest = function (testObj) {
            if (testObj.type == cotc.TYPE_CONTRAIL_TEST) {
                this.tests.push(testObj);
            } else {
                console.log("Test should be object of type CUnit.test");
            }

        }

        this.run = function (severity) {
            _.each(this.tests, function (testObj) {
                if (severity == cotc.SEVERITY_HIGH) {
                    if (testObj.severity == cotc.SEVERITY_HIGH) {
                        testObj.test();
                    }
                } else if (severity == cotc.SEVERITY_MEDIUM) {
                    if (testObj.severity == cotc.SEVERITY_HIGH || testObj.severity == cotc.SEVERITY_MEDIUM) {
                        testObj.test();
                    }
                } else if (severity == cotc.SEVERITY_LOW) {
                    testObj.test();
                } else {
                }
            });
        };
    };

    this.createTestGroup = function (name) {
        return new testGroup(name);
    };

    var testSuite = function (name) {
        this.name = ifNull(name, '');
        this.groups = [];
        this.type = cotc.TYPE_CONTRAIL_TEST_SUITE; //set constant type.

        this.createTestGroup = function (name) {
            var group = new testGroup(name);
            this.groups.push(group);
            return group;
        };

        this.registerGroup = function (group) {
            if (group.type == cotc.TYPE_CONTRAIL_TEST_GROUP) {
                this.groups.push(group);
            } else {
                console.log("Group should be object of CUnit.testGroup.")
            }
        }

        this.run = function (groupNames, severity) {
            var self = this;
            _.each(groupNames, function (groupName) {
                if (groupName == 'all') {
                    //run all the groups.
                    _.each(self.groups, function (group) {
                        group.run(severity);
                    })

                } else {
                    //run only the group that matches name.
                    _.each(self.groups, function (group) {
                        if (group.name == groupName) {
                            group.run(severity);
                        }
                    });
                }
            });
        }
    }

    this.createTestSuite = function (name) {
        return new testSuite(name);
    }

    this.executeCommonTests = function (testConfigObj) {
        _.each(testConfigObj, function (testConfig) {
            _.each(testConfig.suites, function (suiteConfig) {
                suiteConfig.severity = cotc.RUN_SEVERITY;
                if (contrail.checkIfExist(suiteConfig.class)) {
                    var testObj;
                    if (contrail.checkIfExist(testConfig.viewObj)) {
                        testObj = testConfig.viewObj;
                    } else if (contrail.checkIfExist(testConfig.modelObj)) {
                        testObj = testConfig.modelObj;
                    } else if (contrail.checkIfExist(testConfig.moduleObj)) {
                        testObj = testConfig.moduleObj;
                    } else {
                        console.log("Missing test object. Check your page test config.");
                    }
                    suiteConfig.class(testObj, suiteConfig);
                }
            });
        });
    };

    this.executeUnitTests = function (testConfigObj) {
        _.each(testConfigObj, function (testConfig) {
            _.each(testConfig.suites, function(suiteConfig) {
                if (cotc.RUN_SEVERITY == undefined) {
                    console.error("check co.test.config and set the run_severity correctly.");
                }
                suiteConfig.severity = cotc.RUN_SEVERITY;
                if (contrail.checkIfExist(suiteConfig.class)) {
                    suiteConfig.class(testConfig.moduleObj, suiteConfig);
                }
            });
        });

    }

    /**
     * moduleId
     * fakeServer.options {}
     * fakeServer.responses
     * page.hashParams
     * page.loadTimeout
     * rootView
     * testConfig.getTestConfig()
     * @param PageTestConfig
     */
    this.startTestRunner = function (pageTestConfig) {
        var self = this,
            fakeServer = null,
            fakeServerConfig = ifNull(pageTestConfig.fakeServer, self.getDefaultFakeServerConfig());

        module(pageTestConfig.moduleId, {
            setup: function () {
                fakeServer = cotu.getFakeServer(fakeServerConfig.options);
                _.each(fakeServerConfig.responses, function (response) {
                    fakeServer.respondWith(response.method, response.url, [response.statusCode, response.headers, response.data]);
                });
                $.ajaxSetup({
                    cache: true
                });
            },
            teardown: function () {
                fakeServer.restore();
                delete fakeServer;
            }
        });

        var menuHandlerDoneCB = function () {
            asyncTest("Load and Run Test Suite: ", function (assert) {
                expect(0);
                // commenting out for now. once UT lib update get the async working.
                var done = assert.async();

                switch (pageTestConfig.testType) {
                    case cotc.VIEW_TEST:
                        self.startViewTestRunner(pageTestConfig, fakeServer, assert, done);
                        break;
                    case cotc.MODEL_TEST:
                        self.startModelTestRunner(pageTestConfig, fakeServer, done);
                        break;
                    case cotc.UNIT_TEST:
                        self.startUnitTestRunner(pageTestConfig, done);
                        break;
                    case cotc.LIB_API_TEST:
                        self.startLibTestRunner(pageTestConfig, done);
                    default:
                        console.log("Specify test type in your page test config. eg: cotc.VIEW_TEST or cotc.MODEL_TEST");
                }
            });
        };

        /**
         * sometimes menuHandler finishes loading the menu before deferredObj attaches done CB
         */
        if (menuHandler.deferredObj.state() == 'resolved') {
            menuHandlerDoneCB();
        } else {
            menuHandler.deferredObj.done(menuHandlerDoneCB);
        }

    };

    this.startViewTestRunner = function(viewTestConfig, fakeServer, assert, done) {
        if (contrail.checkIfExist(viewTestConfig.page.hashParams)) {
            var loadingStartedDefObj = loadFeature(viewTestConfig.page.hashParams);
            loadingStartedDefObj.done(function () {
                //additional fake server response setup
                var responses = viewTestConfig.fakeServer.getResponsesConfig();
                _.each(responses, function (response) {
                    fakeServer.respondWith(response.method, response.url, [response.statusCode, response.headers, response.body]);
                });

                var pageLoadTimeOut = viewTestConfig.page.loadTimeout,
                    pageLoadSetTimeoutId, pageLoadStart = new Date();

                //Safety timeout until the root view is created. will be fixed in next release.
                setTimeout(function () {
                    var testConfig = viewTestConfig.getTestConfig(),
                        testInitDefObj = $.Deferred(),
                        testStarted = false, testStartTime,
                        qunitStarted = false, qunitStartTime;

                    console.log("Configured Page Load Timeout (Max): " + pageLoadTimeOut / 1000 + "s");
                    console.log("Page Load Started: " + pageLoadStart.toString());

                    //start timer and make sure the startTest is invoked before pageLoadTimeOut.
                    //This is the max time page should wait for loading. Exit.
                    clearTimeout(pageLoadSetTimeoutId);

                    pageLoadSetTimeoutId = window.setTimeout(function () {
                        if (!testStarted && !qunitStarted) {
                            testConfig.rootView.onAllViewsRenderComplete.unsubscribe(startTest);
                            testConfig.rootView.onAllViewsRenderComplete.subscribe(startQUnit);
                            assert.ok(false, "Page should load completely within configured page load timeout");
                            if (done) done();
                        }
                    }, pageLoadTimeOut);

                    /**
                     * function to start the QUnit execution.
                     * This will be invoked once the page loading is complete and test initialization is complete.
                     * onAllViewsRenderComplete will be notified after testInitFn. subscribe to this event inside startTest.
                     */
                    function startQUnit() {
                        qunitStarted = true;
                        qunitStartTime = new Date();
                        console.log("Starting QUnit: " + qunitStartTime.toString());
                        console.log("Time taken to completely load the page: " + ((qunitStartTime.getTime() - pageLoadStart.getTime()) / 1000).toFixed(2) + "s");
                        testConfig.rootView.onAllViewsRenderComplete.unsubscribe(startQUnit);

                        if (pageLoadSetTimeoutId) {
                            window.clearTimeout(pageLoadSetTimeoutId);
                            pageLoadSetTimeoutId = undefined;
                        }

                        var mockDataDefObj = $.Deferred();
                        cotu.setViewObjAndViewConfig4All(testConfig.rootView, testConfig.tests);

                        //create and update mock data in test config
                        cotu.createMockData(testConfig.rootView, testConfig.tests, mockDataDefObj);

                        $.when(mockDataDefObj).done(function () {
                            self.executeCommonTests(testConfig.tests);
                            QUnit.start();
                            if (done) done();
                            //uncomment following line to console all the fake server request/responses
                            //console.log(fakeServer.requests);
                        });
                    }

                    /**
                     * function to start the Test.
                     * invoked once the page load is complete. Test initialization can also trigger more loading.
                     * call startQUnit once render complete.
                     */
                    function startTest() {
                        testStarted = true;
                        testStartTime = new Date();
                        console.log("Starting Test Execution: " + testStartTime.toString());

                        //Remove the startTest from firing again on views renderComplete.
                        testConfig.rootView.onAllViewsRenderComplete.unsubscribe(startTest);

                        /**
                         * testInitFn can have async calls and multiple view rendering.
                         * subscribe to onAllViewsRenderComplete to start the QUnit
                         * listening on testInitDefObj is not reliable as view rendering can take time.
                         */
                        testConfig.rootView.onAllViewsRenderComplete.subscribe(startQUnit);
                        //$.when(testInitDefObj).done(startQUnit);
                        viewTestConfig.testInitFn(testInitDefObj, testConfig.rootView.onAllViewsRenderComplete);
                    }

                    //Initial Page loading.
                    //Check if render is active or any active ajax request. Subscribe to onAllViewsRenderComplete
                    testConfig.rootView.onAllViewsRenderComplete.subscribe(startTest);

                }, 10);
            });
        } else {
            console.log("Requires hash params to load the test page. Update your page test config.");
        }

    };

    this.startModelTestRunner = function(pageTestConfig, fakeServer, done) {

        //additional fake server response setup
        var responses = pageTestConfig.fakeServer.getResponsesConfig();
        _.each(responses, function (response) {
            fakeServer.respondWith(response.method, response.url, [response.statusCode, response.headers, response.body]);
        });

        //TODO Remove the page timeout usage
        var pageLoadTimeOut = pageTestConfig.page.loadTimeout;

        setTimeout(function () {
            var modelTestConfig = pageTestConfig.getTestConfig();
            var modelObjDefObj = $.Deferred();

            cotu.setModelObj4All(modelTestConfig, modelObjDefObj);

            $.when(modelObjDefObj).done(function() {
                pageTestConfig.testInitFn();
                self.executeCommonTests(modelTestConfig.tests);
                QUnit.start();
                if (done) done();
            });
        }, pageLoadTimeOut);
    };

    this.startUnitTestRunner = function(pageTestConfig, done) {
        var self = this,
            moduleDefObj = $.Deferred(),
            testInitDefObj = $.Deferred(),
            unitTestConfig = pageTestConfig.getTestConfig();

        module(ifNull(pageTestConfig.moduleId, "Unit Test Module"));

        if (contrail.checkIfExist(pageTestConfig.testInitFn)) {
            pageTestConfig.testInitFn(testInitDefObj);
        } else {
            testInitDefObj.resolve();
        }

        $.when(testInitDefObj).done(function() {
            cotu.setModuleObj4All(unitTestConfig, moduleDefObj);
            $.when(moduleDefObj).done(function() {
                expect(0);
                self.executeUnitTests(unitTestConfig.tests);
                QUnit.start();
                if (done) done();
            });
        });
    };

    this.startLibTestRunner = function(libTestConfig, done) {
        var self = this;
        var testInitDefObj = $.Deferred();

        module(ifNull(libTestConfig.moduleId, "Library API Test Module"));

        asyncTest("Start Library Tests - " + ifNull(libTestConfig.libName, ""), function (assert) {
            expect(0);
            libTestConfig.testInitFn(testInitDefObj);
            var libTests = libTestConfig.getTestConfig();
            setTimeout(function() {
                self.executeLibTests(libTests);
                QUnit.start();
                if (done) done();
            }, 1000);

        });
    };

    return {
        getDefaultFakeServerConfig: getDefaultFakeServerConfig,
        createFakeServerResponse: createFakeServerResponse,
        getDefaultPageConfig: getDefaultPageConfig,
        createTestSuiteConfig: createTestSuiteConfig,
        createViewTestConfig: createViewTestConfig,
        createPageTestConfig: createPageTestConfig,
        executeCommonTests: executeCommonTests,
        executeUnitTests: executeUnitTests,
        executeLibTests: executeUnitTests,
        test: cTest,
        createTestGroup: createTestGroup,
        createTestSuite: createTestSuite,
        startTestRunner: startTestRunner,
        startViewTestRunner: startViewTestRunner,
        startModelTestRunner: startModelTestRunner,
        startLibTestRunner: startLibTestRunner,
        startUnitTestRunner: startUnitTestRunner
    };
});
