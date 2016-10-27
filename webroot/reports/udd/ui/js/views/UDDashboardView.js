/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(_, ContrailView, qeUtils) {
    var UDDashboardView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            // TODO should it be in hashParams?
            var urlParams = window.layoutHandler.getURLHashObj();
            // get dashboard and tab ids from url params / loaded widgets or generate default
            this.currentDashboard = urlParams.p.split("_").slice(-1).pop() || this.model.dashboardIds()[0] || window.cowl.TITLE_UDD_DEFAULT_DASHBOARD;

            this.currentTab = urlParams.tab || this.model.tabIds(this.currentDashboard)[0] || qeUtils.generateQueryUUID().slice(0, 36);

            // TODO render dashboards in menu
            this.renderView4Config(this.$el, null, this.getViewConfig());
        },

        getViewConfig: function() {
            var self = this,
                currentTabNumber = 0, // get from array
                tabIds = this.model.tabIds(this.currentDashboard);

            // add default tab
            if (_.isEmpty(tabIds)) {
                tabIds.push(this.currentTab);
            }

            var tabs = _.sortBy(
                _.map(tabIds, function(tabId) {
                    return this.getConfig4Tab(tabId);
                }, this),
                function(tab) {
                    return tab.model.getTabCreationTime();
                });

            return {
                elementId: "widget-layout-tabs-view-section",
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "widget-layout-tabs-view",
                            view: "TabsView",
                            viewConfig: {
                                theme: "overcast",
                                active: currentTabNumber,
                                tabs: tabs,
                                onAdd: function(title) {
                                    var tabViewConfigs = [self.getConfig4Tab(qeUtils.generateQueryUUID().slice(0, 36), title, Date.now())];
                                    this.renderNewTab("widget-layout-tabs-view", tabViewConfigs, true);
                                },
                                extendable: true,
                            },
                        } ],
                    } ],
                },
            };
        },

        getConfig4Tab: function(tabId, tabName, tabCreationTime) {
            var tabModel = this.model.filterBy(this.currentDashboard, tabId),
                tabConfig = {
                    elementId: tabId,
                    view: "GridStackView",
                    viewPathPrefix: "reports/udd/ui/js/views/",
                    viewConfig: {
                        dashboardId: this.currentDashboard,
                        tabId: tabId,
                        tabName: tabName
                    },
                    model: tabModel,
                    tabConfig: {
                        activate: function() {
                            // TODO as we don't know the actual content of the widget use view.update()
                            this.$("#" + tabId + " svg").trigger("refresh");
                        }.bind(this),
                        onEdit: function(newTitle) {
                            var proceed = false;
                            if (!newTitle) {
                                if (this.model.isEmpty()) {
                                    return true;
                                }
                                proceed = confirm("Are you sure to delete all widgets in this tab?");
                                if (proceed) {
                                    var widgets = this.model.models;
                                    while (widgets.length > 0) {
                                        widgets[0].destroy();
                                    }
                                }
                            } else {
                                this.model.setTabName(newTitle);
                            }
                            // TODO error handling
                            return proceed;
                        },
                        renderOnActivate: true,
                        editable: true,
                    },
                };

            if (tabConfig.model.isEmpty()) {
                tabConfig.title = tabName || tabId;
                tabConfig.model.setTabName(tabConfig.title);
                tabConfig.model.setTabCreationTime(tabCreationTime);
            } else {
                tabConfig.title = tabConfig.model.getTabName();
            }

            return tabConfig;
        },
    });

    return UDDashboardView;
});
