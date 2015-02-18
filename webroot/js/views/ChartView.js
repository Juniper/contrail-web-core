/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ChartView = Backbone.View.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                url = viewConfig['url'],
                self = this, deferredObj = $.Deferred();

            self.$el.append(loadingSpinnerTemplate);

            $.ajax({
                url: url
            }).done(function (result) {
                deferredObj.resolve(result);
            });

            deferredObj.done(function (response) {
                if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                    response = viewConfig['parseFn'](response);
                }
                self.$el[viewConfig['renderFn']](response);
                self.$el.find('.loading-spinner').remove()
            });

            deferredObj.fail(function (errObject) {
                if (errObject['errTxt'] != null && errObject['errTxt'] != 'abort') {
                    showMessageInChart({selector: $(self.$el), msg: 'Error in fetching Details', type: 'bubblechart'});
                }
            });
        }
    });

    return ChartView;
});