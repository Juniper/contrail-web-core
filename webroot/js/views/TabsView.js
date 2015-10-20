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
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
                tabs = viewConfig['tabs'],
                tabsIdMap = {}, tabRendered = [];

            self.$el.html(tabsTemplate({elementId: elId, tabs: tabs}));

            $.each(tabs, function(tabKey, tabValue) {
                tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabKey;
                if (contrail.checkIfKeyExistInObject(true, 'tabValue.tabConfig', 'renderOnActivate') &&  tabValue.tabConfig.renderOnActivate === true) {
                    tabRendered.push(false);
                } else {
                    self.renderTab(tabValue);
                    tabRendered.push(true);
                }
            });

            $('#' + elId).contrailTabs({
                active: contrail.handleIfNull(viewConfig.active, 0),
                activate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = tabsIdMap[tabId];

                    if (contrail.checkIfFunction(viewConfig.activate)) {
                        viewConfig.activate(event, ui);
                    }

                    if (contrail.checkIfExist(tabs[tabKey].tabConfig) && contrail.checkIfFunction(tabs[tabKey].tabConfig.activate)) {
                        tabs[tabKey].tabConfig.activate(event, ui);
                    }
                },
                beforeActivate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = tabsIdMap[tabId];

                    if (tabRendered[tabKey] === false) {
                        self.renderTab(tabs[tabKey]);
                        tabRendered[tabKey] = true;
                    }
                },
                create: function( event, ui ) {
                    var tabId = ($(ui.panel[0]).attr('id')),
                        tabKey = tabsIdMap[tabId];

                    if (tabRendered[tabKey] === false) {
                        self.renderTab(tabs[tabKey]);
                        tabRendered[tabKey] = true;
                    }
                },
                theme: viewConfig.theme
            });
        },

        renderTab: function(tabObj) {
            var self = this,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childElId = tabObj[cowc.KEY_ELEMENT_ID];

            self.renderView4Config(this.$el.find("#" + childElId), this.model, tabObj, validation, lockEditingByDefault, modelMap);
        }
    });

    return TabsView;
});