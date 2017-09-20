/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var self = this;
    self.mockDataMap = {
        'InfoboxesView': function () {
            var InfoboxDetailView = Backbone.View.extend({
                render: function () {
                    this.$el.html(this.model.get('title'));
                }
            });
            var InfoboxDetailModel = Backbone.Model.extend({
                defaults: {
                    title: 'Virtual Routers'
                }
            });
            return [{
                description: "Adds 5 infoboxes",
                inputData: [{
                    title: 'Virtual Routers',
                    view: InfoboxDetailView,
                    model: new InfoboxDetailModel({title: 'Virtual Routers'}),
                    //downCntFn: dashboardUtils.getDownNodeCnt
                }, {
                    title: 'Control Nodes',
                    view: InfoboxDetailView,
                    model: new InfoboxDetailModel({title: 'Control Nodes'}),
                    //downCntFn: dashboardUtils.getDownNodeCnt
                },{
                    title: 'Analytics Nodes',
                    view: InfoboxDetailView,
                    model: new InfoboxDetailModel({title: 'Analytics Nodes'}),
                    //downCntFn: dashboardUtils.getDownNodeCnt
                },{
                    title: 'Config Nodes',
                    view: InfoboxDetailView,
                    model: new InfoboxDetailModel({title: 'Config Nodes'}),
                    //downCntFn: dashboardUtils.getDownNodeCnt
                },{
                    title: 'Database Nodes',
                    view: InfoboxDetailView,
                    model: new InfoboxDetailModel({title: 'Database Nodes'}),
                    //downCntFn: dashboardUtils.getDownNodeCnt
                }],
                outputData: {
                }
            }]
        },
    }
    return self.mockDataMap;
})