/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var ContentHandler = function () {
        var self = this;
        self.featureAppDefObj = $.Deferred();
        self.initFeatureAppDefObjMap = {};
        self.isInitFeatureAppComplete = false;
        self.isInitFeatureAppInProgress = false;
        self.initFeatureModuleMap = {};

        this.loadViewFromMenuObj = function (currMenuObj, resourcesDefObj, loadingStartedDefObj) {
            globalObj.currMenuObj = currMenuObj; //Store in globalObj
            try {
                self.initFeatureModule(currMenuObj, function() {
                    contentHandler.loadResourcesFromMenuObj(currMenuObj, resourcesDefObj);
                });
                resourcesDefObj.done(function () {
                    //set the global variable
                    IS_NODE_MANAGER_INSTALLED = getValueByJsonPath(globalObj, 'webServerInfo;uiConfig;nodemanager;installed', true);
                    //Cleanup the container
                    $(contentContainer).html('');

                    setTimeout(function () {
                        if ($(contentContainer).html() == '') {
                            $(contentContainer).html('<p id="content-container-loading"><i class="icon-spinner icon-spin"></i> &nbsp;Loading content ..</p>');
                        }
                    }, 2000);

                    var loaderObj = currMenuObj['loader'];

                    if(contrail.checkIfExist(loaderObj)) {
                        if (loaderObj['class'] != null && window[loaderObj['class']] != null) {
                            window[loaderObj['class']].load({
                                containerId: contentContainer,
                                hashParams: layoutHandler.getURLHashParams(),
                                function: loaderObj['function'],
                                loadingStartedDefObj: loadingStartedDefObj
                            });
                            $('#content-container-loading').remove();
                        }
                    } else {
                        $.each(getValueByJsonPath(currMenuObj, 'resources;resource', []), function (idx, currResourceObj) {
                            if (currResourceObj['class'] != null && window[currResourceObj['class']] != null) {
                                window[currResourceObj['class']].load({
                                    containerId: contentContainer,
                                    hashParams: layoutHandler.getURLHashParams(),
                                    function: currResourceObj['function'],
                                    loadingStartedDefObj: loadingStartedDefObj
                                });
                                $('#content-container-loading').remove();
                            }
                        });
                    }
                });
            } catch (error) {
                console.log(error.stack);
            }
        };

        this.loadContent = function(lastHash, currHash, loadingStartedDefObj) {
            var currPageHash = ifNull(currHash['p'], ''),
                resourcesDefObj = $.Deferred();

            if(globalObj['env'] == "test" && currPageHash == '') {
                return;
            }

            hideHardRefresh();

            if ($('.modal-backdrop').is(':visible')) {
                $('.modal-backdrop').remove();
                $('.modal').remove();
            }
            var lastPageHash = ifNull(lastHash['p'], ''),
                currPageQueryStr = ifNull(currHash['q'], {}),
                lastPageQueryStr = ifNull(lastHash['q'], {}),
                webServerInfo = globalObj['webServerInfo'];

            try {
                if (currPageHash == '') {
                    if(webServerInfo['loggedInOrchestrationMode'] == 'vcenter') {
                        //If vCenter is the only orchestration model
                        if(webServerInfo['orchestrationModel'].length == 1)
                            currPageHash = "mon_infra_dashboard";
                        else
                            currPageHash = 'mon_net_dashboard';
                    } else if(webServerInfo['featurePkg']['serverManager'] && !webServerInfo['featurePkg']['webController']) {
                        currPageHash = "setting_sm_clusters";
                    } else if($.inArray(roles['ADMIN'], webServerInfo['role']) > -1) {
                        currPageHash = "mon_infra_dashboard";
                    } else if ($.inArray(roles['TENANT'], webServerInfo['role']) > -1) {
                        currPageHash = "mon_net_dashboard";
                    }
                }
                var currMenuObj = menuHandler.getMenuObjByHash(currPageHash);
                //Toggle menu button only if there is a change in hash of main menu[Monitor/Configure/Settings/Queries]
                menuHandler.toggleMenuButton(null, currPageHash, lastPageHash);
                //If curr URL is same as default URL, remove non-menu breadcrumbs
                //Always re-load the view if menu is clicked

                //If hashchange is within the same page
                if ((lastPageHash == currPageHash) && (globalObj['menuClicked'] == null || globalObj['menuClicked'] == false)) {
                    self.initFeatureModule(currMenuObj, function() {
                        contentHandler.loadResourcesFromMenuObj(currMenuObj, resourcesDefObj);
                    });
                    resourcesDefObj.done(function() {
                        //If hashchange is within the same page
                        var currMenuObj = menuHandler.getMenuObjByHash(currPageHash),
                            loaderObj = currMenuObj['loader'];

                        if(contrail.checkIfExist(loaderObj) && window[loaderObj['class']] != null && window[loaderObj['class']]['updateViewByHash'] != null) {
                            window[loaderObj['class']].updateViewByHash(currPageQueryStr, lastPageQueryStr, currMenuObj);
                        } else {
                            $.each(currMenuObj['resources']['resource'], function(idx,currResourceObj) {
                                if (window[currResourceObj['class']] != null && window[currResourceObj['class']]['updateViewByHash'] != null) {
                                    window[currResourceObj['class']].updateViewByHash(currPageQueryStr, lastPageQueryStr, currMenuObj);
                                }
                            });
                        }

                        if(contrail.checkIfExist(loadingStartedDefObj)) {
                            loadingStartedDefObj.resolve();
                        }
                    });
                } else {
                    globalObj['menuClicked'] = false;
                    //Clean-up the oldView if present
                    if ((lastHash != null) && (lastHash['p'] != null)) {
                        var menuObj = menuHandler.getMenuObjByHash(lastHash['p']);
                        menuHandler.destroyView(menuObj);
                    }
                    var currMenuObj = menuHandler.getMenuObjByHash(currPageHash);

                    contentHandler.loadViewFromMenuObj(currMenuObj, resourcesDefObj, loadingStartedDefObj);
                }
            } catch (error) {
                console.log(error.stack);
            }
        };

        this.initFeatureModule = function (currMenuObj, loadContentCB) {
            var parents = currMenuObj['parents'],
                initJS = parents.length > 0 ? parents[parents.length - 1]['init'] : null,
                initJSPath, initStatus, deferredObj;

            if(contrail.checkIfExist(initJS)) {
                initJSPath = pkgBaseDir + initJS;
                initStatus = self.initFeatureModuleMap[initJSPath];

                if(!contrail.checkIfExist(initStatus)) {
                    deferredObj = $.Deferred();
                    initStatus = {
                        'isProgress': true,
                        'isInProgress': false,
                        'deferredObj': deferredObj
                    };

                    deferredObj.done(function() {
                        loadContentCB();
                    });

                    self.initFeatureModuleMap[initJSPath] = initStatus;

                    require([initJSPath], function() {});
                } else if(initStatus['isInProgress']) {
                    initStatus['defObject'].done(function() {
                        loadContentCB();
                    });
                } else if (initStatus['isComplete']) {
                    loadContentCB()
                }
            } else {
                loadContentCB();
            }
        },

        this.loadResourcesFromMenuObj = function (currMenuObj, resourcesDefObj) {
            var parents = currMenuObj['parents'];

            //Update page Hash only if we are moving to a different view
            var currHashObj = layoutHandler.getURLHashObj();
            if (currHashObj['p'] != currMenuObj['hash']) {
                layoutHandler.setURLHashObj({p: currMenuObj['hash'], q: currMenuObj['queryParams']});
                globalObj.hashUpdated = 1;
            }
            var resourceDefObjList = [],
                rootDir = currMenuObj['rootDir'],
                viewDeferredObjs = [];

            function loadViewResources(menuObj, hash) {
                $.each(getValueByJsonPath(menuObj, 'resources;resource', []), function (idx, currResourceObj) {
                    if (currResourceObj['view'] != null) {
                        if (!(currResourceObj['view'] instanceof Array)) {
                            currResourceObj['view'] = [currResourceObj['view']];
                        }
                        if (currResourceObj['view'] != null && currResourceObj['view'].length > 0 && currResourceObj['view'][0] != null) {
                            $.each(currResourceObj['view'], function () {
                                var viewDeferredObj = $.Deferred();
                                viewDeferredObjs.push(viewDeferredObj);
                                var viewPath = pkgBaseDir + currResourceObj['rootDir'] + '/views/' + this;
                                loadExtTemplate(viewPath, viewDeferredObj, hash);
                            });
                        }
                    }
                })
            }

            function loadTemplateResources(menuObj, hash) {
                $.each(getValueByJsonPath(menuObj, 'resources;resource', []), function (idx, currResourceObj) {
                    if (currResourceObj['template'] != null) {
                        if (!(currResourceObj['template'] instanceof Array)) {
                            currResourceObj['template'] = [currResourceObj['template']];
                        }
                        if (currResourceObj['template'] != null && currResourceObj['template'].length > 0 && currResourceObj['template'][0] != null) {
                            $.each(currResourceObj['template'], function () {
                                var viewDeferredObj = $.Deferred();
                                viewDeferredObjs.push(viewDeferredObj);
                                var viewPath = pkgBaseDir + currResourceObj['rootDir'] + '/templates/' + this;
                                loadExtTemplate(viewPath, viewDeferredObj, hash);
                            });
                        }
                    }
                })
            }

            function loadCssResources(menuObj, hash) {
                $.each(getValueByJsonPath(menuObj, 'resources;resource', []), function (idx, currResourceObj) {
                    if (currResourceObj['css'] == null)
                        return;
                    if (!(currResourceObj['css'] instanceof Array)) {
                        currResourceObj['css'] = [currResourceObj['css']];
                    }
                    $.each(currResourceObj['css'], function () {
                        var cssPath = pkgBaseDir + currResourceObj['rootDir'] + '/css/' + this;
                        if ($.inArray(cssPath, globalObj['loadedCSS']) == -1) {
                            globalObj['loadedCSS'].push(cssPath);
                            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + cssPath + "'>");
                            $('head').append(cssLink);
                        }
                    });
                });
            }

            function loadJsResources(menuObj) {
                $.each(getValueByJsonPath(menuObj, 'resources;resource', []), function (idx, currResourceObj) {
                    if (currResourceObj['js'] != null) {
                        if (!(currResourceObj['js'] instanceof Array))
                            currResourceObj['js'] = [currResourceObj['js']];
                        var isLoadFn = currResourceObj['loadFn'] != null ? true : false;
                        var isReloadRequired = true;
                        //Restrict not re-loading scripts only for monitor infrastructure and monitor networks for now
                        if (NO_RELOAD_JS_CLASSLIST.indexOf(currResourceObj['class']) != -1) {
                            isReloadRequired = false;
                        }
                        $.each(currResourceObj['js'], function () {
                            //Load the JS file only if it's not loaded already
                            //if (window[currResourceObj['class']] == null)
                            if (($.inArray(pkgBaseDir + currResourceObj['rootDir'] + '/js/' + this, globalObj['loadedScripts']) == -1) || (isLoadFn == true) || (isReloadRequired == true))
                                resourceDefObjList.push(getScript(pkgBaseDir + currResourceObj['rootDir'] + '/js/' + this));
                        });
                    }
                });
            }

            //Load the parent views
            if (parents != null && parents.length > 0) {
                $.each(parents, function (i, parent) {
                    var parentRootDir = parent['rootDir'];
                    if (parentRootDir != null || getValueByJsonPath(parent, 'resources;resource', []).length > 0) {
                        loadViewResources(parent, currMenuObj['hash']);
                        loadTemplateResources(parent, currMenuObj['hash']);
                        loadCssResources(parent, currMenuObj['hash']);
                    }
                });
            }
            //Load views required by module
            loadViewResources(currMenuObj, currMenuObj['hash']);
            //Load templates required by module
            loadTemplateResources(currMenuObj, currMenuObj['hash']);
            //Load styles required by module
            loadCssResources(currMenuObj);

            //View file need to be downloaded first before executing any JS file
            $.when.apply(window, viewDeferredObjs).done(function () {
                //Load the parent js
                if (parents != null && parents.length > 0) {
                    $.each(parents, function (i, parent) {
                        var parentRootDir = parent['rootDir'];
                        if (parentRootDir != null || getValueByJsonPath(parent, 'resources;resource', []).length > 0) {
                            loadJsResources(parent);
                        }
                    });
                }
                loadJsResources(currMenuObj);
                $.when.apply(window, resourceDefObjList).done(function () {
                    resourcesDefObj.resolve();
                });
            });
        };

        this.loadFeatureApps = function (featurePackages) {
            var featureAppDefObjList= [],
                initAppDefObj, url;

            for (var key in featurePackages) {
                if(featurePackages[key] && key == FEATURE_PCK_WEB_CONTROLLER) {
                    url = ctBaseDir + '/common/ui/js/controller.app.js';
                    if(globalObj['loadedScripts'].indexOf(url) == -1) {
                        initAppDefObj = $.Deferred();
                        featureAppDefObjList.push(initAppDefObj);
                        self.initFeatureAppDefObjMap[key] = initAppDefObj;
                        featureAppDefObjList.push(getScript(url));
                    }
                } else if (featurePackages[key] && key == FEATURE_PCK_WEB_SERVER_MANAGER) {
                    url = smBaseDir + '/common/ui/js/sm.app.js';
                    if(globalObj['loadedScripts'].indexOf(url) == -1) {
                        initAppDefObj = $.Deferred();
                        featureAppDefObjList.push(initAppDefObj);
                        self.initFeatureAppDefObjMap[key] = initAppDefObj;
                        featureAppDefObjList.push(getScript(url));
                    }
                }  else if (featurePackages[key] && key == FEATURE_PCK_WEB_STORAGE) {
                    url = sBaseDir + '/common/ui/js/storage.app.js';
                    if(globalObj['loadedScripts'].indexOf(url) == -1) {
                        initAppDefObj = $.Deferred();
                        featureAppDefObjList.push(initAppDefObj);
                        self.initFeatureAppDefObjMap[key] = initAppDefObj;
                        featureAppDefObjList.push(getScript(url));
                    }
                }
            }

            if(featureAppDefObjList.length > 0) {
                self.isInitFeatureAppInProgress = true;
            }

            $.when.apply(window, featureAppDefObjList).done(function () {
                self.isInitFeatureAppInProgress = false;
                self.isInitFeatureAppComplete = true;
                self.featureAppDefObj.resolve();
            });
        };
    }

    return ContentHandler;
});

function loadExtTemplate(path, deferredObj, containerName) {
    path = 'text!' + path;

    require([path], function(result) {
        //Add templates to DOM
        if (containerName != null) {
            $('body').append('<div id="' + containerName + '"></div>');
            $('#' + containerName).append(result);
        } else {
            $("body").append(result);
        }

        if (deferredObj != null) {
            deferredObj.resolve();
        }
    });
};