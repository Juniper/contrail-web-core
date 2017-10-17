/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'chart-utils',
    'chart-config',
    'contrail-list-model',
], function (_, ContrailView, chUtils, ChartConfig, ContrailListModel) {
    var ChartView = ContrailView.extend({
        getChartOptionsFromDimension: function (selector) {
             var height = $(selector).height(),
                width = $(selector).width();
            var chartOptions = new ChartConfig().config;
            var widthOptions = cowu.getValueByJsonPath(chartOptions, 'min-width', {});
            var heightOptions = cowu.getValueByJsonPath(chartOptions, 'min-height', {});
            var widthsArray = _.keys(widthOptions),
                widthsArrLen = widthsArray.length;
            var heightsArray = _.keys(heightOptions),
                heightsArrLen = heightsArray.length;
            var selectedWidthOptions, selectedHeightOptions;
            if (width != 0) {
                for (var i = 0; i < widthsArrLen; i++) {
                var widthItem = widthsArray[i];
                    if (widthItem >= width) {
                        selectedWidthOptions = widthOptions[widthItem];
                        break;
                    }
                }
            }
            if (height != 0) {
                for (var i = 0; i < heightsArrLen; i++) {
                var heightItem = heightsArray[i];
                    if (heightItem >= height) {
                        selectedHeightOptions = heightOptions[heightItem];
                        break;
                    }
                }
            }
            return $.extend({}, selectedWidthOptions, selectedHeightOptions);
        },
        appendTemplate: function (selector, chartOptions) {
            var self = this;

            var chartTemplateId = cowu.getValueByJsonPath(chartOptions, 'chartTemplate', cowc.TMPL_CHART),
                chartTemplate = contrail.getTemplate4Id(chartTemplateId);
            $(selector).html(chartTemplate(chartOptions));
        },
        renderLegend: function (selector, chartOptions, viewConfig) {
            var legendContainer = $(selector).find('div.legend');
            if (chartOptions['legendView'] != null) {
                var legendView = new chartOptions['legendView']({
                    el: $(legendContainer),
                    viewConfig: viewConfig
                });
                legendView.render();    
            }
            
        },
        render: function () {
        },
        showText: function (data, viewConfig) {
            var self = this,
                selector = contrail.handleIfNull(selector, $(self.$el)),
                groups = d3.selectAll($(selector).find(".nv-group")),
                textPositionX = ($(selector).find('.chart-container').width() - 20) / 2,
                textPositionY = $(selector).find('.chart-container').height() / 2;
                groups.selectAll('text.center-text').remove();
                groups.selectAll('text')
                      .data(function (d) {
                            return [d];
                      })
                      .enter()
                      .append('text')
                      .style('text-anchor', 'middle')
                      .style('fill', function (d) {
                            return d['color'];
                      })
                      .attr('class', 'center-text')
                      .attr('x', textPositionX)
                      .attr('y', textPositionY)
                      .text(function (d) {
                            return d['text'] != null ? d['text'] : chUtils.getLastYValue(data, viewConfig);
                      });

        },

        updateOverviewText: function () {
            var self = this,
                viewConfig = self.viewConfig,
                selector = contrail.handleIfNull(selector, $(self.$el)),
                data = self.model.getItems(),
                lastValue = '-', valueArr = [], html = '',
                valueFn = cowu.getValueByJsonPath(viewConfig, 'chartOptions;overviewTextOptions;valueFn');

            if (valueFn != null && $.isFunction(valueFn)) {
                valueFn(selector, data, viewConfig);
                return;
            }
            if (data.length) {
                lastValue = chUtils.getLastYValue(data, viewConfig);
            }
            if ($.isNumeric(lastValue) || lastValue == '-') {
                $(selector).find('.value').text(lastValue);
            } else {
                valueArr = lastValue.match(/([0-9]+)(.*)/);
                html = ''+valueArr[1]+'<span class="unit">'+valueArr[2]+'</span>';
                $(selector).find('.value').html(html);
            }
            
        },
        renderMessage: function(message, selector, chartOptions) {
            var self = this,
                message = contrail.handleIfNull(message, ""),
                selector = contrail.handleIfNull(selector, $(self.$el)),
                chartOptions = contrail.handleIfNull(chartOptions, self.chartViewModel.chartOptions),
                container = d3.select($(selector).find("svg")[0]),
                requestStateText = container.selectAll('.nv-requestState').data([message]),
                textPositionX = $(selector).width() / 2,
                textPositionY = chartOptions.margin.top + $(selector).find('.nv-focus').heightSVG() / 2 + 10;

            requestStateText
                .enter().append('text')
                .attr('class', 'nvd3 nv-requestState')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            requestStateText
                .attr('x', textPositionX)
                .attr('y', textPositionY)
                .text(function(t){ return t; });

        },

        removeMessage: function(selector) {
            var self = this,
                selector = contrail.handleIfNull(selector, $(self.$el));

            $(selector).find('.nv-requestState').remove();
        },

        //Maps viewCfg chartOptions -> nvd3 options
        setNvd3ChartOptions: function() {
            var self = this;
            var chartOptions = _.result(self.viewConfig,'chartOptions',{});
            var directMapOptions = ['margin'];
            if(chartOptions.margin != null) {
                self.ChartView.margin(chartOptions.margin);
                // self.ChartView['margin'](chartOptions['margin']);
            }
        },

        bindListeners: function() {
            var self = this,
                viewConfig = cowu.getValueByJsonPath(self, 'viewConfig', cowu.getValueByJsonPath(self,'attributes;viewConfig'));
            if(self.model instanceof Backbone.Model) {
                self.model.on("change",function() {
                    if (self.renderChart != null && $.isFunction(self.renderChart)) {
                        self.renderChart($(self.$el), viewConfig, self.model);
                        self.updateOverviewText();
                    } else if (self.renderTemplate != null && $.isFunction(self.renderTemplate)) {
                        self.renderTemplate($(self.$el), viewConfig, self.model);
                    }
                });
            } else {
                cfDataSource = viewConfig.cfDataSource;
                if (self.model === null && viewConfig['modelConfig'] != null) {
                    self.model = new ContrailListModel(viewConfig['modelConfig']);
                }

                if (self.model != null) {
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
                }
            }
            $($(self.$el)).bind("refresh", function () {
                self.render($(self.$el), viewConfig, self.model);
            });
            self.prevDimensions = chUtils.getDimensionsObj(self.$el);
            /* window resize may not be require since the nvd3 also provides a smoother refresh*/
            self.resizeFunction = _.debounce(function (e) {
                if(!chUtils.isReRenderRequired({
                    prevDimensions: self.prevDimensions,
                    elem:self.$el})) {
                    return;
                }
                self.prevDimensions = chUtils.getDimensionsObj(self.$el);
                self.render($(self.$el), self.viewConfig, self.model);
            },cowc.THROTTLE_RESIZE_EVENT_TIME);
            window.addEventListener('resize',self.resizeFunction);
            $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);
        }
    });

    return ChartView;
});
