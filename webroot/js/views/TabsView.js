/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var TabsView = ContrailView.extend({
        selectors: {
            linkList:       '.contrail-tab-link-list',
            addBlock:       '.contrail-tab-link-list .tab-add',
            editTitle:      '.contrail-tab-link-list .tab-add .edit-title',
            editTitleInput: '.contrail-tab-link-list .tab-add .edit-title > input',
            addLink:        '.contrail-tab-link-list .tab-add .link',
        },
        events: {
            'click .contrail-tab-link-list .tab-add .link': 'onClickAdd', 
            'click .contrail-tab-link-list .icon-remove': 'onClickRemove',
            'blur .contrail-tab-link-list .tab-add .edit-title > input': 'onAdd',
        },

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

            self.$el.html(tabsTemplate({
                elementId: elId,
                tabs: self.tabs,
                extraLinks: viewConfig['extra_links'],
                extendable: viewConfig['extendable'],
            }))

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

            self.$el.contrailTabs({
                active: activeTab,
                activate: function( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId],
                        tabHashUrlObj = {};

                    /*
                     * Execute activate if defined in viewConfig or tabConfig
                     */
                    if (contrail.checkIfFunction(viewConfig.activate)) {
                        //TODO bind activate function with current tab
                        // current element will be available as "this" context
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
                        layoutHandler.setURLHashParams({tab: tabHashUrlObj}, {triggerHashChange: false});

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

            tabsUIObj = self.$el.data('contrailTabs')._tabsUIObj;
            // TODO config condition?
            //tabsUIObj.sortable()
        },

        removeTab: function (tabIndex) {
            var self = this,
                tabPanelId,
                tabConfig = (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) ? self.tabs[tabIndex].tabConfig : null);
            if($.isArray(tabIndex)) {
                for (var i = 0; i < tabIndex.length; i++) {
                    self.removeTab(tabIndex[i]);
                }
                return;
            }

            tabPanelId = self.$('li:eq(' + tabIndex + ')').attr( "aria-controls");

            self.$('li:eq(' + tabIndex + ')').remove();
            $("#" + tabPanelId).remove();

            $.each(self.tabsIdMap, function (tabsIdKey, tabsIdValue) {
                if (tabsIdValue > tabIndex) {
                    self.tabsIdMap[tabsIdKey] = tabsIdValue - 1;
                }
            });

            delete self.tabsIdMap[tabPanelId];
            self.tabs.splice(tabIndex, 1);
            self.tabRendered.splice(tabIndex, 1);

            self.$el.data('contrailTabs').refresh();

            if (self.tabs.length === 0 && !self.attributes.viewConfig['extendable']) {
                self.$el.hide();
            }

            if (tabConfig !== null && contrail.checkIfFunction(tabConfig.onRemoveTab)) {
                tabConfig.onRemoveTab();
            }
        },

        renderTab: function(tabObj, onAllViewsRenderComplete) {
            var self = this,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childElId = tabObj[cowc.KEY_ELEMENT_ID];

            self.$el.show();

            self.renderView4Config(self.$el.find("#" + childElId), tabObj.model || self.model, tabObj, validation, lockEditingByDefault, modelMap, onAllViewsRenderComplete);
        },

        renderNewTab: function(elementId, tabViewConfigs, activateTab, modelMap, onAllViewsRenderComplete) {
            var self = this,
                tabLinkTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_LINK_VIEW),
                tabContentTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_CONTENT_VIEW),
                tabLength = self.tabs.length;

            self.modelMap = modelMap;

            $.each(tabViewConfigs, function(tabKey, tabValue) {
                if (!contrail.checkIfExist(self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'])) {
                    self.$(self.selectors.linkList).append(tabLinkTemplate([tabValue]));
                    self.$el.append(tabContentTemplate([tabValue]));
                    self.$el.data('contrailTabs').refresh();

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
                        self.$el.data('contrailTabs').activateTab(tabLength - 1);
                    } else if (typeof activateTab === 'number') {
                        self.$el.data('contrailTabs').activateTab(activateTab);
                    }

                } else {
                    self.$el.data('contrailTabs').activateTab(self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'])
                }
            });
        },

        onClickRemove: function (event) {
            var self = this
            var tabPanelId = $(event.currentTarget).closest( "li" ).attr( "aria-controls"),
                tabKey = self.tabsIdMap[tabPanelId],
                proceed = true

            if (contrail.checkIfExist(self.tabs[tabKey].tabConfig) && self.tabs[tabKey].tabConfig.removable === true) {
                if (self.tabs[tabKey].tabConfig.onRemove) {
                    proceed = self.tabs[tabKey].tabConfig.onRemove.bind(self.tabs[tabKey])()
                }
                if (proceed) self.removeTab(tabKey)
            }
        },

        onClickAdd: function (event) {
            var self = this
            self.$(self.selectors.addLink).hide()
            self.$(self.selectors.editTitle).show()
            self.$(self.selectors.editTitleInput).focus()
        },

        onAdd: function () {
            var self = this
            var title = self.$(self.selectors.editTitleInput).val()
            self.$(self.selectors.editTitle).hide()
            self.$(self.selectors.addLink).show()
            var addBlock = self.$(self.selectors.addBlock).detach()

            if (!self.attributes.viewConfig.onAdd) throw('specify onAdd function for extendable tabs')
            if (title) self.attributes.viewConfig.onAdd.bind(self)(title)
            setTimeout(function () {
                self.$(self.selectors.linkList).append(addBlock)
            })
        }
    });

    return TabsView;
});
