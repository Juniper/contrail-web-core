define([
    'underscore',
    'backbone',
    'contrail-view',
    'gridstack',
    'contrail-list-model'
], function (_, Backbone,ContrailView,gridstack, ContrailListModel) {
    var GridStackView = ContrailView.extend({
        initialize: function(options) {
            var self = this;
            self.widgets = [];
            self.widgetCfgList = cowu.getValueByJsonPath(options,'attributes;viewConfig;widgetCfgList',{});
            self.gridAttr = cowu.getValueByJsonPath(options,'attributes;viewConfig;gridAttr',{});
            self.COLUMN_CNT = 2;
            self.VIRTUAL_COLUMNS = 2;
            //Default is 12 columns. To have 3 column layout, set defaultWidth as 4
            if(self.gridAttr['defaultWidth'] != null)
                self.COLUMN_CNT = 12/self.gridAttr['defaultWidth'];

            self.$el.addClass('grid-stack grid-stack-12');
            self.gridStack = $(self.$el).gridstack({
                float:false,
                handle:'header',
                verticalMargin:8,
                cellHeight: 20,
                animate:false,
                acceptWidgets:'label'
            }).data('gridstack');
            
            //Trigger resize on widgets on resizestop
        },
        render: function() {
            var self = this;
            for(var i=0;i < self.widgetCfgList.length;i++) {
                var currWidgetCfg = self.widgetCfgList[i];
                self.add({
                    modelCfg: currWidgetCfg['modelCfg'],
                    viewCfg: currWidgetCfg['viewCfg'],
                    itemAttr: currWidgetCfg['itemAttr']
                });
            }
        },
        add: function(cfg) {
            var self = this;
            var currElem = $($('#gridstack-widget-template').text()).attr('data-gs-height',2);
            var itemAttr = ifNull(cfg['itemAttr'],{});
            var defaultWidth = ifNull(self.gridAttr['defaultWidth'],1);
            var defaultHeight = ifNull(self.gridAttr['defaultHeight'],1);
            if(itemAttr['width'] != null) {
                itemAttr['width'] = itemAttr['width']*defaultWidth;
                $(currElem).attr('data-gs-width',itemAttr['width']);
            }
            if(itemAttr['height'] != null) {
                itemAttr['height'] = itemAttr['height']*defaultHeight;
                $(currElem).attr('data-gs-height',itemAttr['height']);
            }
            var widgetCnt = self.widgets.length;
            self.gridStack.addWidget(currElem,widgetCnt/self.COLUMN_CNT,(widgetCnt%self.COLUMN_CNT)/**self.VIRTUAL_COLUMNS*/,
                ifNull(itemAttr['width'],defaultWidth),ifNull(itemAttr['height'],defaultHeight),true);
            self.widgets.push(currElem);
            var modelCfg = cfg['modelCfg'];
            if(cowu.getValueByJsonPath(cfg,'modelCfg;_type') != 'contrailListModel' && modelCfg != null)
                modelCfg = new ContrailListModel(modelCfg);
            self.renderView4Config($(currElem).find('.item-content'), modelCfg, cfg['viewCfg']);
        }
    });
    return GridStackView;
});
