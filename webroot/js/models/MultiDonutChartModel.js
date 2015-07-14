/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    /**
     * This chart model accepts data in following format:
     *
     * @param chartOptions
     * @returns multiDonutChartModel
     * accepts value in {
            innerData: [{
                    name: "",
                    value: 0
                },.. ],
            outerData: [{

                    name: "",
                    value: 0
                },..]
        };
     */
    var MultiDonutChartModel = function (chartOptions) {

        chartOptions.width = ifNull(chartOptions.width, (200 - chartOptions.margin.left - chartOptions.margin.right));
        chartOptions.height = ifNull(chartOptions.height, (chartOptions.width - chartOptions.margin.top - chartOptions.margin.bottom));

        var multiDonutChart = function (selection) {

            selection.each(function (data) {

                var container = d3.select(this);
                container.classed({'contrail-svg': true});

                var containerWrap = container.selectAll("g.contrail-wrap.donut-chart").data([data]);
                var containerGEnter = containerWrap.enter()
                    .append("g")
                    .attr('class', 'contrail-svg contrail-wrap donut-chart').append('g')
                    .attr("transform", "translate(" + ((chartOptions.width / 2) + chartOptions.margin.left) + "," + ((chartOptions.height / 2) + chartOptions.margin.top) + ")");

                multiDonutChart.update = function () {
                    container.transition().call(multiDonutChart);
                };

                var radius = Math.min(chartOptions.width, chartOptions.height) / 2;

                var outerTooltip = nvd3v181.models.tooltip(),
                    innerTooltip = nvd3v181.models.tooltip();

                var outerArc = d3.svg.arc()
                    .outerRadius(radius)
                    .innerRadius(radius - 5);

                var innerArc = d3.svg.arc()
                    .outerRadius(radius - 7)
                    .innerRadius(radius - 20);

                var pie = d3.layout.pie()
                    .sort(null)
                    .startAngle(2 * Math.PI)
                    .endAngle(4 * Math.PI)
                    .value(function (d) {
                        return d.value;
                    });

                var outerPathGroup = containerGEnter.selectAll(".outer-arc")
                    .data(pie(data.outerData))
                    .enter().append("g")
                    .attr("class", "outer-arc")
                    .append("path")
                    .style("fill", function (d) {
                        d.data.color = chartOptions.outerArc.color(d.data.name);
                        return d.data.color;
                    })
                    .style("opacity", function (d) {
                        return chartOptions.outerArc.opacity;
                    })
                    .attr("d", outerArc)
                    .each(function (d) {
                        this._current = d;
                    }).on("mouseover", function (d) {
                        var content = chartOptions.outerArc.tooltipFn(d);
                        content.point = {};
                        content.point = null;
                        outerTooltip.position({top: d3.event.pageY, left: d3.event.pageX})();
                        outerTooltip.data(content).hidden(false);

                    }).on("mouseout", function (d) {
                        outerTooltip.hidden(true);
                    });

                var innerArcEnter = containerGEnter.selectAll(".inner-arc")
                    .data(pie(data.innerData))
                    .enter().append("g")
                    .attr("class", "inner-arc");

                var innerPathGroup = innerArcEnter.append("path")
                    .style("fill", function (d) {
                        d.data.color = chartOptions.innerArc.color(d.data.name);
                        return d.data.color;
                    })
                    .attr("d", innerArc)
                    .each(function (d) {
                        this._current = d;
                    }).on("mouseover", function (d) {
                        var content = chartOptions.innerArc.tooltipFn(d);
                        content.point = {};
                        content.point = null;
                        innerTooltip.position({top: d3.event.pageY, left: d3.event.pageX})();
                        innerTooltip.data(content).hidden(false);
                    }).on("mouseout", function (d) {
                        innerTooltip.hidden(true);
                    });

                var outerFlag = chartOptions.outerArc.flagKey;

                innerPathGroup.transition().duration(750).attrTween("d", innerArcTween);

                outerPathGroup.transition().duration(750)
                    .attrTween("d", outerArcTween)
                    .style("fill", function (d) {
                        return chartOptions.outerArc.color(d.data.status);
                    })
                    .style("stroke", function (d) {
                        if (d.data.status == outerFlag)
                            return chartOptions.outerArc.color(d.data.status);
                    })
                    .style("stroke-width", function (d) {
                        if (d.data.status == outerFlag)
                            return 1.5;
                    })
                    .style("opacity", function (d) {
                        if (d.data.status == outerFlag)
                            return 1;
                        else
                            return 0.5;
                    });

                function outerArcTween(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return outerArc(i(t));
                    };
                }

                function innerArcTween(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return innerArc(i(t));
                    };
                }
            });

        }

        return multiDonutChart;
    }
    return MultiDonutChartModel;
});