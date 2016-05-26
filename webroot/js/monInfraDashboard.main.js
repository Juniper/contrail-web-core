/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var monInfraDashboardLoader = new MonInfraDashboardLoader();

function MonInfraDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            renderFn = paramObject['function'];

        require(['mon-infra-dashboard-view'], function (MonitorInfraDashboardView) {
            var monitorInfraDashboardView = MonitorInfraDashboardView;
            monitorInfraDashboardView.render({
                el:$(contentContainer)
            });
        });
    };

    this.destroy = function()  {
    }
}

