/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/views/InfoboxesView',
    'mon-infra-log-list-model',
    'mon-infra-node-list-model',
    'mon-infra-alert-list-view',
    'mon-infra-log-list-view',
    'mon-infra-sysinfo-view'
], function(_,Backbone,InfoboxesView,
        LogListModel,NodeListModel,
        AlertListView,LogListView,SystemInfoView) {

    //Ensure MonInfraDashboardView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    //Instead oaf assigning the extended Backbone View to a class,instantiate it immediately
    return new (Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            self.isRendered = true;
            var dashboardTmpl = contrail.getTemplate4Id(cowc.TMPL_INFRA_DASHBOARD);
            self.$el.html(dashboardTmpl);
            this.infoBoxView = new InfoboxesView({
                el: $(contentContainer).
                    find('#dashboard-infoboxes')
            });
            self.nodeListModel = new NodeListModel();
            self.nodeListModel.reset();
            var alertListView = new AlertListView({
                el: $(contentContainer).find('#alerts-box'),
                model: self.nodeListModel.getAlertListModel()
            });
            alertListView.render();
            var logListView = new LogListView({
                el: $(contentContainer).find('#logs-box'),
                model: new LogListModel()
            });
            logListView.render();
            var sysInfoView = new SystemInfoView({
                el: $(contentContainer).find('#sysinfo-box'),
                model: self.nodeListModel.getNodeListModel()
            });
            sysInfoView.render();
        },
        addInfoboxes: function(infoBoxesCfg) {
            var self = this
            for(var i=0;i<infoBoxesCfg.length;i++) {
                self.infoBoxView.add(infoBoxesCfg[i]);
                //For each of the infoboxesCfg,add the model to NodeListModel 
                self.nodeListModel.addListModel(infoBoxesCfg[i]['model']);
            }
        }
    }))();

});
