/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore'], function(_){
        var self = this;

        this.getRegExForUrl = function(url){
            var regexUrlMap = {
                '/sm/tags/names' : /\/sm\/tags\/names.*$/,
                '/sm/objects/details/image': /\/sm\/objects\/details\/image\?.*$/,
                '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,
                '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/,
                '/api/service/networking/web-server-info': /\/api\/service\/networking\/web-server-info.*$/
            };

            return regexUrlMap [url];
        };

        this.getNumberOfColumnsForGrid  = function (viewObj){

            var noOfColumns = 0;
            noOfColumns = viewObj.getGridConfig().columnHeader.columns.length;
            if(contrail.checkIfExist(viewObj.getGridConfig().body.options.actionCell))
                noOfColumns ++;
            if(contrail.checkIfExist(viewObj.getGridConfig().body.options.checkboxSelectable))
                noOfColumns ++;
            if(contrail.checkIfExist(viewObj.getGridConfig().body.options.detail))
                noOfColumns ++;
            return noOfColumns;
        };

        this.startQunitWithTimeout = function (timeoutInMilliSec) {
            window.setTimeout(function () {
                QUnit.start();
            }, timeoutInMilliSec);
        };
        return {
        self: self,
        getRegExForUrl: getRegExForUrl,
        getNumberOfColumnsForGrid: getNumberOfColumnsForGrid,
        startQunitWithTimeout: startQunitWithTimeout
    };
});
