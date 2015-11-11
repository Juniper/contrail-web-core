/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var monInfraDashboardLoader = new MonInfraDashboardLoader();

function MonInfraDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            // pathControllerDashboardView = rootDir + '/js/views/ControllerDashboardView.js',
            // pathMonitorInfraDashboardView = rootDir + '/js/views/MonitorInfraDashboardView.js',
            renderFn = paramObject['function'];

        if (self.monInfraDashboardView == null) {
            // requirejs([pathControllerDashboardView,pathMonitorInfraDashboardView], function (ControllerDashboardView,MonitorInfraDashboardView) {
            requirejs(['mon-infra-dashboard-view'], function (MonitorInfraDashboardView) {
                var monitorInfraDashboardView = MonitorInfraDashboardView;
                monitorInfraDashboardView.render({
                    el:$(contentContainer)
                });
                // self.monInfraDashboardView = new ControllerDashboardView({
                //     el: $(contentContainer)
                // });
                // self.monInfraDashboardView.render();
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };

    this.destroy = function()  {
    }
}

