/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/SparklineModel',
    'contrail-list-model'
], function (_, ContrailView, SparklineModel, ContrailListModel) {
    var SparklineView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
            ajaxConfig = viewConfig['ajaxConfig'],
            self = this, deferredObj = $.Deferred(),
            selector = $(self.$el);

            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderSparkline(selector, viewConfig, self.model);
                }
                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderSparkline(selector, viewConfig, self.model);
                });
                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderSparkline(selector, viewConfig, self.model);
                    });
                }
            }
        },
        renderSparkline: function (selector, viewConfig, chartViewModel) {
            var data = chartViewModel.getItems();
            var lineColorClass = contrail.checkIfExist(viewConfig.colorClass) ?
                    viewConfig.colorClass : 'blue-sparkline';
            var chartTemplate = contrail.getTemplate4Id('core-sparkline-template');
            var widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                    viewConfig.widgetConfig : null;
            var chartViewConfig, chartOptions, chartModel;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }
            chartModel = new SparklineModel();
            this.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }
            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);

            //Draw chart
            var sortedData = ([].concat(data)).sort(function (a, b) {
                return a - b
            });
            var graph = d3.select($(selector)[0]).append("svg:svg")
                        .attr('class', lineColorClass)
                        .style('width','100%');
            var maxY = sortedData[sortedData.length - 1];
            var x = d3.scale.linear().domain([0, ifNull(sortedData,[]).length]).range([0, 100]);
            var y = d3.scale.linear().domain([sortedData[0], maxY * 1.2]).range([10, 0]);
            var sparkLine = d3.svg.line()
                                .x(function (d, i) {
                                    return x(i);
                                })
                                .y(function (d) {
                                    return y(d);
                                });
            graph.append("svg:path").attr("d", sparkLine(data));

        }

    });
    return SparklineView;
});