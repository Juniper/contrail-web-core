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

            //Clean-up if there already exists .infobox-container
            self.$el.find('.infobox-container').remove();
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
            self.$el.find('.infobox-container:first').append(infoboxTemplate(cfg));
            self.$el.find('.infobox-detail-container').append($('<div>',{
                    class:'infobox-detail-item',
                }));

            //Revisit - Highlight first infobox
            // self.$el.find('.infobox').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
            // $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').addClass('infobox-blue infobox-dark active');
            $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').
                addClass('infobox-blue infobox-dark active');

            //make infobox part of config itself. during update use it
            cfg['infobox'] = self.$el.find('.infobox-container:first .infobox:last');

            //Listen for changes on model to show/hide down count
            if(cfg['model'].loadedFromCache) {
                updateCnt();
            };
            cfg['model'].onDataUpdate.subscribe(function() {
                updateCnt();
            });

            //Initialize view
            var chartView = new cfg['view']({
                model: cfg['model'],
                el: self.$el.find('.infobox-detail-container .infobox-detail-item:last')
            });

            var renderFn = ifNull(cfg['renderfn'],'render');
            chartView[renderFn]();

            function updateCnt() {
                var rowCnt = cfg['model'].getItems().length;
                var downCnt = 0;
                if(typeof(cfg['downCntFn']) == 'function') {
                    downCnt = cfg['downCntFn'](cfg['model'].getItems());
                }
                cfg.infobox.find(".stat.stat-important").text(downCnt);
                if(downCnt == 0) {
                    cfg.infobox.find(".stat.stat-important").hide();
                } else {
                    cfg.infobox.find(".stat.stat-important").show();
                }
                cfg.infobox.find(".infobox-data-number").text(rowCnt);
            }
        },
    });
    return InfoboxesView;
});
