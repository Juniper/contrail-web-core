/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InfoboxesView = Backbone.View.extend({
        initialize: function() {
            var self = this;
            self.loadedInfoboxes = [];

            self.$el.append(contrail.getTemplate4Id(cowc.TMPL_INFOBOXES_VIEW)());
            self.$el.find("[data-action='refresh']").on('click',function() {
                for(var len=self.loadedInfoboxes.length,i=0;i < len;i++) {
                    var currInfobox = self.loadedInfoboxes[i];
                    currInfobox['model'].refreshData();
                }
            });

            //Add click listener for infoboxes to show/hide the respective container
            self.$el.find('.infobox-container').on('click','.infobox',function() {
                var tabIdx = $(this).index('.infobox');
                //Hide all infobox detail containers and show the one corresponding
                //to clicked infobox.
                self.$el.find('.infobox-detail-container').
                    find('.infobox-detail-item').hide();
                $(self.$el.find('.infobox-detail-container').
                    find('.infobox-detail-item')[tabIdx]).show();
                //Highlight the selected infobox
                self.$el.find('.infobox').removeClass('infobox-blue').
                    removeClass('infobox-dark active').addClass('infobox-grey');
                $(self.$el.find('.infobox')[tabIdx]).removeClass('infobox-grey').
                    addClass('infobox-blue infobox-dark active');
                $(window).resize();
            });
        },

        add: function(cfg) {
            var self = this;
            self.loadedInfoboxes.push(cfg);
            var infoboxTemplate = contrail.getTemplate4Id(cowc.TMPL_INFOBOX);
            self.$el.find('.infobox-container').append(infoboxTemplate(cfg));
            self.$el.find('.infobox-detail-container').append($('<div>',{
                    class:'infobox-detail-item',
                }));

            //Revisit - Highlight first infobox
            // self.$el.find('.infobox').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
            // $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').addClass('infobox-blue infobox-dark active');
            $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').
                addClass('infobox-blue infobox-dark active');

            //Initialize view
            var chartView = new cfg['view']({
                model: cfg['model'],
                el: self.$el.find('.infobox-detail-container .infobox-detail-item:last')
            });
            var currInfobox = self.$el.find('.infobox-container .infobox:last');
            var renderFn = ifNull(cfg['renderfn'],'render');
            chartView[renderFn]();

            //Listen for changes on model to show/hide down count
            if(cfg['model'].loadedFromCache) {
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
