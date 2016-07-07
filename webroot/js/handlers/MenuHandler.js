/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var MenuHandler = function () {
        var self = this, menuObj,
            initMenuDefObj = $.Deferred();  //Will be resolved once menu is loaded and filtered
        //onHashChange is triggered once it is resolved
        self.deferredObj = $.Deferred();

        //TODO: move all bbq code to a common location

        function is_string( arg ) {
            return typeof arg === 'string';
        };

        self.deparam = jq_deparam = function( params, coerce ) {
            var obj = {},
                coerce_types = { 'true': !0, 'false': !1, 'null': null };

            // Iterate over all name=value pairs.
            $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
                var param = v.split( '=' ),
                    key = decodeURIComponent( param[0] ),
                    val,
                    cur = obj,
                    i = 0,

                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                    keys = key.split( '][' ),
                    keys_last = keys.length - 1;

                // If the first keys part contains [ and the last ends with ], then []
                // are correctly balanced.
                if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
                    // Remove the trailing ] from the last keys part.
                    keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

                    // Split first keys part into two parts on the [ and add them back onto
                    // the beginning of the keys array.
                    keys = keys.shift().split('[').concat( keys );

                    keys_last = keys.length - 1;
                } else {
                    // Basic 'foo' style key.
                    keys_last = 0;
                }

                // Are we dealing with a name=value pair, or just a name?
                if ( param.length === 2 ) {
                    val = decodeURIComponent( param[1] );

                    // Coerce values.
                    if ( coerce ) {
                        val = val && !isNaN(val)            ? +val              // number
                            : val === 'undefined'             ? undefined         // undefined
                            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                            : val;                                                // string
                    }

                    if ( keys_last ) {
                        // Complex key, build deep object structure based on a few rules:
                        // * The 'cur' pointer starts at the object top-level.
                        // * [] = array push (n is set to array length), [n] = array if n is 
                        //   numeric, otherwise object.
                        // * If at the last keys part, set the value.
                        // * For each keys part, if the current level is undefined create an
                        //   object or array based on the type of the next keys part.
                        // * Move the 'cur' pointer to the next level.
                        // * Rinse & repeat.
                        for ( ; i <= keys_last; i++ ) {
                            key = keys[i] === '' ? cur.length : keys[i];
                            cur = cur[key] = i < keys_last
                                ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
                                : val;
                        }

                    } else {
                        // Simple key, even simpler rules, since only scalars and shallow
                        // arrays are allowed.

                        if ( $.isArray( obj[key] ) ) {
                            // val is already an array, so push on the next value.
                            obj[key].push( val );

                        } else if ( obj[key] !== undefined ) {
                            // val isn't an array, but since a second value has been specified,
                            // convert val into an array.
                            obj[key] = [ obj[key], val ];

                        } else {
                            // val is a scalar.
                            obj[key] = val;
                        }
                    }

                } else if ( key ) {
                    // No value was defined, so set something meaningful.
                    obj[key] = coerce
                        ? undefined
                        : '';
                }
            });

            return obj;
        };

        var jq_deparam_fragment;
        var str_querystring = 'querystring';
        var str_fragment = 'fragment';
        var aps = Array.prototype.slice;
        var jq_param = $.param;
        var str_location = 'location';
        var str_hashchange = 'hashchange';
        var str_href = 'href';
        var re_no_escape;
        var re_trim_querystring = /^.*\?|#.*$/g;
        var re_trim_fragment = /^.*\#/;

        function jq_deparam_sub( is_fragment, url_or_params, coerce ) {
            if ( url_or_params === undefined || typeof url_or_params === 'boolean' ) {
                // url_or_params not specified.
                coerce = url_or_params;
                url_or_params = jq_param[ is_fragment ? str_fragment : str_querystring ]();
            } else {
                url_or_params = is_string( url_or_params )
                    ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
                    : url_or_params;
            }

            return jq_deparam( url_or_params, coerce );
        };


        function jq_param_sub( is_fragment, get_func, url, params, merge_mode ) {
            var result,
                qs,
                matches,
                url_params,
                hash;

            if ( params !== undefined ) {
                // Build URL by merging params into url string.

                // matches[1] = url part that precedes params, not including trailing ?/#
                // matches[2] = params, not including leading ?/#
                // matches[3] = if in 'querystring' mode, hash including leading #, otherwise ''
                matches = url.match( is_fragment ? /^([^#]*)\#?(.*)$/ : /^([^#?]*)\??([^#]*)(#?.*)/ );

                // Get the hash if in 'querystring' mode, and it exists.
                hash = matches[3] || '';

                if ( merge_mode === 2 && is_string( params ) ) {
                    // If merge_mode is 2 and params is a string, merge the fragment / query
                    // string into the URL wholesale, without converting it into an object.
                    qs = params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' );

                } else {
                    // Convert relevant params in url to object.
                    url_params = jq_deparam( matches[2] );

                    params = is_string( params )

                        // Convert passed params string into object.
                        ? jq_deparam[ is_fragment ? str_fragment : str_querystring ]( params )

                        // Passed params object.
                        : params;

                    qs = merge_mode === 2 ? params                              // passed params replace url params
                        : merge_mode === 1  ? $.extend( {}, params, url_params )  // url params override passed params
                        : $.extend( {}, url_params, params );                     // passed params override url params

                    // Convert params object to a string.
                    qs = jq_param( qs );

                    // Unescape characters specified via $.param.noEscape. Since only hash-
                    // history users have requested this feature, it's only enabled for
                    // fragment-related params strings.
                    if ( is_fragment ) {
                        qs = qs.replace( re_no_escape, decodeURIComponent );
                    }
                }

                // Build URL from the base url, querystring and hash. In 'querystring'
                // mode, ? is only added if a query string exists. In 'fragment' mode, #
                // is always added.
                result = matches[1] + ( is_fragment ? '#' : qs || !matches[1] ? '?' : '' ) + qs + hash;

            } else {
                // If URL was passed in, parse params from URL string, otherwise parse
                // params from window.location.
                result = get_func( url !== undefined ? url : window[ str_location ][ str_href ] );
            }

            return result;
        };

        function jq_deparam_sub( is_fragment, url_or_params, coerce ) {
            if ( url_or_params === undefined || typeof url_or_params === 'boolean' ) {
                // url_or_params not specified.
                coerce = url_or_params;
                url_or_params = jq_param[ is_fragment ? str_fragment : str_querystring ]();
            } else {
                url_or_params = is_string( url_or_params )
                    ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
                    : url_or_params;
            }

            return jq_deparam( url_or_params, coerce );
        };

        jq_param[ str_querystring ]                  = curry( jq_param_sub, 0, get_querystring );
        jq_param[ str_fragment ] = jq_param_fragment = curry( jq_param_sub, 1, get_fragment );

        jq_deparam[ str_querystring ]                    = curry( jq_deparam_sub, 0 );
        jq_deparam[ str_fragment ] = jq_deparam_fragment = curry( jq_deparam_sub, 1 );

        self.getState = function( key, coerce ) {
            return key === undefined || typeof key === 'boolean'
                ? jq_deparam_fragment( key ) // 'key' really means 'coerce' here
                : jq_deparam_fragment( coerce )[ key ];
        };

        function curry( func ) {
            var args = aps.call( arguments, 1 );

            return function() {
                return func.apply( this, args.concat( aps.call( arguments ) ) );
            };
        };

        // Get location.hash (or what you'd expect location.hash to be) sans any
        // leading #. Thanks for making this necessary, Firefox!
        function get_fragment( url ) {
            return url.replace( /^[^#]*#?(.*)$/, '$1' );
        };

        // Get location.search (or what you'd expect location.search to be) sans any
        // leading #. Thanks for making this necessary, IE6!
        function get_querystring( url ) {
            return url.replace( /(?:^[^?#]*\?([^#]*).*$)?.*/, '$1' );
        };

        self.pushState = jq_bbq_pushState = function( params, merge_mode ) {
            if ( is_string( params ) && /^#/.test( params ) && merge_mode === undefined ) {
                // Params string begins with # and merge_mode not specified, so completely
                // overwrite window.location.hash.
                merge_mode = 2;
            }

            var has_args = params !== undefined,
            // Merge params into window.location using $.param.fragment.
                url = jq_param_fragment( location.href,
                    has_args ? params : {}, has_args ? merge_mode : 2 );

            // Set new window.location.href. Note that Safari 3 & Chrome barf on
            // location.hash = '#' so the entire URL is set.
            location.href = url;
        };

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
                loadFeature(self.deparam.fragment(href));
                /*var temp1 = location.hash;
                var temp2 = temp1.split('&');
                var temp3 = temp2[1];
                var temp4 = decodeURIComponent(temp3);
                var temp = {}
                if (temp4 != "undefined") {
                    var vals = temp4.split('=');
                    var temp5 = vals[0].split('[')[1];
                    var key = temp5.split(']')[0];
                    temp[key] = vals[1];
                }
                var obj = {}
                obj['p'] = temp2[0].split('#')[1];
                obj['q'] = temp;
                loadFeature(obj);*/
                /*var href = $(this).attr('href');
                var temp =  href.split('&').reduce(function (params, param) {
                    var paramSplit = param.split('=').map(function (value) {
                        return decodeURIComponent(value.replace('+', ' '));
                    });
                    params[paramSplit[0]] = paramSplit[1];
                    return params;
                }, {});
                loadFeature(temp);*/
                //$(window).haschange();
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

                    //If logged-in user has superAdmin role,then allow all features
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
                    $('#sidebar-collapse').find('i').toggleClass('fa-chevron-left').toggleClass('fa-chevron-right');
                }
                this.selectMenuButton("#btn-" + menuButton);
            }
            $('#tabTitle').text(hostname.substring(0,15)+'... | Contrail ' +
                menuButton.charAt(0).toUpperCase() + menuButton.slice(1));
            if (subMenuId == null) {
                subMenuId = $('.item:first').find('ul:first');
                var href = $('.item:first').find('ul:first').find('li:first a').attr("href");
                /*var temp1 = href;
                var temp2 = temp1.split('&');
                var temp3 = temp2[1];
                var temp4 = decodeURIComponent(temp3);
                var temp = {}
                if (temp4 != "undefined") {
                    var vals = temp4.split('=');
                    var temp5 = vals[0].split('[')[1];
                    var key = temp5.split(']')[0];
                    temp[key] = vals[1];
                }
                var obj = {}
                obj['p'] = temp2[0].split('#')[1];
                obj['q'] = temp;
                loadFeature(obj);*/
                loadFeature(self.deparam.fragment(href));
                //loadFeature($.deparam.fragment(href));
                /*var temp =  href.split('&').reduce(function (params, param) {
                    var paramSplit = param.split('=').map(function (value) {
                        return decodeURIComponent(value.replace('+', ' '));
                    });
                    params[paramSplit[0]] = paramSplit[1];
                    return params;
                }, {});
                loadFeature(temp);*/
                //loadFeature($.deparam(href));//location.href + '#' + $.param(result);
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
            $(linkId).addClass('active');
        }
    };

    return MenuHandler;
});


