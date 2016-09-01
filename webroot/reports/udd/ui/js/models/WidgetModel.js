/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  "lodash",
  "backbone",
  "core-basedir/js/common/qe.utils",
  "core-constants",
  "contrail-model",
  "text!reports/udd/config/default.config.json"
], function(_, Backbone, qewu, cowc, ContrailModel, defaultConfig) {
  defaultConfig = JSON.parse(defaultConfig);

  var WidgetModel = Backbone.Model.extend({
    initialize: function(_p) {
      var self = this,
        attrs = self.attributes;

      self.ready = false;
      if (!_p || !_p.id) {
        var p = _p || {};
        self.id = qewu.generateQueryUUID().slice(0, 36);
        attrs.config = p.config || {};
        attrs.id = self.id;
        attrs.config.title = self.id;
        attrs.contentConfig = self.getDefaultConfig();
      }

      var views = {
        dataConfigView: attrs.contentConfig.dataConfigView.view,
        contentView: attrs.contentConfig.contentView.view,
      };
      attrs.viewsModel = new ContrailModel(views);
      attrs.viewsModel.model().on("change", self.changeConfigModel.bind(self));

      attrs.configModel = new ContrailModel(attrs.config);
      // autosave widget gui config
      attrs.configModel.model().on("change", function() {
        self.save();
      });
      require([self.getConfigModelObj(attrs.contentConfig.dataConfigView.view).path,
          self.getConfigModelObj(attrs.contentConfig.contentView.view).path
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

      data.contentConfig.contentConfigView.modelConfig = JSON.parse(data.contentConfig.contentConfigView.modelConfig);
      data.contentConfig.dataConfigView.modelConfig = JSON.parse(data.contentConfig.dataConfigView.modelConfig);
      return data;
    },

    validate: function() {
      var self = this;
      var attrs = self.attributes;
      var validConfig = !!attrs.configModel.title();
      var validContentConfig = attrs.contentConfigModel ? attrs.contentConfigModel.model().isValid(true, "validation") : true;
      var validDataConfig = attrs.dataConfigModel.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION);
      return !(validConfig && validContentConfig && validDataConfig);
    },

    getDataSourceList: function() {
      return _.keys(defaultConfig.dataSources);
    },

    getContentViewList: function() {
      return _.keys(defaultConfig.contentViews);
    },

    getDefaultConfig: function() {
      var self = this;
      var config = {};
      var defaultDSViewId = self.getDataSourceList()[0];
      var defaultDSViewConfig = defaultConfig.dataSources[defaultDSViewId];
      var defaultContentViewId = self.getContentViewList()[0];
      var defaultContentViewConfig = defaultConfig.contentViews[defaultContentViewId];
      config.dataConfigView = _.extend({}, defaultDSViewConfig);
      config.contentView = _.extend({}, defaultContentViewConfig.contentView);
      config.contentConfigView = _.extend({}, defaultContentViewConfig.contentConfigView);
      return config;
    },

    getViewConfig: function(viewType) {
      var self = this;
      var viewsModel = self.get("viewsModel").model();
      var viewId;
      var viewPathPrefix;
      var viewConfig = {};
      switch (viewType) {
        case "dataConfigView":
          viewId = viewsModel.get(viewType);
          viewPathPrefix = _.get(defaultConfig, ["dataSources", viewId, "viewPathPrefix"]);
          break;
        case "contentView":
          viewId = viewsModel.get(viewType);
          viewPathPrefix = _.get(defaultConfig, ["contentViews", viewId, viewType, "viewPathPrefix"]);
          viewConfig = self.get("contentConfigModel") ? self.get("contentConfigModel").getContentViewOptions() : {};
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
        elementId: self.get("id") + "-" + viewType,
        viewConfig: viewConfig,
      };
    },

    getConfigModelObj: function(view) {
      if (!view) {
        return {};
      }

      var config = defaultConfig.contentViews[view],
        modelId = "",
        pathPrefix = "";

      if (config) {
        modelId = _.get(config, "contentConfigView.model");
        pathPrefix = _.get(config, "contentConfigView.modelPathPrefix");
      } else {
        modelId = _.get(defaultConfig, ["dataSources", view, "model"]);
        pathPrefix = _.get(defaultConfig, ["dataSources", view, "modelPathPrefix"]);
      }
      return {
        id: modelId,
        path: pathPrefix + modelId,
        pathPrefix: pathPrefix,
      };
    },

    changeConfigModel: function(viewsModel) {
      var self = this;
      var changed = viewsModel.changed;
      var contentConfigModel = {};
      var dataConfigModel = {};
      if (changed.dataConfigView) {
        dataConfigModel = self.getConfigModelObj(changed.dataConfigView);
        var changeContentView = defaultConfig.dataSources[changed.dataConfigView].contentViews[0];
        contentConfigModel = self.getConfigModelObj(changeContentView);
      } else if (changed.contentView) {
        contentConfigModel = self.getConfigModelObj(changed.contentView);
      } else {
        return;
      }
      require([dataConfigModel.path, contentConfigModel.path], self._onConfigModelsLoaded.bind(self));
    },

    toJSON: function() {
      var self = this;
      var attrs = self.attributes;
      var configModel = attrs.configModel;

      var result = {
        dashboardId: attrs.dashboardId,
        tabId: attrs.tabId,
        tabName: attrs.tabName,
        config: {
          title: configModel.title(),
          x: configModel.x(),
          y: configModel.y(),
          width: configModel.width(),
          height: configModel.height(),
        },
        contentConfig: {
          dataConfigView: {
            view: self.getViewConfig("dataConfigView").view,
            viewPathPrefix: self.getViewConfig("dataConfigView").viewPathPrefix,
            model: self.getConfigModelObj(attrs.viewsModel.dataConfigView()).id,
            modelPathPrefix: self.getConfigModelObj(attrs.viewsModel.dataConfigView()).pathPrefix,
            modelConfig: JSON.stringify(attrs.dataConfigModel.toJSON()),
          },
          contentView: {
            view: self.getViewConfig("contentView").view,
            viewPathPrefix: self.getViewConfig("contentView").viewPathPrefix,
          },
          contentConfigView: {
            view: self.getViewConfig("contentConfigView").view,
            viewPathPrefix: self.getViewConfig("contentConfigView").viewPathPrefix,
            model: self.getConfigModelObj(attrs.viewsModel.contentView()).id,
            modelPathPrefix: self.getConfigModelObj(attrs.viewsModel.contentView()).pathPrefix,
            modelConfig: attrs.contentConfigModel ? JSON.stringify(attrs.contentConfigModel.toJSON()) : undefined,
          },
        },
      };
      return result;
    },

    _onConfigModelsLoaded: function(DataConfigModel, ContentConfigModel) {
      var self = this;
      var contentConfigModel;
      var dataConfigModel = self.get("dataConfigModel");
      var attrs = self.attributes;
      if (attrs.dataConfigModel) {
        attrs.dataConfigModel.model().off();
      }
      if (DataConfigModel) {
        dataConfigModel = new DataConfigModel(attrs.contentConfig.dataConfigView.modelConfig);
        self.set("dataConfigModel", dataConfigModel);
      }
      if (ContentConfigModel) {
        // TODO set dataModel in modelConfig
        contentConfigModel = new ContentConfigModel(attrs.contentConfig.contentConfigView.modelConfig);
        contentConfigModel.onDataModelChange(dataConfigModel);
        dataConfigModel.model().on("change", contentConfigModel.onDataModelChange.bind(contentConfigModel, dataConfigModel));
      }
      // for some content views config may be missing
      self.set("contentConfigModel", contentConfigModel);

      self.ready = true;
      self.trigger("ready");
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
