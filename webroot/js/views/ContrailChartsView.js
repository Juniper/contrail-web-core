define([
    'lodashv4',
    'core-basedir/js/views/ChartView',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils'
], function (_, ChartView,  ContrailListModel, LegendView, cowc, chUtils) {

    var ContrailChartsView = ChartView.extend({
        initialize: function() {
            var self = this;
            var radialColorScheme10 = [
                '#3f51b5',
                d3v4.schemeCategory10[0],
                d3v4.schemeCategory10[2],
                '#9c27b0',
                '#00bcd4',
                '#4caf50',
                '#a88add',
                '#fcc100',
                '#2196f3',
                '#c62828',
            ];
            self.chartConfig = {
                id: 'chartBox',
                components: [{
                    config: {
                        parentSeparation: 1.0,
                        parentSeparationShrinkFactor: 0.05,
                        parentSeparationDepthThreshold: 4,
                        colorScale: d3v4.scaleOrdinal().range(radialColorScheme10), // eslint-disable-line no-undef
                        drawLinks: false,
                        drawRibbons: true,
                        arcWidth: 15,
                        arcLabelLetterWidth: 5,
                        showArcLabels: true,
                        labelFlow: 'perpendicular',
                        arcLabelXOffset: 0,
                        arcLabelYOffset: 20,
                        levels: [ { level: 0, label: 'Virtual Network' }, { level: 1, label: 'IP' }, { level: 2, label: 'Port' } ],
                        drillDownLevel: 1,
                        tooltip: 'tooltip-id'
                    }
                }]
            };
        },
        getChartViewInfo: function(config, chartId, additionalEvents) {
            var self = this;
            this.$el.empty();
            this.$el.append($('<div>',{id:'chartBox'}));
            $.extend(true,self.chartConfig,config);
            var chartView = new coCharts.ChartView();
            chartView.setConfig(self.chartConfig);
            var component = chartView.getComponent(chartId);
            if(additionalEvents) {
                _.each(additionalEvents, function(eventInfo) {
                    component.delegate(eventInfo.event, eventInfo.selector,
                                eventInfo.handler, eventInfo.handlerName);
                });
            }
            return { chartView: chartView, component:component };
        },
        render: function(data, chartView) {
            var self = this,
                data  = data ? data : this.model.getItems();
            chartView.setData(data);
            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    chartView.render();
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    chartView.setData(self.model.getItems());
                    chartView.render();
                });
                var prevDimensions = chUtils.getDimensionsObj(self.$el);
                self.resizeFunction = _.debounce(function (e) {
                    if(!chUtils.isReRenderRequired({
                        prevDimensions:prevDimensions,
                        elem:self.$el})) {
                        return;
                    }
                     chartView.render();
                 },cowc.THROTTLE_RESIZE_EVENT_TIME);
            }
        }
    });

    return ContrailChartsView;

});
