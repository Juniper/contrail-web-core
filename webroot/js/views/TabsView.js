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
                tabsUIObj;

                self.tabs = viewConfig['tabs'];
                self.tabsIdMap = {};
                self.tabRendered = [];

            self.$el.html(tabsTemplate({elementId: elId, tabs: self.tabs}));

            $.each(self.tabs, function(tabKey, tabValue) {
                self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabKey;
                if (contrail.checkIfKeyExistInObject(true, tabValue, 'tabConfig.renderOnActivate') &&  tabValue.tabConfig.renderOnActivate === true) {
                    self.tabRendered.push(false);
                } else {
                    self.renderTab(tabValue);
                    self.tabRendered.push(true);
                }
            });

            $('#' + elId).contrailTabs({
                active: contrail.handleIfNull(viewConfig.active, 0),
                activate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId];

                    if (contrail.checkIfFunction(viewConfig.activate)) {
                        viewConfig.activate(event, ui);
                    }

                    if (contrail.checkIfExist(self.tabs[tabKey].tabConfig) && contrail.checkIfFunction(self.tabs[tabKey].tabConfig.activate)) {
                        self.tabs[tabKey].tabConfig.activate(event, ui);
                    }
                },
                beforeActivate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId];

                    if (self.tabRendered[tabKey] === false) {
                        self.renderTab(self.tabs[tabKey]);
                        self.tabRendered[tabKey] = true;
                    }
                },
                create: function( event, ui ) {
                    var tabId = ($(ui.panel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId];

                    if (self.tabRendered[tabKey] === false) {
                        self.renderTab(self.tabs[tabKey]);
                        self.tabRendered[tabKey] = true;
                    }
                },
                theme: viewConfig.theme
            });

            tabsUIObj = $('#' + elId).data('contrailTabs')._tabsUIObj;

            tabsUIObj.delegate( ".contrail-tab-link-icon-remove", "click", function() {
                var tabPanelId = $( this ).closest( "li" ).remove().attr( "aria-controls"),
                    tabKey = self.tabsIdMap[tabPanelId];

                if(contrail.checkIfExist(self.tabs[tabKey].tabConfig) && self.tabs[tabKey].tabConfig.removable === true) {
                    $("#" + tabPanelId).remove();
                    $('#' + elId).data('contrailTabs').refresh();

                    if (contrail.checkIfExist(self.tabs[tabKey].tabConfig) && contrail.checkIfFunction(self.tabs[tabKey].tabConfig.onRemoveTab)) {
                        self.tabs[tabKey].tabConfig.onRemoveTab();
                    }

                    $.each(self.tabsIdMap, function (tabsIdKey, tabsIdValue) {
                        if (tabsIdValue > tabKey) {
                            tabsIdValue -= 1;
                        }
                    });

                    delete self.tabsIdMap[tabPanelId];
                    self.tabs.splice(tabKey, 1);
                    self.tabRendered.splice(tabKey, 1);
                }
            });
        },

        renderTab: function(tabObj) {
            var self = this,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childElId = tabObj[cowc.KEY_ELEMENT_ID];

            self.renderView4Config(this.$el.find("#" + childElId), this.model, tabObj, validation, lockEditingByDefault, modelMap);
        },

        renderNewTab: function(elementId, tabViewConfigs, activateTab) {
            var self = this,
                tabLinkTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_LINK_VIEW),
                tabContentTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_CONTENT_VIEW),
                tabLength = self.tabs.length;

            $('#' + elementId + ' > ul.contrail-tab-link-list').append(tabLinkTemplate(tabViewConfigs));
            $('#' + elementId).append(tabContentTemplate(tabViewConfigs));
            $('#' + elementId).data('contrailTabs').refresh();

            $.each(tabViewConfigs, function(tabKey, tabValue) {
                self.tabs.push(tabValue);
                self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabLength + tabKey;
                if (contrail.checkIfKeyExistInObject(true, 'tabValue.tabConfig', 'renderOnActivate') &&  tabValue.tabConfig.renderOnActivate === true) {
                    self.tabRendered.push(false);
                } else {
                    self.renderTab(tabValue);
                    self.tabRendered.push(true);
                }

                tabLength++;
            });

            if (activateTab === true) {
                $('#' + elementId).data('contrailTabs').activateTab(tabLength - 1);
            } else if (typeof activateTab === 'number') {
                $('#' + elementId).data('contrailTabs').activateTab(activateTab);
            }

        }
    });

    return TabsView;
});