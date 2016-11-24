/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils',
    'event-drops'
], function (_, ContrailView,  ContrailListModel, LegendView, cowc,chUtils) {
    var cfDataSource;
    var eventDropsView = ContrailView.extend({
        render: function () {
            var self = this;
            self.tooltipDiv = d3.select("body").append("div")
                            .attr("class", "event-drops-tooltip")
                            .style("opacity", 0);
            self.model.onAllRequestsComplete.subscribe(function() {
                self.renderChart();
            });
        },
        showTooltip : function(d) {
            d3.select('body').selectAll('.event-drops-tooltip').remove();
            var self = this;
            var FONT_SIZE = 12; // in pixels
            var TOOLTIP_WIDTH = 10; // in rem
            var tooltip = d3.select("body").append("div")
                            .attr("class", "event-drops-tooltip")
                            .style("opacity", 0);
            // show the tooltip with a small animation
            tooltip.transition()
                .duration(200)
                .each('start', function start() {
                    d3.select(this).style('block');
                })
                .style('opacity', 1);
            var rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;
            rightOrLeftLimit = 200;
            //Check if tooltip can be accomodated on right
            var direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

            var ARROW_MARGIN = 1.65;
            var ARROW_WIDTH = FONT_SIZE;
            var left = direction === 'right' ?
                d3.event.pageX - rightOrLeftLimit + 30 :
                d3.event.pageX - ARROW_MARGIN * FONT_SIZE - ARROW_WIDTH / 2;

            tooltip.html('<div>' + d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d['MessageTS']/1000)) + '</div>' +
                        '<div>' + d.Source + '</div>' +
                        '<div>' + d.Category + '</div>' +
                        '<div>' + d.Xmlmessage + '</div>')
                .classed(direction,true)
                .style({
                    left: left + 'px',
                    top: (d3.event.pageY + 16) + 'px',
                    position: 'absolute'
                });
        },
        hideTooltip : function() {
            d3.select('.event-drops-tooltip').transition()
                .duration(200)
                .each('end', function end() {
                    this.remove();
                })
                .style('opacity', 0);
        },
        renderChart: function() {
            var self = this;
            var colors =  d3.scale.category10();
            // colors = cowc.FIVE_NODE_COLOR;
            var data = self.model.getItems();
            data = _.groupBy(data,function(d) { return d.Messagetype; });
            data = _.map(data,function(value,key) {
                return {
                    name: key,
                    data: value
                }
            });
            var eventDropsChart = d3.chart.eventDrops()
                .start(new Date(new Date().getTime() - 2 * 60 * 60 * 1000)) //last 2 hours
                .end(new Date())
                .eventLineColor(function(d, i) { return colors[i]})
                .labelsWidth(200)
                .mouseover(self.showTooltip)
                .mouseout(self.hideTooltip)
                .date(function(d){
                    return new Date(d.MessageTS/1000);
                });
            d3.select(self.$el[0])
            .datum(data)
            .call(eventDropsChart);
        }
    });

    return eventDropsView;
});
