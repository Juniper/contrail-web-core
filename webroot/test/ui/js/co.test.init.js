/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cowc, cowu, cowf, cowl, cowch, cowm, cotu, cotc, covdc;

var allTestFiles = [], windowKarma = window.__karma__;

for (var file in windowKarma.files) {
    if (/\.test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery', 'underscore', 'validation', 'core-constants', 'core-utils',
    'core-formatters', 'core-messages', 'core-views-default-config', 'core-labels', 'knockout', 'core-cache',

    'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',

    'core-basedir/js/common/qe.utils',
    'core-basedir/js/common/qe.model.config',
    'core-basedir/js/common/qe.grid.config',
    'core-basedir/js/common/qe.parsers',
    'core-basedir/js/common/chart.utils',

    'co-test-utils', 'co-test-constants',

    'layout-handler', 'joint.contrail', 'text', 

];

var testAppConfig = {
    featurePkg: '',
    featuresDisabled: '',
    webServerInfo: ''
};

var bundles = (globalObj['env'] == 'prod') ? coreBundles :  {};

requirejs.config({
    bundles: bundles
});

function setFeaturePkgAndInit(featurePkg, coreTestMockData) {
    var featurePkgObj = {};
    switch (featurePkg) {
        case 'webController':
            featurePkgObj.featurePkg = 'webControllerMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'ctWebServerInfoMockData';
            break;

        case 'webStorage':
            featurePkgObj.featurePkg = 'webStorageMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'sWebServerInfoMockData';
            break;

        case 'serverManager':
            featurePkgObj.featurePkg = 'serverManagerMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'smWebServerInfoMockData';
            break;

        case 'testLibApi':
            return testLibApiAppInit({});

    }
    testAppConfig.featurePkg = JSON.stringify(coreTestMockData[featurePkgObj.featurePkg]);
    testAppConfig.featuresDisabled = JSON.stringify(coreTestMockData[featurePkgObj.featuresDisabled]);
    testAppConfig.webServerInfo = JSON.stringify(coreTestMockData[featurePkgObj.webServerInfo]);

    testAppInit(testAppConfig);
}
/**
 * For base unit tests, since modules are not loaded via menu hash we will call this
 * manually to load the feature level packages.
 * @param featurePackages
 */
var loadFeatureApps = function (featurePackages) {
    var featureAppDefObjList= [],
        initAppDefObj, url;

    for (var key in featurePackages) {
        if(featurePackages[key] && key == FEATURE_PCK_WEB_CONTROLLER) {
            url = ctBaseDir + '/common/ui/js/controller.app.js';
            if(globalObj['loadedScripts'].indexOf(url) == -1) {
                initAppDefObj = $.Deferred();
                featureAppDefObjList.push(initAppDefObj);
                globalObj['initFeatureAppDefObjMap'][key] = initAppDefObj;
                featureAppDefObjList.push(loadUtils.getScript(url));
            }
        } else if (featurePackages[key] && key == FEATURE_PCK_WEB_SERVER_MANAGER) {
            url = smBaseDir + '/common/ui/js/sm.app.js';
            if(globalObj['loadedScripts'].indexOf(url) == -1) {
                initAppDefObj = $.Deferred();
                featureAppDefObjList.push(initAppDefObj);
                globalObj['initFeatureAppDefObjMap'][key] = initAppDefObj;
                featureAppDefObjList.push(loadUtils.getScript(url));
            }
        }  else if (featurePackages[key] && key == FEATURE_PCK_WEB_STORAGE) {
            url = strgBaseDir + '/common/ui/js/storage.app.js';
            if(globalObj['loadedScripts'].indexOf(url) == -1) {
                initAppDefObj = $.Deferred();
                featureAppDefObjList.push(initAppDefObj);
                globalObj['initFeatureAppDefObjMap'][key] = initAppDefObj;
                featureAppDefObjList.push(loadUtils.getScript(url));
            }
        }
    }

    //Where isInitFeatureAppInProgress used
    if(featureAppDefObjList.length > 0) {
        globalObj['isInitFeatureAppInProgress'] = true;
    }

    $.when.apply(window, featureAppDefObjList).done(function () {
        globalObj['isInitFeatureAppInProgress'] = false;
        globalObj['isInitFeatureAppComplete'] = true;
        globalObj['featureAppDefObj'].resolve();
        // self.featureAppDefObj.resolve();
    });
};

function testAppInit(testAppConfig) {

    function loadAjaxRequest(ajaxCfg,callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',ajaxCfg['url']);
        xhr.send(null);
        xhr.onload(function(response) {
            callback(response);
        });

    }
    var orchPrefix = window.location.pathname;
    //Even with URL as <https://localhost:8143>,pahtname is returning as "/"
    if(orchPrefix == "/")
        orchPrefix = "";
    built_at = "";

    (function() {
        var menuXMLLoadDefObj,layoutHandlerLoadDefObj,featurePkgs;
        loadUtils = {
            getScript: function(url, callback) {
                var scriptPath = url + '?built_at=' + built_at;
                globalObj['loadedScripts'].push(url);
                return $.ajax({
                    type: "GET",
                    url: scriptPath,
                    success: callback,
                    dataType: "script",
                    cache: true
                }).fail(function() {
                    console.info("Error in fetching script",url);
                });
            },
            getCookie: function(name) {
                if(name != null) {
                    var cookies = document.cookie.split(";");
                    for (var i = 0; i < cookies.length; i++) {
                        var x = cookies[i].substr(0, cookies[i].indexOf("="));
                        var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                        x = x.replace(/^s+|s+$/g, "").trim();
                        if (x == name)
                            return unescape(y);
                    }
                }
                return false;
            },
            postAuthenticate: function(response) {
                require(['jquery'],function() {
                    //To fetch alarmtypes
                    require(['core-alarm-utils'],function() {});
                    $('#signin-container').empty();
                    //If #content-container already exists,just show it
                    if($('#content-container').length == 0) {
                        $('#app-container').html($('#app-container-tmpl').text());
                        $('#app-container').removeClass('hide');
                    } else 
                        $('#app-container').removeClass('hide');
                    globalObj['webServerInfo'] = loadUtils.parseWebServerInfo(response);
                    webServerInfoDefObj.resolve();

                    // if (loadUtils.getCookie('username') != null) {
                    //     $('#user_info').text(loadUtils.getCookie('username'));
                    // }
                    // $('#user-profile').show();
                    $.when.apply(window,[menuXMLLoadDefObj,layoutHandlerLoadDefObj]).done(function(menuXML) {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        require(['core-bundle'],function() {
                            layoutHandler.load(menuXML);
                        });
                    });
                });
            },
            getWebServerInfo: function() {
                $.ajax({
                    url: '/api/service/networking/web-server-info',
                    type: "GET",
                    dataType: "json"
                }).done(function (response,textStatus,xhr) {
                    globalObj['webServerInfo'] = response;
                    webServerInfoDefObj.resolve();
                }).fail(function(response) {
                    console.info(response);
                    loadUtils.onAuthenticationReq();
                });
            },
            fetchMenu: function(menuXMLLoadDefObj) {
                $.ajax({
                    url: '/menu',
                    type: "GET",
                    dataType: "xml"
                }).done(function (response,textStatus,xhr) {
                    menuXML = response;
                    menuXMLLoadDefObj.resolve(menuXML);
                }).fail(function(response) {
                    console.info(response);
                    loadUtils.onAuthenticationReq();
                });
            },
            isAuthenticated: function(successCB) {
                Ajax.request(orchPrefix + '/isauthenticated',"GET",null,function(response) {
                    if(response != null && response.isAuthenticated == true) {
                        loadUtils.postAuthenticate(response);
                    } else {
                        loadUtils.onAuthenticationReq();
                    }
                    featurePkgs = response['featurePkg'];
                    require(['jquery'],function() {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();

                        // Call success callback if exist.
                        successCB ? successCB(featurePkgs) : loadFeatureApps(featurePkgs);
                    });
                });
            },
            parseWebServerInfo: function(webServerInfo) {
                if (webServerInfo['serverUTCTime'] != null) {
                    webServerInfo['timeDiffInMillisecs'] = webServerInfo['serverUTCTime'] - new Date().getTime();
                    if (Math.abs(webServerInfo['timeDiffInMillisecs']) > globalObj['timeStampTolerance']) {
                        if (webServerInfo['timeDiffInMillisecs'] > 0) {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(), new XDate(webServerInfo['serverUTCTime']), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        } else {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(webServerInfo['serverUTCTime']), new XDate(), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        }
                    }
                }
                return webServerInfo;
            }
        }
        requirejs(['text!menu.xml',
            'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',
            'co-test-utils',
            'co-test-constants',
            'co-test-messages',
            'co-test-runner',
            'jquery'
        ], function (menuXML,CoreCommonTmpl,cotu,cotc) {
            // var fakeServer = sinon.fakeServer.create();
            // fakeServer.autoRespond = true;
            // fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/admin/webconfig/featurePkg/webController'),
            //     [200, {"Content-Type": "application/json"}, testAppConfig.featurePkg]);
            // fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/admin/webconfig/features/disabled'),
            //     [200, {"Content-Type": "application/json"}, testAppConfig.featuresDisabled]);
            // fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/service/networking/web-server-info'),
            //     [200, {"Content-Type": "application/json"}, testAppConfig.webServerInfo]);
            // fakeServer.respondWith("GET", cotu.getRegExForUrl('/menu'),
            //     [200, {"Content-Type": "application/xml"}, menuXML]);

            
            //Load feature apps
            if(globalObj['featureAppDefObj'] == null)
                globalObj['featureAppDefObj'] = $.Deferred();

            menuXMLLoadDefObj = $.Deferred();
            layoutHandlerLoadDefObj = $.Deferred();
            webServerInfoDefObj = $.Deferred();

            globalObj['webServerInfo'] = JSON.parse(testAppConfig.webServerInfo);
            webServerInfoDefObj.resolve();

            globalObj['layoutDefObj'] = $.Deferred();

            require([
                'underscore', 'validation', 'knockout', 'jquery-dep-libs', 'chart-libs', 'nonamd-libs'
            ], function (_, validation, ko) {
                //_ is already noConflict with require config init.
                window.kbValidation = validation;
                window.ko = ko;

                SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (toElement) {
                        return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
                    };

                // Before we load the feature apps, Core app skeleton and helpers must be loaded.
                function loadCoreAndFeatureApps(featurePkgs) {
                    require(['core-bundle'], function () {
                        require(['core-utils'], function (CoreUtils) {
                            cowu = new CoreUtils();
                            //Proceed with loading layout.
                            require([
                                'layout-handler', 'content-handler', 'contrail-load', 'lodash'
                            ], function (LayoutHandler, ContentHandler, ChartUtils, _) {
                                window._ = _;
                                contentHandler = new ContentHandler();
                                initBackboneValidation();
                                initCustomKOBindings(window.ko);
                                initDomEvents();

                                $("body").addClass('navbar-fixed');
                                $("body").append(cotu.getPageHeaderHTML());
                                $("body").append(cotu.getSidebarHTML());
                                $("body").append(CoreCommonTmpl);

                                layoutHandler = new LayoutHandler();
                                layoutHandlerLoadDefObj.resolve();
                                layoutHandler.load(menuXML);

                                var cssList = cotu.getCSSList();
                                for (var i = 0; i < cssList.length; i++) {
                                    $("body").append(cssList[i]);
                                }
                                //Load all feature apps now.
                                loadFeatureApps(featurePkgs);

                                requirejs(['contrail-layout'], function () {

                                    var logAllTestFiles = "Test files: ";
                                    for (var i = 0; i < allTestFiles.length; i++) {
                                        logAllTestFiles += "\n";
                                        logAllTestFiles +=  i + 1 + ") " + allTestFiles[i];
                                    }
                                    console.log(logAllTestFiles);

                                    var testFilesIndex = 0,
                                        loadTestRunner = true,
                                        testFile = allTestFiles[testFilesIndex],
                                        defObj = $.Deferred();

                                    function loadSingleFileAndStartKarma(testFile, defObj, loadTestRunner) {
                                        var startKarmaCB = function (defObj, loadTestRunner) {
                                            console.log("Loaded test file: " + testFile.split('/').pop());
                                            return window.__karma__.start(defObj, loadTestRunner);
                                        };
                                        //Clear Cookies if any exist
                                        if (document.cookie != '') {
                                            var cookies = document.cookie.split(";");
                                            for (var i = 0; i < cookies.length; i++){
                                                var cookie =  cookies[i].split("=");
                                                document.cookie = cookie[0] + "=;expires=Tue, 02 Dec 1890 00:00:01 UTC;";
                                            }
                                        }

                                        //clear the core cache
                                        cowch.reset();

                                        require([testFile], function () {
                                            requirejs.config({
                                                deps: [testFile],
                                                callback: startKarmaCB(defObj, loadTestRunner)
                                            });
                                        });

                                    }

                                    function loadNextFileOrStartCoverage() {
                                        requirejs.undef(allTestFiles[testFilesIndex]);
                                        console.log("Execution complete. Unloaded test file: " + allTestFiles[testFilesIndex].split('/').pop());
                                        console.log("----------------------------------------------------------------------------");
                                        window.QUnit.config.current = {semaphore: 1};
                                        window.QUnit.config.blocking = true;
                                        //window.QUnit.stop();
                                        testFilesIndex += 1;
                                        loadTestRunner = false;
                                        if (testFilesIndex < allTestFiles.length) {
                                            //console.log("Initializing QUnit and proceeding to next test.");
                                            window.QUnit.init();
                                            var defObj = $.Deferred();
                                            defObj.done(loadNextFileOrStartCoverage);
                                            loadSingleFileAndStartKarma(allTestFiles[testFilesIndex], defObj, loadTestRunner);
                                        }
                                        else if (testFilesIndex == allTestFiles.length) {
                                            console.log("Completed; Starting Coverage.")
                                            window.__karma__.complete({
                                                coverage: window.__coverage__
                                            });
                                        }
                                    };

                                    defObj.done(loadNextFileOrStartCoverage);

                                    loadSingleFileAndStartKarma(testFile, defObj, loadTestRunner);

                                });
                            });
                        });
                    });
                };

                // For test-env we will not authenticate.
                // Now the Core app skeleton is loaded.
                // Check if the session is authenticated; and proceed with loading core and feature apps.
                // loadUtils.isAuthenticated(loadCoreAndFeatureApps);
                loadCoreAndFeatureApps(globalObj['webServerInfo']['featurePkg']);
            });
        });
    })();
}

function testLibApiAppInit(testAppConfig) {

    require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
        window.ko = Knockout;
        window.Bezier = Bezier;

        if (document.location.pathname.indexOf('/vcenter') == 0) {
            $('head').append('<base href="/vcenter/" />');
        }

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages,
                                    CoreViewsDefaultConfig, CoreLabels, Knockout, Cache, CoreCommonTmpl,
                                    QEUtils, QEModelConfig, QEGridConfig, QEParsers, ChartUtils,
                                    CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
            covdc = new CoreViewsDefaultConfig();
            cowl = new CoreLabels();
            kbValidation = validation;
            cowch = new Cache();

            qewu = new QEUtils();
            qewmc = new QEModelConfig();
            qewgc = new QEGridConfig();
            qewp = new QEParsers();

            chUtils = new ChartUtils();

            cotu = CoreTestUtils;
            cotc = CoreTestConstants;

            $("body").addClass('navbar-fixed');
            $("body").append(cotu.getPageHeaderHTML());
            $("body").append(cotu.getSidebarHTML());
            $("body").append(CoreCommonTmpl);

            var cssList = cotu.getCSSList();

            for (var i = 0; i < cssList.length; i++) {
                $("body").append(cssList[i]);
            }
            require([allTestFiles[0]], function () {
                requirejs.config({
                    deps: [allTestFiles[0]],
                    callback: window.__karma__.start($.Deferred(), true)
                });
            });
        });
    });

}
