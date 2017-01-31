/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-basedir/reports/udd/ui/js/common/udd.constants"
], function(_, ContrailView, qeUtils, uddConstants) {
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
                tabIds = this.model.tabIds(this.currentDashboard),
                customTabOrder = this.model.getCustomizedTabListOrder(),
                customizedTabNumber = customTabOrder.length;

            // add default tab
            if (_.isEmpty(tabIds)) {
                tabIds.push(this.currentTab);
            }

            // sort by creationTime
            var tabs = _.sortBy(
                _.map(tabIds, function(tabId) {
                    return this.getConfig4Tab(tabId);
                }, this),
                function(tab) {
                    return tab.model.getTabCreationTime();
                });

            // do a stable sort based on the customized tab list order
            tabs = _.sortBy(tabs, function(tab) {
                var customOrderIdx = _.indexOf(customTabOrder, tab.elementId);
                return customOrderIdx === -1 ? customizedTabNumber++ : customOrderIdx;
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
                                dragToReorder: true,
                                dragToReorderHandler: function(serializedTabList) {
                                    _.forEach(this.model.models, function(model) {
                                        model.set("customizedTabListOrder", serializedTabList);
                                        model.save();
                                    });
                                }.bind(this),
                                dragToDrop: true,
                                dragToDropHandler: function(event, ui) {
                                    // TODO: the logic here is quite similiar to WidgetView.clone()
                                    // 
                                    // To reduce the code duplicates, find a way to reuse the WidgetView.clone() or vice versa
                                    var $toTab = $(event.target),
                                        $movedEntity = $(ui.draggable[0]);

                                    if ($movedEntity.is(".widget")) {
                                        var toTabId = $toTab.attr("aria-controls").slice(0, -4),
                                            fromTabId = $movedEntity.closest(".contrail-tab-content").attr("id"),
                                            widgetId = $movedEntity.attr("id"),
                                            widgetModelToMove = this.model.tabModels[fromTabId].collection.get(widgetId),
                                            toCollection = this.model.tabModels[toTabId],
                                            posMeta = ["x", "y", "width", "height"],
                                            vmParams = ["editingTitle", "isReady", "step", "canProceed"],
                                            widgetTileMeta = widgetModelToMove.get(uddConstants.modelIDs.WIDGET_META).model().attributes, // positioning, title and other UI state flags
                                            clonedWidgetConfig = widgetModelToMove.toJSON(); // overall widget component config

                                        // Parse the raw initial state of a widget
                                        widgetModelToMove.parse(clonedWidgetConfig);

                                        // Mark position meta invalid to let UDDGridStackView.onAdd recalculate them.
                                        clonedWidgetConfig.config = _.transform(clonedWidgetConfig.config, function(result, value, key) {
                                            if (_.includes(posMeta, key)) {
                                                result[key] = -1;
                                            } else {
                                                result[key] = value;
                                            }
                                        });

                                        // Add some ViewModel-generated props which are not saved on backend.
                                        // These props are used by KO bindings to handle UI logic
                                        _.merge(clonedWidgetConfig.config, _.pick(widgetTileMeta, vmParams));

                                        // Override the tab related info with the destination tab's
                                        _.merge(clonedWidgetConfig, toCollection.info);

                                        // Add the clone to destination tab
                                        toCollection.collection.add(clonedWidgetConfig);

                                        // Remove the moved widget
                                        widgetModelToMove.destroy();
                                    }
                                }.bind(this)
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
