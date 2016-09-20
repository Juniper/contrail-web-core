/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-basedir/reports/qe/ui/js/views/QueryEngineView"
], function(_, QueryEngineView) {
    var QEPageLoader = function() {
        this.load = function (paramObject) {
            var self = this, hashParams = paramObject.hashParams,
                renderFn = paramObject.function,
                loadingStartedDefObj = paramObject.loadingStartedDefObj;

            self.qeView = new QueryEngineView();
            self.renderView(renderFn, hashParams);
            if(!_.isNil(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        };
        this.renderView = function (renderFn, hashParams) {
            $(window.contentContainer).empty();
            switch (renderFn) {
                case "renderSystemLogs":
                    this.qeView.renderSystemLogs({hashParams: hashParams});
                    break;

                case "renderObjectLogs":
                    this.qeView.renderObjectLogs({hashParams: hashParams});
                    break;

                case "renderLogQueue":
                    this.qeView.renderLogQueue({hashParams: hashParams});
                    break;

                case "renderStatQuery":
                    this.qeView.renderStatQuery({hashParams: hashParams});
                    break;

                case "renderStatQueue":
                    this.qeView.renderStatQueue({hashParams: hashParams});
                    break;
            }
        };

        this.updateViewByHash = function(currPageQueryStr) {
            var renderFn;

        //TODO: The renderFunction should be passed from ContentHandler
            if (currPageQueryStr.type === "flow") {
                renderFn = "renderFlows";
            }

            this.load({ hashParams: currPageQueryStr, "function": renderFn });
        };

        this.destroy = function() {};
    };

    return QEPageLoader;
});
