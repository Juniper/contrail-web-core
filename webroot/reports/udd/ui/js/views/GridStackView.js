/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * View for collection of widgets
 * Utilizes grid layout from gridstack jquery module
 */
define([
    "lodash",
    "handlebars",
    "gridstack",
    "contrail-view",
    "core-basedir/reports/udd/ui/js/common/udd.constants"
], function(_, Handlebars, GridStack, ContrailView, uddConstants) {
    var GridStackView = ContrailView.extend({
        initialize: function() {
            this.p = _.extend({
                animate: false,
                width: 2,
                float: false,
                removeTimeout: 100,
                acceptWidgets: ".grid-stack-item",
                handle: ".panel-heading",
                verticalMargin: 8,
                cellHeight: 60,
                minWidth: 1,
                minHeight: 6,
            }, this.attributes.viewConfig);

            this.template = window.contrail.getTemplate4Id("udd-layout-template");
            this.widgetTemplate = window.contrail.getTemplate4Id("udd-widget-template");
            this.placeholderHTML = window.contrail.getTemplate4Id("udd-layout-placeholder-template");

            this.listenTo(this.model, "add", this.onAdd);
            this.listenTo(this.model, "remove", this.onRemove);
        },

        id: "widgets",
        events: {
            "change .grid-stack": "onChange",
            "resizestop .grid-stack": "onResize",
            "click .add-widget": "add",
        },

        render: function() {
            this.$el.html(this.template({ width: this.p.width }));
            
            this.initLayout();
            
            _.forEach(this.model.models, function(model) {
                this.onAdd(model);
            }, this);

            return this;
        },

        initLayout: function() {
            var $grid = this.$(".grid-stack");

            $grid.gridstack(this.p);
            this.grid = $grid.data("gridstack");
            this.placeHolder = this.$el.append(this.placeholderHTML);
        },
        getNextPosMeta: function() {
            var newX, newY, newL,
                linear = [];

            // transform two-dimensional widgets layout to linear cells array
            _.forEach(this.model.models, function(m) {
                var configModel = m.get(uddConstants.modelIDs.WIDGET_META),
                    configJSON = configModel.model().toJSON() || {};

                if (!this.invalidPosMeta(configJSON)) {
                    var topLeft = configModel.y() * this.p.width + configModel.x();
                    // mark cells of multicolumn widgets
                    for (var col = 0, cols = configModel.width(); col < cols; col++) {
                        // linear[topLeft + col] = true;
                        // mark cells of multirow widgets
                        for (var row = 0, rows = configModel.height(); row < rows; row++) {
                            linear[topLeft + col + row * this.p.width] = true;
                        }
                    }
                }
            }, this);

            // find empty cell or use last
            for (var i = 0, len = linear.length; i <= len; i++) {
                if (!linear[i]) {
                    newL = i;
                    break;
                }
            }

            newX = newL % this.p.width;
            newY = Math.floor(newL / this.p.width);

            return {
                x: newX,
                y: newY,
                width: 1,
                height: this.p.minHeight
            };
        },
        // place widget in most left and most top available position
        add: function() {
            var newWidgetModelConfig = _.merge({
                dashboardId: this.p.dashboardId,
                tabId: this.p.tabId,
                tabName: this.model.getTabName(),
                tabCreationTime: this.model.getTabCreationTime(),
                config: {
                    isReady: false,
                    step: uddConstants.steps.DATA_CONFIG,
                    canProceed: false,
                    editingTitle: false
                }
            }, {
                config: this.getNextPosMeta()
            });

            this.model.add(newWidgetModelConfig);
        },

        clear: function() {
            this.grid.removeAll();

            return false;
        },

        // Add a single widget to the area by creating a view for it
        onAdd: function(model) {
            var self = this,
                id = model.get("id"),
                configModel = model.get(uddConstants.modelIDs.WIDGET_META),
                widgetConfig = model.get(uddConstants.raw.WIDGET_META) || {};

            widgetConfig.id = id;

            if (self.invalidPosMeta(widgetConfig)) {
                var newPosMeta = self.getNextPosMeta();

                model.set(uddConstants.raw.WIDGET_META, _.merge(widgetConfig, newPosMeta));
                _.forOwn(newPosMeta, function(value, key) {
                    configModel[key](value);
                });
            }

            self.grid.addWidget(
                self.widgetTemplate(widgetConfig),
                widgetConfig.x,
                widgetConfig.y,
                widgetConfig.width,
                widgetConfig.height,
                false, // autoposition
                self.p.minWidth, // minWidth
                undefined, // maxWidth
                self.p.minHeight, // minHeight
                undefined, // maxHeight
                id);

            var el = self.$("#" + id);

            function renderView() {
                self.renderView4Config(el, model, {
                    view: "WidgetView",
                    elementId: id,
                    viewPathPrefix: "reports/udd/ui/js/views/",
                    viewConfig: {},
                }, null, null, null, function(view) { // eslint-disable-line
                    // self.reconcileContentHeight(view.childViewMap[id].$el);
                });
            }

            if (model.ready) {
                renderView();
            } else {
                model.once("ready", renderView);
            }
        },

        onRemove: function(model) {
            var el = this.$("#" + model.id);
            this.grid.removeWidget(el);
        },

        onResize: _.throttle(function(event, ui) {
            var self = this,
                widget = _.find(self.childViewMap, function(w) {
                    return w.$el[0] === ui.element[0];
                });

            // pospone resizing due to widget animation
            setTimeout(function() {
                widget.resize();
                // self.reconcileContentHeight(widget.$el);
            }, 100);
        }, 500),
        // Update widget model config on gridstack items change
        // TODO Why onChange event get called with items as undefined so many time? Can we restrict it to more specific change condition?
        onChange: function(event, items) {
            _.forEach(items, function(item) {
                if (!item.id) {
                    return;
                }

                var widgetView = this.childViewMap[item.id];
                if (!widgetView) {
                    return;
                }

                var config = widgetView.model.get(uddConstants.modelIDs.WIDGET_META).model();
                config.set({
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                });
            }, this);
        },
        // TODO: this method is specific to a widget having GridView as content.
        // It should be moved to a specific location rather that this generic one.
        // Several locations to look into:
        //      * add resize method to the GridView definition
        //      * inject a resize method to the GridView instance via configuration object
        reconcileContentHeight: function(widget) {
            var $w = $(widget),
                contrailGridClass = "contrail-grid",
                classNames = {
                    widget: "widget",
                    contrailGrid: contrailGridClass,
                    widgetHeader: "panel-heading",
                    widgetFooter: "panel-footer",
                    gridHeader: "grid-header",
                    gridBody: "grid-body",
                    gridFooter: "grid-footer",
                    gridHeadingRow: "slick-header",
                    gridContentRow: "slick-viewport"
                },
                selectors = _.mapValues(classNames, function(className) {
                    return "." + className;
                }),
                $contrailGrid = $w.find(selectors.contrailGrid);

            if ($contrailGrid.length === 0) {
                return;
            }

            var $components = {};

            _.forEach(_.omit(selectors, contrailGridClass), function(selector, name) {
                $components[name] = $w.find(selector);
            });

            var newGridBodyHeight = $w.outerHeight() - $components.widgetHeader.outerHeight()
                    - $components.gridHeader.outerHeight() - $components.gridFooter.outerHeight()
                    - $components.widgetFooter.outerHeight(),
                newContentHeight = newGridBodyHeight - $components.gridHeadingRow.outerHeight();

            $components.gridBody.outerHeight(newGridBodyHeight);
            $components.gridContentRow.outerHeight(newContentHeight);
            $contrailGrid.data("contrailGrid")._grid.resizeCanvas();
        },
        invalidPosMeta: function(posMetaConfig) {
            return posMetaConfig.x === -1
                || posMetaConfig.y === -1
                || posMetaConfig.width === -1
                || posMetaConfig.height === -1;
        }
    });
    return GridStackView;
});
