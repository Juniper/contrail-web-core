/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 * Credits : http://bl.ocks.org/godds/ec089a2cf3e06a2cd5fc
 */

define([
    'underscore',
    'core-basedir/js/views/ChartView',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils'
], function (_, ChartView,  ContrailListModel, LegendView, cowc, chUtils) {
    var cfDataSource;
    var stackedBarChartWithFocusChartView = ChartView.extend({
        settingsChanged: function(newSettings) {
            var self = this,
                vc = self.attributes.viewConfig;
            if(vc.hasOwnProperty("chartOptions")) {
                vc.chartOptions["resetColor"] = true;
                for(var key in newSettings) {
                    if(key in vc.chartOptions) {
                        vc.chartOptions[key] = newSettings[key];
                    }
                }
            }
            self.renderChart($(self.$el), vc, self.model);
        },

        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                resizeId;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            var listenToHistory = getValueByJsonPath(chartOptions,'listenToHistory',false);

            //settings
            if (cowu.getValueByJsonPath(viewConfig, 'chartOptions;applySettings', true)) {
                cowu.updateSettingsWithCookie(viewConfig);
            }
            if(listenToHistory) {
                var postData, remoteConfig;
                if (self.model === null && viewConfig['modelConfig'] != null) {
                    remoteConfig = viewConfig['modelConfig'];
                    postData = JSON.parse(getValueByJsonPath(pRemoteConfig,'remote;ajaxConfig;data'));
                } else {
                  //get the models ajax config and then modify the timeextent
                    remoteConfig = self.model.getRemoteConfig();
                    var pRemoteConfig = getValueByJsonPath(remoteConfig,'remote');
                    postData = JSON.parse(getValueByJsonPath(pRemoteConfig,'ajaxConfig;data'));
                }
                chUtils.listenToHistory(function(event) {
                  //create a new model and then bind to self.
                    var timeExtent = getValueByJsonPath(event,'state;timeExtent',null);
                    if(timeExtent != null && timeExtent.length > 0) {
                        self.model = cowu.buildNewModelForTimeRange (self.model,viewConfig,timeExtent);
                        self.model.onAllRequestsComplete.subscribe(function () {
                            self.renderChart($(self.$el), viewConfig, self.model);
                        });
                    }
                });
            }
            cfDataSource = viewConfig.cfDataSource;
            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model !== null) {
                if(cfDataSource == null) {
                    self.renderChart($(self.$el), viewConfig, self.model);
                } else if(self.model.loadedFromCache == true) {
                    self.renderChart($(self.$el), viewConfig, self.model);
                }

                if(cfDataSource != null) {
                    cfDataSource.addCallBack('updateChart',function(data) {
                        self.renderChart($(self.$el), viewConfig, self.model);
                    });
                    //Need to render if the callbacks have already kicked 
                    //in before coming here
                    self.renderChart($(self.$el), viewConfig, self.model);
                } else {
                    if (self.model.isRequestInProgress() != true) {
                        self.renderChart($(self.$el), viewConfig, self.model);
                    }
                    self.model.onAllRequestsComplete.subscribe(function () {
                        self.renderChart($(self.$el), viewConfig, self.model);
                    });
                }

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderChart($(self.$el), viewConfig, self.model);
                    });
                }

                $($(self.$el)).bind("refresh", function () {
                    self.renderChart($(self.$el), viewConfig, self.model);
                });
                var prevDimensions = chUtils.getDimensionsObj(self.$el);

                self.resizeFunction = _.debounce(function (e, refreshSource) {
                   $('.stack-bar-chart-tooltip').remove();
                    if(!chUtils.isReRenderRequired({
                        prevDimensions:prevDimensions,
                        elem:self.$el})) {
                        return;
                    }
                    prevDimensions = chUtils.getDimensionsObj(self.$el);
                    self.renderChart($(self.$el), viewConfig, self.model, refreshSource);
                },cowc.THROTTLE_RESIZE_EVENT_TIME);

                window.addEventListener('resize',function(e){self.resizeFunction(e,'windowResize')});
                $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel, refreshSource) {
            if (!($(selector).is(':visible'))) {
                return;
            }
            var self = this;
            var data = chartViewModel.getFilteredItems();
            var chartTemplate = contrail.getTemplate4Id('core-stacked-bar-chart-template');
            var widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                    viewConfig.widgetConfig : null;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            var updateToHistory = getValueByJsonPath(chartOptions,'updateToHistory',false);
            var cfDataSource = viewConfig.cfDataSource;
            var defaultChartOptions = getDefaultChartOptions();
            var chartOptionsForSize = ChartView.prototype.getChartOptionsFromDimension(selector);
            chartOptions = $.extend(defaultChartOptions, chartOptions, chartOptionsForSize);
            var addOverviewChart = getValueByJsonPath(chartOptions,'addOverviewChart',true);
            var brush = getValueByJsonPath(chartOptions,'brush',false);
            var xAxisLabel = getValueByJsonPath(chartOptions,'xAxisLabel',"Time");
            var yAxisLabel = getValueByJsonPath(chartOptions,'yAxisLabel',"Count");
            var limit = getValueByJsonPath(chartOptions,'limit');
            var yField = getValueByJsonPath(chartOptions,'yField');
            var totalHeight = ($(selector).closest('.custom-grid-stack-item').length > 0 )?
                    $(selector).closest('.custom-grid-stack-item').height():
                        chartOptions['height'];
            var customMargin = getValueByJsonPath(chartOptions,'margin',{});
            var xAxisOffset = getValueByJsonPath(chartOptions,'xAxisOffset',0); // in minutes
            var yAxisOffset = getValueByJsonPath(chartOptions,'yAxisOffset',0); //Percentage
            var barWidth = getValueByJsonPath(chartOptions,'barWidth',null);
            var bucketSize = getValueByJsonPath(chartOptions,'bucketSize', cowc.DEFAULT_BUCKET_DURATION); // in minutes
            var tickPadding = getValueByJsonPath(chartOptions,'tickPadding',10);
            var showLegend = getValueByJsonPath(chartOptions,'showLegend', true);
            var showControls = getValueByJsonPath(chartOptions,'showControls',true);
            var title = getValueByJsonPath(chartOptions,'title',null);
            var failureCheckFn = getValueByJsonPath(chartOptions,'failureCheckFn',null);
            var failureLabel = getValueByJsonPath(chartOptions,'failureLabel', cowc.FAILURE_LABEL);
            var tooltipFn = getValueByJsonPath(chartOptions,'tooltipFn', defaultTooltipFn);
            var colors = getValueByJsonPath(chartOptions,'colors', {yAxisLabel: cowc.DEFAULT_COLOR});
            var yAxisFormatter = getValueByJsonPath(chartOptions,'yAxisFormatter');
            var xAxisFormatter = getValueByJsonPath(chartOptions,'xAxisFormatter', d3.time.format("%H:%M"));
            var onClickBar = getValueByJsonPath(chartOptions,'onClickBar',false);
            var defaultZeroLineDisplay = getValueByJsonPath(chartOptions,'defaultZeroLineDisplay', false);
            var groupBy = chartOptions['groupBy'], groups = [], yAxisMaxValue;
            var resetColor = getValueByJsonPath(chartOptions,'resetColor',false);
            var showXAxis = cowu.getValueByJsonPath(chartOptions, 'showXAxis', true);
            var showYAxis = cowu.getValueByJsonPath(chartOptions, 'showYAxis', true);
            var showXMinMax = cowu.getValueByJsonPath(chartOptions, 'showXMinMax', false);
            var showYMinMax = cowu.getValueByJsonPath(chartOptions, 'showYMinMax', false);
            var zoomIn = cowu.getValueByJsonPath(chartOptions, 'zoomIn', true);
            var brushRangeLimit = cowu.getValueByJsonPath(chartOptions, 'brushRangeLimit');
            var minTimeRange = cowu.getValueByJsonPath(chartOptions, 'minTimeRange');
            var fixedTimeRange = cowu.getValueByJsonPath(chartOptions, 'fixedTimeRange');
            var useCustomTimeFormat = cowu.getValueByJsonPath(chartOptions, 'useCustomTimeFormat');

            if (showLegend) {
                totalHeight -= 30; //we can make dynamic by getting the legend div height
            }
            if (widgetConfig) {
                totalHeight -= 33;
            }
            var hideTicks = getValueByJsonPath(chartOptions,'hideTicks',false);
            self.grouped = getValueByJsonPath(chartOptions,'grouped',false);
            //settings
            if(typeof chartOptions["colors"] != 'function' && chartOptions['applySettings'] != false) {
                chartOptions["colors"] = cowc.FIVE_NODE_COLOR;
            }
            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data, chartOptions);
              //Need to check and remove the data.length condition because invalid for object
            } else {
                if (data === null || data.length === 0 && defaultZeroLineDisplay){
                    var start = Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                        end = Date.now();
                        chartOptions['timeRange'] = {'start_time': parseInt(start.toString()+'000'),
                                'end_time': parseInt(end.toString()+'000')};
                }else{
                    chartOptions['defaultZeroLineDisplay'] = false;
                }
                data = cowu.chartDataFormatter(data, chartOptions);
            }
            if (fixedTimeRange) {
                //Filter the data within the time range
                var currTime = _.now()
                var fixedTimeRangeDate = [currTime - fixedTimeRange * 1000, currTime];
                for (var i = 0 ; i < data.length; i++) {
                    var values = cowu.getValueByJsonPath(data[i],'values',[]);
                    values = $.map(values, function(d,i) {
                        if(new Date(d.date).getTime() > fixedTimeRangeDate[0] && new Date(d.date).getTime() < fixedTimeRangeDate[1]) {
                            return d;
                        }
                    });
                    data[i]['values'] = values;
                }
            }

            var colorNodes = _.without(_.pluck(data, 'key'), failureLabel);
            self.parsedValues = data;
            self.parsedData = _.indexBy(data, 'key');
            if (colors != null && colorNodes[0] != 'DEFAULT') {
                if (typeof colors == 'function') {
                    self.colors = colors(_.without(_.pluck(data, 'key'), failureLabel), resetColor);
                } else if (typeof colors == 'object') {
                    self.colors = colors;
                }
            }else{
                self.colors = {
                        'DEFAULT':cowc.DEFAULT_COLOR
                }
            }
           //converting the data to d3 stack api expected format
            var stackedData = [];
            $.each(ifNull(data,[]), function(idx, obj){
                if (obj['key'] != null && obj['values'] != null) {
                    stackedData.push(obj['values']);
                }
            });
            var stack = d3.layout.stack();
            stackedData = stack(stackedData);
            self.stackedData = stackedData;
            if ($(selector).find('.stacked-bar-chart-container').find("svg") != null &&
                    $(selector).find('.stacked-bar-chart-container').find("svg").length > 0) {
                $(selector).find('.stacked-bar-chart-container').empty();
            } else {
                $(selector).html(chartTemplate);
                if (widgetConfig !== null) {
                    this.renderView4Config($(selector).find('.stacked-bar-chart-container'), chartViewModel, widgetConfig, null, null, null);
                }
            }
            //clearToolTip(false);//clear any tooltips from previous if any
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
            if (!showXAxis) {
                margin['bottom'] = 0;
            }
            if (!showYAxis) {
                margin['left'] = 0;
            }

            var customTimeFormat = d3.time.format.multi([
//              [".%L", function(d) { return d.getMilliseconds(); }],
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

            // mathematical scales for the x and y axes
            var x = d3.time.scale().range([0, width - 10]);

            var y = d3.scale.linear().range([height, 0]);

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
                            .tickFormat((useCustomTimeFormat)? customTimeFormat: xAxisFormatter);
            var yAxis = d3.svg.axis()
                            .scale(y)
                            .orient("left")
                            .ticks(getValueByJsonPath(chartOptions,'ticks',3))
                            .tickFormat(yAxisFormatter)
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
            var main = svg.append("g")
                            .attr("class", "main")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            //Add the axis labels
            if (showXAxis) {
                xaxisLabel = main.append("text")
                                .attr("class", "axis-label drag-handle")
                                .attr("text-anchor", "middle")
                                .attr("x", width/2)
                                .attr("y", height + 40)
                                .text(xAxisLabel);
            }
            if (showYAxis) {
                yaxisLabel = main.append("text")
                                .attr("class", "axis-label")
                                .attr("text-anchor", "middle")
                                .attr("y", -margin.left)
                                .attr("x", -totalHeight/2)
                                .attr("dy", ".75em")
                                .attr("dx", ".75em")
                                .attr("transform", "rotate(-90)")
                                .text(yAxisLabel);
            }
// var tooltipDiv = self.tooltipDiv;
            var formatTime = d3.time.format("%e %b %X");
            if (hideTicks) {
                $('.stacked-bar-chart-container .tick > line').css('opacity','0')
            }
            if(brush && addOverviewChart) {
                overview = svg.append("g")
                                    .attr("class", "overview")
                                    .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

                // brush tool to let us zoom and pan using the overview chart
                brush = d3.svg.brush()
                                    .x(xOverview)
                                    .on("brushend", brushed)
                                    .on("brush",brushed);
            } else if (brush) {
                brush2Main = d3.svg.brush()
                                    .x(x)
                                    .on("brushend", brushed2Main)
                                    .on("brush", brushDragged2Main);
            }
            var dateExtent;
            var yAxisMaxValue = getyAxisMaxValue(data);
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
                    //Need to look for a way to use d3.extent for nested array of object
                        if (dateExtent[0] == null || dateExtent[1] == null) {
                            dateExtent[0] = d3.min(self.stackedData, function(d) {
                                return d3.min(d, function(d) {
                                    return d.date;
                                });
                            });
                            dateExtent[1] = d3.max(self.stackedData, function(d) {
                                return d3.max(d, function(d) {
                                    return d.date;
                                });
                            });
                        }
//                    if (minTimeRange != null) {// && dateExtent.length > 1 && dateExtent[0] != null && dateExtent[1] != null) {
//                        if ((dateExtent[1].getTime() - dateExtent[0].getTime()) < minTimeRange * 1000) {
//                            var maxDate = dateExtent[1] = d3.max(self.stackedData, function(d) {
//                                                                                return d3.max(d, function(d) {
//                                                                                    return d.date;
//                                                                                });
//                                                                            });
//                            dateExtent[0] = new Date(maxDate.getTime() - minTimeRange * 1000);
//                        }
//                    }
                    if (fixedTimeRange != null) {// && dateExtent.length > 1 && dateExtent[0] != null && dateExtent[1] != null) {
                      var currTime = _.now();
                      dateExtent[0] = new Date(currTime - minTimeRange * 1000);
                      dateExtent[1] = new Date(currTime);
                   }
                    //extend the range after to plot the x axis
//                    dateExtent = [d3.time.minute.offset(dateExtent[0], - xAxisOffset),
//                                  d3.time.minute.offset(dateExtent[1], xAxisOffset)];
                }
            }
            if(data == null || data.length == 0 && !defaultZeroLineDisplay) {
                var noDataTxt = main.append("g")
                                .append("text")
                                .attr("class","nvd3 nv-noData")
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                                .text(cowm.DATA_SUCCESS_EMPTY);
                yExtent = [0,1];//Default y extent
                yAxisMaxValue = 1;
            }
            x.domain(dateExtent);
            y.domain(yExtent);
            self.barPadding = 2; //Space between the bars
            xOverview.domain(x.domain());
            yOverview.domain(y.domain());
            if (showXMinMax) {
                xAxis.tickValues(x.domain());
            }
            if (showYMinMax) {
                yAxis.tickValues(y.domain());
            }
            // draw the axes now that they are fully set up
            if (showXAxis) {
                main.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
            }
            if (showYAxis) {
                main.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
            }
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
                if (brushRangeLimit) {
                    brush2Main.extent(chUtils.getTimeExtentForDuration(brushRangeLimit));
                    main.select('.brush').call(brush2Main);
//                    if(refreshSource != 'windowResize') {
                        brushed2Main();
//                    }
                }
            }
            if (self.stackedData != null && self.stackedData.length > 0) {
                updateChart(self, chartOptions);
            }

            //Prepending the legend to chart container
            if (groupBy == null) {
                showControls = false;
            }
            //if (showControls == true || showLegend == true) {
                var colorsMap = self.colors,
                    nodeLegend = [],
                    legendData = [];
                $.each(colorsMap, function (key, value) {
                    nodeLegend.push({
                        name: key,
                        color: value
                    });
                });
                legendData.push({
                    label: title,
                    legend: nodeLegend
                });
                if (failureCheckFn != null && typeof failureCheckFn == 'function') {
                    legendData.push({
                        label: failureLabel,
                        legend: [{
                            name: failureLabel,
                            color: cowc.FAILURE_COLOR
                        }]
                    });
                }
                var legendView = new LegendView({
                    el: $(selector),
                    viewConfig: {
                        showControls: showControls,
                        controlsData: [{label: 'Stacked', cssClass: 'stacked filled'},
                            {label: 'Grouped', cssClass: 'grouped'}],
                        showLegend: showLegend,
                        legendData: legendData
                    }
                });
                legendView.render();
                //Bind the click handlers to legend
                $(selector).find('.custom-chart-legend')
                    .find('div.square, div.circle')
                    .on('click', function (e) {
                        if ($(e.target).hasClass('square') && !$(e.target).hasClass('filled')) {
                            $(selector).find('div.square').toggleClass('filled');
                        } else if ($(e.target).hasClass('circle') && !$(e.target).hasClass('filled')) {
                            $(selector).find('div.circle').toggleClass('filled');
                        }
                        if ($(e.target).hasClass('grouped')) {
                            transitionGrouped(self);
                        } else if ($(e.target).hasClass('stacked')) {
                            transitionStacked(self);
                        }
                    });
            //}
            //Need to wait until the widget is rendered.
            setTimeout(updateFilteredCntInHeader,200);
            function getyAxisMaxValue(data, excludey0) {
                if (excludey0 == null) {
                    excludey0 = false;
                }
                return d3.max(data, function(d) {
                    if (d.values != null && typeof d.values == 'object') {
                        d = d.values;
                    }
                    return d3.max(d, function(d) {
                        if (excludey0) {
                            return d.y;
                        }else {
                            return ifNull(d.y0,0) + d.y;
                        }
                    });
                });
            }

            /*
             * This function is called, while drawing for the first time and
             * and whenever the data changes like clicking on the legend
             * will filter the data.
             */
            function updateChart (chartView, chartOptions) {
                var yAxisFormatter = chartOptions['yAxisFormatter'];
                yAxisMaxValue = getyAxisMaxValue(chartView.stackedData);
                yAxisMaxValue = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
                if(yAxisMaxValue < 1)
                    yAxisMaxValue = 1;
                y.domain([0, yAxisMaxValue]);
                chartView.yScale = y;
                chartView.yAxis = yAxis;
                main.select('.y.axis').call(yAxis);
                // draw the bars
                main.append("g").attr("class", "bars")
                    // a group for each stack of bars, positioned in the correct x position
                groups =  main.select('g.bars').selectAll(".bar.stack")
                    .data(chartView.parsedValues)
                    .enter()
                    .append("g")
                    .style("fill", function(d, i) {
                        return d['color'];
                    }).attr("class", "bar stack");
                // a bar for each value in the stack, positioned in the correct y positions
                groups.selectAll("rect")
                    .style("cursor","hand")
                    .data(function(d) {
                        return d['values']; })
                    .enter().append("rect")
                    .on('click', onclickBar)
                    .attr("class", "bar")
                    .attr("width", barWidth != null ? barWidth : width / chartView.stackedData[0].length - chartView.barPadding )
                    .attr("x", function(d, i, j){
                        return x(d.date);
                        //return i * (width / chartView.stackedData[0].length);
                     })
                    .attr("y", function(d) {
                        if(d.name != cowc.FAILURE_LABEL && d.total === 0){
                            return height;
                        }else{
                            return y(d.y0) + y(d.y) - height;
                        }
                     })
                    .attr("height", function(d) {
                        if(d.name != cowc.FAILURE_LABEL && d.total === 0){
                            return (height * 0.01);
                        }else{
                            return height - y(d.y);
                        }
                     })
                     .attr("fill", function(d, i){
                         if(d.name != cowc.FAILURE_LABEL && d.total === 0){
                             return cowc.DEFAULT_COLOR;
                         }
                     })
                    //.style("fill", function(d) { return d.color; })
                    .on("mouseover", function(d, i, j) {
                        var tooltipData = [],
                            reverseParsedValues = cowu.getValueByJsonPath(chartView,'parsedValues',[]).reverse();
                        var classId = 'stacked-bar-cutom-tootlip'
                        if (self.$el.hasClass('item-content')) {
                            classId = self.$el.parent().parent().attr('id')
                        }
                        if(self.tooltipDiv == null) {
                            self.tooltipDiv = d3.select("body").append("div")
                                    .attr("class", "stack-bar-chart-tooltip " + classId)
                                    .style("opacity", 0);
                        }
                        $.each(reverseParsedValues, function (idx, obj) {
                            obj['values'] = cowu.getValueByJsonPath(obj, 'values;'+i, {});
                            tooltipData.push(obj);
                        });
                        if (chartOptions.tooltipDataFormatter) {
                            tooltipData = chartOptions.tooltipDataFormatter(tooltipData);
                        }
                        //if (chartView.sliceTooltip) {
                            var event = d3.event;
                            var x = tooltipData;
                            //TODO parent div adjust need to be removed
                            //$(tooltipDiv).css({'width': '0px','height': '0px'});
                            var tooltipDiv = self.tooltipDiv;
                            tooltipDiv.transition()
                                .duration(200)
                                .style("opacity", 1);
                            var tooltipHTML = chUtils.defaultStackTooltipFn(tooltipData, yAxisFormatter, chartOptions);
                            tooltipDiv.html(tooltipHTML).style("border","none");
                            tooltipDiv.style("left", getToolTipXPos(event.pageX, $($(tooltipDiv)[0]).children('div').width()) + "px")
                                .style("top", (event.pageY - 28) + "px")
                                .style("position","absolute");
                        //}
                     })
                    .on("mouseout", function(d) {
                            //setTimeout(function () {
                            clearToolTip(true,self);
                            //}, 1000);
                     });
                chartView.groups = groups;
                chartView.main = main;
            }
            setTimeout(updateFilteredCntInHeader, 200);
            var transitionGrouped = function() {
                yAxisMaxValue = getyAxisMaxValue(self.parsedValues, true);
                yAxisMaxValue = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
                self.grouped = true;
                self.yAxis.scale().domain([0, yAxisMaxValue]);
                self.main.select('.y.axis').call(self.yAxis);
                self.groups.selectAll("rect")
                    .attr("width", barWidth != null ? barWidth : (width / self.stackedData[0].length - self.barPadding) / self.stackedData.length )
                    //.attr("width", self.barWidth )
                    .attr("x", function(d, i, j){
                        // need to change the stackedData[0].length to max length of array
                        return i * (width / self.stackedData[0].length) + ((width / self.stackedData[0].length)/self.stackedData.length) * j ;
                    }).attr("y", function(d, i, j){
                        return self.yScale(d.y);
                    }).attr("height", function(d) {
                        return height - self.yScale(d.y);
                    });
            };

            var transitionStacked = function () {
                //If it is already in stacked we should return it
                if (!self.grouped) {
                    return;
                }
                yAxisMaxValue = getyAxisMaxValue(self.parsedValues);
                yAxisMaxValue = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
                self.grouped = false;
                self.yAxis.scale().domain([0, yAxisMaxValue]);
                self.main.select('.y.axis').call(self.yAxis);
                self.groups.selectAll("rect")
                    .attr("y", function(d){
                        return self.yScale(d.y) + self.yScale(d.y0) - height;
                    }).attr("height", function(d) {
                        return height - self.yScale(d.y);;
                    }).attr("x", function(d, i){
                        return i * (width / self.stackedData[0].length);
                    }).attr("width", barWidth != null ? barWidth : width / self.stackedData[0].length - self.barPadding);
                    //.attr("width", self.barWidth);
            };
            if (self.grouped) {
                transitionGrouped();
            }
            function getToolTipXPos (currPos, tooltipWidth) {
                var windowWidth = $(document).width();
                var tooltipPositionLeft = currPos + 10;
                if ((windowWidth - currPos) < tooltipWidth + 10) {
                    tooltipPositionLeft = currPos - tooltipWidth - 10;
                }
                return tooltipPositionLeft;
            }

            function getDefaultChartOptions () {
                return {
                    addOverviewChart: true,
                    brush: false,
                    xAxisLabel: 'Time',
                    yAxisLabel: 'Count',
                    height: 300,
                    xAxisOffset: 0,
                    yAxisOffset: 0,
                    bucketSize: cowc.DEFAULT_BUCKET_DURATION,
                    tickpadding: 10,
                    showLegend: true,
                    showControls: true,
                    failureLabel: cowc.FAILURE_LABEL,
                    colors: {
                        yAxisLabel: cowc.DEFAULT_COLOR
                    },
                    yAxisFormatter: function (value) {
                        return cowu.numberFormatter(value);
                    },
                    onClickBar: false,
                    margin: {},
                    yField: null,
                    barWidth: null,
                    title: null,
                    failureCheckFn: null,
                    tooltipFn: defaultTooltipFn
                };
            }

            function defaultTooltipFn (d, yAxisFormatter) {
                var tooltipConfig = {},
                time = new XDate(d.date).toString('HH:mm'),
                y = yAxisFormatter(d['y']);
                tooltipConfig['title'] = {
                    name : d['name'],
                    type: title
                };
                if (d['name'] != failureLabel) {
                    tooltipConfig['content'] = {
                        iconClass : false,
                        info : [{
                            label: 'Time',
                            value: time,
                        }, {
                            label: limit != null ? d['name'] : yAxisLabel,
                            value: ifNull(y, '-')
                        }]
                    };
                } else {
                    tooltipConfig['content'] = {
                        iconClass : false,
                        info : [{
                            label: 'Time',
                            value: time
                        },{
                            label: 'Total',
                            value: ifNull(d['total'], '-')
                        }, {
                            label: failureLabel,
                            value: ifNull(y, '-')
                        }]
                    };
                }
                var tooltipElementTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP),
                tooltipElementTitleTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
                tooltipElementContentTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT),
                tooltipElementObj, tooltipElementTitleObj, tooltipElementContentObj;
                tooltipConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig);
                tooltipElementObj = $(tooltipElementTemplate(tooltipConfig));
                tooltipElementTitleObj = $(tooltipElementTitleTemplate(tooltipConfig.title));
                tooltipElementContentObj = $(tooltipElementContentTemplate(tooltipConfig.content));

                tooltipElementObj.find('.popover-title').append(tooltipElementTitleObj);
                tooltipElementObj.find('.popover-content').append(tooltipElementContentObj);
                return $(tooltipElementObj).wrapAll('<div>').parent().html();
            }
            function onclickBar(data) {
                var xExtent = data.timestampExtent;
                if(chartOptions.onClickBar != false){
                    clearToolTip(false);
                }
                xExtent = xExtent.map(function(date){
                    return new Date(date).getTime(); //convert to millisecs
                });
                if ((xExtent[1] - xExtent[0]) < cowc.ALARM_BUCKET_DURATION) {
                    var avg = (xExtent[1] + xExtent[0])/2;
                    xExtent[0] = avg - cowc.ALARM_BUCKET_DURATION / 2 ;
                    xExtent[1] = avg + cowc.ALARM_BUCKET_DURATION / 2 ;
                }
                if (cfDataSource != null) {
                    cfDataSource.applyFilter('timeFilter',xExtent);
                    cfDataSource.fireCallBacks({source:'crossfilter'});
                }
            }
            function clearToolTip(fade,self) {
                if(fade) {
                    self.tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                } else {
                   $('.stack-bar-chart-tooltip').remove();
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

            function brushDragged2Main() {
                var xExtent = (brush2Main.empty() ? x.domain() : brush2Main.extent());
                if (brushRangeLimit) {
                    if ((xExtent[1].getTime() - xExtent[0].getTime()) < brushRangeLimit * 1000) {
                        return;
                    } else {
    //                    brush2Main.extent([new Date(xExtent[0]), new Date(xExtent[0] + brushRangeLimit * 1000)]);
    //                    main.select('.brush').call(brush2Main);
                        d3.event.target.extent([new Date(xExtent[0].getTime()), new Date(xExtent[0].getTime() + brushRangeLimit * 1000)]);
                        d3.event.target(d3.select(this));
                    }
                }
            }

            function brushed2Main() {
                clearToolTip(false);
                if(brush2Main.empty()){
                    cfDataSource.removeFilter('timeFilter');
                    if(updateToHistory) {
                        //do push the current time range to history
                        var xExtent = [new Date().getTime() * 1000 - (2 * 60 * 60 * 1000), new Date().getTime() * 1000]
                        history.pushState({timeExtent:xExtent}, 'timeRange', window.location.pathname + window.location.hash);
                    }
                } else {
                    var xExtent = (brush2Main.empty() ? x.domain() : brush2Main.extent());

                    xExtent = xExtent.map(function(date){
                        return new Date(date).getTime() *1000; //convert to millisecs
                    });
                    if(updateToHistory) {
                        //do push the current time range to history
                        history.pushState({timeExtent:xExtent}, 'timeRange', window.location.pathname + window.location.hash);
                    }
                    if (zoomIn == null || zoomIn == true ) {
                        if ((xExtent[1] - xExtent[0]) > cowc.ALARM_BUCKET_DURATION) {
                            cfDataSource.applyFilter('timeFilter',xExtent);
                        }
                    } else {
                        //Nothing to do. The chart will not zoomIn and brush will be visible
                    }
                }
                if (zoomIn == null || zoomIn == true )
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
            if (hideTicks) {
                $('.stacked-bar-chart-container .tick > line').css('opacity','0')
            }
        }
    });

    return stackedBarChartWithFocusChartView;
});
