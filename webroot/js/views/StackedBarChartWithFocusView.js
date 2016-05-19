/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 * Credits : http://bl.ocks.org/godds/ec089a2cf3e06a2cd5fc
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView,  ContrailListModel) {
    var cfDataSource;
    var selector;
    var stackedBarChartWithFocusChartView = ContrailView.extend({

        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            selector = $(self.$el);

            cfDataSource = viewConfig.cfDataSource;
            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model !== null) {
                if(cfDataSource == null) {
                    self.renderChart(selector, viewConfig, self.model);
                } else if(self.model.loadedFromCache == true) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                if(cfDataSource != null) {
                    cfDataSource.addCallBack('updateChart',function(data) {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                } else {
                    self.model.onAllRequestsComplete.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }

                $(selector).bind("refresh", function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                var resizeFunction = function (e) {
                    self.renderChart(selector, viewConfig, self.model);
                };

                $(window)
                    .off('resize', resizeFunction)
                    .on('resize', resizeFunction);
                self.renderChart(selector, viewConfig, self.model);
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {

            var data = chartViewModel.getFilteredItems();
            var chartTemplate = contrail.getTemplate4Id('core-stacked-bar-chart-template');
            var widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                    viewConfig.widgetConfig : null;
            var chartViewConfig, chartOptions, chartModel;
            var cfDataSource = viewConfig.cfDataSource;
            var addOverviewChart = getValueByJsonPath(viewConfig,'chartOptions;addOverviewChart',true);
            var brush = getValueByJsonPath(viewConfig,'chartOptions;brush',true);
            var xAxisLabel = getValueByJsonPath(viewConfig,'chartOptions;xAxisLabel',"Time");
            var yAxisLabel = getValueByJsonPath(viewConfig,'chartOptions;yAxisLabel',"Count");
            var totalHeight = getValueByJsonPath(viewConfig,'chartOptions;height',300);
            var customMargin = getValueByJsonPath(viewConfig,'chartOptions;margin',{});
            var xAxisOffset = getValueByJsonPath(viewConfig,'chartOptions;xAxisOffset',0); // in minutes
            var yAxisOffset = getValueByJsonPath(viewConfig,'chartOptions;yAxisOffset',0); //Percentage
            var barWidth = getValueByJsonPath(viewConfig,'chartOptions;barWidth',null);
            var bucketSize = getValueByJsonPath(viewConfig,'chartOptions;bucketSize',10); // in minutes
            var axisLabelFontSize = getValueByJsonPath(viewConfig,'chartOptions;axisLabelFontSize',13);
            var tickPadding = getValueByJsonPath(viewConfig,'chartOptions;tickPadding',10);
            var showLegend = getValueByJsonPath(viewConfig,'chartOptions;showLegend',false);
            var legendFn = getValueByJsonPath(viewConfig,'chartOptions;legendFn',null);
            var sliceTooltipFn = null;

            //sliceTooltipFn is for portion of bar in stacked bar.
            if (contrail.checkIfFunction(viewConfig['chartOptions']['sliceTooltipFn'])) {
                sliceTooltipFn = viewConfig['chartOptions']['sliceTooltipFn'];
            }
            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }
            if ($(selector).find('.stacked-bar-chart-container').find("svg") != null &&
                    $(selector).find('.stacked-bar-chart-container').find("svg").length > 0) {
                $(selector).find('.stacked-bar-chart-container').empty();
            } else {
                $(selector).html(chartTemplate);
                if (widgetConfig !== null) {
                    this.renderView4Config($(selector).find('.stacked-bar-chart-container'), chartViewModel, widgetConfig, null, null, null);
                }
            }
            clearToolTip(false);//clear any tooltips from previous if any
            /**
             * Actual chart code starts
             */

            // sizing information, including margins so there is space for labels, etc
            var totalWidth = $(selector).find('.stacked-bar-chart-container').width();
            var totalOverviewHeight = totalWidth * 0.1;
            var margin =  { top: 20, right: 20, bottom: totalOverviewHeight, left: 20 };
            margin = $.extend(margin, customMargin);
            if(!addOverviewChart) {
                margin =  { top: 20, right: 20, bottom: 40, left: 50 };
            }
            var customTimeFormat = d3.time.format.multi([
//                                                         [".%L", function(d) { return d.getMilliseconds(); }],
                                                         [":%S", function(d) { return d.getSeconds(); }],
                                                         ["%H:%M", function(d) { return d.getMinutes(); }],
                                                         ["%H:%M", function(d) { return d.getHours(); }],
                                                         ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                                                         ["%b %d", function(d) { return d.getDate() != 1; }],
                                                         ["%B", function(d) { return d.getMonth(); }],
                                                         ["%Y", function() { return true; }]
                                                       ]);
            var width = totalWidth - margin.left - margin.right,
//            var width = totalWidth - 54,
                height = totalHeight - margin.top - margin.bottom,
                marginOverview = { top: totalHeight * 0.86, right: margin.right, bottom: 20,  left: margin.left },
                heightOverview = totalHeight - marginOverview.top - marginOverview.bottom;
            var overview,brush,brush2Main;
            // set up a date parsing function for future use
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // mathematical scales for the x and y axes
            var x = d3.time.scale()
                            .range([0, width]);
            var y = d3.scale.linear()
                            .range([height, 0]);

            var xOverview = d3.time.scale()
                            .range([0, width]);
            var yOverview = d3.scale.linear()
                            .range([heightOverview, 0]);

            // rendering for the x and y axes
            var xAxis = d3.svg.axis()
                            .scale(x)
                            .orient("bottom")
                            .innerTickSize(-height)
                            .outerTickSize(0)
                            .tickPadding(tickPadding)
                            .tickFormat(customTimeFormat)
            var yAxis = d3.svg.axis()
                            .scale(y)
                            .orient("left")
                            .ticks(3)
                            .tickFormat(d3.format("d"))
                            .innerTickSize(-width)
                            .outerTickSize(0)
                            .tickPadding(tickPadding);
            var xAxisOverview = d3.svg.axis()
                            .scale(xOverview)
                            .orient("bottom");

            // something for us to render the chart into
            var svg = d3.select($(selector).find('.stacked-bar-chart-container')[0])
                            .append("svg") // the overall space
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.bottom);
            if (showLegend && legendFn != null && typeof legendFn == 'function') {
                legendFn(data, selector);
            }
            var main = svg.append("g")
                            .attr("class", "main")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            //Add the axis labels
            var xaxisLabel = main.append("text")
                                .attr("class", "axis-label")
                                .attr("text-anchor", "end")
                                .attr("x", width/2)
                                .attr("y", height + 40)
                                .attr("font-size", axisLabelFontSize)
                                .text(xAxisLabel);
            var yaxisLabel = main.append("text")
                                .attr("class", "axis-label")
                                .attr("text-anchor", "end")
                                .attr("y", -margin.left)
                                .attr("x", -height/2)
                                .attr("dy", ".75em")
                                .attr("dx", ".75em")
                                .attr("transform", "rotate(-90)")
                                .attr("font-size", axisLabelFontSize)
                                .text(yAxisLabel);
            var tooltipDiv = d3.select("body").append("div")
                            .attr("class", "stack-bar-chart-tooltip")
                            .style("opacity", 0);
            var formatTime = d3.time.format("%e %b %X");
            if(brush && addOverviewChart) {
                overview = svg.append("g")
                                    .attr("class", "overview")
                                    .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

                // brush tool to let us zoom and pan using the overview chart
                brush = d3.svg.brush()
                                    .x(xOverview)
                                    .on("brushend", brushed);
            } else if (brush) {
                brush2Main = d3.svg.brush()
                                    .x(x)
                                    .on("brushend", brushed2Main);
            }
            var dateExtent;
            var yAxisMaxValue = d3.max(data, function(d) { return d.total; });
            yAxisMaxValue = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
            var yExtent = [0, yAxisMaxValue];
            var filter = cfDataSource != null ? cfDataSource.getFilter('timeFilter') : null;
            if(filter != null && filter.length > 0) {
                dateExtent = [new Date(filter[0]/1000), new Date(filter[1]/1000)]
            } else{
                if(data == null || data.length == 0) {
                    dateExtent = [d3.time.minute.offset(new Date(), -xAxisOffset), new Date()];
                } else {
                    dateExtent = d3.extent(data, function(d) { return d.date; });
                    //extend the range after to plot the x axis
                    dateExtent = [d3.time.minute.offset(dateExtent[0], - xAxisOffset),
                                  d3.time.minute.offset(dateExtent[1], xAxisOffset)];
                }
            }
            if(data == null || data.length == 0) {
                var noDataTxt = main.append("g")
                                .append("text")
                                .attr("class","nvd3 nv-noData")
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                                .text(cowm.DATA_SUCCESS_EMPTY);
                yExtent = [0,1];//Default y extent
            }
            x.domain(dateExtent);
            if (barWidth == null && bucketSize != null) {
                bucketSize = bucketSize * 60 * 1000;
                barWidth = d3.scale.ordinal().domain(d3.range(dateExtent[0].getTime(), dateExtent[1].getTime(), bucketSize)).rangeRoundBands(x.range(),0.08).rangeBand();
            }
            y.domain(yExtent);
            xOverview.domain(x.domain());
            yOverview.domain(y.domain());

            // draw the axes now that they are fully set up
            main.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            main.append("g")
                .attr("class", "y axis")
                .call(yAxis);
            //Create the brush
            if(brush && addOverviewChart) {
                overview.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + heightOverview + ")")
                        .call(xAxisOverview);
                overview.append("g")
                            .attr("class", "bars")
                    .selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return xOverview(d.date) - 3; })
                        .attr("width", 6)
                        .attr("y", function(d) { return yOverview(d.total); })
                        .attr("height", function(d) { return heightOverview - yOverview(d.total); })
                        .style("fill", function(d) {
                            return d.overviewColor;
                            });

                // add the brush target area on the overview chart
                overview.append("g")
                            .attr("class", "x brush")
                            .call(brush)
                            .selectAll("rect")
                                // -6 is magic number to offset positions for styling/interaction to feel right
                                .attr("y", -6)
                                // need to manually set the height because the brush has
                                // no y scale, i.e. we should see the extent being marked
                                // over the full height of the overview chart
                                .attr("height", heightOverview + 7);  // +7 is magic number for styling
            } else if (brush) {
                main.append("g")
                    .attr("class", "x brush")
                    .call(brush2Main)
                    .selectAll("rect")
                    // -6 is magic number to offset positions for styling/interaction to feel right
                    .attr("y", -6)
                    // need to manually set the height because the brush has
                    // no y scale, i.e. we should see the extent being marked
                    // over the full height of the overview chart
                    .attr("height", height + 7);  // +7 is magic number for styling
            }
            // draw the bars
            main.append("g")
                    .attr("class", "bars")
                // a group for each stack of bars, positioned in the correct x position
                .selectAll(".bar.stack")
                .data(data)
                .enter().append("g")
                    .attr("class", "bar stack")
                    .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
                    .on('click',onclickBar)
                    .on("mouseover", function(d) {
                        if (sliceTooltipFn == null) {
                            tooltipDiv.transition()
                                .duration(200)
                                .style("opacity", .9);
                            tooltipDiv.html(formatTime(d.date) + "<br/>"  + d.total + " Alarm(s)")
                                .style("left", getToolTipXPos(d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                        }
                    })
                    .on("mouseout", function(d) {
                            clearToolTip(true);
                        })
                // a bar for each value in the stack, positioned in the correct y positions
                .selectAll("rect")
                .style("cursor","hand")

                .data(function(d) { return d.counts; })
                .enter().append("rect")
                    .attr("class", "bar")
                    .attr("width", barWidth)
                    .attr("y", function(d) { return y(d.y1); })
                    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                    .style("fill", function(d) { return d.color; })
                    .on("mouseover", function(d) {
                        if (sliceTooltipFn != null &&
                            typeof sliceTooltipFn == 'function') {
                            var event = d3.event;
                            //TODO parent div adjust need to be removed
                            //$(tooltipDiv).css({'width': '0px','height': '0px'});
                            tooltipDiv.transition()
                                .duration(200)
                                .style("opacity", 1);
                            tooltipDiv.html(function () {
                                return sliceTooltipFn(d);
                            })
                            .style("left", getToolTipXPos(event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                        }
                     })
                    .on("mouseout", function(d) {
                            //setTimeout(function () {
                            clearToolTip(true);
                            //}, 1000);
                     });

            //Need to wait until the widget is rendered.
            setTimeout(updateFilteredCntInHeader,200);

            function getToolTipXPos (currPos) {
                var windowWidth = $(document).width();
                var tooltipWidth = $($(tooltipDiv)[0]).width()
                var tooltipPositionLeft = currPos;
                if ((windowWidth - currPos) < tooltipWidth) {
                    tooltipPositionLeft = currPos - tooltipWidth - 10;
                }
                return tooltipPositionLeft;
            }
            function onclickBar(data) {
                var xExtent = data.timestampExtent;
                clearToolTip(false);
                xExtent = xExtent.map(function(date){
                    return new Date(date).getTime(); //convert to millisecs
                });
                if ((xExtent[1] - xExtent[0]) < cowc.ALARM_BUCKET_DURATION) {
                    var avg = (xExtent[1] + xExtent[0])/2;
                    xExtent[0] = avg - cowc.ALARM_BUCKET_DURATION / 2 ;
                    xExtent[1] = avg + cowc.ALARM_BUCKET_DURATION / 2 ;
                }
                cfDataSource.applyFilter('timeFilter',xExtent);
                cfDataSource.fireCallBacks({source:'crossfilter'});
            }

            function clearToolTip(fade) {
                if(fade) {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                } else {
                    $('.stack-bar-chart-tooltip').remove();
//                    tooltipDiv.transition()
//                    .style("opacity", 0);
                }
            }
            // zooming/panning behaviour for overview chart
            function brushed() {
                clearToolTip(false);
                if(brush.empty()){
                    cfDataSource.removeFilter('timeFilter');
                } else {
                    var xExtent = (brush.empty() ? xOverview.domain() : brush.extent());
                    xExtent = xExtent.map(function(date){
                        return new Date(date).getTime() *1000; //convert to millisecs
                    });
                    cfDataSource.applyFilter('timeFilter',xExtent);
                }
                cfDataSource.fireCallBacks({source:'crossfilter'});
            }

            function brushed2Main() {
                if(brush2Main.empty()){
                    cfDataSource.removeFilter('timeFilter');
                } else {
                    var xExtent = (brush2Main.empty() ? x.domain() : brush2Main.extent());
                    xExtent = xExtent.map(function(date){
                        return new Date(date).getTime() *1000; //convert to millisecs
                    });
                    if ((xExtent[1] - xExtent[0]) > cowc.ALARM_BUCKET_DURATION) {
                        cfDataSource.applyFilter('timeFilter',xExtent);
                    }
                }
                cfDataSource.fireCallBacks({source:'crossfilter'});
//                setTimeout(updateFilteredCntInHeader,500);
            }

            function updateFilteredCntInHeader() {
                //Update cnt in title
                var headerElem = $(selector).find('.widget-body').siblings('.widget-header')[0];
                if(headerElem != null && cfDataSource != null) {
                    var filteredCnt = cfDataSource.getFilteredRecordCnt(),
                        totalCnt = cfDataSource.getRecordCnt();
                    var infoElem = ifNull($($(headerElem).contents()[1]),$(headerElem));
                    var innerText = infoElem.text().split('(')[0].trim();

                    if(totalCnt > filteredCnt) {
                        innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
                    }
                    infoElem.text(innerText);
                }
            }

            /**
             * Actual chart code ENDS
             */
        }
    });

    return stackedBarChartWithFocusChartView;
});
