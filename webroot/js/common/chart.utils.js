/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'legend-view'
], function (_,LegendView) {
    var chartUtils = {
        updateChartOnResize: function(selector,chart){
            if(selector != null && $(selector).is(':visible') && chart != null) {
                if($(selector).find('.nv-noData').data('customMsg')) {
                    var msg = $(selector).find('.nv-noData').text();
                    chart.update();
                    $(selector).find('.nv-noData').text(msg);
                } else if($(selector).data('chart') != null)
                    $(selector).data('chart').update();
            }
        },

        getViewFinderPoint: function (time) {
            var navDate = d3.time.format('%x %H:%M')(new Date(time));
            return new Date(navDate).getTime();
        },

        getCurrentTime4MemCPUCharts: function () {
            var now = new Date(), currentTime;
            currentTime = now.getTime();
            return currentTime;
        },

        interpolateSankey: function(points) {
            var x0 = points[0][0], y0 = points[0][1], x1, y1, x2,
                path = [x0, ",", y0],
                i = 0, n = points.length;
            while (++i < n) {
                x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2;
                path.push("C", x2, ",", y0, " ", x2, ",", y1, " ", x1, ",", y1);
                x0 = x1, y0 = y1;
            }
            return path.join("");
        },

        drawSparkLine4Selector: function(selector, className, data) {
            var sortedData = ([].concat(data)).sort(function (a, b) {
                return a - b
            });
            var graph = d3.select(selector).append("svg:svg").attr('class', className);
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
        },

        drawSparkLineBar: function(selector, data) {
            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }
            var w = 57, h = 38, maxValue = 0, maxBarValue = 36;

            $.each(data.data, function(key,val){
                if(maxValue < parseInt(val.value)){
                    maxValue = parseInt(val.value);
                }
            });
            var svg = d3.select(selector)
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            svg.selectAll("rect")
                .data(data.data)
                .enter()
                .append("rect")
                .attr("x",function(d, i) {
                    return i * 7;
                })
                .attr("y", function(d){
                    if(maxValue != 0){
                        d = parseInt(d.value) * maxBarValue / maxValue;
                    } else {
                        d = parseInt(d.value);
                    }
                    return h - (d + 2);
                })
                .attr("width", 5)
                .attr("height", function(d) {
                    if(maxValue != 0){
                        d = parseInt(d.value) * maxBarValue / maxValue;
                    } else {
                        d = parseInt(d.value);
                    }
                    return d + 2;
                })
                .attr("fill", "steelblue")
                .on("mouseover", function(d,i) {
                    $('body').find('.nvtooltip').remove();
                    var div = d3.select('body').append("div")
                        .attr("class", "nvtooltip");

                    div.transition().duration(10);

                    div.html('<span class="lbl">' + parseInt(d.value) + '</span> ' + data.yLbl + ' with <span class="lbl">' + d.name +'</span> ' + data.xLbl)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    $('body').find('.nvtooltip').remove();
                });
        },
        getDimensionsObj: function(elem) {
            return {
                width: $(window).width(),
                height:$(window).height(),
                elemWidth:$(elem).width(),
                elemHeight:$(elem).height()
            }
        },
        isReRenderRequired: function(cfg) {
            var elem = cfg['elem'];
            var prevDimensions = cfg['prevDimensions'];
            // console.info("last Dimensions",prevDimensions['lastWidth'],prevDimensions['lastHeight'],
            // prevDimensions['lastElemWidth'],prevDimensions['lastElemHeight']);
            // console.info("current Dimensions",$(window).height(),$(window).width(),$(self.$el).width(),$(self.$el).height());
            if(prevDimensions['width'] == $(window).width() && prevDimensions['height'] == $(window).height() &&
                prevDimensions['elemWidth'] == $(self.$el).width() && prevDimensions['elemHeight'] == $(self.$el).height()) {
                return false;
            }
            return true;
        },
        getDefaultViewConfig: function(chartType) {
            var stackChartConfig = {
                    viewConfig: {
                        class: 'mon-infra-chart chartMargin',
                        chartOptions: {
                            // bucketSize: this.STATS_BUCKET_DURATION,
                            bucketSize: 2.5,
                            showLegend: true,
                            showControls: true,
                            tickPadding: 8,
                            margin: {
                                left: 45,
                                top: 20,
                                right: 0,
                                bottom: 15
                            },
                            yAxisOffset: 25,
                            defaultZeroLineDisplay: true
                        }
                    }
                };
            var defaultViewConfigMap = {
                 'StackedBarChartWithFocusView' : stackChartConfig,
                 'StackedAreaChartView'         : stackChartConfig,
                 "LineWithFocusChartView": {
                    viewConfig: {
                        class: 'mon-infra-chart chartMargin',
                        parseFn: cowu.chartDataFormatter,
                        chartOptions : {
                            brush: false,
                            xAxisLabel: '',
                            yAxisLabel: '',
                            groupBy: 'Source',
                            yField: '',
                            yFieldOperation: 'average',
                            // bucketSize: this.STATS_BUCKET_DURATION,
                            bucketSize: 2.5,
                            colors: {},
                            title: '',
                            axisLabelDistance : 0,
                            margin: {
                                left: 58,
                                top: 20,
                                right: 0,
                                bottom: 20
                            },
                            tickPadding: 8,
                            hideFocusChart: true,
                            forceY: false,
                            yFormatter : function(d){
                                return d;
                            },
                            xFormatter: function(xValue, tickCnt) {
                                var date = xValue > 1 ? new Date(xValue) : new Date();
                                if (tickCnt != null) {
                                var mins = date.getMinutes();
                                date.setMinutes(Math.ceil(mins/15) * 15);
                                }
                                return d3.time.format('%H:%M')(date);
                            },
                            yTickFormat: function(value){
                                return d3.format('.2f')(value);
                            },
                            showLegend: true,
                            defaultZeroLineDisplay: true,
                            legendView: LegendView
                        }
                    }
                }
            };
            if(defaultViewConfigMap[chartType] != null) 
                return defaultViewConfigMap[chartType]
            else
                return {};
        }
    };

    return chartUtils;
});
