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

define([], function () {
    /**
     * This chart model accepts data in following format:
     * [{label: '', value: },{..}]
     * @param chartOptions
     * @returns DonutChartModel
     */
    var DonutChartModel = function (chartOptions) {

        nv.models.donutChart = function() {
            "use strict";

            //============================================================
            // Public Variables with Default Settings
            //------------------------------------------------------------
            var pie = nv.models.pie();
            var legend = nv.models.legend();
            var tooltip = nv.models.tooltip();

            var margin = {top: 0, right: 0, bottom: 0, left: 0}
                , width = null
                , height = null
                , showLegend = true
                , legendPosition = "right"
                , color = d3.scale.category20()
                , state = nv.utils.state()
                , defaultState = null
                , noData = null
                , duration = 250
                , dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'stateChange', 'changeState','renderEnd')
                ;

            tooltip
                .headerEnabled(false)
                .duration(0)
                .valueFormatter(function(d, i) {
                    return pie.valueFormat()(d, i);
                });

            //============================================================
            // Private Variables
            //------------------------------------------------------------

            var renderWatch = nv.utils.renderWatch(dispatch);

            var stateGetter = function(data) {
                return function(){
                    return {
                        active: data.map(function(d) { return !d.disabled })
                    };
                }
            };

            var stateSetter = function(data) {
                return function(state) {
                    if (state.active !== undefined) {
                        data.forEach(function (series, i) {
                            series.disabled = !state.active[i];
                        });
                    }
                }
            };

            //============================================================
            // Chart function
            //------------------------------------------------------------

            function chart(selection) {
                renderWatch.reset();
                renderWatch.models(pie);

                selection.each(function(chartDataObj) {
                    var container = d3.select(this),
                        data = chartDataObj.data,
                        requestState = chartDataObj.requestState;

                    nv.utils.initSVG(container);

                    var that = this;
                    var availableWidth = nv.utils.availableWidth(width, container, margin),
                        availableHeight = nv.utils.availableHeight(height, container, margin);

                    chart.update = function() { container.transition().call(chart); };
                    chart.container = this;

                    state.setter(stateSetter(data), chart.update)
                        .getter(stateGetter(data))
                        .update();

                    //set state.disabled
                    state.disabled = data.map(function(d) { return !!d.disabled });

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

                    // //Display No Data message if there's nothing to show.
                    //if (!data || !data.length) {
                    //    nv.utils.noData(chart, container);
                    //   // return chart;
                    //} else {
                    //    container.selectAll('.nv-noData').remove();
                    //}

                    // Setup containers and skeleton of chart
                    var wrap = container.selectAll('g.nv-wrap.nv-pieChart').data([data]);
                    var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-pieChart').append('g');
                    var g = wrap.select('g');

                    gEnter.append('g').attr('class', 'nv-pieWrap');
                    gEnter.append('g').attr('class', 'nv-legendWrap');

                    // Legend
                    if (showLegend) {
                        if (legendPosition === "top") {
                            legend.width( availableWidth ).key(pie.x());

                            wrap.select('.nv-legendWrap')
                                .datum(data)
                                .call(legend);

                            if ( margin.top != legend.height()) {
                                margin.top = legend.height();
                                availableHeight = nv.utils.availableHeight(height, container, margin);
                            }

                            wrap.select('.nv-legendWrap')
                                .attr('transform', 'translate(0,' + (-margin.top) +')');
                        } else if (legendPosition === "right") {
                            var legendWidth = nv.models.legend().width();

                            if (availableWidth / 4 < legendWidth) {
                                legendWidth = (availableWidth / 4)
                            }

                            legend.height(availableHeight).key(pie.x());
                            legend.width(legendWidth);
                            availableWidth -= legend.width();

                            wrap.select('.nv-legendWrap')
                                .datum(data)
                                .call(legend)
                                .attr('transform', 'translate(' + (availableWidth + 10) +',0)');
                        }
                    }
                    wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    // Main Chart Component(s)
                    pie.width(availableWidth).height(availableHeight);
                    var pieWrap = g.select('.nv-pieWrap').datum([data]);
                    d3.transition(pieWrap).call(pie);
                });

                renderWatch.renderEnd('pieChart immediate');
                return chart;
            }

            //============================================================
            // Event Handling/Dispatching (out of chart's scope)
            //------------------------------------------------------------

            pie.dispatch.on('elementMouseover.tooltip', function(evt) {
                evt['series'] = {
                    key: chart.x()(evt.data),
                    value: chart.y()(evt.data),
                    color: evt.color
                };
                tooltip.data(evt).hidden(false);
            });

            pie.dispatch.on('elementMouseout.tooltip', function(evt) {
                tooltip.hidden(true);
            });

            pie.dispatch.on('elementMousemove.tooltip', function(evt) {
                tooltip.position({top: d3.event.pageY, left: d3.event.pageX})();
            });

            //============================================================
            // Expose Public Variables
            //------------------------------------------------------------

            // expose chart's sub-components
            chart.legend = legend;
            chart.dispatch = dispatch;
            chart.pie = pie;
            chart.tooltip = tooltip;
            chart.options = nv.utils.optionsFunc.bind(chart);

            // use Object get/set functionality to map between vars and chart functions
            chart._options = Object.create({}, {
                // simple options, just get/set the necessary values
                noData:         {get: function(){return noData;},         set: function(_){noData=_;}},
                showLegend:     {get: function(){return showLegend;},     set: function(_){showLegend=_;}},
                legendPosition: {get: function(){return legendPosition;}, set: function(_){legendPosition=_;}},
                defaultState:   {get: function(){return defaultState;},   set: function(_){defaultState=_;}},

                // deprecated options
                tooltips:    {get: function(){return tooltip.enabled();}, set: function(_){
                    // deprecated after 1.7.1
                    nv.deprecated('tooltips', 'use chart.tooltip.enabled() instead');
                    tooltip.enabled(!!_);
                }},
                tooltipContent:    {get: function(){return tooltip.contentGenerator();}, set: function(_){
                    // deprecated after 1.7.1
                    nv.deprecated('tooltipContent', 'use chart.tooltip.contentGenerator() instead');
                    tooltip.contentGenerator(_);
                }},

                // options that require extra logic in the setter
                color: {get: function(){return color;}, set: function(_){
                    color = _;
                    legend.color(color);
                    pie.color(color);
                }},
                duration: {get: function(){return duration;}, set: function(_){
                    duration = _;
                    renderWatch.reset(duration);
                }},
                margin: {get: function(){return margin;}, set: function(_){
                    margin.top    = _.top    !== undefined ? _.top    : margin.top;
                    margin.right  = _.right  !== undefined ? _.right  : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left   = _.left   !== undefined ? _.left   : margin.left;
                }}
            });
            nv.utils.inheritOptions(chart, pie);
            nv.utils.initOptions(chart);
            return chart;
        };

        var chartModel = nv.models.donutChart()
            .donut(true)
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .margin(chartOptions.margin)
            .height(chartOptions.height)
            .donutRatio(chartOptions.donutRatio)
            .showLegend(chartOptions.showLegend)
            .legendPosition(chartOptions.legendPosition)
            .showLabels(chartOptions.showLabels)
            .noData(chartOptions.noDataMessage);

        chartModel.tooltip.enabled(chartOptions.showTooltips);
        chartModel.pie.valueFormat(chartOptions.valueFormat);
        chartModel.legend.rightAlign(chartOptions.legendRightAlign)
            .padding(chartOptions.legendPadding);

        return chartModel;
    }
    return DonutChartModel;
});