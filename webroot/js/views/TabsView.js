/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var TabsView = ContrailView.extend({
        render: function () {
            var self = this,
                elId = self.attributes.elementId,
                tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
                viewConfig = self.attributes.viewConfig,
                tabs = viewConfig['tabs'],
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childViewObj, childElId, childView;

            self.$el.html(tabsTemplate({elementId: elId, tabs: tabs}));

            var tabsData = $('#' + elId).contrailTabs({
                active: contrail.handleIfNull(viewConfig.active, 0),
                activate: viewConfig.activate,
                theme: viewConfig.theme
            }).data('contrailTabs');

            for (var i = 0; i < tabs.length; i++) {
                childViewObj = tabs[i];
                childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                childView = self.renderView4Config(this.$el.find("#" + childElId), this.model, childViewObj, validation, lockEditingByDefault, modelMap);
            }
        }
    });

    return TabsView;
});