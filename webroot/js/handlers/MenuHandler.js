/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var MenuHandler = function () {
        var self = this, menuObj,
            initMenuDefObj = $.Deferred(),
            webServerInfoDefObj = $.Deferred();

        self.featureAppDefObj = $.Deferred();
        //onHashChange is triggered once it is resolved
        self.deferredObj = $.Deferred();

        this.loadMenu = function () {
            $.get('/menu.xml?built_at=' + built_at, function (xml) {
                $.get('/api/admin/webconfig/features/disabled?built_at=' + built_at, function (disabledFeatures) {
                    $.get('/api/admin/webconfig/featurePkg/webController?built_at=' + built_at, function (webControllPkg) {
                        menuObj = $.xml2json(xml);
                        webServerInfoDefObj.always(function () {
                            processXMLJSON(menuObj, disabledFeatures);
                            globalObj['webServerInfo']['disabledFeatures'] = ifNull(disabledFeatures, []);
                            var menuShortcuts = contrail.getTemplate4Id('menu-shortcuts')(menuHandler.filterMenuItems(menuObj['items']['item'], 'menushortcut', webControllPkg));
                            $("#sidebar-shortcuts").html(menuShortcuts);
                            ['items']['item'] = menuHandler.filterMenuItems(menuObj['items']['item']);
                            initMenuDefObj.resolve();
                        });
                    });
                })
            });
            //Add an event listener for clicking on menu items
            $('#menu').on('click', 'ul > li > a', function (e) {
                var href = $(this).attr('href');
                loadFeature($.deparam.fragment(href));
                if (!e.ctrlKey) {
                    e.preventDefault();//Stop the page to navigate to the url set in href
                }
            });
            //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (response) {
                if (response['serverUTCTime'] != null) {
                    response['timeDiffInMillisecs'] = response['serverUTCTime'] - new Date().getTime();
                    if (Math.abs(response['timeDiffInMillisecs']) > timeStampTolearence) {
                        if (response['timeDiffInMillisecs'] > 0)
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(), new XDate(response['serverUTCTime']), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        else
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(response['serverUTCTime']), new XDate(), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                    }
                    globalObj['webServerInfo'] = response;
                }
                self.loadFeatureApps(response['featurePkg']);
            }).always(function () {
                webServerInfoDefObj.resolve();
            });
            $.when.apply(window, [initMenuDefObj, webServerInfoDefObj, self.featureAppDefObj]).done(function () {
                self.deferredObj.resolve();
            });
        }

        //Filter the menu items based
        //  * allowedRolesList for each feature and comparing them with the logged-in user roles
        //  * allowedOrchestrationModels for each feature and comparing it against loggedInOrchestrationMode
        //type = menushortcut returns only the first level menu (Configure,Monitor)
        this.filterMenuItems = function (items, type, webControllerPkg) {
            if (type == null) {
                items = items.filter(function (value) {
                    var hasAccess = false;
                    hasAccess = checkForAccess(value);
                    if (value['items'] != null && value['items']['item'] instanceof Array && hasAccess)
                        value['items']['item'] = menuHandler.filterMenuItems(value['items']['item']);
                    return hasAccess;
                });
                return items;
            } else if (type == 'menushortcut') {
                var result = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = {};
                    obj['iconClass'] = items[i]['iconClass'], obj['id'] = items[i]['name'], obj['label'] = items[i]['label'];
                    /*disable config baremetal section if contrail-web-controller package is not installed and only
                     contrail-web-server-manager is installed*/
                    if (obj['id'] == 'configure' && (webControllerPkg.webController == null
                        || (webControllerPkg.webController != null && !webControllerPkg.webController.enable))) {
                        obj['cssClass'] = "disabledBtn";
                    } else {
                        /*If top level item has access tag then check for it
                         else check for the access tag in the sub menu items
                         */
                        if (items[i]['access'] != null)
                            obj['cssClass'] = checkForAccess(items[i]) ? "btn-" + items[i]['name'] : "disabledBtn";
                        else if (items[i]['items'] != null && items[i]['items']['item'] instanceof Array) {
                            var subMenu = items[i]['items']['item'], allowed = false;
                            for (var j = 0; j < subMenu.length; j++) {
                                if (subMenu[j]['access'] != null) {
                                    /*
                                     * if atleast one submenu item is allowed then menu button should not be disabled
                                     */
                                    if (checkForAccess(subMenu[j]))
                                        allowed = true;
                                    /*
                                     * if any submenu item has no access tag which mean it is accessible to everyone so menu button should not be disabled
                                     */
                                } else {
                                    allowed = true;
                                    break;
                                }
                            }
                            obj['cssClass'] = allowed ? "btn-" + items[i]['name'] : "disabledBtn";
                            //Menu with no sub items,so disabling it
                        } else
                            obj['cssClass'] = "disabledBtn";
                    }
                    result.push(obj);
                }
                return result;
            }
        }

        /*
         * This function checks whether the user(from globalObj) is permitted to view the menu item(which the parameter)
         * and returns true if permitted else false
         */
        function checkForAccess(value) {
            var roleExists = false, orchExists = false, accessFnRetVal = false;
            var orchModel = globalObj['webServerInfo']['loggedInOrchestrationMode'];
            var loggedInUserRoles = globalObj['webServerInfo']['role'];
            if (value.access != null) {
                if (value.access.roles != null) {
                    if (!(value.access.roles.role instanceof Array))
                        value.access.roles.role = [value.access.roles.role];
                    var rolesArr = value.access.roles.role;
                    var allowedRolesList = [];

                    //If logged-in user has superAdmin role,then allow all features
                    if ($.inArray(roles['ADMIN'], loggedInUserRoles) > -1) {
                        roleExists = true;
                    } else {
                        //If any one of userRole is in allowedRolesList
                        for (var i = 0; i < rolesArr.length; i++) {
                            if ($.inArray(rolesArr[i], loggedInUserRoles) > -1) {
                                roleExists = true;
                                break;
                            }
                        }
                    }
                } else
                    roleExists = true;

                if (value.access.accessFn != null) {
                    if (typeof(menuAccessFns[value.access.accessFn]) == 'function')
                        accessFnRetVal = menuAccessFns[value.access.accessFn]();
                } else
                    accessFnRetVal = true;

                if (value.access.orchModels != null) {
                    if (!(value.access.orchModels.model instanceof Array))
                        value.access.orchModels.model = [value.access.orchModels.model];
                    var orchModels = value.access.orchModels.model;

                    for (var i = 0; i < orchModels.length; i++) {
                        if ((orchModels[i] == orchModel) || ('none' == orchModel)) {
                            orchExists = true;
                        }
                    }
                } else
                    orchExists = true;
                return (roleExists && orchExists && accessFnRetVal);
            } else {
                return true;
            }
        }

        this.toggleMenuButton = function (menuButton, currPageHash, lastPageHash) {
            var currentBCTemplate = contrail.getTemplate4Id('current-breadcrumb');
            var currPageHashArray, subMenuId, reloadMenu, linkId;
            if (menuButton == null) {
                currPageHashArray = currPageHash.split('_');
                //Looks scalable only till 2nd level menu
                linkId = '#' + currPageHashArray[0] + '_' + currPageHashArray[1] + '_' + currPageHashArray[2];
                subMenuId = $(linkId).parent('ul.submenu');
                menuButton = getMenuButtonName(currPageHashArray[0]);
                //If user has switched between top-level menu
                reloadMenu = check2ReloadMenu(lastPageHash, currPageHashArray[0]);
            }
            if (reloadMenu == null || reloadMenu) {
                var menu = {};
                for (var i = 0; i < menuObj['items']['item'].length; i++) {
                    if (menuObj['items']['item'][i]['name'] == menuButton)
                        menu = menuObj['items']['item'][i];
                }
                $('#menu').html('');
                $('#menu').html(contrail.getTemplate4Id('menu-template')(menu));
                if ($('#sidebar').hasClass('menu-min')) {
                    $('#sidebar-collapse').find('i').toggleClass('icon-chevron-left').toggleClass('icon-chevron-right');
                }
                this.selectMenuButton("#btn-" + menuButton);
            }
            if (subMenuId == null) {
                subMenuId = $('.item:first').find('ul:first');
                var href = $('.item:first').find('ul:first').find('li:first a').attr("href");
                loadFeature($.deparam.fragment(href));
            } else {
                subMenuId = $(linkId).parent('ul.submenu');
                toggleSubMenu($(subMenuId), linkId);
                var currURL = window.location.href.split(window.location.host)[1];
                //Modify breadcrumb only if current URL is same as default one
                //Reset to default menu breadcrumbs
                //if($(linkId + ' a').attr('href') == currURL) {
                //var breacrumbsArr = [$(linkId).parents('li').parents('ul').children('li:first').children('a').text().trim(),
                //    $(linkId + ' a').text().trim(),$(linkId).parents('li').children('a').text().trim()];
                var breadcrumbsArr = [{
                    href: $(linkId + ' a:first').attr('href').trim(),
                    link: $(linkId + ' a:first').text().trim()
                }];
                if ($(linkId).parents('ul').length == 2) {
                    breadcrumbsArr.unshift({
                        href: $(linkId).parents('li').children('a:first').attr('data-link').trim(),
                        link: $(linkId).parents('li').children('a:first').text().trim()
                    });
                    breadcrumbsArr.unshift({
                        href: $(linkId).parents('li').parents('ul').children('li:first').children('a:first').attr('data-link').trim(),
                        link: $(linkId).parents('li').parents('ul').children('li:first').children('a:first').text().trim()
                    });
                } else {
                    breadcrumbsArr.unshift({
                        href: $(linkId).parents('li').parents('ul').children('li:first').children('a:first').attr('data-link').trim(),
                        link: $(linkId).parents('li').parents('ul').children('li:first').children('a:first').text().trim()
                    });
                }
                $('#breadcrumb').html(currentBCTemplate(breadcrumbsArr));
                //}
            }
        }

        this.selectMenuButton = function (buttonId) {
            $('#btn-monitor').removeClass("active");
            $('#btn-configure').removeClass("active");
            $('#btn-query').removeClass("active");
            $('#btn-setting').removeClass("active");
            $(buttonId).addClass("active");
        }
        /*
         * Here we are checking whether the hash exists in the menu object
         */
        this.isHashExists = function (hashObj) {
            //if the hash is null,which means no change in the current hash conveys that already it exists in menuObj
            if (hashObj != null && (hashObj['p'] == null || menuHandler.getMenuObjByHash(hashObj['p']) != -1))
                return true;
            else
                return false;

        }

        /*
         * post-processing of menu XML JSON
         * JSON expectes item to be an array,but xml2json make item as an object if there is only one instance
         */
        function processXMLJSON(json, disabledFeatures) {
            if ((json['resources'] != null) && json['resources']['resource'] != null) {
                if (!(json['resources']['resource'] instanceof Array))
                    json['resources']['resource'] = [json['resources']['resource']];
            }
            if ((json['items'] != null) && (json['items']['item'] != null)) {
                if (json['items']['item'] instanceof Array) {
                    var currItem = json['items']['item'];
                    for (var i = (currItem.length - 1); i > -1; i--) {
                        //remove diabled features from the menu obeject
                        if (currItem[i]['hash'] != undefined
                            && disabledFeatures.disabled != null && disabledFeatures.disabled.indexOf(currItem[i]['hash']) !== -1) {
                            currItem.splice(i, 1);
                        } else {
                            if (currItem[i] != undefined) {
                                processXMLJSON(currItem[i], disabledFeatures);
                                add2SiteMap(currItem[i]);
                            }
                        }
                    }
                } else {
                    processXMLJSON(json['items']['item'], disabledFeatures);
                    add2SiteMap(json['items']['item']);
                    json['items']['item'] = [json['items']['item']];
                }
            }
        }

        function add2SiteMap(item) {
            var searchStrings = item.searchStrings, hash = item.hash, queryParams = item.queryParams;
            if (hash != null && searchStrings != null) {
                var searchStrArray = splitString2Array(searchStrings, ',');
                siteMap[hash] = {searchStrings: searchStrArray, queryParams: queryParams};
                for (var j = 0; j < searchStrArray.length; j++) {
                    siteMapSearchStrings.push(searchStrArray[j]);
                }
            }
        }

        function isDependencyOk(dependencies) {
            return true;
        }

        /*
         * Strip down the menu object to only required fields
         */
        function formatMenuObj(currMenu) {
            var retMenuObj = {};
            $.each(['label', 'class', 'name'], function (index, value) {
                if (value == 'class') {
                    if ((currMenu[value] == null) && (currMenu['loadFn'] == null))
                        retMenuObj['cls'] = 'disabled';
                    else
                        retMenuObj['cls'] = 'enabled';
                    if (currMenu['hide'] == 'true')
                        retMenuObj['cls'] = 'hide';
                } else {
                    retMenuObj[value] = currMenu[value];
                }
            });
            return retMenuObj;
        }

        function processMenu(menuObj) {
            var retMenuObj = [];
            for (var i = 0, j = 0; i < menuObj.length; i++) {
                //Process this menu only if dependencies are OK
                if (isDependencyOk(menuObj[i])) {
                    retMenuObj[j] = formatMenuObj(menuObj[i]);
                    if ((menuObj[i]['items'] != null) && (menuObj[i]['items']['item'] != null) && (menuObj[i]['items']['item'].length > 0)) {
                        retMenuObj[j]['items'] = {};
                        retMenuObj[j]['items'] = processMenu(menuObj[i]['items']['item']);
                    }
                    j++;
                }
            }
            return retMenuObj;
        }

        this.destroyView = function (currMenuObj) {
            if (currMenuObj == null)
                return;
            //Call destory function on viewClass which is being unloaded
            if (currMenuObj['resources'] != null) {
                $.each(getValueByJsonPath(currMenuObj, 'resources;resource', []), function (idx, currResourceObj) {
                    if ((currResourceObj['class'] != null) && (typeof(window[currResourceObj['class']]) == 'function' || typeof(window[currResourceObj['class']]) == 'object') &&
                        (typeof(window[currResourceObj['class']]['destroy']) == 'function')) {
                        $.allajax.abort();

                        try {
                            window[currResourceObj['class']]['destroy']();
                        } catch (error) {
                            console.log(error.stack);
                        }
                    }
                    //window[currResourceObj['class']] = null;
                });
            }
        }

        /**
         * parentsArr is used to load the resources specified in the menu hierarchy
         */
        this.getMenuObjByHash = function (menuHash, currMenuObj, parentsArr) {
            parentsArr = ifNull(parentsArr, []);
            if (currMenuObj == null)
                currMenuObj = menuObj['items']['item'];
            for (var i = 0; i < currMenuObj.length; i++) {
                if (currMenuObj[i]['hash'] == menuHash) {
                    currMenuObj[i]['parents'] = parentsArr;
                    return currMenuObj[i];
                }
                if ((currMenuObj[i]['items'] != null) && (currMenuObj[i]['items']['item'] != null) && (currMenuObj[i]['items']['item'].length > 0)) {
                    parentsArr.push(currMenuObj[i]);
                    var retVal = self.getMenuObjByHash(menuHash, currMenuObj[i]['items']['item'], parentsArr);
                    if (retVal != -1) {
                        return retVal;
                    } else {
                        parentsArr.pop();
                    }
                }
            }
            return -1;
        }

        this.getMenuObjByName = function (menuName) {
            menuName = menuName.replace('menu_', '');
            var currMenuObj = menuObj;
            for (var i = 0; i < menuName.length; i++) {
                var currMenuIdx = menuName[i];
                currMenuObj = currMenuObj['items']['item'][currMenuIdx];
            }
            return currMenuObj;
        }

        this.loadResourcesFromMenuObj = function (currMenuObj, resourcesDefObj) {
            var parents = currMenuObj['parents'];
            if (currMenuObj['rootDir'] != null || getValueByJsonPath(currMenuObj, 'resources;resource', []).length > 0) {
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
                                    var viewPath = pkgBaseDir + currResourceObj['rootDir'] + '/views/' + this + '?built_at=' + built_at;
                                    templateLoader.loadExtTemplate(viewPath, viewDeferredObj, hash);
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
                                    var viewPath = pkgBaseDir + currResourceObj['rootDir'] + '/templates/' + this + '?built_at=' + built_at;
                                    templateLoader.loadExtTemplate(viewPath, viewDeferredObj, hash);
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
                //Load the feature views
                loadViewResources(currMenuObj, currMenuObj['hash']);
                loadTemplateResources(currMenuObj, currMenuObj['hash']);
                //Load the feature css files
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
            }
        };

        this.loadViewFromMenuObj = function (currMenuObj) {
            var resourcesDefObj = $.Deferred();
            globalObj.currMenuObj = currMenuObj; //Store in globalObj
            try {
                self.loadResourcesFromMenuObj(currMenuObj, resourcesDefObj);
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

                    $.each(getValueByJsonPath(currMenuObj, 'resources;resource', []), function (idx, currResourceObj) {
                        if (currResourceObj['class'] != null) {
                            if (window[currResourceObj['class']] != null) {
                                window[currResourceObj['class']].load({
                                    containerId: contentContainer,
                                    hashParams: layoutHandler.getURLHashParams(),
                                    function: currResourceObj['function']
                                });
                                $('#content-container-loading').remove();
                            }
                        }
                    });
                });
            } catch (error) {
                console.log(error.stack);
            }
        };

        this.loadFeatureApps = function (featurePackages) {
            var featureAppDefObjList= [],
                initAppDefObj, url;

            self.initFeatureAppDefObjMap = {};

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

            $.when.apply(window, featureAppDefObjList).done(function () {
                self.featureAppDefObj.resolve();
            });
        };
    };

    return MenuHandler;
});
