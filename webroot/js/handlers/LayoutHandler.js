/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'menu-handler', 'content-handler'], function (_, MenuHandler, ContentHandler) {
    var LayoutHandler = function () {
        var self = this;

        //Don't escape ":[]" characters while pushing state via bbq
        //noEscape(":[]");

        this.load = function (menuObj) {
            var webServerInfo = globalObj['webServerInfo'],
                featurePkgs = getValueByJsonPath(globalObj, 'webServerInfo;featurePkg', null);
            menuHandler = new MenuHandler();
            //reset the cache
            if(typeof(cowch) != "undefined")
                cowch.reset();
            if (Object.keys(featurePkgs).length === 1
                && featurePkgs[FEATURE_PCK_WEB_SERVER_MANAGER] === true) {
                $('#alarms-popup-link').hide();
            }
            cowu.updateMultiViewSettingsFromCookie();
            menuHandler.loadMenu(menuObj);
            menuHandler.handleSideMenu();
            self.onHashChange({}, cowhu.getState());
        };

        /** Get view height excluding header & footer **/
        this.getViewHeight = function () {
            var windowHeight = $(window).height();
            //To enforce minimum height
            if (windowHeight < 768)
                windowHeight = 768;
            //Subtract the height of pageHeader and seperator height
            return (windowHeight - $('#pageHeader').outerHeight() - 1);
        };

        /** Returns the entire hash object */
        this.getURLHashObj = function () {
            return cowhu.getState();
        };

        /** Override the entire hash object with the given one */
        this.setURLHashObj = function (obj) {
            /*if (!menuHandler.isHashExists(obj))
                return*/
            var cgcEnabled = getValueByJsonPath(globalObj,
                    'webServerInfo;cgcEnabled', false, false);
            var currHashObj = self.getURLHashObj();
            var region  = contrail.getCookie('region');
            if(cgcEnabled && region) {
                obj.region = region;
            }
            //Update Hash only if it differs from current hash
            if (JSON.stringify(sort(currHashObj)) != JSON.stringify(sort(obj))) {
                cowhu.pushState(obj, 2);
            }
        };
        /** Returns the value of 'q' in urlHash which is used to maintain the state within a page */
        this.getURLHashParams = function () {
            var urlHash = cowhu.getState('q');
            return ifNull(urlHash, {});
        };

        /** Sets the vaue of 'q' in urlHash */
        this.setURLHashParams = function (hashParams, obj) {
            var merge = true, triggerHashChange = true;
            if (!menuHandler.isHashExists(obj))
                return
            if (obj != null) {
                merge = ifNull(obj['merge'], true);
                triggerHashChange = ifNull(obj['triggerHashChange'], true);
            }

            //Update Hash only if it differs from current hash
            var currHashParams = self.getURLHashParams();
            //If merge is true, merge the parameters before comparing current hash with the new hash going to be pushed
            if ((merge == true) && (typeof(hashParams) == 'object'))
                hashParams = $.extend({}, currHashParams, hashParams);
            if (JSON.stringify(sort(currHashParams)) != JSON.stringify(sort(hashParams))) {
                //To avoid loading the view again
                if (triggerHashChange == false)
                    globalObj.hashUpdated = 1;
                if ((obj != null) && (obj['p'] != null)){
                    cowhu.pushState({p: obj['p'], q: hashParams});
                }
                else
                    cowhu.pushState({q: hashParams});
            }
        };

        this.onHashChange = function(lastHash, currHash, loadingStartedDefObj) {
            if (cowc.SUMMARY_PAGE_HASHES.indexOf(currHash['p']) > -1 && currHash['q'] == null) {
                $('#toolbar').show();
            } else {
                $('#toolbar').hide();
            }
            if (cowc.panelLayout) {
                $('.page-content').addClass('bg-color-grey');
            } else {
                /*if (layoutHandler.getURLHashObj()['p'] == 'mon_infra_dashboard') {
                    $('.page-content').addClass('bg-color-grey');
                } else {*/
                    $('.page-content').removeClass('bg-color-grey');
                //}        
            }
            
            globalObj['featureAppDefObj'].done(function () {
                contentHandler.loadContent(lastHash, currHash, loadingStartedDefObj);
            });
        }
    };

    return LayoutHandler;
});
