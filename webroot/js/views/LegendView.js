define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var legendView = Backbone.View.extend({
        initialize: function (args) {
            var self = this,
                legendConfig = getValueByJsonPath(args, 'legendConfig'),
                selector = getValueByJsonPath(args, 'el'),
                legendTemplate = contrail.getTemplate4Id(cowc.TMPL_CUSTOM_CHART_LEGEND);
                if ($(selector).find('.custom-chart-legend') != null &&
                        $(selector).find('.custom-chart-legend').length > 0) {
                    $(selector).find('.custom-chart-legend').remove();
                }
                $(selector).prepend(legendTemplate(legendConfig));
        }
    });
    return legendView;
});