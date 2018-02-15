/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var TextView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                selector = $(self.$el);

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            $(self.$el).html('');

            if (self.model !== null && self.model.isRequestInProgress) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderText(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderText(selector, viewConfig, self.model);
                });

                self.model.onDataUpdate.subscribe(function () {
                    self.renderText($(self.$el), viewConfig, self.model);
                });

                self.resizeFunction = _.debounce(function (e) {
                     self.renderText($(self.$el), viewConfig, self.model);
                 },cowc.THROTTLE_RESIZE_EVENT_TIME);

                $(window).on('resize',self.resizeFunction);

            } else if(self.model) {
                self.renderTemplate($(self.$el), viewConfig, self.model);
            }
        },

        renderText: function (selector, viewConfig, textViewModel) {
            var data = textViewModel.getItems(),
                template = viewConfig['template'];
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                title = cowu.getValueByJsonPath(viewConfig,'title');

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }
            $(selector).html('');
            var html = '';
            if (title) {
                html = '<div class="row notification-title">'+ title +'</div>'
            }
            if (textViewModel != null && !textViewModel.isRequestInProgress() && data != null && data.length == 0) {
                html += '<div class="alarm-load-status"><p class="status"><i class=""></i> No Alarms Found.</p></div>';
//                $(selector).html(html)
            }
            else if (template != null) {
                template = contrail.getTemplate4Id(template);
                $.each(data, function(idx, obj) {
                    html += template(obj);
                });
            }

            $(selector).append(html);
        },
        renderTemplate: function(selector, viewConfig, data) {
            var template = contrail.getTemplate4Id(viewConfig['template']);
            $(selector).html(template(data))
        }

    });
    return TextView;
});
