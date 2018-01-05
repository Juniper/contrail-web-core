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
        /**
         * @param {Object} options 
         * @param {Object} options.attributes
         */ 
        initialize: function(options) {
            var self = this;
            self.widgets = [];
            self.doSaveLayout = false;
            //Ensure that the passed-on options are not modified, need to reset to default layout
            self.widgetCfgList = _.result(options,'attributes.viewConfig.widgetCfgList',{});
            self.gridAttr = _.result(options,'attributes.viewConfig.gridAttr',{});
            self.elementId = _.result(options,'attributes.viewConfig.elementId','');
            self.movedWidgetCfg = _.result(options,'attributes.viewConfig.movedWidgetCfg',null);
            self.disableDrag = _.result(options,'attributes.viewConfig.disableDrag',false);
            self.disableResize = _.result(options,'attributes.viewConfig.disableResize',false);
            self.isSaveLayout = _.result(options,'attributes.viewConfig.savelayout',true);
            self.COLUMN_CNT = 2;
            self.VIRTUAL_COLUMNS = 2;
            //Decouple cellHieght from height assigned to widget
            self.CELL_HEIGHT_MULTIPLER = 1;
            //Default is 12 columns. To have 3 column layout, set defaultWidth as 4
            if(self.gridAttr['defaultWidth'] != null)
                self.COLUMN_CNT = cowc.GRID_STACK_COLUMN_CNT/self.gridAttr['defaultWidth'];
            self.$el.append($('#gridstack-template').text());
            self.$el.find('.custom-grid-stack').addClass('grid-stack grid-stack-24');
            self.$el.attr('data-widget-id',self.elementId);
            self.gridStack = $(self.$el).find('.custom-grid-stack').gridstack({
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
            self.$el.find('.fa-plus').on('click',function() {
                self.add();
            });

            self.$el.on('dragstart',function(event,ui) {
                self.$el.find('.grid-stack-item').on('drag',function(event,ui) {
                    $('.custom-grid-stack').addClass('show-borders');
                });
            });
            if (cowc.panelLayout) {
                self.$el.on('mouseenter','.grid-stack-item',function() {
                    $(this).find('.flip-button').show();
                });
                self.$el.on('mouseleave','.grid-stack-item', function() {
                    $(this).find('.flip-button').hide();
                });
                self.$el.find('.fa-plus').on('click',function() {
                    self.add();
                });
            }
            self.$el.on('dragstart',function(event,ui) {
                self.$el.find('.grid-stack-item').on('drag',function(event,ui) {
                    $('.custom-grid-stack').addClass('show-borders');
                });
            });
            
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
                if(self.doSaveLayout == true)
                    self.saveGrid();
                if(self.doSaveLayout == true)
                    self.doSaveLayout = false;
            });
            self.$el.find('.widget-dropdown').hover(function() {
                self.$el.find('.widget-dropdown').show();
            },function() {
                self.$el.find('.widget-dropdown').hide();
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
            // return;
            var self = this;
            var isValidLayout = true;
            if(self.isSaveLayout === false)
            return false;
            var serializedData = _.map(self.$el.find('.custom-grid-stack-item:visible'), function (el) {
                el = $(el);
                var node = el.data('_gridstack_node');
                //itemAttr contains properties from both itemAttr (view.config file) & customItemAttr (ListView)
                var itemAttr = {},
                    viewCfg = {};
                if (el.data('data-cfg') != null) {
                    itemAttr = el.data('data-cfg').itemAttr;
                    viewCfg = el.data('data-cfg').viewCfg;
                }
                // console.assert(el.attr('data-widget-id') != null);
                // console.assert(node.width != null || node.height != null, "Node width/height is null while serializing");
                if(node == null || node.x == null || node.height == null | node.width == null || node.y == null) {
                    isValidLayout = false;
                }
                return {
                    id: el.attr('data-widget-id'),
                    viewCfg: viewCfg,
                    itemAttr: $.extend(itemAttr,{
                        x: node.x,
                        y: node.y,
                        width: node.width,
                        height: node.height
                        })
                };
            }, this);

            // var itemWidths = _.sum(serializedData,function(d) {  
            //     return _.result(d,'itemAttr.width',0)
            // });

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
            //Clear all existing widgets if any before rendering new widgets
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
                if(!self.isLayoutValid(tmpData)) {
                    localstorage.removeItem(self.elementId);
                }
            }
            // currWidgetCfg['itemAttr'] - Defined in viewconfig.js / Read from localstorage
            // widgetCfgList[i]['itemAttr'] - Defined in ListView file
            for(var i=0;i < widgetCfgList.length;i++) {
                var currWidgetCfg = widgetConfigManager.get(widgetCfgList[i]['id'],widgetCfgList[i]);
                //Here using extend for itemAttr - to get properties from both view.config & ListView
                self.add({
                    widgetCfg: widgetCfgList[i],
                    modelCfg: currWidgetCfg['modelCfg'],
                    //viewCfg: currWidgetCfg['viewCfg'],
                    viewCfg: $.extend(true, {},currWidgetCfg['viewCfg'], cowu.getValueByJsonPath(widgetCfgList, i+';viewCfg', {})),
                    itemAttr: $.extend({},currWidgetCfg['itemAttr'],widgetCfgList[i]['itemAttr'])
                });
            }
            if(self.movedWidgetCfg) {
                //Save the grid layout once gridstack view is rendered there are dropped widgets
                self.saveGrid();
                self.movedWidgetCfg = null;
            }
            self.$el.find('.grid-stack').data('grid-stack-instance',self);
        },
        /**
         * @param {Object} cfg
         * @param {Boolean} isMoved - True if this widget is pulled from another page
         */
        add: function(cfg, isMoved) {
            var self = this;
            var itemAttr = _.result(cfg,'itemAttr',{});
            $.extend(itemAttr, {panelLayout: cowc.panelLayout});
            var widgetTemplate = contrail.getTemplate4Id('gridstack-widget-template');
            var currElem = $(widgetTemplate(itemAttr)).attr('data-gs-height',2);
            var defaultWidth = ifNull(self.gridAttr['widthMultiplier'],1);
            var defaultHeight = ifNull(self.gridAttr['heightMultiplier'],1)*self.CELL_HEIGHT_MULTIPLER;
            var widgetCfg = _.result(cfg, 'widgetCfg', {});
            var widgetCnt = self.widgets.length;
            $(currElem).attr('data-widget-id',widgetCfg['id']);
            $(currElem).attr('id',widgetCfg['id']);
            $(currElem).data('data-cfg', cfg);
            if(typeof(cfg) == 'undefined') {
                currElem.attr('data-gs-height',8);
                currElem.attr('data-gs-width',12);
                self.gridStack.addWidget(currElem);
            } else {
                var itemAttr = ifNull(cfg['itemAttr'],{});
                var widthMultiplier = ifNull(self.gridAttr['widthMultiplier'],1);
                var heightMultiplier = ifNull(self.gridAttr['heightMultiplier'],1)*self.CELL_HEIGHT_MULTIPLER;
                var widgetIdx = self.widgets.length;

                //If an widget is dragged to current page for which layout preferences exists, push down all the widgets by dragged widget height
                if(cowu.getLayoutPreference(self.elementId) != null || isMoved) {
                    if(isMoved){
                        self.tmpHeight = itemAttr['height'];
                        itemAttr['x'] = 0;
                        delete itemAttr['y'];
                    } else if(self.tmpHeight > 0) {
                        itemAttr['y'] = itemAttr['y'] + self.tmpHeight;
                    }
                    self.gridStack.addWidget(currElem,itemAttr['x'],itemAttr['y'],itemAttr['width'],itemAttr['height']);
                } else {
                    if(itemAttr['width'] != null) {
                        itemAttr['width'] = itemAttr['width']*widthMultiplier;
                        $(currElem).attr('data-gs-width',itemAttr['width']);
                    }
                    if(itemAttr['height'] != null) {
                        itemAttr['height'] = itemAttr['height']*heightMultiplier;
                        $(currElem).attr('data-gs-height',itemAttr['height']);
                    }
                    self.gridStack.addWidget(currElem,widgetIdx/self.COLUMN_CNT,widgetIdx%self.COLUMN_CNT,
                        ifNull(itemAttr['width'],widthMultiplier),ifNull(itemAttr['height'],heightMultiplier),true);
                }
            }
            var region = contrail.getCookie('region');
            if(region == null) {
                region = "Default"
            }
            //if there exists a mapping of modelId in widgetConfigManager.modelInstMap, use it
            /*$(currElem).find('.widget-dropdown').contrailDropdown({
                dataTextField: "name",
                dataValueField: "value",
                dropdownCssClass: 'min-width-150',
                defaultValueId: 0,
                data: _.map(widgetConfigManager.getWidgetList(),function(val,idx) {
                    return {
                        name: val['val'],
                        value: val['id']
                    };
                }),
                change: function(e) {
                    //Remove the current widget
                    var currView = $(currElem).find('.item-content').data('ContrailView');
                    if(currView != null)
                    currView.destroy();
                    $(currElem).find('.item-content').empty();
                    self.renderWidget({widgetCfg:{id:e.val}},currElem);
                }
            });*/
            if (cowc.panelLayout) {
                $(currElem).find('.grid-stack-item-content').addClass('panel panel-default');
                $(currElem).find('.widget-dropdown').select2({
                    placeholder: "Select a Widget",
                    data: widgetConfigManager.getWidgetList(),
                    change: function(e) {
                    }
                });
                $(currElem).find('.widget-dropdown').on('change',function(e) {
                    //Remove the current widget
                    var currView = $(currElem).find('.item-content').data('ContrailView');
                    if(currView != null)
                    currView.destroy();
                    $(currElem).find('.item-content').empty();
                    self.renderWidget({widgetCfg:{id:e.val}},currElem);
                });
            }
            if (itemAttr && itemAttr['cssClass'] != null) {
                $(currElem).find('.grid-stack-item-content').addClass(cfg['itemAttr']['cssClass']);
            }


            //Listener for flipping widget
            $(currElem).find('.flip-button').on('click',function() {
                //Add transform-3d property
                $(currElem).find('.flip').css("transform-style", "preserve-3d");
                $(currElem).find('.flip').css("transform", "rotateX(180deg)");
            });
            $(currElem).find('.btn-widget-update').on('click',function() {
                $(this).blur();
                $(currElem).find('.flip').css("transform-style", "");
                $(currElem).find('.flip').css("transform", "");
            });
            $(currElem).find('.btn-widget-cancel').on('click',function() {
                $(this).blur();
                $(currElem).find('.flip').css("transform-style", "");
                $(currElem).find('.flip').css("transform", "");
            });
            //Listener for removing widgets
            $(currElem).find('.fa-remove').on('click',function() {
                self.gridStack.removeWidget($(currElem));
            });

            self.widgets.push(currElem);
            self.renderWidget(cfg,currElem);
        },
        getModelForCfg: function(cfg,options) {
            //Maintain a mapping of cacheId vs contrailListModel and if found,return that
            var model,
                modelId = cfg['modelId'];
                region = contrail.getCookie('region');
            if(region == null) {
                region = "Default"
            }
            var defObj;
            var cachedModelObj = widgetConfigManager.modelInstMap[region+';'+modelId];
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
                model = widgetConfigManager.modelInstMap[modelId]['model'];
            } else if(cowu.getValueByJsonPath(cfg,'source','').match(/STATTABLE|LOG|OBJECT/)) {
                if(options['needContrailListModel'] == true) {
                    defObj = cowu.fetchStatsListModel(cfg['config'],
                            {needContrailListModel: options['needContrailListModel']});
                    model = new ContrailListModel([]);
                    // getRemoteConfig is a function which is
                    // available in contrailListModel when we
                    // instantiate with  remote ajax config, in this
                    // we are instantiating contrailListModel with
                    // empty data array and fetching data is being
                    // done by backbone model, so we are adding
                    // explicitly getRemoteConfig function.

                    // getRemoteConfig is used only in alarms
                    // page
                    model.getRemoteConfig = function () {
                        return defObj.listModelConfig
                    };
                } else {
                    options['source'] = cfg['source'];
                    options['type'] = cfg['type'];
                    model = cowu.populateModel(cfg['config'], options);
                }
            } else if(cowu.getValueByJsonPath(cfg,'listModel','') != '') {
                model = cfg['listModel'];
            } else if(cowu.getValueByJsonPath(cfg,'_type') != 'contrailListModel' && !$.isEmptyObject(cfg) && cfg != null) {
                model = new ContrailListModel(cfg['config']);
            } 
            function updateCache() {
                if(isCacheExpired && modelId != null) {
                    widgetConfigManager.modelInstMap[modelId] = {
                        model: model,
                        time: _.now()
                    };
                }
            }
            if(defObj != null) {
                 defObj.done(function(response, listModelConfig) {
                     model.setData(response);
                     updateCache();
                 });
            } else {
                 updateCache();
            }
            return model;
        },
        renderWidget: function(cfg,currElem) {
            //While instantiating a new empty widget,cfg will be empty
            if(typeof(cfg) == 'undefined') {
                return;
            }
            var modelCfg = cfg['modelCfg'],model;
            var widgetCfg = cfg['widgetCfg'];
            //If modelCfg is null,get it from widgetConfigManager
            if(modelCfg == null) {
                $.extend(cfg,widgetConfigManager.get(widgetCfg['id']));
                modelCfg = cfg['modelCfg'];
            }
            $(currElem).attr('data-widget-id',widgetCfg['id']);
            $(currElem).data('data-cfg', cfg);
            var self = this;
            //Add cache Config
            var viewType = cowu.getValueByJsonPath(cfg,'viewCfg;view','');
            var needContrailListModel = cowu.getValueByJsonPath(cfg, 'modelCfg;needContrailListModel', false);
            if(viewType.match(/GridView/)) {
                needContrailListModel = true;
            }
            model = self.getModelForCfg(cfg['modelCfg'],{needContrailListModel: needContrailListModel});
            if(viewType.match(/eventDropsView/)) {
                $(currElem).find('header').addClass('drag-handle');
            } else {
                $(currElem).find('.item-content').addClass('drag-handle');
            }
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
