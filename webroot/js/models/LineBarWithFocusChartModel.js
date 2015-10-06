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
    var LineBarWithFocusChartModel = function(chartOptions) {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var lines = nvd3v181.models.line()
            , lines2 = nvd3v181.models.line()
            , bars = nvd3v181.models.historicalBar()
            , bars2 = nvd3v181.models.historicalBar()
            , xAxis = nvd3v181.models.axis()
            , x2Axis = nvd3v181.models.axis()
            , y1Axis = nvd3v181.models.axis()
            , y2Axis = nvd3v181.models.axis()
            , y3Axis = nvd3v181.models.axis()
            , y4Axis = nvd3v181.models.axis()
            , legend = nvd3v181.models.legend()
            , brush = d3.svg.brush()
            , tooltip = nvd3v181.models.tooltip()
            ;

        var margin = chartOptions.margin
            , margin2 = chartOptions.margin2
            , width = null
            , height = null
            , getX = function(d) { return d.x }
            , getY = function(d) { return d.y }
            , color = nvd3v181.utils.defaultColor()
            , showLegend = true
            , focusEnable = true
            , focusShowAxisY = false
            , focusShowAxisX = true
            , focusHeight = 90
            , extent
            , brushExtent = null
            , x
            , x2
            , y1
            , y2
            , y3
            , y4
            , noData = null
            , dispatch = d3.dispatch('brush', 'stateChange', 'changeState')
            , transitionDuration = 0
            , state = nvd3v181.utils.state()
            , defaultState = null
            , legendLeftAxisHint = ' (left axis)'
            , legendRightAxisHint = ' (right axis)'
            ;

        lines.clipEdge(true);
        lines2.interactive(false);
        xAxis.orient('bottom').tickPadding(5);
        y1Axis.orient('left');
        y2Axis.orient('right');
        x2Axis.orient('bottom').tickPadding(5);
        y3Axis.orient('left');
        y4Axis.orient('right');

        tooltip.headerEnabled(true).headerFormatter(function(d, i) {
            return xAxis.tickFormat()(d, i);
        });

        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var stateGetter = function(data) {
            return function(){
                return {
                    active: data.map(function(d) { return !d.disabled })
                };
            }
        };

        var stateSetter = function(data) {
            return function(state) {
                if (state.active !== undefined)
                    data.forEach(function(series,i) {
                        series.disabled = !state.active[i];
                    });
            }
        };

        function chartModel(selection) {
            selection.each(function (chartDataObj) {
                var container = d3.select(this),
                    that = this,
                    data = chartDataObj.data,
                    requestState = chartDataObj.requestState;

                nvd3v181.utils.initSVG(container);
                var availableWidth = nvd3v181.utils.availableWidth(width, container, margin),
                    availableHeight1 = nvd3v181.utils.availableHeight(height, container, margin)
                        - (focusEnable ? focusHeight : 0),
                    availableHeight2 = focusHeight - margin2.top - margin2.bottom;

                chartModel.update = function () {
                    container.transition().duration(transitionDuration).call(chartModel);
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

                var dataBars = [], dataLines = [],
                    series1 = [], series2 = [];

                dataBars = data.filter(function (d) {
                    return !d.disabled && d.bar
                });
                dataLines = data.filter(function (d) {
                    return !d.bar
                }); // removed the !d.disabled clause here to fix Issue #240

                series1 = data
                    .filter(function (d) {
                        return !d.disabled && d.bar
                    })
                    .map(function (d) {
                        return d.values.map(function (d, i) {
                            return {x: getX(d, i), y: getY(d, i)}
                        })
                    });

                series2 = data
                    .filter(function (d) {
                        return !d.disabled && !d.bar
                    })
                    .map(function (d) {
                        return d.values.map(function (d, i) {
                            return {x: getX(d, i), y: getY(d, i)}
                        })
                    });

                x = bars.xScale();
                x2 = x2Axis.scale();
                y1 = bars.yScale();
                y2 = lines.yScale();
                y3 = bars2.yScale();
                y4 = lines2.yScale();


                x.range([0, availableWidth]);

                x2  .domain(d3.extent(d3.merge(series1.concat(series2)), function(d) { return d.x } ))
                    .range([0, availableWidth]);

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-linePlusBar').data([data]);
                var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-linePlusBar').append('g');
                var g = wrap.select('g');

                gEnter.append('g').attr('class', 'nv-legendWrap');

                // this is the main chart
                var focusEnter = gEnter.append('g').attr('class', 'nv-focus');
                focusEnter.append('g').attr('class', 'nv-x nv-axis');
                focusEnter.append('g').attr('class', 'nv-y1 nv-axis');
                focusEnter.append('g').attr('class', 'nv-y2 nv-axis');
                focusEnter.append('g').attr('class', 'nv-barsWrap');
                focusEnter.append('g').attr('class', 'nv-linesWrap');

                // context chart is where you can focus in
                var contextEnter = gEnter.append('g').attr('class', 'nv-context');
                contextEnter.append('g').attr('class', 'nv-x nv-axis');
                contextEnter.append('g').attr('class', 'nv-y1 nv-axis');
                contextEnter.append('g').attr('class', 'nv-y2 nv-axis');
                contextEnter.append('g').attr('class', 'nv-barsWrap');
                contextEnter.append('g').attr('class', 'nv-linesWrap');
                contextEnter.append('g').attr('class', 'nv-brushBackground');
                contextEnter.append('g').attr('class', 'nv-x nv-brush');

                //============================================================
                // Legend
                //------------------------------------------------------------

                if (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY && showLegend) {
                    var legendWidth = availableWidth,
                        legendXPosition = 0;

                    legend.width(legendWidth);

                    g.select('.nv-legendWrap')
                        .datum(data.map(function(series) {
                            series.originalKey = series.originalKey === undefined ? series.key : series.originalKey;
                            series.key = series.originalKey + (series.bar ? legendLeftAxisHint : legendRightAxisHint);
                            return series;
                        }))
                        .call(legend);

                    if ( margin.top != legend.height()) {
                        margin.top = legend.height();
                        // FIXME: shouldn't this be "- (focusEnabled ? focusHeight : 0)"?
                        availableHeight1 = nvd3v181.utils.availableHeight(height, container, margin) - focusHeight;
                    }

                    g.select('.nv-legendWrap')
                        .attr('transform', 'translate(' + legendXPosition + ',' + (-margin.top) +')');
                }

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                //============================================================
                // Context chart (focus chart) components
                //------------------------------------------------------------

                // hide or show the focus context chart
                g.select('.nv-context').style('display', (focusEnable && requestState === cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY) ? 'initial' : 'none');

                bars2
                    .width(availableWidth)
                    .height(availableHeight2)
                    .color(data.map(function (d, i) {
                        return d.color || color(d, i);
                    }).filter(function (d, i) {
                        return !data[i].disabled && data[i].bar
                    }));
                lines2
                    .width(availableWidth)
                    .height(availableHeight2)
                    .color(data.map(function (d, i) {
                        return d.color || color(d, i);
                    }).filter(function (d, i) {
                        return !data[i].disabled && !data[i].bar
                    }));

                var bars2Wrap = g.select('.nv-context .nv-barsWrap')
                    .datum(dataBars.length ? dataBars : [
                        {values: []}
                    ]);
                var lines2Wrap = g.select('.nv-context .nv-linesWrap')
                    .datum((dataLines.length > 0 && !dataLines[0].disabled) ? dataLines : [
                        {values: []}
                    ]);

                g.select('.nv-context')
                    .attr('transform', 'translate(0,' + ( availableHeight1 + margin.bottom + margin2.top) + ')');

                bars2Wrap.transition().call(bars2);
                lines2Wrap.transition().call(lines2);

                // context (focus chart) axis controls
                if (focusShowAxisX) {
                    x2Axis
                        ._ticks( nvd3v181.utils.calcTicksX(availableWidth / 100, data))
                        .tickSize(-availableHeight2, 0);
                    g.select('.nv-context .nv-x.nv-axis')
                        .attr('transform', 'translate(0,' + y3.range()[0] + ')');
                    g.select('.nv-context .nv-x.nv-axis').transition()
                        .call(x2Axis);
                }

                if (focusShowAxisY) {
                    y3Axis
                        .scale(y3)
                        ._ticks( availableHeight2 / 36 )
                        .tickSize( -availableWidth, 0);
                    y4Axis
                        .scale(y4)
                        ._ticks( availableHeight2 / 36 )
                        .tickSize(dataBars.length ? 0 : -availableWidth, 0); // Show the y2 rules only if y1 has none

                    g.select('.nv-context .nv-y3.nv-axis')
                        .attr('transform', 'translate(0,' + x2.range()[0] + ')');
                    g.select('.nv-context .nv-y2.nv-axis')
                        .attr('transform', 'translate(' + x2.range()[1] + ',0)');

                    g.select('.nv-context .nv-y1.nv-axis').transition()
                        .call(y3Axis);
                    g.select('.nv-context .nv-y2.nv-axis').transition()
                        .call(y4Axis);
                }

                // Setup Brush
                brush.x(x2).on('brush', onBrush);

                if (brushExtent) brush.extent(brushExtent);

                var brushBG = g.select('.nv-brushBackground').selectAll('g')
                    .data([brushExtent || brush.extent()]);

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
                    //.attr('y', -5)
                    .attr('height', availableHeight2);
                gBrush.selectAll('.resize').append('path').attr('d', resizePath);

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

                    // Update chart from a state object passed to event handler
                    dispatch.on('changeState', function (e) {
                        if (typeof e.disabled !== 'undefined') {
                            data.forEach(function (series, i) {
                                series.disabled = e.disabled[i];
                            });
                            state.disabled = e.disabled;
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
                        .each(function(d,i) {
                            var leftWidth = x2(d[0]) - x2.range()[0],
                                rightWidth = x2.range()[1] - x2(d[1]);

                            d3.select(this).select('.left')
                                .attr('width',  (leftWidth < 0 || isNaN(leftWidth)) ? 0 : leftWidth);

                            d3.select(this).select('.right')
                                .attr('x', isNaN(rightWidth) ? 0 : x2(d[1]))
                                .attr('width', (rightWidth < 0 || isNaN(rightWidth)) ? 0 : rightWidth);
                        });
                }

                function onBrush() {
                    brushExtent = brush.empty() ? null : brush.extent();
                    extent = brush.empty() ? x2.domain() : brush.extent();
                    dispatch.brush({extent: extent, brush: brush});
                    updateBrushBG();

                    // Prepare Main (Focus) Bars and Lines
                    bars
                        .width(availableWidth)
                        .height(availableHeight1)
                        .color(data.map(function(d,i) {
                            return d.color || color(d, i);
                        }).filter(function(d,i) { return !data[i].disabled && data[i].bar }));

                    lines
                        .width(availableWidth)
                        .height(availableHeight1)
                        .color(data.map(function(d,i) {
                            return d.color || color(d, i);
                        }).filter(function(d,i) { return !data[i].disabled && !data[i].bar }));

                    var focusBarsWrap = g.select('.nv-focus .nv-barsWrap')
                        .datum(!dataBars.length ? [{values:[]}] :
                            dataBars
                                .map(function(d,i) {
                                    return {
                                        key: d.key,
                                        values: d.values.filter(function(d,i) {
                                            return bars.x()(d,i) >= extent[0] && bars.x()(d,i) <= extent[1];
                                        })
                                    }
                                })
                    );

                    var focusLinesWrap = g.select('.nv-focus .nv-linesWrap')
                        .datum(dataLines.length && !dataLines[0].disabled ?
                            dataLines
                                .map(function(d,i) {
                                    return {
                                        area: d.area,
                                        key: d.key,
                                        values: d.values.filter(function(d,i) {
                                            return lines.x()(d,i) >= extent[0] && lines.x()(d,i) <= extent[1];
                                        })
                                    }
                                }) : [{values: []}]
                    );

                    // Update Main (Focus) X Axis
                    if (dataBars.length) {
                        x = bars.xScale();
                    } else {
                        x = lines.xScale();
                    }

                    xAxis
                        .scale(x)
                        ._ticks( nvd3v181.utils.calcTicksX(availableWidth/100, data) )
                        .tickSize(-availableHeight1, 0);

                    xAxis.domain([Math.ceil(extent[0]), Math.floor(extent[1])]);

                    g.select('.nv-x.nv-axis').transition().duration(transitionDuration)
                        .call(xAxis);

                    // Update Main (Focus) Bars and Lines
                    focusBarsWrap.transition().duration(transitionDuration).call(bars);
                    focusLinesWrap.transition().duration(transitionDuration).call(lines);

                    // Setup and Update Main (Focus) Y Axes
                    g.select('.nv-focus .nv-x.nv-axis')
                        .attr('transform', 'translate(0,' + y1.range()[0] + ')');

                    y1Axis
                        .scale(y1)
                        ._ticks( nvd3v181.utils.calcTicksY(availableHeight1/36, data) )
                        .tickSize(-availableWidth, 0);
                    y2Axis
                        .scale(y2)
                        ._ticks( nvd3v181.utils.calcTicksY(availableHeight1/36, data) )
                        .tickSize(dataBars.length ? 0 : -availableWidth, 0); // Show the y2 rules only if y1 has none

                    g.select('.nv-focus .nv-y1.nv-axis')
                    g.select('.nv-focus .nv-y2.nv-axis')
                        .attr('transform', 'translate(' + x.range()[1] + ',0)');

                    g.select('.nv-focus .nv-y1.nv-axis').transition().duration(transitionDuration)
                        .call(y1Axis);
                    g.select('.nv-focus .nv-y2.nv-axis').transition().duration(transitionDuration)
                        .call(y2Axis);
                }

                onBrush();

            });

            return chartModel;
        }

        //============================================================
        // Event Handling/Dispatching (out of chart's scope)
        //------------------------------------------------------------

        lines.dispatch.on('elementMouseover.tooltip', function(evt) {
            tooltip
                .duration(100)
                .valueFormatter(function(d, i) {
                    return y2Axis.tickFormat()(d, i);
                })
                .data(evt)
                .position(evt.pos)
                .hidden(false);
        });

        lines.dispatch.on('elementMouseout.tooltip', function(evt) {
            tooltip.hidden(true)
        });

        bars.dispatch.on('elementMouseover.tooltip', function(evt) {
            evt.value = chartModel.x()(evt.data);
            evt['series'] = {
                value: chartModel.y()(evt.data),
                color: evt.color
            };
            tooltip
                .duration(0)
                .valueFormatter(function(d, i) {
                    return y1Axis.tickFormat()(d, i);
                })
                .data(evt)
                .hidden(false);
        });

        bars.dispatch.on('elementMouseout.tooltip', function(evt) {
            tooltip.hidden(true);
        });

        bars.dispatch.on('elementMousemove.tooltip', function(evt) {
            tooltip.position({top: d3.event.pageY, left: d3.event.pageX})();
        });

        //============================================================


        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        // expose chart's sub-components
        chartModel.dispatch = dispatch;
        chartModel.legend = legend;
        chartModel.lines = lines;
        chartModel.lines2 = lines2;
        chartModel.bars = bars;
        chartModel.bars2 = bars2;
        chartModel.xAxis = xAxis;
        chartModel.x2Axis = x2Axis;
        chartModel.y1Axis = y1Axis;
        chartModel.y2Axis = y2Axis;
        chartModel.y3Axis = y3Axis;
        chartModel.y4Axis = y4Axis;
        chartModel.tooltip = tooltip;

        chartModel.options = nvd3v181.utils.optionsFunc.bind(chartModel);

        chartModel._options = Object.create({}, {
            // simple options, just get/set the necessary values
            width:      {get: function(){return width;}, set: function(_){width=_;}},
            height:     {get: function(){return height;}, set: function(_){height=_;}},
            showLegend: {get: function(){return showLegend;}, set: function(_){showLegend=_;}},
            brushExtent:    {get: function(){return brushExtent;}, set: function(_){brushExtent=_;}},
            noData:    {get: function(){return noData;}, set: function(_){noData=_;}},
            focusEnable:    {get: function(){return focusEnable;}, set: function(_){focusEnable=_;}},
            focusHeight:    {get: function(){return focusHeight;}, set: function(_){focusHeight=_;}},
            focusShowAxisX:    {get: function(){return focusShowAxisX;}, set: function(_){focusShowAxisX=_;}},
            focusShowAxisY:    {get: function(){return focusShowAxisY;}, set: function(_){focusShowAxisY=_;}},
            legendLeftAxisHint:    {get: function(){return legendLeftAxisHint;}, set: function(_){legendLeftAxisHint=_;}},
            legendRightAxisHint:    {get: function(){return legendRightAxisHint;}, set: function(_){legendRightAxisHint=_;}},

            // deprecated options
            tooltips:    {get: function(){return tooltip.enabled();}, set: function(_){
                // deprecated after 1.7.1
                nvd3v181.deprecated('tooltips', 'use chart.tooltip.enabled() instead');
                tooltip.enabled(!!_);
            }},
            tooltipContent:    {get: function(){return tooltip.contentGenerator();}, set: function(_){
                // deprecated after 1.7.1
                nvd3v181.deprecated('tooltipContent', 'use chart.tooltip.contentGenerator() instead');
                tooltip.contentGenerator(_);
            }},

            // options that require extra logic in the setter
            margin: {get: function(){return margin;}, set: function(_){
                margin.top    = _.top    !== undefined ? _.top    : margin.top;
                margin.right  = _.right  !== undefined ? _.right  : margin.right;
                margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                margin.left   = _.left   !== undefined ? _.left   : margin.left;
            }},
            duration: {get: function(){return transitionDuration;}, set: function(_){
                transitionDuration = _;
            }},
            color:  {get: function(){return color;}, set: function(_){
                color = nvd3v181.utils.getColor(_);
                legend.color(color);
            }},
            x: {get: function(){return getX;}, set: function(_){
                getX = _;
                lines.x(_);
                lines2.x(_);
                bars.x(_);
                bars2.x(_);
            }},
            y: {get: function(){return getY;}, set: function(_){
                getY = _;
                lines.y(_);
                lines2.y(_);
                bars.y(_);
                bars2.y(_);
            }}
        });

        nvd3v181.utils.inheritOptions(chartModel, lines);
        nvd3v181.utils.initOptions(chartModel);

        //============================================================
        // Customize NVD3 Chart: Following code has been added by Juniper to
        // customize LineBarWithFocusChart.
        //------------------------------------------------------------

        chartModel.legendRightAxisHint('')
                  .legendLeftAxisHint('')
                  .brushExtent(chartOptions['brushExtent']);

        chartModel.interpolate(interpolateSankey);
        chartModel.bars.padData(false);

        if(chartOptions.forceY1) {
            chartModel.bars.forceY(chartOptions.forceY1);
            chartModel.bars2.forceY(chartOptions.forceY1);
        }

        if(chartOptions.forceY2) {
            chartModel.lines.forceY(chartOptions.forceY2);
            chartModel.lines2.forceY(chartOptions.forceY2);
        }

        chartModel.xAxis.tickFormat(function (d) {
            return d3.time.format('%H:%M')(new Date(d));
        });

        chartModel.x2Axis.axisLabel("Time").tickFormat(function (d) {
            return d3.time.format('%H:%M')(new Date(d));
        });

        chartModel.y1Axis.axisLabel(chartOptions.y1AxisLabel)
                         .axisLabelDistance(chartOptions.axisLabelDistance)
                         .tickFormat(chartOptions['y1Formatter'])
                         .showMaxMin(false);

        chartModel.y2Axis.axisLabel(chartOptions.y2AxisLabel)
                         .axisLabelDistance(chartOptions.axisLabelDistance)
                         .tickFormat(chartOptions['y2Formatter'])
                         .showMaxMin(false);

        chartModel.showLegend(chartOptions.showLegend);

        return chartModel;
    };

    return LineBarWithFocusChartModel;
});