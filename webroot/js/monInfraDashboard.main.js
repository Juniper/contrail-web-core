/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var monInfraDashboardLoader = new MonInfraDashboardLoader();

function MonInfraDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, 
            hashParams = paramObject['hashParams'],
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require(['mon-infra-dashboard-view'], function (MonitorInfraDashboardView) {
            self.monitorInfraDashboardView = MonitorInfraDashboardView;
            self.monitorInfraDashboardView.render({
                el:$(contentContainer)
            });
            if (loadingStartedDefObj != null) {
                loadingStartedDefObj.resolve();
            }
        });
    };

    this.destroy = function()  {
    }
}

