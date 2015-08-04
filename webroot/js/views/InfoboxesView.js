/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InfoboxesView = Backbone.View.extend({
        initialize: function() {
            var self = this;

            self.$el.append($('<div/>',{
                class:'infobox-container'
            }));
            self.$el.append($('<div/>',{
                class:'infobox-detail-container'
            }));

            //Add click listener for infoboxes to show/hide the respective container
            self.$el.find('.infobox-container').on('click','.infobox',function() {
                var tabIdx = $(this).index();
                self.$el.find('.infobox-detail-container .infobox-detail-item').hide();
                $(self.$el.find('.infobox-detail-container .infobox-detail-item')[tabIdx]).show();
                $(window).resize();
            });
        },

        add: function(cfg) {
            var self = this;
            var infoboxTemplate = contrail.getTemplate4Id(cowc.TMPL_INFOBOX);
            self.$el.find('.infobox-container').append(infoboxTemplate(cfg));
            self.$el.find('.infobox-detail-container').append($('<div>',{
                    class:'infobox-detail-item',
                }));

            //Initialize view
            var chartView = new cfg['view']({
                model: cfg['model'],
                el: self.$el.find('.infobox-detail-container .infobox-detail-item:last')
            });
            var currInfobox = self.$el.find('.infobox-container .infobox:last');
            var renderFn = ifNull(cfg['renderfn'],'render');
            chartView[renderFn]();

            //Listen for changes on model to show/hide down count
            if(cfg['model'].isRequestInProgress() == false) {
                updateCnt();
            };
            cfg['model'].onDataUpdate.subscribe(function() {
                updateCnt();
            });
            function updateCnt() {
                var rowCnt = cfg['model'].getItems().length;
                var downCnt = 0;
                if(typeof(cfg['downCntFn']) == 'function') {
                    downCnt = cfg['downCntFn'](cfg['model'].getItems());
                }
                currInfobox.find(".stat.stat-important").text(downCnt);
                if(downCnt == 0) {
                    currInfobox.find(".stat.stat-important").hide();
                } else {
                    currInfobox.find(".stat.stat-important").show();
                }
                currInfobox.find(".infobox-data-number").text(rowCnt);
            }
        },
    });
    return InfoboxesView;
});
