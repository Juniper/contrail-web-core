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
        defaultStackTooltipFn: function (tooltipData,yAxisFormatter,chartOptions) {
              var tooltipData = tooltipData;
              var strTime;
              var hours;
              var minutes;
              tooltipData  = $.map(tooltipData,function(d){ d.values['y'] = yAxisFormatter(d.values['y']);
              if(d.dateTime){
                  strTime = d.dateTime;
                  d['Time']= strTime;
              }
              else{
                hours = d.values['date'].getHours();
                hours = ('0' + hours).slice(-2);
                minutes = d.values['date'].getMinutes();
                minutes = ('0' + minutes).slice(-2);
                strTime = hours + ':' + minutes;
                d['Time']= strTime;
            }
            return d;
            });
              var toolTipTemplate = contrail.getTemplate4Id(cowc.TOOLTIP_TEMPLATE);
              return toolTipTemplate({
                subTitle: chartOptions.subTitle,
                yAxisLabel:chartOptions.yAxisLabel,
                Time:tooltipData[0].Time,
                tooltipData: tooltipData
            });
        },
        defaultLineAreaTooltipFn: function (d,chartOptions, yAxisFormatter) {
            var series = d.series;
            if(yAxisFormatter != null){
                series = $.map(series,function(d){
                    d['value'] = yAxisFormatter(d['value']);
                    return d;
                });
            }
            else if (chartOptions.yFormatter) {
                series = $.map(series,function(d){
                    d['value'] = chartOptions.yFormatter(d['value']);
                    return d;
                });
            }
            var toolTipTemplate = contrail.getTemplate4Id(cowc.TOOLTIP_LINEAREACHART_TEMPLATE);
            return toolTipTemplate({
                subTitle: chartOptions.subTitle,
                yAxisLabel:chartOptions.yAxisLabel,
                Time:d.value,
                series:series
            });
        },
        getDefaultViewConfig: function(chartType) {
            var stackChartConfig = {
                    viewConfig: {
                        class: 'mon-infra-chart chartMargin',
                        chartOptions: {
                            // bucketSize: this.STATS_BUCKET_DURATION,
                            bucketSize: 2.5,
                            showLegend: false,
                            showControls: false,
                            tickPadding: 8,
                            margin: {
                                left: 45,
                                top: 15,
                                right: 10,
                                bottom: 20
                            },
                            yAxisOffset: 25,
                            showXMinMax: true,
                            showYMinMax: true,
                            forceY: [0, 0.01],
                            defaultZeroLineDisplay: true,
                            tooltipFn: this.defaultLineAreaTooltipFn
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
                            defaultDataStatusMessage: false,
                            spliceAtBorders: false,
                            brush: false,
                            xAxisLabel: '',
                            yAxisLabel: '',
                            groupBy: 'Source',
                            showXMinMax: true,
                            showYMinMax: true,
                            yField: '',
                            yFieldOperation: 'average',
                            // bucketSize: this.STATS_BUCKET_DURATION,
                            bucketSize: 2.5,
                            colors: {},
                            onClickBar:false,
                            title: '',
                            axisLabelDistance : 0,
                            margin: {
                                left: 58,
                                top: 20,
                                right: 10,
                                bottom: 20
                            },
                            tickPadding: 8,
                            hideFocusChart: true,
                            forceY: [0, 0.01],
                            yFormatter : function(d){
                                return d;
                            },
                            xFormatter: function(xValue, tickCnt) {
                                var date = xValue > 1 ? new Date(xValue) : new Date();
                                return d3.time.format('%H:%M')(date);
                            },
                            yTickFormat: function(value){
                                return d3.format('.2f')(value);
                            },
                            showLegend: false,
                            defaultZeroLineDisplay: true,
                            legendView: LegendView,
                            tooltipFn: this.defaultLineAreaTooltipFn
                        }
                    }
                },
                "ZoomScatterChartView" : {
                      viewConfig: {
                          loadChartInChunks: false,
                          chartOptions: {
                              sortFn:function(data){
                                  return data.reverse();
                              },
                              doBucketize: true,
                              xLabel: ctwl.TITLE_CPU,
                              yLabel: 'Memory (MB)',
                              xField: 'x',
                              yField: 'y',
                              sizeField: 'size',
                              xTickCount: 5,
                              yTickCount: 5,
                              dataParser: cowu.parseDataForScatterChart,
                              margin: {top:5},
                              bubbleSizeFn: function(d) {
                                   return d3.max(d,function(d) { return d.size;});
                              },
                          }
                      }
                  }
            };
            if(defaultViewConfigMap[chartType] != null) 
                return defaultViewConfigMap[chartType]
            else
                return {};
        },
        updateTickOptionsInChart: function (chartObj, chartOptions) {
            var showXMinMax = cowu.getValueByJsonPath(chartOptions, 'showXMinMax', false),
                showYMinMax = cowu.getValueByJsonPath(chartOptions, 'showYMinMax', false),
                xTickCnt = cowu.getValueByJsonPath(chartOptions, 'xTickCnt'),
                showTicks = cowu.getValueByJsonPath(chartOptions, 'showTicks', true)
                showXAxis = cowu.getValueByJsonPath(chartOptions, 'showXAxis', true),
                showYAxis = cowu.getValueByJsonPath(chartOptions, 'showYAxis', true),
                yTickCnt = cowu.getValueByJsonPath(chartOptions, 'yTickCnt');
            if (xTickCnt) {
                chartObj.xAxis.ticks(0);
            }
            if (yTickCnt) {
                chartObj.y1Axis != null ? chartObj.y1Axis.ticks(0): chartObj.yAxis.ticks(0);
            }
            if (!showTicks) {
                chartObj.xAxis.ticks(0);
                chartObj.y1Axis != null ? chartObj.y1Axis.ticks(0): chartObj.yAxis.ticks(0);
                if (chartObj.x2Axis != null) {
                    chartObj.x2Axis.ticks(0);
                }
                if (chartObj.y2Axis != null) {
                    chartObj.y2Axis.ticks(0);
                }
            }
            // If showXMinMax/showYMinMax is true we are
            // hiding the other ticks.
            if (showXMinMax) {
                chartObj.xAxis.ticks(0);
                if (chartObj.x2Axis != null) {
                    chartObj.x2Axis.ticks(0);
                }
            }
            if (showYMinMax) {
                chartObj.y1Axis != null ? chartObj.y1Axis.ticks(0): chartObj.yAxis.ticks(0);
                if (chartObj.y2Axis != null) {
                    chartObj.y2Axis.ticks(0);
                }
            }
            return chartObj;
        }
    };

    return chartUtils;
});
