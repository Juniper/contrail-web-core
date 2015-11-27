/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var BarChartView = Backbone.View.extend({
        el: ".chart",
        chart: null,
        chartSelection: null,
        initialize: function (options) {
            var that = this;
            var chartConfig = getValueByJsonPath(options, 'viewConfig', {});
            this.chart = barChart();
            var dimension = chartConfig['dimension'];
            var xSmplCnt = 24;
            xSmplCnt = Math.max(xSmplCnt,
                d3.max(dimension.group().all(), function (d) {
                    return d['key'];
                }));
            this.chart.dimension(dimension)
                .group(dimension.group(Math.floor))
                .toolTip(false)
                .x(d3.scale.linear()
                    .domain([0, xSmplCnt + xSmplCnt / 24])      //Let's keep ordinal discrete domain
                    //To accomodate 1 extra bar
                    .rangeRound([0, 10 * 26]))
                .xScale(chartConfig['xScale'])
                .y(d3.scale.linear()
                    .domain([0, ifNotNumeric(chartConfig['maxY'], 24)])
                    .range([50, 0]));

            if (typeof(chartConfig['onBrushEnd']) == 'function') {
                this.chart.onBrushEnd(chartConfig['onBrushEnd']);
            }
        },
        render: function () {
            this.chartSelection = d3.select(this.el)
                .call(this.chart);
        },
        update: function () {
            this.chartSelection.call(this.chart);
        }
    });

    function barChart() {
        //Serves as a static variable for this function
        if (!barChart.id) barChart.id = 0;
        var toolTip_text = "";
        var config = {
            margin: {top: 0, right: 10, bottom: 10, left: 10},
        }
        var margin = config.margin, x, xScale,
            y = d3.scale.linear().range([50, 0]),
            id = barChart.id++,
            axis = d3.svg.axis().ticks(5).orient("bottom"),
            brush = d3.svg.brush(),
            brushDirty,
            onBrushEnd,
            dimension,
            group,
            round,
            toolTip;

        function chart(div) {
            var width = x.range()[1],
                height = y.range()[0],
                xaxis_max_value = x.domain()[1];
            logMessage('crossFilterChart', 'Start');

            div.each(function () {
                var div = d3.select(this),
                    g = div.select("g");

                // Create the skeletal chart.
                if (g.empty()) {
                    div.select(".title").append("span")
                        //.attr("href", "javascript:reset(" + id + ")") //Can be commented
                        .attr("class", "reset")
                        .text("reset")
                        .style("display", "none");
                    div.select('.title .reset').on('click', function () {
                        chart.filter(null);
                        if (typeof(onBrushEnd) == 'function') {
                            onBrushEnd();
                        }
                    });

                    g = div.insert("svg", "div.title")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    g.append("clipPath")
                        .attr("id", "clip-" + id)
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);
                    var bars = g.selectAll(".bar")
                        .data(["background", "foreground"])
                        .enter().append("path")
                        .attr("class", function (d) {
                            return d + " bar";
                        })
                        .datum(group.all());
                    g.selectAll(".foreground.bar")
                        .attr("clip-path", "url(#clip-" + id + ")");

                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(axis);
                    // Initialize the brush component with pretty resize handles.
                    var gBrush = g.append("g").attr("class", "brush").call(brush);
                    gBrush.selectAll("rect").attr("height", height);
                    gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                }
                // Only redraw the brush if set externally.
                if (brushDirty) {
                    brushDirty = false;
                    g.selectAll(".brush").call(brush);
                    div.select(".title span").style("display", brush.empty() ? "none" : null);
                    if (brush.empty()) {
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", 0)
                            .attr("width", width);
                    } else {
                        var extent = brush.extent();
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", x(extent[0]))
                            .attr("width", x(extent[1]) - x(extent[0]));
                    }
                }

                g.selectAll(".bar").attr("d", barPath);
            });

            function barPath(groups) {
                var path = [],
                    i = -1,
                    n = groups.length,
                    d;
                while (++i < n) {
                    d = groups[i];
                    path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                }
                if (path.length == 0)
                    return null;
                else
                    return path.join("");
            }

            function resizePath(d) {
                var e = +(d == "e"),
                    x = e ? 1 : -1,
                    y = height / 3;
                return "M" + (.5 * x) + "," + y
                    + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                    + "V" + (2 * y - 6)
                    + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                    + "Z"
                    + "M" + (2.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8)
                    + "M" + (4.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8);
            }
        }

        brush.on("brushstart.chart", function () {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title span").style("display", null);
        });

        brush.on("brush.chart", function () {
            var g = d3.select(this.parentNode),
                extent = brush.extent();
            if (round) g.select(".brush")
                .call(brush.extent(extent = extent.map(round)))
                .selectAll(".resize")
                .style("display", null);
            g.select("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
            extent[0] = Math.floor(extent[0]);
            dimension.filterAll();
            if (xScale != null) {
                var xRangeArr = xScale.range();
                var beginIdx = Math.max(0, _.sortedIndex(xRangeArr, extent[0]) - 1);
                var endIdx = Math.min(_.sortedIndex(xRangeArr, extent[1]), xRangeArr.length - 1);
                //If it falls in the last bucket,need to include the last value also
                if (_.sortedIndex(xRangeArr, extent[1]) == xRangeArr.length) {
                    dimension.filterFunction(function (d) {
                        return d >= xRangeArr[beginIdx] && d <= xRangeArr[endIdx];
                    });
                } else {
                    dimension.filterFunction(function (d) {
                        return d >= xRangeArr[beginIdx] && d < xRangeArr[endIdx - 1];
                    });
                }
            } else {
                dimension.filterFunction(function (d) {
                    return d >= extent[0] && d < extent[1]
                });
            }
        });

        brush.on("brushend.chart", function () {
            if (brush.empty()) {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title span").style("display", "none");
                div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                dimension.filterAll();
            }
            if (onBrushEnd != null) {
                onBrushEnd();
            }
        });

        chart.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };

        chart.x = function (_) {
            if (!arguments.length) return x;
            x = _;
            axis.scale(x);
            brush.x(x);
            return chart;
        };

        chart.y = function (_) {
            if (!arguments.length) return y;
            y = _;
            return chart;
        };

        chart.dimension = function (_) {
            if (!arguments.length) return dimension;
            dimension = _;
            return chart;
        };

        chart.xScale = function (_) {
            if (!arguments.length) return xScale;
            xScale = _;
            return chart;
        };

        chart.filter = function (_) {
            if (_) {
                brush.extent(_);
                dimension.filterRange(_);
            } else {
                brush.clear();
                dimension.filterAll();
            }
            brushDirty = true;
            return chart;
        };

        chart.group = function (_) {
            if (!arguments.length) return group;
            group = _;
            return chart;
        };

        chart.round = function (_) {
            if (!arguments.length) return round;
            round = _;
            return chart;
        };
        chart.toolTip = function (_) {
            if (!arguments.length) return toolTip;
            toolTip = _;
            return chart;
        };
        chart.onBrushEnd = function (_) {
            if (!arguments.length) return onBrushEnd;
            onBrushEnd = _;
            return onBrushEnd;
        }

        return d3.rebind(chart, brush, "on");
    }

    return BarChartView;
});
