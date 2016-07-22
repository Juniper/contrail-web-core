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
                tabHashUrlObj = layoutHandler.getURLHashParams()['tab'],
                tabsUIObj, activeTab = contrail.handleIfNull(viewConfig.active, 0);

            self.tabs = viewConfig['tabs'];
            self.tabsIdMap = {};
            self.tabRendered = [];
            self.activateTimeout = null;

            self.$el.html(tabsTemplate({elementId: elId, tabs: self.tabs, extraLinks: viewConfig['extra_links']}));

            $.each(self.tabs, function(tabKey, tabValue) {
                /*
                 * Setting activeTab if set in the URL params
                 */
                if (contrail.checkIfExist(tabHashUrlObj) && contrail.checkIfExist(tabHashUrlObj[elId]) && tabHashUrlObj[elId] === tabValue[cowc.KEY_ELEMENT_ID]) {
                    activeTab = tabKey
                }

                self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabKey;
                if (contrail.checkIfKeyExistInObject(true, tabValue, 'tabConfig.renderOnActivate') &&  tabValue.tabConfig.renderOnActivate === true) {
                    self.tabRendered.push(false);
                } else {
                    self.renderTab(tabValue);
                    self.tabRendered.push(true);
                }
            });

            $('#' + elId).contrailTabs({
                active: activeTab,
                activate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId],
                        tabHashUrlObj = {};

                    /*
                     * Execute activate if defined in viewConfig or tabConfig
                     */
                    if (contrail.checkIfFunction(viewConfig.activate)) {
                        viewConfig.activate(event, ui);
                    }

                    if (contrail.checkIfExist(self.tabs[tabKey].tabConfig) && contrail.checkIfFunction(self.tabs[tabKey].tabConfig.activate)) {
                        self.tabs[tabKey].tabConfig.activate(event, ui);
                    }

                    /*
                     * Setting activeTab to the url on activate
                     */

                    if (self.activateTimeout !== null) {
                        clearTimeout(self.activateTimeout);
                    }

                    self.activateTimeout = setTimeout(function() {
                        if (contrail.checkIfExist(self.tabs[tabKey]) && contrail.checkIfExist(self.tabs[tabKey]['elementId']))
                        tabHashUrlObj[elId] = self.tabs[tabKey]['elementId'];
                        /* below check is required to not update
                          url hash params when tab used inside form */
                        if(viewConfig.type !== cowc.TAB_FORM_TYPE) {
                            layoutHandler.setURLHashParams({tab: tabHashUrlObj}, {triggerHashChange: false});
                        }

                        self.activateTimeout = null;
                    }, 300);
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

            tabsUIObj.delegate( ".contrail-tab-link-icon-remove", "click", function(event) {
                var tabPanelId = $( this ).closest( "li" ).attr( "aria-controls"),
                    tabKey = self.tabsIdMap[tabPanelId];

                if(contrail.checkIfExist(self.tabs[tabKey].tabConfig) && self.tabs[tabKey].tabConfig.removable === true) {
                    self.removeTab(tabKey);
                }
            });
        },

        removeTab: function (tabIndex) {
            var self = this,
                elId = self.attributes.elementId, tabPanelId,
                tabConfig = (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) ? self.tabs[tabIndex].tabConfig : null);
            if($.isArray(tabIndex)) {
                for (var i = 0; i < tabIndex.length; i++) {
                    self.removeTab(tabIndex[i]);
                }
                return;
            }

            tabPanelId = $("#" + elId).find('li:eq(' + tabIndex + ')').attr( "aria-controls");

            $("#" + elId).find('li:eq(' + tabIndex + ')').remove();
            $("#" + tabPanelId).remove();

            $.each(self.tabsIdMap, function (tabsIdKey, tabsIdValue) {
                if (tabsIdValue > tabIndex) {
                    self.tabsIdMap[tabsIdKey] = tabsIdValue - 1;
                }
            });

            delete self.tabsIdMap[tabPanelId];
            self.tabs.splice(tabIndex, 1);
            self.tabRendered.splice(tabIndex, 1);

            $('#' + elId).data('contrailTabs').refresh();

            if (self.tabs.length === 0) {
                $("#" + elId).hide();
            }

            if (tabConfig !== null && contrail.checkIfFunction(tabConfig.onRemoveTab)) {
                tabConfig.onRemoveTab();
            }
        },

        renderTab: function(tabObj, onAllViewsRenderComplete) {
            var self = this,
                elId = self.attributes.elementId,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childElId = tabObj[cowc.KEY_ELEMENT_ID];

            $("#" + elId).show();

            self.renderView4Config(this.$el.find("#" + childElId), this.model, tabObj, validation, lockEditingByDefault, modelMap, onAllViewsRenderComplete);
        },

        renderNewTab: function(elementId, tabViewConfigs, activateTab, modelMap, onAllViewsRenderComplete) {
            var self = this,
                tabLinkTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_LINK_VIEW),
                tabContentTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_CONTENT_VIEW),
                tabLength = self.tabs.length;

            self.modelMap = modelMap;

            $.each(tabViewConfigs, function(tabKey, tabValue) {
                if (!contrail.checkIfExist(self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'])) {
                    $('#' + elementId + ' > ul.contrail-tab-link-list').append(tabLinkTemplate([tabValue]));
                    $('#' + elementId).append(tabContentTemplate([tabValue]));
                    $('#' + elementId).data('contrailTabs').refresh();

                    self.tabs.push(tabValue);
                    self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabLength;
                    if (contrail.checkIfKeyExistInObject(true, tabValue, 'tabConfig.renderOnActivate') && tabValue.tabConfig.renderOnActivate === true) {
                        self.tabRendered.push(false);
                        //TODO - onAllViewsRenderComplete should be called when rendered
                    } else {
                        self.renderTab(tabValue, onAllViewsRenderComplete);
                        self.tabRendered.push(true);
                    }

                    tabLength++;

                    if (activateTab === true) {
                        $('#' + elementId).data('contrailTabs').activateTab(tabLength - 1);
                    } else if (typeof activateTab === 'number') {
                        $('#' + elementId).data('contrailTabs').activateTab(activateTab);
                    }

                } else {
                    $('#' + elementId).data('contrailTabs').activateTab(self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'])
                }
            });
        }
    });

    return TabsView;
});