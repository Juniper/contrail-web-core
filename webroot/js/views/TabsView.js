/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
], function (_, ContrailView) {
    var TabsView = ContrailView.extend({
        selectors: {
            linkList: '.contrail-tab-link-list',
            addBlock: '.contrail-tab-link-list .tab-add',
            editTitle: '.contrail-tab-link-list .tab-add .title-edit',
            editTitleInput: '.contrail-tab-link-list .tab-add .title-edit > input',
            addLink: '.contrail-tab-link-list .tab-add .link',
        },
        events: {
            'click .contrail-tab-link-list .tab-add .link': 'onClickAdd',
            'click .contrail-tab-link-list .tab-menu .title-save': 'onEdit',
            //'click .contrail-tab-link-list .icon-remove': 'onEdit',
            'blur .contrail-tab-link-list .tab-add .title-edit > input': 'onAdd',
        },

        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
                tabHashUrlObj = layoutHandler.getURLHashParams().tab,
                tabsUIObj, activeTab = contrail.handleIfNull(viewConfig.active, 0);

            self.tabs = viewConfig.tabs
            self.tabsIdMap = {}
            self.tabRendered = []
            self.activateTimeout = null

            self.$el.html(tabsTemplate({
                elementId: elId,
                tabs: self.tabs,
                extraLinks: viewConfig.extra_links,
                extendable: viewConfig.extendable,
                editable: viewConfig.editable,
            }))

            $.each(self.tabs, function (tabKey, tabValue) {
                /*
                 * Setting activeTab if set in the URL params
                 */
                if (contrail.checkIfExist(tabHashUrlObj) &&
                    contrail.checkIfExist(tabHashUrlObj[elId]) &&
                    tabHashUrlObj[elId] === tabValue[cowc.KEY_ELEMENT_ID]) {
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

            self.$('#' + elId).contrailTabs({
                active: activeTab,
                activate: function ( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id'))
                    var tabKey = self.tabsIdMap[tabId]
                    var tabHashUrlObj = {}

                    self._initTabMenu(tabKey)
                    /*
                     * Execute activate if defined in viewConfig or tabConfig
                     */
                    if (contrail.checkIfFunction(viewConfig.activate)) {
                        // TODO bind activate function with current tab
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

                    self.activateTimeout = setTimeout(function () {
                        if (contrail.checkIfExist(self.tabs[tabKey]) && contrail.checkIfExist(self.tabs[tabKey]['elementId']))
                            tabHashUrlObj[elId] = self.tabs[tabKey]['elementId']
                        layoutHandler.setURLHashParams({tab: tabHashUrlObj}, {triggerHashChange: false});

                        self.activateTimeout = null;
                    }, 300);
                },

                beforeActivate: function ( event, ui ) {
                    var tabId = ($(ui.newPanel[0]).attr('id')),
                        tabKey = self.tabsIdMap[tabId];

                    if (self.tabRendered[tabKey] === false) {
                        self.renderTab(self.tabs[tabKey]);
                        self.tabRendered[tabKey] = true;
                    }
                },

                create: function ( event, ui ) {
                    var tabId = ($(ui.panel[0]).attr('id'))
                    var tabKey = self.tabsIdMap[tabId]

                    self._initTabMenu(tabKey)
                    if (self.tabRendered[tabKey] === false) {
                        self.renderTab(self.tabs[tabKey]);
                        self.tabRendered[tabKey] = true;
                    }
                },

                theme: viewConfig.theme,
            });

            tabsUIObj = self.$('#' + elId).data('contrailTabs')._tabsUIObj;
            // TODO config condition?
            // tabsUIObj.sortable()
        },

        _initTabMenu: function (tabKey) {
            var self = this

            var tabMenuTemplate = contrail.getTemplate4Id('core-tabs-menu-template')
            var tab = self.tabs[tabKey]
            self.$('#' + tab.elementId + '-tab-link').siblings('.tab-edit').popover({
                placement: 'bottom',
                trigger: 'focus click',
                html: true,
                content: function () {
                    return tabMenuTemplate(tab.title)
                },
            })
            //TODO destroy previous popover
        },

        removeTab: function (tabIndex) {
            var self = this,
                elId = self.attributes.elementId,
                tabPanelId,
                tabConfig = (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) ? self.tabs[tabIndex].tabConfig : null);
            if ($.isArray(tabIndex)) {
                for (var i = 0; i < tabIndex.length; i++) {
                    self.removeTab(tabIndex[i]);
                }
                return;
            }

            tabPanelId = self.$('#' + elId + ' li:eq(' + tabIndex + ')').attr( 'aria-controls');

            self.$('#' + elId + ' li:eq(' + tabIndex + ')').remove();
            $('#' + tabPanelId).remove();

            $.each(self.tabsIdMap, function (tabsIdKey, tabsIdValue) {
                if (tabsIdValue > tabIndex) {
                    self.tabsIdMap[tabsIdKey] = tabsIdValue - 1;
                }
            });

            delete self.tabsIdMap[tabPanelId];
            self.tabs.splice(tabIndex, 1);
            self.tabRendered.splice(tabIndex, 1);

            self.$('#' + elId).data('contrailTabs').refresh();

            if (self.tabs.length === 0 && !self.attributes.viewConfig.extendable) {
                self.$('#' + elId).hide();
            }

            if (tabConfig !== null && contrail.checkIfFunction(tabConfig.onRemoveTab)) {
                tabConfig.onRemoveTab();
            }
        },

        renderTab: function (tabObj, onAllViewsRenderComplete) {
            var self = this,
                elId = self.attributes.elementId,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childElId = tabObj[cowc.KEY_ELEMENT_ID];

            self.$('#' + elId).show();

            self.renderView4Config(self.$('#' + childElId), tabObj.model || self.model, tabObj, validation, lockEditingByDefault, modelMap, onAllViewsRenderComplete);
        },

        renderNewTab: function (elId, tabViewConfigs, activateTab, modelMap, onAllViewsRenderComplete) {
            var self = this,
                tabLinkTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_LINK_VIEW),
                tabContentTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_CONTENT_VIEW),
                tabLength = self.tabs.length,
                activateTabIndex;

            self.modelMap = modelMap;

            $.each(tabViewConfigs, function (tabKey, tabValue) {
                if (!contrail.checkIfExist(self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'])) {
                    self.$(self.selectors.linkList).append(tabLinkTemplate([tabValue]));
                    self.$('#' + elId).append(tabContentTemplate([tabValue]))
                    self.$('#' + elId).data('contrailTabs').refresh()

                    self.tabs.push(tabValue);
                    self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab'] = tabLength;
                    if (contrail.checkIfKeyExistInObject(true, tabValue, 'tabConfig.renderOnActivate') && tabValue.tabConfig.renderOnActivate === true) {
                        self.tabRendered.push(false);
                        // TODO - onAllViewsRenderComplete should be called when rendered
                    } else {
                        self.renderTab(tabValue, onAllViewsRenderComplete);
                        self.tabRendered.push(true);
                    }

                    tabLength++;

                    if (activateTab === true) {
                        activateTabIndex = tabLength - 1
                    } else if (_.isNumber(activateTab)) {
                        activateTabIndex = activateTab
                    }
                    if (!_.isUndefined(activateTabIndex)) {
                        self.$('#' + elId).data('contrailTabs').activateTab(activateTabIndex)
                    }
                } else {
                    activateTabIndex = self.tabsIdMap[tabValue[cowc.KEY_ELEMENT_ID] + '-tab']
                    self.$('#' + elId).data('contrailTabs').activateTab(activateTabIndex)
                }
            });
        },

        onEdit: function (event) {
            var self = this
            var li = $(event.currentTarget).closest( 'li' )
            var tabPanelId = li.attr( 'aria-controls')
            var tabKey = self.tabsIdMap[tabPanelId]
            var proceed = true
            var tab = self.tabs[tabKey]

            if (contrail.checkIfExist(self.tabs[tabKey].tabConfig) &&
                tab.tabConfig.editable === true) {
                self.$('.tab-edit').popover('hide')
                var newTitle = self.$('.title-updated').val()
                if (newTitle !== tab.title && newTitle) {
                    var tabLink = li.find('#' + tab.elementId + '-tab-link')
                    tabLink.html(newTitle)
                    tab.title = newTitle
                }
                if (self.tabs[tabKey].tabConfig.onEdit) {
                    proceed = self.tabs[tabKey].tabConfig.onEdit.bind(self.tabs[tabKey], newTitle)()
                }
                if (!newTitle && proceed) self.removeTab(tabKey)
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

            if (!self.attributes.viewConfig.onAdd) throw new Error('specify onAdd function for extendable tabs')
            if (title) self.attributes.viewConfig.onAdd.bind(self)(title)
            setTimeout(function () {
                self.$(self.selectors.linkList).append(addBlock)
            })
        },
    });

    return TabsView;
});
