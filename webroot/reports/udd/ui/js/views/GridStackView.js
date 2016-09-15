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
    "/assets/gridstack/js/gridstack.js",
    "contrail-view",
    "text!/reports/udd/ui/templates/layout.html",
    "text!/reports/udd/ui/templates/widget.html",
    "text!/reports/udd/ui/templates/layoutPlaceholder.html"
], function(_, Handlebars, GridStack, ContrailView,
    layoutTemplate, widgetTemplate, placeholderTemplate) {

    var GridStackView = ContrailView.extend({
        initialize: function() {
            var self = this;
            self.p = _.extend({
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
            }, self.attributes.viewConfig);

            self.listenTo(self.model, "add", self.onAdd);
            self.listenTo(self.model, "remove", self.onRemove);
            // TODO self.listenTo(self.model, 'reset', self.clear)
        },

        id: "widgets",
        template: Handlebars.compile(layoutTemplate),
        widgetTemplate: Handlebars.compile(widgetTemplate),
        events: {
            "change .grid-stack": "onChange",
            "resizestop .grid-stack": "onResize",
            "click .add-widget": "add",
        },
        placeholderHTML: Handlebars.compile(placeholderTemplate)(),

        render: function() {
            var self = this;
            self.$el.html(self.template({ width: self.p.width }));
            self.initLayout();
            _.each(self.model.models, function(model) {
                self.onAdd(model);
            });
            return self;
        },

        initLayout: function() {
            var self = this;
            var $grid = self.$(".grid-stack");

            $grid.gridstack(self.p);
            self.grid = $grid.data("gridstack");
            self.placeHolder = self.$el.append(self.placeholderHTML);
        },
        // place widget in most left and most top available position
        add: function() {
            var self = this;
            var newX;
            var newY;
            var newL;
            var linear = [];
            // transform two-dimensional widgets layout to linear cells array
            _.each(self.model.models, function(m) {
                var topLeft = m.attributes.configModel.y() * self.p.width + m.attributes.configModel.x();
                // mark cells of multicolumn widgets
                for (var col = 0, cols = m.attributes.configModel.width(); col < cols; col++) {
                    //linear[topLeft + col] = true;
                    // mark cells of multirow widgets
                    for (var row = 0, rows = m.attributes.configModel.height(); row < rows; row++) {
                        linear[topLeft + col + row * self.p.width] = true;
                    }
                }
            });
            // find empty cell or use last
            for (var i = 0, len = linear.length; i <= len; i++) {
                if (!linear[i]) {
                    newL = i;
                    break;
                }
            }
            newX = newL % self.p.width;
            newY = Math.floor(newL / self.p.width);

            self.model.add({
                dashboardId: self.p.dashboardId,
                tabId: self.p.tabId,
                tabName: self.model.getTabName(),
                config: { x: newX, y: newY, width: 1, height: self.p.minHeight },
            });
        },

        clear: function() {
            var self = this;
            self.grid.removeAll();
            return false;
        },

        // Add a single widget to the area by creating a view for it
        onAdd: function(model) {
            var self = this;
            var id = model.get("id");
            var widgetConfig = model.get("configModel").model().toJSON() || {};
            widgetConfig.id = id;
            self.grid.addWidget(self.widgetTemplate(widgetConfig),
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
                }, null, null, null, function(view) {
                    self.reconcileContentHeight(view.childViewMap[id].$el);
                });
            }

            if (model.ready) {
                renderView();
            } else {
                model.once("ready", renderView);
            }
        },

        onRemove: function(model) {
            var self = this;
            var el = self.$("#" + model.id);
            self.grid.removeWidget(el);
        },

        onResize: function(event, ui) {
            var self = this;
            var widget = _.find(self.childViewMap, function(w) {
                return w.$el[0] === ui.element[0];
            });
            // pospone resizing due to widget animation
            setTimeout(function() {
                widget.resize();
                self.reconcileContentHeight(widget.$el);
            }, 100);
        },
        // Update widget model config on gridstack items change
        // TODO Why onChange event get called with items as undefined so many time? Can we restrict it to more specific change condition?
        onChange: function(event, items) {
            var self = this;
            _.each(items, function(item) {
                if (!item.id) return;
                    
                var widgetView = self.childViewMap[item.id];
                if (!widgetView) return;

                var config = widgetView.model.get("configModel").model();
                config.set({
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                });
            });
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
        }
    });
    return GridStackView;
});
