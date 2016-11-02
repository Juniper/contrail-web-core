/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils'
], function (_, ContrailView,  ContrailListModel, LegendView, cowc,chUtils) {
    var cfDataSource;
    var stackedAreaChartView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,tooltipElementObj,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                resizeId;

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
            var chartTemplate = contrail.getTemplate4Id('core-stacked-area-chart-template');
            var widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                    viewConfig.widgetConfig : null;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            var totalHeight = ($(selector).closest('.custom-grid-stack-item').length > 0 )?
                    $(selector).closest('.custom-grid-stack-item').height() - 20:
                        cowu.getValueByJsonPath(chartOptions, 'height', 300);

            chartOptions['timeRange'] =  getValueByJsonPath(self, 'model;queryJSON');
            var totalWidth = $(selector).find('.stacked-area-chart-container').width();
            var totalOverviewHeight = totalWidth * 0.1;
            var margin =  { top: 20, right: 20, bottom: totalOverviewHeight, left: 20 };
            var showLegend = getValueByJsonPath(chartOptions,'showLegend', true);
            var showControls = getValueByJsonPath(chartOptions,'showControls',true);
            var title = getValueByJsonPath(chartOptions,'title',null);
            var xAxisLabel = getValueByJsonPath(chartOptions,'xAxisLabel',"Time");
            var yAxisLabel = getValueByJsonPath(chartOptions,'yAxisLabel',"Count");
            var failureCheckFn = getValueByJsonPath(chartOptions,'failureCheckFn',null);
            var failureLabel = getValueByJsonPath(chartOptions,'failureLabel', cowc.FAILURE_LABEL);
            var tooltipFn = getValueByJsonPath(chartOptions,'tooltipFn', defaultTooltipFn);
            var colors = getValueByJsonPath(chartOptions,'colors', {yAxisLabel: cowc.DEFAULT_COLOR});
            var yAxisOffset = getValueByJsonPath(chartOptions,'yAxisOffset',0);
            var yAxisFormatter = getValueByJsonPath(chartOptions,'yAxisFormatter',function (value) {
                return cowu.numberFormatter(value);
            });
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
            } else if (data != null && data.length > 0) {
                data = cowu.chartDataFormatter(data, chartOptions);
            }
            if (colors != null) {
                if (typeof colors == 'function') {
                    self.colors = colors(_.without(_.pluck(data, 'key'), failureLabel));
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
                            .useInteractiveGuideline(false)    //Tooltips which show all data points. Very nice!
                            .showControls(false)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                            .showLegend(false)
                            .clipEdge(true);

              //Format x-axis labels with custom function.
              chart.xAxis.tickFormat(function(d) { return d3.time.format('%H:%M')(new Date(d)) });

              //y-axis tickformatter
              chart.yAxis
                  .tickFormat(yAxisFormatter);
              if (yAxisOffset != 0) {
                  var domain = chart.yAxis.domain();
                  var stackedData = _.pluck(data, 'values');
                  var allObjs = _.reduce(stackedData, function (result, value) {
                      return result.concat(value);
                  }, []);
                  var yAxisMaxValue = d3.max(allObjs, function(d) { return d.total; });
                  domain[1] = yAxisMaxValue + (yAxisOffset/100) * yAxisMaxValue;
                  chart.yDomain(domain);
              }
              //initialize the chart in the svg element
              chart.interpolate("monotone");
              svg.datum(data)
                .call(chart)

              //Add the axis labels
              var xaxisLabel = svg.append("text")
                                  .attr("class", "axis-label")
                                  .attr("text-anchor", "middle")
                                  .attr("x", width/2)
                                  .attr("y", height + 40)
                                  .style('font-size', '10px')
                                  .text(xAxisLabel);
              var yaxisLabel = svg.append("text")
                                  .attr("class", "axis-label")
                                  .attr("text-anchor", "middle")
//                                  .attr("y", -margin.left)
                                  .attr("x", -totalHeight/2)
                                  .attr("dy", ".75em")
                                  .attr("dx", ".75em")
                                  .style('font-size', '10px')
                                  .attr("transform", "rotate(-90)")
                                  .text(yAxisLabel);
              //Use the tooltip formatter if present
              chart.tooltip.contentGenerator(function (obj) {
                      return tooltipFn(obj.point,yAxisFormatter)})

              //Add the modified legends
              showControls=false;
              if (showControls == true || showLegend == true) {
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
              }
//              nv.utils.windowResize(chart.update); Not using since we need to do other stuff on resize

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
