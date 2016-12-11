/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'backbone',
    'contrail-view',
    'gridstack',
    'contrail-list-model',
    'core-utils',
    'chart-utils',
    'widget-configmanager',
], function (_, Backbone,ContrailView,gridstack, ContrailListModel,CoreUtils,chUtils,widgetConfigManager) {
    var cowu = new CoreUtils();
    var GridStackView = ContrailView.extend({
        initialize: function(options) {
            var self = this;
            self.widgets = [];
            self.doSaveLayout = false;
            //Ensure that the passed-on options are not modified, need to reset to default layout
            self.widgetCfgList = cowu.getValueByJsonPath(options,'attributes;viewConfig;widgetCfgList',{});
            self.gridAttr = cowu.getValueByJsonPath(options,'attributes;viewConfig;gridAttr',{});
            self.elementId = cowu.getValueByJsonPath(options,'attributes;viewConfig;elementId','');
            self.movedWidgetCfg = cowu.getValueByJsonPath(options,'attributes;viewConfig;movedWidgetCfg',null);
            self.COLUMN_CNT = 2;
            self.VIRTUAL_COLUMNS = 2;
            //Decouple cellHieght from height assigned to widget
            self.CELL_HEIGHT_MULTIPLER = 1;
            //Default is 12 columns. To have 3 column layout, set defaultWidth as 4
            if(self.gridAttr['defaultWidth'] != null)
                self.COLUMN_CNT = 12/self.gridAttr['defaultWidth'];

            self.$el.addClass('grid-stack grid-stack-12 custom-grid-stack');
            self.$el.attr('data-widget-id',self.elementId);
            self.gridStack = $(self.$el).gridstack({
                float:true,
                handle:'.drag-handle',
                resizable: {
                    handles:'sw,se',
                },
                verticalMargin:8/self.CELL_HEIGHT_MULTIPLER,
                cellHeight: 20,
                animate:false,
                acceptWidgets:'label'
            }).data('gridstack');
            
            self.$el.on('dragstart',function(event,ui) {
                self.$el.find('.grid-stack-item').on('drag',function(event,ui) {
                    $('.custom-grid-stack').addClass('show-borders');
                });
                $('.custom-grid-stack').addClass('show-borders');
            });
            self.$el.on('dragstop',function(event,ui) {
                self.doSaveLayout = true;
                $('.custom-grid-stack').removeClass('show-borders');
            });
            self.$el.on('resizestart',function(event,ui) {
                $('.custom-grid-stack').addClass('show-borders');
            });
            //Trigger resize on widgets on resizestop
            self.$el.on('resizestop',function(event,ui) {
                self.doSaveLayout = true;
                $('.custom-grid-stack').removeClass('show-borders');
                $(ui.element[0]).trigger('resize');
            });
            //Listen for change events once gridStack is rendered else it's getting triggered even while adding widgets for the first time
            self.$el.on('change',function(event,items) {
                //Added to avoid saving to localStorage on resetLayout..as change event gets triggered even if we remove all widgets from gridstack
                if(localStorage.getItem(self.elementId) != null) {
                    if(self.doSaveLayout == true)
                        self.saveGrid();
                    if(self.doSaveLayout == true)
                        self.doSaveLayout = false;
                }
            });
        },
        saveGrid : function () {
            var self = this;
            var serializedData = _.map(self.$el.find('.grid-stack-item:visible'), function (el) {
                el = $(el);
                var node = el.data('_gridstack_node');
                return {
                    id: el.attr('data-widget-id'),
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                };
            }, this);
            if(serializedData.length > 0) {
                localStorage.setItem(self.elementId,JSON.stringify(serializedData));
            }
        },
        render: function() {
            var self = this;
            //Clear all existing widgets
            self.gridStack.removeAll();
            self.widgets = [];
            self.tmpHeight = 0;
            if(self.movedWidgetCfg) {
                // self.doSaveLayout = false;
                self.add(self.movedWidgetCfg, true);
                self.movedWidgetCfg = null;
            }
            var widgetCfgList = self.widgetCfgList;
            //Check if there exists a saved preference for current gridStack id
            if(localStorage.getItem(self.elementId) != null) {
                var serializedData = localStorage.getItem(self.elementId),
                    tmpData = JSON.parse(serializedData);
                if(tmpData.length > 0){
                    widgetCfgList = tmpData;
                }
            }
            for(var i=0;i < widgetCfgList.length;i++) {
                var currWidgetCfg = widgetConfigManager.get(widgetCfgList[i]['id'])();
                self.add({
                    widgetCfg: widgetCfgList[i],
                    modelCfg: currWidgetCfg['modelCfg'],
                    viewCfg: currWidgetCfg['viewCfg'],
                    itemAttr: $.extend({},currWidgetCfg['itemAttr'],widgetCfgList[i])
                });
            }
            self.saveGrid();
            self.$el.data('grid-stack-instance',self);
        },
        add: function(cfg, isMoved) {
            var self = this;
            var currElem = $($('#gridstack-widget-template').text()).attr('data-gs-height',2);
            var itemAttr = ifNull(cfg['itemAttr'],{});
            var defaultWidth = ifNull(self.gridAttr['defaultWidth'],1);
            var defaultHeight = ifNull(self.gridAttr['defaultHeight'],1)*self.CELL_HEIGHT_MULTIPLER;
            var widgetCfg = cfg['widgetCfg'];
            var widgetCnt = self.widgets.length;
            $(currElem).attr('data-widget-id',widgetCfg['id']);
            if(localStorage.getItem(self.elementId) != null || isMoved) {
                if(isMoved){
                    self.tmpHeight = itemAttr['height'];
                    itemAttr['x'] = 0;
                    delete itemAttr['y'];
                }else if(self.tmpHeight > 0){
                    itemAttr['y'] = itemAttr['y'] + self.tmpHeight;
                }
                self.gridStack.addWidget(currElem,itemAttr['x'],itemAttr['y'],itemAttr['width'],itemAttr['height']);
            } else {
                if(itemAttr['width'] != null) {
                    itemAttr['width'] = itemAttr['width']*defaultWidth;
                    $(currElem).attr('data-gs-width',itemAttr['width']);
                }
                if(itemAttr['height'] != null) {
                    itemAttr['height'] = itemAttr['height']*defaultHeight;
                    $(currElem).attr('data-gs-height',itemAttr['height']);
                }
                self.gridStack.addWidget(currElem,widgetCnt/self.COLUMN_CNT,(widgetCnt%self.COLUMN_CNT)/**self.VIRTUAL_COLUMNS*/,
                    ifNull(itemAttr['width'],defaultWidth),ifNull(itemAttr['height'],defaultHeight),true);
            }
            self.widgets.push(currElem);
            var modelCfg = cfg['modelCfg'],model;
            //Add cache Config
            var modelId = cfg['modelCfg']['modelId'];
            //if there exists a mapping of modelId in widgetConfigManager.modelInstMap, use it
            //Maintain a mapping of cacheId vs contrailListModel and if found,return that
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
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;source','').match(/STATTABLE|LOG|OBJECT/)) {
                model = new ContrailListModel(cowu.getStatsModelConfig(modelCfg['config']));
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;listModel','') != '') {
                model = modelCfg['listModel'];
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;_type') != 'contrailListModel' && modelCfg != null) {
                model = new ContrailListModel(modelCfg['config']);
            }
            if(isCacheExpired && modelId != null) {
                widgetConfigManager.modelInstMap[modelId] = {
                    model: model,
                    time: _.now()
                };
            }
            var viewType = cowu.getValueByJsonPath(cfg,'viewCfg;view','');
            if(viewType.match(/eventDropsView/)) {
                $(currElem).find('header').addClass('drag-handle');
            } else {
                $(currElem).find('.item-content').addClass('drag-handle');
            }
            cfg['viewCfg'] = $.extend(true,{},chUtils.getDefaultViewConfig(viewType),cfg['viewCfg']);
            $(currElem).data('data-cfg', cfg);
            self.renderView4Config($(currElem).find('.item-content'), model, cfg['viewCfg']);
        }
    });
    return GridStackView;
});
