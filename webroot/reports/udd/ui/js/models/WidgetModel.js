/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "backbone",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-constants",
    "contrail-model",
    "text!reports/udd/config/default.config.json"
], function(_, Backbone, qeUtils, cowc, ContrailModel, defaultConfig) {
    defaultConfig = JSON.parse(defaultConfig);

    var WidgetModel = Backbone.Model.extend({
        initialize: function(_p) {
            var self = this;

            self.ready = false;

            if (!_p || !_p.id) {
                var p = _p || {},
                    uuid = qeUtils.generateQueryUUID().slice(0, 36),
                    _widgetConfig = p.config || {
                        isReady: false
                    };

                _.merge(_widgetConfig, {
                    title: uuid
                });

                self.set("id", uuid);
                self.set("config", _widgetConfig);
                self.set("contentConfig", self.getDefaultConfig());
            }

            var views = {
                    dataConfigView: self.get("contentConfig").dataConfigView.view,
                    contentView: self.get("contentConfig").contentView.view,
                },
                _viewsModel = new ContrailModel(views),
                _configModel = new ContrailModel(self.get("config"));

            self.set("viewsModel", _viewsModel);
            _viewsModel.model().on("change", self.changeConfigModel.bind(self));

            self.set("configModel", _configModel);
            // autosave widget gui config
            _configModel.model().on("change", function() {
                self.save();
            });

            require([self.getConfigModelObj(views.dataConfigView).path,
                    self.getConfigModelObj(views.contentView).path
                ],
                self._onConfigModelsLoaded.bind(self)
            );

            self._parseViewLabels();
        },

        parse: function(data) {
            // on successful model save
            if (data.result) {
                return data;
            }

            if (data.error) {
                console.error(data.error);
                return [];
            }

            // Why these two lines here????
            data.contentConfig.contentConfigView.modelConfig = JSON.parse(data.contentConfig.contentConfigView.modelConfig);
            data.contentConfig.dataConfigView.modelConfig = JSON.parse(data.contentConfig.dataConfigView.modelConfig);
            return data;
        },

        validate: function() {
            var attrs = this.attributes,
                validConfig = !!attrs.configModel.title(),
                validContentConfig = attrs.contentConfigModel ? attrs.contentConfigModel.model().isValid(true, "validation") : true,
                validDataConfig = attrs.dataConfigModel.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION);

            return !(validConfig && validContentConfig && validDataConfig);
        },

        getDataSourceList: function() {
            return _.keys(defaultConfig.dataSources);
        },

        getContentViewList: function() {
            return _.keys(defaultConfig.contentViews);
        },

        getDefaultConfig: function() {
            var defaultDSViewId = this.getDataSourceList()[0],
                defaultDSViewConfig = defaultConfig.dataSources[defaultDSViewId],
                defaultContentViewId = this.getContentViewList()[0],
                defaultContentViewConfig = defaultConfig.contentViews[defaultContentViewId];

            return {
                dataConfigView: _.extend({}, defaultDSViewConfig),
                contentView: _.extend({}, defaultContentViewConfig.contentView),
                contentConfigView: _.extend({}, defaultContentViewConfig.contentConfigView)
            };
        },

        /**
         * Load view meta data for the "viewType"
         * @param  {string} viewType [description]
         * @return {object}          an object describing how to load the view
         */
        getViewConfig: function(viewType) {
            var viewsModel = this.get("viewsModel").model(),
                viewId, viewPathPrefix, viewConfig = {};

            switch (viewType) {
                case "dataConfigView":
                    viewId = viewsModel.get(viewType);
                    viewPathPrefix = _.get(defaultConfig, ["dataSources", viewId, "viewPathPrefix"]);
                    break;
                case "contentView":
                    viewId = viewsModel.get(viewType);
                    viewPathPrefix = _.get(defaultConfig, ["contentViews", viewId, viewType, "viewPathPrefix"]);
                    viewConfig = this.get("contentConfigModel") ? this.get("contentConfigModel").getContentViewOptions() : {};
                    break;
                case "contentConfigView":
                    var contentView = viewsModel.get("contentView");
                    viewId = _.get(defaultConfig, ["contentViews", contentView, viewType, "view"]);
                    viewPathPrefix = _.get(defaultConfig, ["contentViews", contentView, viewType, "viewPathPrefix"]);
                    break;
                default:
            }

            return {
                view: viewId,
                viewPathPrefix: viewPathPrefix,
                elementId: this.get("id") + "-" + viewType,
                viewConfig: viewConfig,
            };
        },

        /**
         * Load data model meta data for 'viewId' from predefined "default.config.json"
         * @param  {string} viewId view identifier
         * @return {object}        an object describing how to load the view's data model
         */
        getConfigModelObj: function(viewId) {
            if (!viewId) {
                return {};
            }

            var modelId = "", pathPrefix = "",
                baseObjPath = _.has(defaultConfig.contentViews, viewId) ? ["contentViews", viewId, "contentConfigView"] : ["dataSources", viewId];

            modelId = _.get(defaultConfig, baseObjPath.concat("model"));
            pathPrefix = _.get(defaultConfig, baseObjPath.concat("modelPathPrefix"));

            return {
                id: modelId,
                path: pathPrefix + modelId,
                pathPrefix: pathPrefix,
            };
        },

        changeConfigModel: function(viewsModel) {
            var changed = viewsModel.changed,
                contentConfigModel = {},
                dataConfigModel = {};

            if (changed.dataConfigView) {
                console.debug("changed data config view");
                dataConfigModel = this.getConfigModelObj(changed.dataConfigView);
                // What does this retrieve????
                var changeContentView = defaultConfig.dataSources[changed.dataConfigView].contentViews[0];
                contentConfigModel = this.getConfigModelObj(changeContentView);
            } else if (changed.contentView) {
                console.log("changed content config view");
                contentConfigModel = this.getConfigModelObj(changed.contentView);
            } else {
                return;
            }

            require([dataConfigModel.path, contentConfigModel.path], this._onConfigModelsLoaded.bind(this));
        },

        toJSON: function() {
            var attrs = this.attributes,
                widgetConfigModel = attrs.configModel;

            var result = {
                dashboardId: attrs.dashboardId,
                tabId: attrs.tabId,
                tabName: attrs.tabName,
                config: {
                    title: widgetConfigModel.title(),
                    x: widgetConfigModel.x(),
                    y: widgetConfigModel.y(),
                    width: widgetConfigModel.width(),
                    height: widgetConfigModel.height(),
                },
                contentConfig: {
                    dataConfigView: {
                        view: this.getViewConfig("dataConfigView").view,
                        viewPathPrefix: this.getViewConfig("dataConfigView").viewPathPrefix,
                        model: this.getConfigModelObj(attrs.viewsModel.dataConfigView()).id,
                        modelPathPrefix: this.getConfigModelObj(attrs.viewsModel.dataConfigView()).pathPrefix,
                        modelConfig: JSON.stringify(attrs.dataConfigModel.toJSON()),
                    },
                    contentView: {
                        view: this.getViewConfig("contentView").view,
                        viewPathPrefix: this.getViewConfig("contentView").viewPathPrefix,
                    },
                    contentConfigView: {
                        view: this.getViewConfig("contentConfigView").view,
                        viewPathPrefix: this.getViewConfig("contentConfigView").viewPathPrefix,
                        model: this.getConfigModelObj(attrs.viewsModel.contentView()).id,
                        modelPathPrefix: this.getConfigModelObj(attrs.viewsModel.contentView()).pathPrefix,
                        modelConfig: attrs.contentConfigModel ? JSON.stringify(attrs.contentConfigModel.toJSON()) : undefined,
                    },
                },
            };
            return result;
        },

        _onConfigModelsLoaded: function(DataConfigModel, ContentConfigModel) {
            var contentConfigModel,
                dataConfigModel = this.get("dataConfigModel"),
                attrs = this.attributes;

            if (attrs.dataConfigModel) {
                // Why remove custom and Backbone event handlers???
                attrs.dataConfigModel.model().off("change");
            }

            if (DataConfigModel) {
                dataConfigModel = new DataConfigModel(attrs.contentConfig.dataConfigView.modelConfig);
                this.set("dataConfigModel", dataConfigModel);
            }

            if (ContentConfigModel) {
                // TODO set dataModel in modelConfig
                contentConfigModel = new ContentConfigModel(attrs.contentConfig.contentConfigView.modelConfig);

                // ALERT: Since the onDataModelChange event hanlder listens to Backbone's change event,
                //        we should pass in the underlying Backbone model rather than the KnockBack model.
                //        This will avoid an data update timing issue (the Backbone model is updated,
                //        but the Knockback observables are not updated till next CPU tick.)
                contentConfigModel.onDataModelChange(dataConfigModel.model());
                dataConfigModel.model().on("change", contentConfigModel.onDataModelChange.bind(contentConfigModel, dataConfigModel.model()));
            }

            // for some content views config may be missing <=== What?!!!!
            this.set("contentConfigModel", contentConfigModel);

            this.ready = true;
            this.trigger("ready");
        },

        _parseViewLabels: function() {
            var self = this;
            self.viewLabels = {};
            _.each(_.extend({}, defaultConfig.contentViews, defaultConfig.dataSources), function(config, id) {
                self.viewLabels[id] = config.label;
            });
        },
    });
    return WidgetModel;
});
