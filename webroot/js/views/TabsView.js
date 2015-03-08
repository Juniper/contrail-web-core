/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var TabView = Backbone.View.extend({
        render: function () {
            var tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
                viewConfig = this.attributes.viewConfig,
                self = this, tabs = viewConfig['tabs'],
                validation = this.attributes.validation,
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                modelMap = this.modelMap,
                childViewObj, childElId;

            this.$el.html(tabsTemplate(tabs));

            var projectTabs = this.$el.find("#contrail-tabs").contrailTabs({
                activate: viewConfig['activate']
            }).data('contrailTabs');

            for (var i = 0; i < tabs.length; i++) {
                childViewObj = tabs[i];
                childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                cowu.renderView4Config(this.$el.find("#" + childElId), this.model, childViewObj, validation, lockEditingByDefault, modelMap);
            }
        }
    });

    return TabView;
});