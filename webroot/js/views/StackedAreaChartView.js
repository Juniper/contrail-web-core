/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'core-basedir/js/views/ChartView',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils'
], function (_, ChartView,  ContrailListModel, LegendView, cowc,chUtils) {
    var cfDataSource;
    var stackedAreaChartView = ChartView.extend({
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
            var viewConfig = this.attributes.viewConfig,tooltipElementObj,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                resizeId;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            var listenToHistory = getValueByJsonPath(chartOptions,'listenToHistory',false);
            //settings
            cowu.updateSettingsWithCookie(viewConfig);
            cfDataSource = viewConfig.cfDataSource;
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
                } else {
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
                /* window resize may not be require since the nvd3 also provides a smoother refresh*/
                self.resizeFunction = _.debounce(function (e) {
                    if(!chUtils.isReRenderRequired({
                        prevDimensions:prevDimensions,
                        elem:self.$el})) {
                        return;
                    }
                    prevDimensions = chUtils.getDimensionsObj(self.$el);
                    self.renderChart($(self.$el), viewConfig, self.model);
                },cowc.THROTTLE_RESIZE_EVENT_TIME);
                window.addEventListener('resize',self.resizeFunction);
                $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);
            }
        },
        renderChart: function (selector, viewConfig, chartViewModel) {
            if (!($(selector).is(':visible'))) {
                return;
            }
            var self = this;
            var data = chartViewModel.getFilteredItems();
            var chartOptionsForSize = ChartView.prototype.getChartOptionsFromDimension(selector);
            var chartTemplate = contrail.getTemplate4Id('core-stacked-area-chart-template');
            var widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                    viewConfig.widgetConfig : null;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            chartOptions = $.extend(true, {}, chartOptions, chartOptionsForSize);
            var totalHeight = ($(selector).closest('.custom-grid-stack-item').length > 0 )?
                    $(selector).closest('.custom-grid-stack-item').height():
                        cowu.getValueByJsonPath(chartOptions, 'height', 300);

            var totalWidth = $(selector).find('.stacked-area-chart-container').width();
            var margin =  cowu.getValueByJsonPath(chartOptions, 'margin', { top: 20, right: 20, bottom: 20, left: 20 });
            var showLegend = getValueByJsonPath(chartOptions,'showLegend', true);
            var showControls = getValueByJsonPath(chartOptions,'showControls',true);
            var title = getValueByJsonPath(chartOptions,'title',null);
            var xAxisLabel = getValueByJsonPath(chartOptions,'xAxisLabel',"Time");
            var yAxisLabel = getValueByJsonPath(chartOptions,'yAxisLabel',"Count");
            var failureCheckFn = getValueByJsonPath(chartOptions,'failureCheckFn',null);
            var failureLabel = getValueByJsonPath(chartOptions,'failureLabel', cowc.FAILURE_LABEL);
            var tooltipFn = getValueByJsonPath(chartOptions,'tooltipFn', defaultTooltipFn);
            var colors = getValueByJsonPath(chartOptions,'colors', {yAxisLabel: cowc.DEFAULT_COLOR});
            var resetColor = getValueByJsonPath(chartOptions,'resetColor',false);
            var yAxisOffset = getValueByJsonPath(chartOptions,'yAxisOffset',0);
            var showXAxis = cowu.getValueByJsonPath(chartOptions, 'showXAxis', true);
            var showYAxis = cowu.getValueByJsonPath(chartOptions, 'showYAxis', true);
            var showXLabel = cowu.getValueByJsonPath(chartOptions, 'showXLabel', true);
            var showYLabel = cowu.getValueByJsonPath(chartOptions, 'showYLabel', true);
            var showXMinMax = cowu.getValueByJsonPath(chartOptions, 'showXMinMax', false);
            var showYMinMax = cowu.getValueByJsonPath(chartOptions, 'showYMinMax', false);
            if (!showXAxis) {
                // Bottom we are subtracting only 20 because there may be overview chart in bottom for which we may need
                // the bottom margin
                margin['bottom'] = margin['bottom'] - 20;
            }
            if (!showYAxis) {
                margin['right'] = 0;
            }
            if (showLegend) {
                totalHeight -= 30; //we can make dynamic by getting the legend div height
            }
            var yAxisFormatter = getValueByJsonPath(chartOptions,'yAxisFormatter',function (value) {
                return cowu.numberFormatter(value);
            });
            var listenToHistory = getValueByJsonPath(chartOptions,'listenToHistory',false);
            var data = [];
            data = chartViewModel.getFilteredItems();

            var customTimeFormat = d3.time.format.multi([
                    //[".%L", function(d) { return d.getMilliseconds(); }],
                    [":%S", function(d) { return d.getSeconds(); }],
                    ["%H:%M", function(d) { return d.getMinutes(); }],
                    ["%H:%M", function(d) { return d.getHours(); }],
                    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                    ["%b %d", function(d) { return d.getDate() != 1; }],
                    ["%B", function(d) { return d.getMonth(); }],
                    ["%Y", function() { return true; }]
                    ]);
            var width = totalWidth - margin.left - margin.right,
              height = totalHeight - margin.top - margin.bottom,
              marginOverview = { top: totalHeight * 0.86, right: margin.right, bottom: 20,  left: margin.left },
              heightOverview = totalHeight - marginOverview.top - marginOverview.bottom;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data, chartOptions);
              //Need to check and remove the data.length condition because invalid for object
            } else {
                data = cowu.chartDataFormatter(data, chartOptions);
            }
            if (colors != null) {
                if (typeof colors == 'function') {
                    self.colors = colors(_.without(_.pluck(data, 'key'), failureLabel), resetColor);
                } else if (typeof colors == 'object') {
                    self.colors = colors;
                }
            }

            //empty and add the svg
            d3.select($(selector).find('.stacked-area-chart-container')[0]).empty();
            $(selector).html(chartTemplate);
            if (widgetConfig !== null) {
                this.renderView4Config($(selector).
                        find('.stacked-area-chart-container'), null, widgetConfig,
                        null, null, null);
            }
            //set the svg width and height
            var svg = d3.select($(selector).find('.stacked-area-chart-container')[0])
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);

            nv.addGraph(function() {
              var chart = nv.models.stackedAreaChart()
                            .x(function(d) { return d['x'] })   //We can modify the data accessor functions...
                            .y(function(d) { return d['y'] })   //...in case your data is formatted differently.
                            .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                            .showControls(false)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                            .showLegend(false)
                            .clipEdge(true);

              //Format x-axis labels with custom function.
              chart.xAxis.tickFormat(function(d) { return d3.time.format('%H:%M')(new Date(d)) });
              //y-axis tickformatter
              chart.yAxis
                  .tickFormat(yAxisFormatter);
              chUtils.updateTickOptionsInChart(chart, chartOptions);
              chart.showXAxis(showXAxis);
              chart.showYAxis(showYAxis);
              chart.margin(margin);
              if (yAxisOffset != 0) {
                  var domain = chart.yAxis.domain();
                  var stackedData = _.pluck(data, 'values');
                  var allObjs = _.reduce(stackedData, function (result, value) {
                      return result.concat(value);
                  }, []);
                  var yAxisMaxValue = d3.max(allObjs, function(d) { return d.total; });
                  domain[1] = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
                  if (domain[1] == 0)
                      chart.yDomain([0,1]);
                  else
                      chart.yDomain(domain);
              }
              //initialize the chart in the svg element
              chart.interpolate("monotone");
              svg.datum(data)
                .call(chart)

              //Add the axis labels
              if (showXLabel) {
                svg.append("text")
                                  .attr("class", "xaxis axis-label")
                                  .attr("text-anchor", "middle")
                                  .attr("x", width/2)
                                  .attr("y", height + 40)
                                  .style('font-size', '10px')
                                  .text(xAxisLabel);
              }
              if (showYLabel) {
                svg.append("text")
                                  .attr("class", "yaxis axis-label")
                                  .attr("text-anchor", "middle")
//                                  .attr("y", -margin.left)
                                  .attr("x", -totalHeight/2)
                                  .attr("dy", ".75em")
                                  .attr("dx", ".75em")
                                  .style('font-size', '10px')
                                  .attr("transform", "rotate(-90)")
                                  .text(yAxisLabel);
              }
              chart.stacked.dispatch.on("areaClick.toggle", null);
              //Use the tooltip formatter if present
               if(chartOptions.tooltipFn) {
                   chart.interactiveLayer.tooltip.contentGenerator(function (obj) {
                                return chartOptions.tooltipFn(obj,chartOptions, yAxisFormatter);
                            })
                        }
              //Add the modified legends
              showControls=false;
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
                              color: cowu.getValueByJsonPath(chartOptions, 'failureColor', cowc.FAILURE_COLOR),
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
//              nv.utils.windowResize(chart.update); Not using since we need to do other stuff on resize
              $(selector).data('chart', chart);
              return chart;
            });
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
                            label: yAxisLabel,
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
                tooltipElementTitleObj, tooltipElementContentObj;
                tooltipConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig);
                tooltipElementObj = $(tooltipElementTemplate(tooltipConfig));
                tooltipElementTitleObj = $(tooltipElementTitleTemplate(tooltipConfig.title));
                tooltipElementContentObj = $(tooltipElementContentTemplate(tooltipConfig.content));

                tooltipElementObj.find('.popover-title').append(tooltipElementTitleObj);
                tooltipElementObj.find('.popover-content').append(tooltipElementContentObj);
                return $(tooltipElementObj).wrapAll('<div>').parent().html();
            }
        }
    });

    return stackedAreaChartView;
});
