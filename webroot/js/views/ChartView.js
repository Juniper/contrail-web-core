/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ChartView = Backbone.View.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                url = viewConfig['url'],
                self = this, deferredObj = $.Deferred();

            $.ajax({
                url: url
            }).done(function (result) {
                deferredObj.resolve(result);
            });

            deferredObj.done(function (response) {
                if (viewConfig['parseFn'] != null && typeof(viewConfig['parseFn']) == 'function') {
                    response = viewConfig['parseFn'](response);
                }
                self.$el[viewConfig['renderFn']](response);
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