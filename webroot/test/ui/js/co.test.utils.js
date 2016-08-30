/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'jquery',
    'underscore',
    'co-test-messages',
    'contrail-list-model',
], function ($, _, cotm, ContrailListModel) {


    this.getRegExForUrl = function (url) {
        var regexUrlMap = {
            '/api/service/networking/web-server-info': /\/api\/service\/networking\/web-server-info.*$/,
            '/menu.xml': /\/menu.*$/
        };

        return regexUrlMap [url];
    };

    this.getNumberOfColumnsForGrid = function (viewObj) {

        var noOfColumns = 0;
        noOfColumns = viewObj.getGridConfig().columnHeader.columns.length;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.actionCell))
            noOfColumns++;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.checkboxSelectable))
            noOfColumns++;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.detail))
            noOfColumns++;
        return noOfColumns;
    };

    this.startQunitWithTimeout = function (timeoutInMilliSec) {
        window.setTimeout(function () {
            QUnit.start();
        }, timeoutInMilliSec);
    };


    this.getPageHeaderHTML = function () {
        return '<div id="pageHeader" class="navbar navbar-default ace-save-state"> ' +
            '<div id="navbar-container" class="navbar-container ace-save-state"> ' +
            '<button type="button" class="navbar-toggle menu-toggler pull-left" id="menu-toggler" data-target="#sidebar"> ' +
            '<i class="fa fa-bars"></i> ' +
            '</button> ' +
            '<div id="error-container" class="alert-error"> ' +
            '<div id="msg-container"><span class="error-font-weight">Error : </span><span id="error-msg-container"></span></div> ' +
            '<div id="error-close-icon"><button id="close-error-popup" class="btn btn-mini"><i class="fa fa-remove"></i></button></div> ' +
            '</div> ' +
            '<div id="success-msg-container"><div id="success-text-container"></div></div> ' +
            '<a href="#" class="navbar-brand"> ' +
            '<img class="logo" src="base/contrail-web-core/webroot/img/sdn-logo.png"/> ' +
            '</a> ' +
            '<ul style="width:330px" class="nav ace-nav pull-right"> ' +
            '<li id="user-profile" class="customHide pull-right"> ' +
            '<a data-toggle="dropdown" href="#" class="user-menu dropdown-toggle"> ' +
            '<i class="fa fa-user icon-only fa-2"></i> ' +
            '<span id="user_info"></span> ' +
            '<i class="fa fa-caret-down"></i> ' +
            '</a> ' +
            '<ul class="pull-right dropdown-menu dropdown-caret dropdown-closer" id="user_menu"> ' +
            '<li> ' +
            '<a id="logout"> ' +
            '<i class="fa fa-power-off"></i> Logout </a> ' +
            '</li> ' +
            '</ul> ' +
            '</li> ' +
            '<li id="region-profile"> ' +
            '<div id="regionDD" style="padding-bottom:6px"></div> ' +
            '</li> ' +
            '<li id="alarms-popup-link" onclick="cowu.loadAlertsPopup();" class="pull-right"> ' +
            '<a href="javascript:void(0);"> ' +
            '<i class="fa fa-bell icon-only fa-2"></i> ' +
            '<span id="alert_info">Alarms</span> ' +
            '</a> ' +
            '</li> ' +
            '</ul> ' +
            '</div> ' +
            '</div>';
    };

    this.getSidebarHTML = function () {
        return '<div class="main-container ace-save-state" id="main-container"> ' +
            '<div id="sidebar" class="sidebar responsive ace-save-state" data-sidebar=true" data-sidebar-scroll="true" data-sidebar-hover="true"> ' +
            '<div class="sidebar-shortcuts" id="sidebar-shortcuts"> </div> ' +
            '<ul id="menu" class="nav nav-list"></ul> ' +
            '</div> ' +
            '<div id="main-content" class="main-content"> ' +
            '<div class="main-content-inner"> ' +
            '<div id="breadcrumbs" class="breadcrumbs ace-save-state fixed"> ' +
            '<ul id="breadcrumb" class="breadcrumb"> </ul> ' +
            '<div id="page-help" class="page-help"> ' +
            '<div id="page-help-toggle-btn" class="page-help-toggle-btn"> ' +
            '<i class="page-help-toggle-text ace-icon fa fa-question bigger-150"></i> ' +
            '</div> ' +
            '</div> ' +
            '<div id="nav-search" class="nav-search"> ' +
            '<form id="search-form" onsubmit="searchSiteMap();"> ' +
            '<span class="input-icon"> ' +
            '<input id="nav-search-input" type="text" placeholder="Search Sitemap" class="input-medium search-query nav-search-input" autocomplete="off"> ' +
            '<i class="fa fa-search" id="nav-search-icon"></i> ' +
            '</span> ' +
            '</form> ' +
            '</div> ' +
            '</div> ' +
            '<div id="page-content" class="page-content"> ' +
            '<div id="content-container"></div> ' +
        '</div> ' +
        '</div> ' +
        '</div> ' +
        '</div> ' +
        '<a href="#" id="back-to-top"><i class="fa fa-angle-double-up icon-only bigger-110"></i>​&nbsp; Back to Top</a> ' +
        '<div class="page-help-container" id="page-help-container" tabindex="-1">';
    };

    this.getCSSList = function () {
        var cssList = [];
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/bootstrap/css/bootstrap.min.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/jquery-ui.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.jquery.ui.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/font-awesome.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/nvd3-v1.8.1/css/nv.d3.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/select2/styles/select2.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/datetimepicker/styles/jquery.datetimepicker.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/slickgrid/styles/slick.grid.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery/css/jquery.steps.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/contrail.init.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.theme.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.theme.layout.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.theme.elements.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.responsive.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.grid.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.form.elements.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.components.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.chart.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.graph.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.custom.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/contrail.font.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/fonts/contrailFonts.ttf"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/common/ui/css/fonts/contrailFonts.woff"/>');
        return cssList;
    };

    this.getFakeServer = function (serverConfig) {
        var fakeServer = sinon.fakeServer.create();
        fakeServer.autoRespond = (serverConfig == null || serverConfig['autoRespond'] == null) ? true : serverConfig['autoRespond'];
        fakeServer.autoRespondAfter = (serverConfig == null || serverConfig['autoRespondAfter'] == null) ? 0 : serverConfig['autoRespondAfter'];
        fakeServer.xhr.useFilters = true;

        fakeServer.xhr.addFilter(function (method, url) {
            var searchResult = url.search(/(.*\.tmpl.*)|(.*\.js.*)/);
            return searchResult == -1 ? false : true;
        });

        return fakeServer;
    };

    this.getViewConfigObj = function (viewObj) {
        if ((viewObj != null) &&
            contrail.checkIfExist(viewObj.attributes) &&
            contrail.checkIfExist(viewObj.attributes.viewConfig)) {
            return viewObj.attributes.viewConfig;
        }
    };

    this.setViewObjAndViewConfig4All = function (rootViewObj, testConfig) {
        _.each(testConfig, function (viewIdConfig) {
            viewIdConfig.viewObj = rootViewObj.viewMap[viewIdConfig.viewId];
            viewIdConfig.viewConfigObj = this.getViewConfigObj(viewIdConfig.viewObj);
        })
    };

    this.setModelObj4All = function(testConfig, done) {

        var deferredList = [];

        _.each(testConfig.tests, function(modelTestConfig) {
            var modelName = modelTestConfig.model,
                modelPathPrefix = contrail.checkIfExist(modelTestConfig['modelPathPrefix']) ? modelTestConfig['modelPathPrefix'] : 'core-basedir/js/models/',
                modelObj,
                deferredObj = $.Deferred();

            deferredList.push(deferredObj);

            deferredObj.done(function() {
                modelTestConfig.modelObj = modelObj;
            });

            require([ modelPathPrefix + modelName ], function(ModelClass) {
                modelObj = new ModelClass();
                deferredObj.resolve();
            });
        });

        $.when.apply($, deferredList).done(function () {
            done.resolve();
        });

    };

    this.setModuleObj4All = function (testConfig, done) {
        var deferredList = [];

        _.each(testConfig.tests, function (unitTestConfig) {
            var deferredObj = $.Deferred(),
                loadModule = false,
                module, moduleObj;

            unitTestConfig.moduleObj = null;

            if (contrail.checkIfExist(unitTestConfig.moduleId)) {
                module = unitTestConfig.moduleId;
                loadModule = true;
            } else {
                var moduleName = contrail.checkIfExist(unitTestConfig.moduleName) ? unitTestConfig.moduleName : '',
                    modulePathPrefix = contrail.checkIfExist(unitTestConfig.modulePathPrefix) ? unitTestConfig.modulePathPrefix : 'core-basedir/js/common/';
                module = modulePathPrefix + moduleName;
                loadModule = true;
            }

            deferredList.push(deferredObj);

            deferredObj.done(function () {
                unitTestConfig.moduleObj = moduleObj;
            });

            if (loadModule) {
                require([module], function (ModuleClass) {
                    moduleObj = new ModuleClass();
                    deferredObj.resolve();
                });
            } else {
                deferredObj.resolve();
            }
        });

        $.when.apply($, deferredList).done(function () {
            done.resolve();
        });
    };

    this.initFeatureModule = function (initJSFile, deferredObj) {
        var successCB = function () {
            deferredObj.resolve();
        }

        contentHandler.initFeatureModule({parents: [{init: initJSFile}]}, successCB);
    };

    this.initFeatureApp = function (featureApp, deferredObj) {
        loadFeatureApps([featureApp]);
        var featureAppDefObj = globalObj['initFeatureAppDefObjMap'][featureApp];

        setTimeout(function() {
            if(contrail.checkIfExist(featureAppDefObj)) {
                if (featureAppDefObj.state() == 'resolved') {
                    deferredObj.resolve();
                } else {
                    featureAppDefObj.done(function() {
                        deferredObj.resolve();
                    });
                }
            }
        }, 50);
    };

    this.formatTestModuleMessage = function (message, id) {
        if (message != null && id != null) {
            return message + ":" + id + " - ";
        } else {
            if (message != null) {
                return message + " - ";
            }
        }
    };

    this.getGridDataSourceWithOnlyRemotes = function (viewConfig) {
        if (viewConfig != null && contrail.checkIfExist(viewConfig.elementConfig)) {
            var dataSource = viewConfig.elementConfig['body']['dataSource'];
            //return everything except dataView, cacheConfig if exist
            if (contrail.checkIfExist(dataSource.cacheConfig)) {
                delete dataSource.cacheConfig;
            }
            if (contrail.checkIfExist(dataSource.dataView)) {
                delete dataSource.dataView;
            }
            return dataSource;
        }
    };

    this.createMockData = function (rootViewObj, testConfigObj, deferredObj) {
        var deferredList = [];
        _.each(testConfigObj, function (testConfig) {
            var defMockDataConfig = {dataGenerator: function(){return;},dataParsers:{}},
                primaryMockDataConfig;

            if (contrail.checkIfExist(testConfig.modelConfig)) {
                primaryMockDataConfig = $.extend(true, defMockDataConfig, testConfig.modelConfig);
            }

            _.each(testConfig.suites, function (suiteConfig) {
                var mockDataConfig = primaryMockDataConfig;

                if (contrail.checkIfExist(suiteConfig.modelConfig)) {
                    mockDataConfig = $.extend(true, defMockDataConfig, suiteConfig.modelConfig);
                }

                if (mockDataConfig != null) {
                    suiteConfig.modelConfig = mockDataConfig; // adding the model config to suiteConfig.
                    if (contrail.checkIfExist(mockDataConfig.dataGenerator)) {
                        var mockDataDefObj = $.Deferred();
                        deferredList.push(mockDataDefObj);
                        /**
                         * generator returns a model. if the model has promise to check if the requests are complete,
                         * we will use that promise. otherwise the promise passed on as argument will be checked.
                         */
                        var optionalDefObj = $.Deferred();
                        var onDataCompleteCB = function () {
                            suiteConfig.model = mockDataModel;
                            var mockData;
                            if (contrail.checkIfExist(mockDataModel.getItems)) {
                                mockData = mockDataModel.getItems();
                            } else {
                                if (contrail.checkIfExist(mockDataModel.attributes)) {
                                    mockData = mockDataModel.attributes;
                                }
                            }
                            if (contrail.checkIfExist(mockDataConfig.dataParsers.mockDataParseFn)) {
                                mockData = mockDataConfig.dataParsers.mockDataParseFn(mockData);
                            }
                            suiteConfig.mockData = mockData;
                            mockDataDefObj.resolve();
                        };

                        var mockDataModel = mockDataConfig.dataGenerator(testConfig.viewObj, optionalDefObj);

                        if (contrail.checkIfExist(mockDataModel.onAllRequestsComplete)) {
                            mockDataModel.onAllRequestsComplete.subscribe(onDataCompleteCB);
                            /**
                             * Sometimes the data model is retrieved via model key and
                             * all the requests are already complete
                             */
                            optionalDefObj.done(onDataCompleteCB);
                        } else {
                            optionalDefObj.done(onDataCompleteCB);
                        }

                    }
                }
            });
        });

        $.when.apply($, deferredList).done(function () {
            deferredObj.resolve();
        });
    };


    return {
        getRegExForUrl: getRegExForUrl,
        getNumberOfColumnsForGrid: getNumberOfColumnsForGrid,
        startQunitWithTimeout: startQunitWithTimeout,
        getCSSList: getCSSList,
        getSidebarHTML: getSidebarHTML,
        getPageHeaderHTML: getPageHeaderHTML,
        getFakeServer: getFakeServer,
        getViewConfigObj: getViewConfigObj,
        setViewObjAndViewConfig4All: setViewObjAndViewConfig4All,
        setModelObj4All: setModelObj4All,
        setModuleObj4All: setModuleObj4All,
        formatTestModuleMessage: formatTestModuleMessage,
        getGridDataSourceWithOnlyRemotes: getGridDataSourceWithOnlyRemotes,
        createMockData: createMockData,
        initFeatureModule: initFeatureModule,
        initFeatureApp: initFeatureApp
    };

});
