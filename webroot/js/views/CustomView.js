/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'chart-view',
    'chart-utils',
    'contrail-list-model',
    'widget-configmanager',
], function (_, ChartView, chUtils, ContrailListModel, widgetConfigManager) {
    var CustomView = ChartView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                template = viewConfig['template'],
                selector = $(self.$el);
            self.viewConfig = viewConfig;
            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            $(selector).html(contrail.getTemplate4Id(template)(viewConfig));
            self.renderChart(selector, viewConfig, self.model);
            ChartView.prototype.bindListeners.call(self);
        },

        renderChart: function (selector, viewConfig, textViewModel) {
            //var data = textViewModel.getItems(),
            var self = this,
                childWidgets = viewConfig['childWidgets'];

            var widgetElements = $(selector).find('.widget-container');
            $.each(widgetElements, function (idx, el) {
                if (childWidgets[idx] != null) {
                    var widgetCfg = widgetConfigManager.get(childWidgets[idx]);
                    var viewType = cowu.getValueByJsonPath(widgetCfg,'viewCfg;view','');
                    var model = self.getModelForCfg(widgetCfg['modelCfg']);
                    widgetCfg['viewCfg'] = $.extend(true,{},chUtils.getDefaultViewConfig(viewType),widgetCfg['viewCfg']);
                    self.renderView4Config(el, model, widgetCfg['viewCfg']);
                }
            });
        },
        getModelForCfg: function (cfg, options) {
            //Maintain a mapping of cacheId vs contrailListModel and if found,return that
            var defObj;
            // var listModel = new ContrailListModel([]);
            var modelId = cfg['modelId'];
            var cachedModelObj = widgetConfigManager.modelInstMap[modelId];
            var isCacheExpired = true;
            if(cachedModelObj != null && 
               (_.now() - cachedModelObj['time']) < cowc.INFRA_MODEL_CACHE_TIMEOUT * 1000) {
                model = widgetConfigManager.modelInstMap[modelId]['model'];
                if(model.errorList.length == 0) {
                    isCacheExpired = false;
                    model.loadedFromCache = true;
                }
            }
            if(!isCacheExpired) {
                model = widgetConfigManager.modelInstMap[modelId]['model'];
            } else if(cowu.getValueByJsonPath(cfg,'source','').match(/STATTABLE|LOG|OBJECT/)) {
                if(options && options['needContrailListModel'] == true) {
                    model = cowu.fetchStatsListModel(cfg['config']);
                } else {
                    BbCollection = Backbone.Collection.extend({});
                    BbModel = Backbone.Model.extend({
                        defaults: {
                            type: cfg['type'],
                            data: []
                        },
                        isRequestInProgress: function() {
                            if(model.fetched == false) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                        getItems: function() {
                            return this.get('data');
                        },
                        initialize: function(options) {
                            this.cfg = options['cfg'];
                        },
                        sync: function(method,model,options) {
                            var defObj;
                            if(method == "read") {
                                defObj = cowu.fetchStatsListModel(this.cfg);
                            }
                            defObj.done(function(data) {
                                model.fetched = true;
                                options['success'](data); 
                            });
                        },
                        parse: function(data) {
                            var self = this;
                            this.set({data: data});
                        }
                    });
                    bbModelInst = new BbModel({
                        cfg:cfg['config']
                    });
                    bbModelInst.fetch();
                    model = bbModelInst;
                }
            } else if(cowu.getValueByJsonPath(cfg,'listModel','') != '') {
                model = cfg['listModel'];
            } else if(cowu.getValueByJsonPath(cfg,'_type') != 'contrailListModel' && !$.isEmptyObject(cfg) && cfg != null) {
                model = new ContrailListModel(cfg['config']);
            } 
            return model;
        }
    });
    return CustomView;
});
