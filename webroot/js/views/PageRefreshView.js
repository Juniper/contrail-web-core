/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view',
       ],
       function(_, ContrailView){
        var pageRefreshView = ContrailView.extend({
            render : function (){
                var self = this;
                var viewConfig = this.attributes.viewConfig;
                var parentView = viewConfig.parentView;
                var onClickFn = viewConfig.onClick;
                var pageRefreshTemplate = contrail.getTemplate4Id(
                        cowc.TMPL_PAGE_REFRESH_VIEW);
                self.$el.html(pageRefreshTemplate);
                var selector =  self.$el.find(".page-refresh").find('.fa-repeat');
                refreshTimer (self);
                if (onClickFn != null) {
                    $(selector).on("click", function () {
                        onClickFn();
                        startStopSpinner(self);
                    });
                } else {
                    $(selector).on("click", function() {
                       //Get all the sibling views and refresh their models.
                        self.refreshViews(parentView);
                        startStopSpinner(self);
                    });
                }
            },
            refreshViews : function (parentView) {
                if(parentView.models != null) {
                    $.each(parentView.models, function(i,d) {
                        if (typeof d.refreshData == 'function') {
                            d.refreshData();
                        }
                    });
                }
                var children = parentView.childViewMap;
                if(!_.isEmpty(children)) {
                    for(key in children) {
                        if(children[key].model != null && typeof children[key].model.refreshData == 'function') {
                            children[key].model.refreshData();
                        }
                        this.refreshViews(children[key]);
                    }
                }
            }
        });

        function startStopSpinner (self) {
            self.$el.find(".page-refresh").find('.fa-repeat')
                .removeClass("fa-repeat")
                .addClass('fa fa-spin fa-spinner');
            setTimeout( function() {
                refreshTimer(self);
                self.$el.find(".page-refresh").find('.fa-spinner')
                    .removeClass("fa-spin fa-spinner")
                    .addClass('fa fa-repeat');
            },2000);
        }

        function refreshTimer (self) {
            var min = 0;
            self.$el.find(".page-refresh")
                .find('.page-last-refresh-time-text')
                .text(getDisplayText(0,0));
            function pad ( val ) { return val >  9 ? val : "0" + val; }
            cowu.pageRefreshTimers.push(setInterval( function(){
                var mins = ++min % 60;
                var hours = parseInt(min / 60, 10);
                self.$el.find(".page-refresh")
                    .find('.page-last-refresh-time-text')
                    .text(getDisplayText(hours,mins));
            }, 60000));
        }

        function getDisplayText (h,m) {
            var text = "Last updated: ";
            if (h == 0 && m == 0) {
                text += 'now';
            } else if ( h > 0) {
                text += h + 'h ' + m + 'm ago';
            } else {
                text += m + 'm ago';
            }
            return text;
        }
        return pageRefreshView;
});