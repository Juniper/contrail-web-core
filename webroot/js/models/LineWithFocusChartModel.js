/*
 ##Juniper License

 Copyright (c) 2014 Juniper Networks, Inc.

 ##nvd3.js License

 Copyright (c) 2011-2014 [Novus Partners, Inc.][novus]

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 [novus]: https://www.novus.com/

 ##d3.js License

 Copyright (c) 2012, Michael Bostock
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * The name Michael Bostock may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

define([
    'underscore'
], function (_) {
    var LineWithFocusChartModel = function (chartOptions) {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var lines = nvd3v181.models.line()
            , lines2 = nvd3v181.models.line()
            , xAxis = nvd3v181.models.axis()
            , yAxis = nvd3v181.models.axis()
            , x2Axis = nvd3v181.models.axis()
            , y2Axis = nvd3v181.models.axis()
            , legend = nvd3v181.models.legend()
            , brush = d3.svg.brush()
            , tooltip = nvd3v181.models.tooltip()
            , interactiveLayer = nvd3v181.interactiveGuideline()
            ;

        var margin = chartOptions.margin
            , margin2 = chartOptions.margin2
            , color = nvd3v181.utils.defaultColor()
            , width = null
            , height = null
            , height2 = 90
            , useInteractiveGuideline = false
            , xScale
            , yScale
            , x2
            , y2
            , showLegend = true
            , brushExtent = null
            , focusShowAxisY = false
            , noData = null
            , dispatch = d3.dispatch('brush', 'stateChange', 'changeState')
            , transitionDuration = 250
            , state = nvd3v181.utils.state()
            , defaultState = null
            ;

        lines.clipEdge(false).duration(0);
        lines2.interactive(false);
        xAxis.orient('bottom').tickPadding(5);
        yAxis.orient('left');
        x2Axis.orient('bottom').tickPadding(5);
        y2Axis.orient('left');

        tooltip.valueFormatter(function (d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function (d, i) {
            return xAxis.tickFormat()(d, i);
        });

        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var stateGetter = function (data) {
            return function () {
                return {
                    active: data.map(function (d) {
                        return !d.disabled
                    })
                };
            }
        };

        var stateSetter = function (data) {
            return function (state) {
                if (state.active !== undefined)
                    data.forEach(function (series, i) {
                        series.disabled = !state.active[i];
                    });
            }
        };

        function chartModel(selection) {
            selection.each(function (chartDataObj) {
                var container = d3.select(this),
                    that = this,
                    data = chartDataObj.data,
                    requestState = chartDataObj.requestState,
                    yDataKey = contrail.checkIfExist(chartOptions.chartAxesOptionKey) ? chartOptions.chartAxesOptionKey : 'y';

                nvd3v181.utils.initSVG(container);
                var availableWidth = nvd3v181.utils.availableWidth(width, container, margin),
                    availableHeight1 = nvd3v181.utils.availableHeight(height, container, margin) - height2,
                    availableHeight2 = height2 - margin2.top - margin2.bottom;

                chartModel.update = function () {
                    container.transition().duration(transitionDuration).call(chartModel)
                };
                chartModel.container = this;

                state
                    .setter(stateSetter(data), chartModel.update)
                    .getter(stateGetter(data))
                    .update();

                // DEPRECATED set state.disableddisabled
                state.disabled = data.map(function (d) {
                    return !!d.disabled
                });

                if (!defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) {
                        if (state[key] instanceof Array)
                            defaultState[key] = state[key].slice(0);
                        else
                            defaultState[key] = state[key];
                    }
                }

                // Setup Scales
                xScale = lines.xScale();
                yScale = lines.yScale();
                x2 = lines2.xScale();
                y2 = lines2.yScale();

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-lineWithFocusChart').data([data]);
                var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-lineWithFocusChart').append('g');
                var g = wrap.select('g');

                gEnter.append('g').attr('class', 'nv-legendWrap');

                var focusEnter = gEnter.append('g').attr('class', 'nv-focus');
                focusEnter.append('g').attr('class', 'nv-x nv-axis');
                focusEnter.append('g').attr('class', 'nv-y nv-axis');
                focusEnter.append('g').attr('class', 'nv-linesWrap');
                focusEnter.append('g').attr('class', 'nv-interactive');

                var contextEnter = gEnter.append('g').attr('class', 'nv-context');
                contextEnter.append('g').attr('class', 'nv-x nv-axis');
                contextEnter.append('g').attr('class', 'nv-y nv-axis');
                contextEnter.append('g').attr('class', 'nv-linesWrap');
                contextEnter.append('g').attr('class', 'nv-brushBackground');
                contextEnter.append('g').attr('class', 'nv-x nv-brush');

                // Legend
                /*if (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY && showLegend) {
                    legend.width(availableWidth);

                    g.select('.nv-legendWrap')
                        .datum(data)
                        .call(legend);

                    if (margin.top != legend.height()) {
                        margin.top = legend.height();
                        availableHeight1 = nvd3v181.utils.availableHeight(height, container, margin) - height2;
                    }

                    g.select('.nv-legendWrap')
                        .attr('transform', 'translate(0,' + (-margin.top) + ')')
                }*/

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


                //Set up interactive layer
                if (useInteractiveGuideline) {
                    interactiveLayer
                        .width(availableWidth)
                        .height(availableHeight1)
                        .margin({left: margin.left, top: margin.top})
                        .svgContainer(container)
                        .xScale(xScale);
                    wrap.select(".nv-interactive").call(interactiveLayer);
                }

                // Main Chart Component(s)
                lines
                    .y(function (d, i) {
                        return d[yDataKey]
                    })
                    .width(availableWidth)
                    .height(availableHeight1)
                    .color(
                    data
                        .map(function (d, i) {
                            return d.color || color(d, i);
                        })
                        .filter(function (d, i) {
                            return !data[i].disabled;
                        })
                );

                lines2
                    .defined(lines.defined())
                    .y(function (d, i) {
                        return d[yDataKey]
                    })
                    .width(availableWidth)
                    .height(availableHeight2)
                    .color(
                    data
                        .map(function (d, i) {
                            return d.color || color(d, i);
                        })
                        .filter(function (d, i) {
                            return !data[i].disabled;
                        })
                );

                g.select('.nv-context')
                    .attr('transform', 'translate(0,' + ( availableHeight1 + margin.bottom + margin2.top) + ')')

                var contextLinesWrap = g.select('.nv-context .nv-linesWrap')
                    .datum(data.filter(function (d) {
                        return !d.disabled
                    }));

                d3.transition(contextLinesWrap).call(lines2);

                // Setup Main (Focus) Axes
                xAxis
                    .scale(xScale)
                    ._ticks(nvd3v181.utils.calcTicksX(availableWidth / 100, data))
                    .tickSize(-availableHeight1, 0);

                yAxis
                    .scale(yScale)
                    ._ticks(nvd3v181.utils.calcTicksY(availableHeight1 / 40, data))
                    .tickSize(-availableWidth, 0);

                g.select('.nv-focus .nv-x.nv-axis')
                    .attr('transform', 'translate(0,' + availableHeight1 + ')');

                // Setup Brush
                brush
                    .x(x2)
                    .on('brush', function () {
                        onBrush();
                    });

                if (brushExtent) brush.extent(brushExtent);

                var brushBG = g.select('.nv-brushBackground').selectAll('g')
                    .data([brushExtent || brush.extent()])

                var brushBGenter = brushBG.enter()
                    .append('g');

                brushBGenter.append('rect')
                    .attr('class', 'left')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('height', availableHeight2);

                brushBGenter.append('rect')
                    .attr('class', 'right')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('height', availableHeight2);

                var gBrush = g.select('.nv-x.nv-brush')
                    .call(brush);
                gBrush.selectAll('rect')
                    .attr('height', availableHeight2);
                gBrush.selectAll('.resize').append('path').attr('d', resizePath);

                onBrush();

                // Setup Secondary (Context) Axes
                x2Axis
                    .scale(x2)
                    ._ticks(nvd3v181.utils.calcTicksX(availableWidth / 100, data))
                    .tickSize(-availableHeight2, 0);

                g.select('.nv-context .nv-x.nv-axis')
                    .attr('transform', 'translate(0,' + y2.range()[0] + ')');
                d3.transition(g.select('.nv-context .nv-x.nv-axis'))
                    .call(x2Axis);

                if(focusShowAxisY) {
                    y2Axis
                        .scale(y2)
                        ._ticks(nvd3v181.utils.calcTicksY(availableHeight2 / 36, data))
                        .tickSize(-availableWidth, 0);

                    d3.transition(g.select('.nv-context .nv-y.nv-axis'))
                        .call(y2Axis);
                }

                g.select('.nv-context .nv-x.nv-axis')
                    .attr('transform', 'translate(0,' + y2.range()[0] + ')');

                g.select('.nv-context').style('display', (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY) ? 'initial' : 'none');

                //============================================================
                // Event Handling/Dispatching (in chart's scope)
                //------------------------------------------------------------

                if (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY) {
                    legend.dispatch.on('stateChange', function (newState) {
                        for (var key in newState)
                            state[key] = newState[key];
                        dispatch.stateChange(state);
                        chartModel.update();
                    });

                    interactiveLayer.dispatch.on('elementMousemove', function (e) {
                        lines.clearHighlights();
                        var singlePoint, pointIndex, pointXLocation, allData = [];
                        data
                            .filter(function (series, i) {
                                series.seriesIndex = i;
                                return !series.disabled;
                            })
                            .forEach(function (series, i) {
                                var extent = brush.empty() ? x2.domain() : brush.extent();
                                var currentValues = series.values.filter(function (d, i) {
                                    return lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1];
                                });

                                pointIndex = nvd3v181.interactiveBisect(currentValues, e.pointXValue, lines.x());
                                var point = currentValues[pointIndex];
                                var pointYValue = chartModel.y()(point, pointIndex);
                                if (pointYValue != null) {
                                    lines.highlightPoint(i, pointIndex, true);
                                }
                                if (point === undefined) return;
                                if (singlePoint === undefined) singlePoint = point;
                                if (pointXLocation === undefined) pointXLocation = chartModel.xScale()(chartModel.x()(point, pointIndex));
                                allData.push({
                                    key: series.key,
                                    value: chartModel.y()(point, pointIndex),
                                    color: color(series, series.seriesIndex)
                                });
                            });
                        //Highlight the tooltip entry based on which point the mouse is closest to.
                        if (allData.length > 2) {
                            var yValue = chartModel.yScale().invert(e.mouseY);
                            var domainExtent = Math.abs(chartModel.yScale().domain()[0] - chartModel.yScale().domain()[1]);
                            var threshold = 0.03 * domainExtent;
                            var indexToHighlight = nvd3v181.nearestValueIndex(allData.map(function (d) {
                                return d.value
                            }), yValue, threshold);
                            if (indexToHighlight !== null)
                                allData[indexToHighlight].highlight = true;
                        }

                        var xValue = xAxis.tickFormat()(chartModel.x()(singlePoint, pointIndex));
                        interactiveLayer.tooltip
                            .position({left: e.mouseX + margin.left, top: e.mouseY + margin.top})
                            .chartContainer(that.parentNode)
                            .valueFormatter(function (d, i) {
                                return d == null ? "N/A" : yAxis.tickFormat()(d);
                            })
                            .data({
                                value: xValue,
                                index: pointIndex,
                                series: allData
                            })();

                        interactiveLayer.renderGuideLine(pointXLocation);
                    });

                    interactiveLayer.dispatch.on("elementMouseout", function (e) {
                        lines.clearHighlights();
                    });

                    dispatch.on('changeState', function (e) {
                        if (typeof e.disabled !== 'undefined') {
                            data.forEach(function (series, i) {
                                series.disabled = e.disabled[i];
                            });
                        }
                        chartModel.update();
                    });
                }

                //============================================================
                // Functions
                //------------------------------------------------------------

                // Taken from crossfilter (http://square.github.com/crossfilter/)
                function resizePath(d) {
                    var e = +(d == 'e'),
                        x = e ? 1 : -1,
                        y = availableHeight2 / 3;
                    return 'M' + (.5 * x) + ',' + y
                        + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
                        + 'V' + (2 * y - 6)
                        + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y)
                        + 'Z'
                        + 'M' + (2.5 * x) + ',' + (y + 8)
                        + 'V' + (2 * y - 8)
                        + 'M' + (4.5 * x) + ',' + (y + 8)
                        + 'V' + (2 * y - 8);
                }


                function updateBrushBG() {
                    if (!brush.empty()) brush.extent(brushExtent);
                    brushBG
                        .data([brush.empty() ? x2.domain() : brushExtent])
                        .each(function (d, i) {
                            var leftWidth = x2(d[0]) - xScale.range()[0],
                                rightWidth = availableWidth - x2(d[1]);
                            d3.select(this).select('.left')
                                .attr('width', leftWidth < 0 ? 0 : leftWidth);

                            d3.select(this).select('.right')
                                .attr('x', x2(d[1]))
                                .attr('width', rightWidth < 0 ? 0 : rightWidth);
                        });
                }


                function onBrush() {
                    brushExtent = brush.empty() ? null : brush.extent();
                    var extent = brush.empty() ? x2.domain() : brush.extent();

                    //The brush extent cannot be less than one.  If it is, don't update the line chart.
                    if (Math.abs(extent[0] - extent[1]) <= 1) {
                        return;
                    }

                    dispatch.brush({extent: extent, brush: brush});


                    updateBrushBG();

                    // Update Main (Focus)
                    var focusLinesWrap = g.select('.nv-focus .nv-linesWrap')
                        .datum(
                        data
                            .filter(function (d) {
                                return !d.disabled
                            })
                            .map(function (d, i) {
                                return {
                                    key: d.key,
                                    area: d.area,
                                    values: d.values.filter(function (d, i) {
                                        return lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1];
                                    })
                                }
                            })
                    );
                    focusLinesWrap.transition().duration(transitionDuration).call(lines);


                    // Update Main (Focus) Axes
                    g.select('.nv-focus .nv-x.nv-axis').transition().duration(transitionDuration)
                        .call(xAxis);
                    g.select('.nv-focus .nv-y.nv-axis').transition().duration(transitionDuration)
                        .call(yAxis);
                }
            });

            return chartModel;
        }

        //============================================================
        // Event Handling/Dispatching (out of chart's scope)
        //------------------------------------------------------------

        lines.dispatch.on('elementMouseover.tooltip', function (evt) {
            tooltip.data(evt).position(evt.pos).hidden(false);
        });

        lines.dispatch.on('elementMouseout.tooltip', function (evt) {
            tooltip.hidden(true)
        });

        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        // expose chart's sub-components
        chartModel.dispatch = dispatch;
        chartModel.legend = legend;
        chartModel.lines = lines;
        chartModel.lines2 = lines2;
        chartModel.xAxis = xAxis;
        chartModel.yAxis = yAxis;
        chartModel.x2Axis = x2Axis;
        chartModel.y2Axis = y2Axis;
        chartModel.interactiveLayer = interactiveLayer;
        chartModel.tooltip = tooltip;

        chartModel.options = nvd3v181.utils.optionsFunc.bind(chartModel);

        chartModel._options = Object.create({}, {
            // simple options, just get/set the necessary values
            focusShowAxisY:    {get: function(){return focusShowAxisY;}, set: function(_){focusShowAxisY=_;}},
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            focusHeight: {
                get: function () {
                    return height2;
                }, set: function (_) {
                    height2 = _;
                }
            },
            showLegend: {
                get: function () {
                    return showLegend;
                }, set: function (_) {
                    showLegend = _;
                }
            },
            brushExtent: {
                get: function () {
                    return brushExtent;
                }, set: function (_) {
                    brushExtent = _;
                }
            },
            defaultState: {
                get: function () {
                    return defaultState;
                }, set: function (_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function () {
                    return noData;
                }, set: function (_) {
                    noData = _;
                }
            },

            // deprecated options
            tooltips: {
                get: function () {
                    return tooltip.enabled();
                }, set: function (_) {
                    // deprecated after 1.7.1
                    nvd3v181.deprecated('tooltips', 'use chart.tooltip.enabled() instead');
                    tooltip.enabled(!!_);
                }
            },
            tooltipContent: {
                get: function () {
                    return tooltip.contentGenerator();
                }, set: function (_) {
                    // deprecated after 1.7.1
                    nvd3v181.deprecated('tooltipContent', 'use chart.tooltip.contentGenerator() instead');
                    tooltip.contentGenerator(_);
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            color: {
                get: function () {
                    return color;
                }, set: function (_) {
                    color = nvd3v181.utils.getColor(_);
                    legend.color(color);
                    // line color is handled above?
                }
            },
            interpolate: {
                get: function () {
                    return lines.interpolate();
                }, set: function (_) {
                    lines.interpolate(_);
                    lines2.interpolate(_);
                }
            },
            xTickFormat: {
                get: function () {
                    return xAxis.tickFormat();
                }, set: function (_) {
                    xAxis.tickFormat(_);
                    x2Axis.tickFormat(_);
                }
            },
            yTickFormat: {
                get: function () {
                    return yAxis.tickFormat();
                }, set: function (_) {
                    yAxis.tickFormat(_);
                    y2Axis.tickFormat(_);
                }
            },
            duration: {
                get: function () {
                    return transitionDuration;
                }, set: function (_) {
                    transitionDuration = _;
                    yAxis.duration(transitionDuration);
                    y2Axis.duration(transitionDuration);
                    xAxis.duration(transitionDuration);
                    x2Axis.duration(transitionDuration);
                }
            },
            x: {
                get: function () {
                    return lines.x();
                }, set: function (_) {
                    lines.x(_);
                    lines2.x(_);
                }
            },
            y: {
                get: function () {
                    return lines.y();
                }, set: function (_) {
                    lines.y(_);
                    lines2.y(_);
                }
            },
            useInteractiveGuideline: {
                get: function () {
                    return useInteractiveGuideline;
                }, set: function (_) {
                    useInteractiveGuideline = _;
                    if (useInteractiveGuideline) {
                        lines.interactive(false);
                        lines.useVoronoi(false);
                    }
                }
            }
        });

        nvd3v181.utils.inheritOptions(chartModel, lines);
        nvd3v181.utils.initOptions(chartModel);

        //============================================================
        // Customize NVD3 Chart: Following code has been added by Juniper to
        // customize LineWithFocusChart.
        //------------------------------------------------------------

        chartModel.brushExtent(chartOptions['brushExtent'])
                  .useInteractiveGuideline(true);

        chartModel.interpolate(cowu.interpolateSankey);

        chartModel.xAxis.tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d));
        });

        chartModel.x2Axis.axisLabel("Time").tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d));
        });

        chartModel.yAxis.axisLabel(chartOptions.yAxisLabel)
                        .axisLabelDistance(chartOptions.axisLabelDistance)
                        .tickFormat(chartOptions['yFormatter'])
                        .showMaxMin(false);

        if(contrail.checkIfExist(chartOptions.forceY)) {
            chartModel.lines.forceY(chartOptions.forceY);
            chartModel.lines2.forceY(chartOptions.forceY);
        }

        return chartModel;
    };

    return LineWithFocusChartModel;
});