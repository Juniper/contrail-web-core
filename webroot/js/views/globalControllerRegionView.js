      /*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/globalcontroller/ui/js/models/globalControllerListModel'
], function (_, ContrailView, GlobalControllerListModel) {
    var GlobalControllerRegionView = ContrailView.extend({
        render: function (viewConfig) {
            var self = this,
            globalControllerListModel=null;
            globalControllerListModel = self.model;
            if (self.model.loadedFromCache == true) {
                 renderRegionView();
            }
            self.model.onAllRequestsComplete.subscribe(function () {
                renderRegionView();
            });
            function renderRegionView(){
                var cfgDashbaordViewTemplate = contrail.getTemplate4Id("globalController-dashbaord-template");
                var headInfo = globalControllerListModel.getItems()[0];
                self.$el.html(cfgDashbaordViewTemplate({headInfo}));
                var objectCntSection = self.$el.find(".container .objectCntSection"),
                    chartSection = self.$el.find(".container .chartSection"),
                    nodesCntSection = self.$el.find(".container .nodesCntContainer");
                self.renderView4Config(objectCntSection,
                        globalControllerListModel, getObjectCountView());
                self.renderView4Config(chartSection,
                        globalControllerListModel, getGlobalControllerChartsView(viewConfig));
                self.renderView4Config(nodesCntSection,
                        globalControllerListModel, getNodesCountView());
            }
        }
    });
    var getObjectCountView = function () {
        return {
            elementId: "objectviewCnt",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: "objectviewCnt_grid",
                                view : "objectCntView",
                        viewPathPrefix:"monitor/infrastructure/globalcontroller/ui/js/views/",
                        app:cowc.APP_CONTRAIL_CONTROLLER
                    }]}]
                }
        }
    }
    var getGlobalControllerChartsView = function (viewConfig) {
        return {
            elementId: "globalControllerChart",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: "globalControllerChart_grid",
                        view : "globalControllerchartView",
                        viewPathPrefix:"monitor/infrastructure/globalcontroller/ui/js/views/",
                        app:cowc.APP_CONTRAIL_CONTROLLER
                    }]}]
                }
        }
    }
    var getNodesCountView = function () {
        return {
            elementId: "nodesCounttView",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: "nodesCntView_grid",
                        view: "nodesCntView",
                        viewPathPrefix:"monitor/infrastructure/globalcontroller/ui/js/views/",
                        app:cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                        }
                    }]}]
                }
        }
    }
    return GlobalControllerRegionView;
});