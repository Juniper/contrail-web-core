/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var MenuHandler = function () {
        var self = this, menuObj,
            initMenuDefObj = $.Deferred();  //Will be resolved once menu is loaded and filtered
        //onHashChange is triggered once it is resolved
        self.deferredObj = $.Deferred();

        var featurePkgToMenuNameMap = {
            'webController': 'wc',
            'webStorage': 'ws',
            'serverManager': 'sm'
        };

        this.loadMenu = function (xml) {
            menuObj = $.xml2json(xml);
            var optFeatureList =
                getValueByJsonPath(globalObj, 'webServerInfo;optFeatureList',
                                   null);
            var featurePkgsInfo =
                getValueByJsonPath(globalObj, 'webServerInfo;featurePkgsInfo',
                                   null);
            processXMLJSON(menuObj, optFeatureList);
            var menuShortcuts = contrail.getTemplate4Id('menu-shortcuts')(menuHandler.filterMenuItems(menuObj['items']['item'], 'menushortcut', featurePkgsInfo));
            $("#sidebar-shortcuts").html(menuShortcuts);
            menuHandler.filterMenuItems(menuObj['items']['item']);

            //Add an event listener for clicking on menu items
            $('#menu').off('click').on('click', 'ul > li > a', function (e) {
                var href = $(this).attr('href');
                loadFeature(cowhu.deparam.fragment(href));
                if (!e.ctrlKey) {
                    e.preventDefault();//Stop the page to navigate to the url set in href
                }
            });

            //Intialize the alarm flag
            var isMonAlarmsEnabled =
                getValueByJsonPath(optFeatureList, 'mon_alarms', true);
            if (false == isMonAlarmsEnabled) {
                cowu.getAlarmsFromAnalytics = false;
            }
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

                    //If logged-in user has cloudAdmin role,then allow all features
                    if ($.inArray(globalObj['roles']['ADMIN'], loggedInUserRoles) > -1) {
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
                    if (typeof(globalObj['menuAccessFns'][value.access.accessFn]) == 'function')
                        accessFnRetVal = globalObj['menuAccessFns'][value.access.accessFn]();
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
            var hostname = window.location.hostname;
            if (menuButton == null) {
                currPageHashArray = currPageHash.split('_');
                //Looks scalable only till 2nd level menu
                linkId = '#' + currPageHashArray[0] + '_' + currPageHashArray[1];
                if(currPageHashArray[2] != null) {
                    linkId += '_' + currPageHashArray[2];
                }
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
                    $('#sidebar-collapse').find('i').toggleClass('fa-chevron-left').toggleClass('fa-chevron-right');
                }
                this.selectMenuButton("#btn-" + menuButton);
            }
            $('#tabTitle').text(hostname.substring(0,15)+'... | Contrail ' +
                menuButton.charAt(0).toUpperCase() + menuButton.slice(1));
            if (subMenuId == null) {
                subMenuId = $('.item:first').find('ul:first');
                var href = $('.item:first').find('ul:first').find('li:first a').attr("href");
                loadFeature(cowhu.deparam.fragment(href));
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
                } else if ($(linkId).parents('ul').length == 1){
                    breadcrumbsArr.unshift({
                        href: $(linkId).parents('ul').children('li:first').children('a:first').attr('data-link').trim(),
                        link: $(linkId).parents('ul').children('li:first').children('a:first').text().trim()
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
        function processXMLJSON(json, optFeatureList) {
            if ((json['resources'] != null) && json['resources']['resource'] != null) {
                if (!(json['resources']['resource'] instanceof Array))
                    json['resources']['resource'] = [json['resources']['resource']];
            }
            if ((json['items'] != null) && (json['items']['item'] != null)) {
                if (json['items']['item'] instanceof Array) {
                    var currItem = json['items']['item'];
                    for (var i = (currItem.length - 1); i > -1; i--) {
                        //remove diabled features from the menu obeject
                        var isOptional =
                            getValueByJsonPath(currItem, i +
                                               ';menuAttr;optional', false);
                        var hash =
                            getValueByJsonPath(currItem, i + ';hash', null);
                        var ifFeatureEnabled =
                            getValueByJsonPath(optFeatureList, hash, false);
                        if (("true" == isOptional) &&
                            (false == ifFeatureEnabled)) {
                            currItem.splice(i, 1);
                        } else {
                            if (currItem[i] != undefined) {
                                processXMLJSON(currItem[i], optFeatureList);
                                add2SiteMap(currItem[i]);
                            }
                        }
                    }
                } else {
                    processXMLJSON(json['items']['item'], optFeatureList);
                    add2SiteMap(json['items']['item']);
                    json['items']['item'] = [json['items']['item']];
                }
            }
        }

        function add2SiteMap(item) {
            var searchStrings = item.searchStrings, hash = item.hash, queryParams = item.queryParams;
            if (hash != null && searchStrings != null) {
                var searchStrArray = cowu.splitString2Array(searchStrings, ',');
                globalObj['siteMap'][hash] = {searchStrings: searchStrArray, queryParams: queryParams};
                for (var j = 0; j < searchStrArray.length; j++) {
                    globalObj['siteMapSearchStrings'].push(searchStrArray[j]);
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
            if (currMenuObj == null) {
                currMenuObj = menuObj['items']['item'];
            }
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

        this.handleSideMenu = function() {
            $('#menu-toggler').on('click', function () {
                $('#sidebar').toggleClass('display');
                $(this).toggleClass('display');
                return false;
            });
            //opening submenu
            var $minimized = false;
            $('.nav-list').on('click', function (e) {
                if ($minimized) return;

                //check to see if we have clicked on an element which is inside a .dropdown-toggle element?!
                //if so, it means we should toggle a submenu
                var link_element = $(e.target).closest('.dropdown-toggle');
                if (link_element && link_element.length > 0) {
                    var sub = link_element.next().get(0);
                    toggleSubMenu(sub);
                    return false;
                }
            });

            var sidebarState = getCookie('sidebar');
            if (sidebarState == 'close') {
                $('#sidebar').addClass('menu-min');
                $('#sidebar-collapse').find('i').removeClass('fa-chevron-left').addClass('fa fa-chevron-right');
            }
        }
    };
    function toggleSubMenu(subMenu, linkId) {
        //if we are opening this submenu, close all other submenus except the ".active" one
        if (!$(subMenu).is(':visible')) {//ie, we are about to open it and make it visible
            $('.open > .submenu').each(function () {
                if (this != subMenu) {
                    $(this).slideUp(200).parent().removeClass('open').removeClass('active');
                }
            });
            $(subMenu).slideToggle(200).parent().toggleClass('open').toggleClass('active');
        }
        if (linkId != null) {
            $('.submenu > li').each(function () {
                $(this).removeClass('active');
            });
            $('.mainMenu').each(function () {
                $(this).removeClass('active');
            });
            $(linkId).addClass('active');
        }
    };

    return MenuHandler;
});


