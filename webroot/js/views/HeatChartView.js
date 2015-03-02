/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var HeatChartView = Backbone.View.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                heatChartTemplate = contrail.getTemplate4Id(ctwc.TMPL_VN_PORT_HEAT_CHART),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred();

            self.$el.append(loadingSpinnerTemplate);

            var selector = $(self.$el);

            $.ajax(ajaxConfig).done(function (result) {
                deferredObj.resolve(result);
            });

            deferredObj.done(function (response) {
                selector.html(heatChartTemplate());

                renderHeatChartCB(selector.find("#src-udp-heat-chart"), ctwp.parseNetworks4PortMap({
                    res: jsonPath(response, '$..udp_sport_bitmap')[0],
                    type: 'src',
                    pType: 'udp'
                }));
                renderHeatChartCB(selector.find("#dst-udp-heat-chart"), ctwp.parseNetworks4PortMap({
                    res: jsonPath(response, '$..udp_dport_bitmap')[0],
                    type: 'dst',
                    pType: 'udp'
                }));
                renderHeatChartCB(selector.find("#src-tcp-heat-chart"), ctwp.parseNetworks4PortMap({
                    res: jsonPath(response, '$..tcp_sport_bitmap')[0],
                    type: 'src',
                    pType: 'tcp'
                }));
                renderHeatChartCB(selector.find("#dst-tcp-heat-chart"), ctwp.parseNetworks4PortMap({
                    res: jsonPath(response, '$..tcp_dport_bitmap')[0],
                    type: 'dst',
                    pType: 'tcp'
                }));
            });

            deferredObj.fail(function (errObject) {
                if (errObject['errTxt'] != null && errObject['errTxt'] != 'abort') {
                    showMessageInChart({
                        selector: self.$el,
                        msg: 'Error in fetching Details'
                    });
                }
            });

        }
    });

    function renderHeatChartCB(selector, response) {
        var data = response['res'];
        var margin = {top: 20, right: 0, bottom: 100, left: 20},
            width = 960 - margin.left - margin.right,
            height = 230 - margin.top - margin.bottom,
            gridSize = Math.floor(width / 64),
            legendElementWidth = gridSize * 2,
            buckets = 9,
            colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
            colors = ["white", "#599AC9"]; // alternatively colorbrewer.YlGnBu[9]
        var maxValue = d3.max(data, function (d) {
            return d.value;
        });
        if (maxValue == 0)
            colors = ['white'];
        var colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, maxValue])
            .range(colors);

        var svg = d3.select($(selector)[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xValues = [], yValues = [];
        for (var i = 0; i < 64; i++) {
            xValues.push(i);
        }
        for (var i = 0; i < 4; i++) {
            yValues.push(i);
        }
        var yLabels = svg.selectAll(".xLabel")
            .data(yValues)
            .enter().append("text")
            //.text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * gridSize;
            })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) {
                return ((i >= 0 && i <= 4) ? "xLabel mono axis axis-workweek" : "xLabel mono axis");
            });

        var xLabels = svg.selectAll(".xLabel")
            .data(xValues)
            .enter().append("text")
            //.text(function(d) { return d; })
            .attr("x", function (d, i) {
                return i * gridSize;
            })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function (d, i) {
                return ((i >= 7 && i <= 16) ? "xLabel mono axis axis-worktime" : "xLabel mono axis");
            });

        var heatMap = svg.selectAll(".hour")
            .data(data)
            .enter().append("rect")
            .attr("x", function (d) {
                return (d.x - 1) * gridSize;
            })
            .attr("y", function (d) {
                return (d.y - 1) * gridSize;
            })
            //.attr("rx", 4)
            //.attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0]);
        heatMap.transition().duration(1000)
            .style("fill", function (d) {
                return colorScale(d.value);
            });
        heatMap.on('click', function (d) {
            var currHashObj = layoutHandler.getURLHashObj();
            var startRange = ((64 * d.y) + d.x) * 256;
            var endRange = startRange + 255;
            var params = {};
            var protocolMap = {'icmp': 1, 'tcp': 6, 'udp': 17};
            var divId = $($(selector)[0]).attr('id');
            params['fqName'] = currHashObj['q']['fqName'];
            params['port'] = startRange + "-" + endRange;
            params['startTime'] = new XDate().addMinutes(-10).getTime();
            params['endTime'] = new XDate().getTime();
            params['portType'] = response['type'];
            params['protocol'] = protocolMap[response['pType']];
            layoutHandler.setURLHashParams(params, {p: 'mon_networking_networks'});
        });
        heatMap.on('mouseover', function () {
            d3.select(this).style('cursor', 'pointer');
        });
        heatMap.append("title").text(function (d) {
            var startRange = ((64 * d.y) + d.x) * 256;
            //return 'Hello' + d.value;
            return startRange + ' - ' + (startRange + 255);
        });

        var legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function (d) {
                return d;
            })
            .enter().append("g")
            .attr("class", "legend");
    };

    return HeatChartView;
});