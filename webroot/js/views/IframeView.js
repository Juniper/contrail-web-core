/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['backbone'
], function (Backbone) {
    var IframeView = Backbone.View.extend({
        initialize: function(options) {
            var self=this;
            this.options = options;
        },
        render: function() {
            var self = this,
                url = self.options.url != null ? self.options.url : "";
            var iFrameTmpl = contrail.getTemplate4Id("iframe-template");
            $(self.$el).html('');
            $('body').append(iFrameTmpl({
                url: url,
            }));
        }
    });
    return IframeView;
});
