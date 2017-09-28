/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'lodash',
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
            self.disableDrag = cowu.getValueByJsonPath(options,'attributes;viewConfig;disableDrag',false);
            self.disableResize = cowu.getValueByJsonPath(options,'attributes;viewConfig;disableResize',false);
            self.isSaveLayout = cowu.getValueByJsonPath(options,'attributes;viewConfig;savelayout',true);
            self.COLUMN_CNT = 2;
            self.VIRTUAL_COLUMNS = 2;
            //Decouple cellHieght from height assigned to widget
            self.CELL_HEIGHT_MULTIPLER = 1;
            //Default is 12 columns. To have 3 column layout, set defaultWidth as 4
            if(self.gridAttr['defaultWidth'] != null)
                self.COLUMN_CNT = cowc.GRID_STACK_COLUMN_CNT/self.gridAttr['defaultWidth'];

            self.$el.addClass('grid-stack grid-stack-24 custom-grid-stack');
            self.$el.attr('data-widget-id',self.elementId);
            self.gridStack = $(self.$el).gridstack({
                float: false,
                handle:'.drag-handle',
                resizable: {
                    handles:'sw,se',
                },
                disableDrag: self.disableDrag,
                disableResize: self.disableResize,
                verticalMargin:8/self.CELL_HEIGHT_MULTIPLER,
                cellHeight: 20,
                animate:false,
                acceptWidgets:'label',
                width: 24
            }).data('gridstack');

            self.$el.on('drag','.grid-stack-item',function(event,ui) {
                if($(ui.drag).find('.brush').length == 0) {
                    $('.custom-grid-stack').addClass('show-borders');
                }
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
                if(cowu.getLayoutPreference(self.elementId) != null) {
                    if(self.doSaveLayout == true)
                        self.saveGrid();
                    if(self.doSaveLayout == true)
                        self.doSaveLayout = false;
                }
            });
        },
        //Mark the layout as invalid if there are more than 5 widgets in a row i.e
        //avg width of a widget shouldn't be more than 12/5 (12 being the total width)
        isLayoutValid: function(data) {
            var itemWidths = _.sum(data,'itemAttr.width');
            var avgItemWidth = itemWidths/data.length;
            if(avgItemWidth < 2.3) {
                return false;
            }
            return true;
        },
        saveGrid : function () {
            var self = this;
            var isValidLayout = true;
            if(self.isSaveLayout === false)
            return false;
            var serializedData = _.map(self.$el.find('.custom-grid-stack-item:visible'), function (el) {
                el = $(el);
                var node = el.data('_gridstack_node');
                //itemAttr contains properties from both itemAttr (view.config file) & customItemAttr (ListView)
                var itemAttr = (el.data('data-cfg') != null)? el.data('data-cfg').itemAttr: {};
                // console.assert(el.attr('data-widget-id') != null);
                // console.assert(node.width != null || node.height != null, "Node width/height is null while serializing");
                if(node == null || node.x == null || node.height == null | node.width == null || node.y == null) {
                    isValidLayout = false;
                }
                return {
                    id: el.attr('data-widget-id'),
                    itemAttr: $.extend(itemAttr,{
                        x: node.x,
                        y: node.y,
                        width: node.width,
                        height: node.height
                        })
                };
            }, this);

            if(!self.isLayoutValid(serializedData)) {
                isValidLayout = false;
            }

            if(isValidLayout == true) {
                cowu.updateLayoutPreference(self.elementId, serializedData);
            } else {

            }
        },
        render: function() {
            var self = this;
            //Clear all existing widgets
            //self.gridStack.removeAll();
            _.each(self.$el.find('.custom-grid-stack-item:visible'), function (el) {
                try {
                    self.gridStack.removeWidget($(el));
                } catch(e) {
                    console.info('Error in removing widget');
                }
            });
            self.widgets = [];
            self.tmpHeight = 0;
            if(self.movedWidgetCfg) {
                // self.doSaveLayout = false;
                self.add(self.movedWidgetCfg, true);
                self.movedWidgetCfg = null;
            }
            var widgetCfgList = self.widgetCfgList;
            //Check if there exists a saved preference for current gridStack id
            if(cowu.getLayoutPreference(self.elementId) != null) {
                var serializedData = cowu.getLayoutPreference(self.elementId),
                    tmpData = serializedData;
                if(tmpData.length > 0) {
                    if(self.isLayoutValid(serializedData) == true) {
                        widgetCfgList = tmpData;
                    } else {
                        cowu.updateLayoutPreference(self.elementId,null,{delete:true});
                    }
                }
            }
            // currWidgetCfg['itemAttr'] - Defined in viewconfig.js / Read from localstorage
            // widgetCfgList[i]['itemAttr'] - Defined in ListView file
            for(var i=0;i < widgetCfgList.length;i++) {
                var currWidgetCfg = widgetConfigManager.get(widgetCfgList[i]['id'])(
                        widgetCfgList[i],i);
                //Here using extend for itemAttr - to get properties from both view.config & ListView
                self.add({
                    widgetCfg: widgetCfgList[i],
                    modelCfg: currWidgetCfg['modelCfg'],
                    viewCfg: currWidgetCfg['viewCfg'],
                    itemAttr: $.extend({},currWidgetCfg['itemAttr'],widgetCfgList[i]['itemAttr'])
                });
            }
            //Save the grid layout once gridstack view is rendered there are dropped widgets
            self.saveGrid();
            if(self.movedWidgetCfg) {
                self.movedWidgetCfg = null;
            }
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
            $(currElem).attr('id',widgetCfg['id']);
            $(currElem).data('data-cfg', cfg);
            if(cowu.getLayoutPreference(self.elementId) != null || isMoved) {
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
            var region = contrail.getCookie('region');
            if(region == null) {
                region = "Default"
            }
            //if there exists a mapping of modelId in widgetConfigManager.modelInstMap, use it
            //Maintain a mapping of cacheId vs contrailListModel and if found,return that
            var cachedModelObj = cowu.getValueByJsonPath(widgetConfigManager.modelInstMap,region + ';' + modelId);
            var isCacheExpired = true;
            
            if(cachedModelObj != null && 
               (_.now() - cachedModelObj['time']) < cowc.INFRA_MODEL_CACHE_TIMEOUT * 1000) {
                model = cowu.getValueByJsonPath(widgetConfigManager.modelInstMap,region + ';' + modelId+ ';model');
                if(model.errorList.length == 0) {
                    isCacheExpired = false;
                    model.loadedFromCache = true;
                }
            }
            if(!isCacheExpired) {
                model = cowu.getValueByJsonPath(widgetConfigManager.modelInstMap,region + ';' + modelId+ ';model');
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;source','').match(/STATTABLE|LOG|OBJECT/)) {
                model = new ContrailListModel(cowu.getStatsModelConfig(modelCfg['config']));
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;listModel','') != '') {
                model = modelCfg['listModel'];
            } else if(cowu.getValueByJsonPath(cfg,'modelCfg;_type') != 'contrailListModel' && modelCfg != null) {
                model = new ContrailListModel(modelCfg['config']);
            }
            if(isCacheExpired && modelId != null) {
                widgetConfigManager.modelInstMap[region] = {};
                widgetConfigManager.modelInstMap[region][modelId] = {
                    model: model,
                    time: _.now()
                };
            }
            var viewType = cowu.getValueByJsonPath(cfg,'viewCfg;view','');
            cfg['viewCfg'] = $.extend(true,{},chUtils.getDefaultViewConfig(viewType),cfg['viewCfg']);
            self.renderView4Config($(currElem).find('.item-content'), model, cfg['viewCfg'], null, null, null, function () {
                if(viewType.match(/eventDropsView/) || viewType.match(/VRouterCrossFiltersView/)) {
                    $(currElem).find('header').addClass('drag-handle');
                } else if (viewType.match(/GridView/)) {
                    $(currElem).find('.grid-widget-header').addClass('drag-handle');
                } else if(viewType.match(/StackedBarChartWithFocusView/)){
                    //No handle
                    var isBrushEnabled = getValueByJsonPath(cfg, 'viewCfg;viewConfig;chartOptions;brush', false);
                    if(isBrushEnabled) {
                        $(currElem).find('.stacked-bar-chart-container .axis-label').addClass('drag-handle');
                    } else {
                        $(currElem).find('.item-content').addClass('drag-handle');
                    }
                } else {
                    $(currElem).find('.item-content').addClass('drag-handle');
                }
            });
        }
    });
    return GridStackView;
});
