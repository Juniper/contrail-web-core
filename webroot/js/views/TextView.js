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

            if (self.model !== null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderText(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderText(selector, viewConfig, self.model);
                });

                self.resizeFunction = _.debounce(function (e) {
                     self.renderText($(self.$el), viewConfig, self.model);
                 },cowc.THROTTLE_RESIZE_EVENT_TIME);

                $(window).on('resize',self.resizeFunction);

            }
        },

        renderText: function (selector, viewConfig, textViewModel) {
            var data = textViewModel.getItems(),
                template = viewConfig['template'];
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }
            $(selector).html('');
            if (textViewModel != null && !textViewModel.isRequestInProgress() && data != null && data.length == 0) {
                $(selector).html('<div class="alarm-load-status"><p class="status"><i class=""></i> No Alarms Found.</p></div>')
            }
            else if (template != null) {
                var html = '',
                    template = contrail.getTemplate4Id(template);

                $.each(data, function(idx, obj) {
                    html += template(obj);
                });
            }

            $(selector).append(html);
        }
    });
    return TextView;
});
