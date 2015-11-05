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
        loadTimeout: 1000
    };

    this.getDefaultPageConfig = function () {
        return defaultPageConfig;
    }

    var defaultPageTestConfig = {
        moduleId: 'Set moduleId for your Test in pageTestConfig',
        fakeServer: this.getDefaultFakeServerConfig(),
        page: this.getDefaultPageConfig(),
        getTestConfig: function () {
            return {};
        },
        testInitFn: function(defObj) {
            if (defObj) defObj.resolve();
            return;
        }
    };

    this.createPageTestConfig = function (moduleId, fakeServerConfig, pageConfig, getTestConfigCB, testInitFn) {
        var pageTestConfig = $.extend(true, {}, defaultPageTestConfig);
        if (moduleId != null) {
            pageTestConfig.moduleId = moduleId;
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
                if (contrail.checkIfExist(suiteConfig.class)) {
                    var testObj;
                    if (contrail.checkIfExist(testConfig.viewObj)) {
                        testObj = testConfig.viewObj;
                    } else if (contrail.checkIfExist(testConfig.modelObj)) {
                        testObj = testConfig.modelObj;
                    } else {
                        console.log("Missing test object. Check your page test config.");
                    }
                    suiteConfig.class(testObj, suiteConfig);
                }
            });
        });
    };

    this.executeLibTests = function (testConfig) {
        _.each(testConfig.suites, function(suiteConfig) {
            if (contrail.checkIfExist(suiteConfig.class)) {
                suiteConfig.class(suiteConfig);
            }
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
    this.startCommonTestRunner = function (pageTestConfig) {
        var self = this,
            fakeServer;

        module(pageTestConfig.moduleId, {
            setup: function () {
                fakeServer = cotu.getFakeServer(pageTestConfig.fakeServer.options);
                _.each(pageTestConfig.fakeServer.responses, function (response) {
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
            asyncTest("Load and Run Test Suite: ", function (assert) { //TODO Review the test message.
                expect(0);
                var done = assert.async();
                if (contrail.checkIfExist(pageTestConfig.page) && (pageTestConfig.page.hashParams.p != "")) {
                    self.startViewTestRunner(pageTestConfig, fakeServer, done);
                } else {
                    self.startModelTestRunner(pageTestConfig, fakeServer, done);
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

    this.startViewTestRunner = function(viewTestConfig, fakeServer, done) {
        if (contrail.checkIfExist(viewTestConfig.page.hashParams)) {
            var loadingStartedDefObj = loadFeature(viewTestConfig.page.hashParams);
            loadingStartedDefObj.done(function () {
                //additional fake server response setup
                var responses = viewTestConfig.fakeServer.getResponsesConfig();
                _.each(responses, function (response) {
                    fakeServer.respondWith(response.method, response.url, [response.statusCode, response.headers, response.body]);
                });

                var pageLoadTimeOut = viewTestConfig.page.loadTimeout;

                setTimeout(function () {
                    var testConfig = viewTestConfig.getTestConfig();
                    var testInitDefObj = $.Deferred();

                    viewTestConfig.testInitFn(testInitDefObj);
                    // testInitFn can have async calls. wait for the promise to resolve.
                    $.when(testInitDefObj).done(function() {
                        var mockDataDefObj = $.Deferred();
                        cotu.setViewObjAndViewConfig4All(testConfig.rootView, testConfig.tests);

                        //create and update mock data in test config
                        cotu.createMockData(testConfig.rootView, testConfig.tests, mockDataDefObj);

                        $.when(mockDataDefObj).done(function () {
                            //run initializations before tests if any
                            self.executeCommonTests(testConfig.tests);
                            QUnit.start();
                            done();
                            //uncomment following line to console all the fake server request/responses
                            //console.log(fakeServer.requests);
                        });
                    });
                }, pageLoadTimeOut);
            });
        } else {
            console.log("Requires hash params to load the test page. Update your page test config.");
        }

    };

    this.startModelTestRunner = function(modelTestConfig, fakeServer, done) {

        //additional fake server response setup
        var responses = modelTestConfig.fakeServer.getResponsesConfig();
        _.each(responses, function (response) {
            fakeServer.respondWith(response.method, response.url, [response.statusCode, response.headers, response.body]);
        });

        //TODO Remove the page timeout usage
        var pageLoadTimeOut = modelTestConfig.page.loadTimeout;

        setTimeout(function () {
            var testConfig = modelTestConfig.getTestConfig();
            var modelObjDefObj = $.Deferred();

            cotu.setModelObj4All(testConfig, modelObjDefObj);

            $.when(modelObjDefObj).done(function() {
                modelTestConfig.testInitFn();
                self.executeCommonTests(testConfig.tests);
                QUnit.start();
                done();
            });
        }, pageLoadTimeOut);
    };

    this.startBasicTestRunner = function(baseTestConfig) {
        var self = this;
        var testInitDefObj = $.Deferred();

        asyncTest("Start Basic Unit Tests - " + ifNull(libTestConfig.libName, ""), function (assert) {
            expect(0);
            baseTestConfig.testInitFn(testInitDefObj);

            $.when(testInitDefObj).done(function() {
                self.executeLibTests(baseTestConfig);
                QUnit.start();
            });

        });
    };

    this.startLibTestRunner = function(libTestConfig) {
        var self = this;
        asyncTest("Start Library Tests - " + ifNull(libTestConfig.libName, ""), function (assert) {
            expect(0);
            libTestConfig.testInitFn();
            setTimeout(function() {
                self.executeLibTests(libTestConfig);
                QUnit.start();
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
        executeLibTests: executeLibTests,
        test: cTest,
        createTestGroup: createTestGroup,
        createTestSuite: createTestSuite,
        startTestRunner: startCommonTestRunner,
        startCommonTestRunner : startCommonTestRunner,
        startViewTestRunner: startViewTestRunner,
        startModelTestRunner: startModelTestRunner,
        startLibTestRunner: startLibTestRunner
    };
});
