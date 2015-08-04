define([
    'underscore',
    'backbone'
],function(_,Backbone) {
    var BarChartView = Backbone.View.extend({
        el: ".chart",
        chart: null,
        chartSelection: null,
        initialize: function(options) {
            var that = this;
            var chartConfig = getValueByJsonPath(options,'viewConfig',{});
            this.chart = d3.custom.barChart();
            var dimension = chartConfig['dimension'];
            var xSmplCnt = 24;
            xSmplCnt = Math.max(xSmplCnt,
                d3.max(dimension.group().all(),function(d) { return d['key']; }));
            this.chart.dimension(dimension)
                .group(dimension.group(Math.floor))
                .toolTip(false)
                .x(d3.scale.linear()
                    .domain([0, xSmplCnt + (xSmplCnt/24)])
                    .rangeRound([0,10 * 26]))
                .y(d3.scale.linear()
                    .domain([0,ifNotNumeric(chartConfig['maxY'],24)])
                    .range([50,0]));
            if(typeof(chartConfig['onBrushEnd']) == 'function') {
                this.chart.onBrushEnd(chartConfig['onBrushEnd']);
            }
        },
        render: function() {
            this.chartSelection = d3.select(this.el)
                .call(this.chart);
        },
        update: function() {
            this.chartSelection.call(this.chart);
        }
    });
    return BarChartView;
});
