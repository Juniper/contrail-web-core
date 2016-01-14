/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var mnAlarmsPageLoader = new MonitorAlarmsLoader();

function MonitorAlarmsLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = rootDir + '/js/views/AlarmView.js',
            renderFn = paramObject['function'];

        requirejs([pathMNView], function (AlarmsView) {
            self.mnView = new AlarmsView();
            self.renderView(renderFn, hashParams);
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.mnView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
};