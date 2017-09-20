/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var InfoboxesView = ContrailView.extend({
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
                window.dispatchEvent(new Event('resize'));
            });
        },

        add: function(cfg,positionCfg) {
            var self = this;
            self.loadedInfoboxes.push(cfg);
            var prepend = _.result(positionCfg,'prepend',false);
            var infoboxTemplate = contrail.getTemplate4Id(cowc.TMPL_INFOBOX);
            var infoboxElem = $(infoboxTemplate(cfg));
            var detailElem = $('<div>',{
                        class:'infobox-detail-item',
                    });
            if(prepend == true) {
                self.$el.find('.infobox-container:first').prepend(infoboxElem);
                self.$el.find('.infobox-detail-container').prepend(detailElem);
            } else {
                self.$el.find('.infobox-container:first').append(infoboxElem);
                self.$el.find('.infobox-detail-container').append(detailElem);
            }

            //Highlight first infobox
             self.$el.find('.infobox-widget .infobox:not(:nth-child(1))').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
             $(self.$el.find('.infobox')[0]).removeClass('infobox-grey').
                addClass('infobox-blue infobox-dark active');

            //make infobox part of config itself. during update use it
            cfg['infobox'] = infoboxElem;

            //Listen for changes on model to show/hide down count
            if(cfg['model'].loadedFromCache) {
                updateCnt();
            };
            if (cfg['model'].onDataUpdate != null) {
                cfg['model'].onDataUpdate.subscribe(function() {
                    updateCnt();
                });
            }

            //Initialize view
            var chartView = new cfg['view']({
                model: cfg['model'],
                el: detailElem
            });

            var renderFn = cowu.ifNull(cfg['renderfn'],'render');
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
