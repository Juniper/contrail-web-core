/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/models/ScatterChartModel',
    'contrail-list-model'
], function (_, Backbone, ScatterChartModel, ContrailListModel) {
    var ScatterChartView = Backbone.View.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if(viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if(self.model != null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        var chartData = self.model.getItems();
                        if(chartData.length != 0) {
                            self.renderChart(selector, viewConfig, chartData);
                        }
                    });
                }
            } else {
                $.ajax(ajaxConfig).done(function (result) {
                    deferredObj.resolve(result);
                });

                deferredObj.done(function (response) {
                    var chartData = response;
                    self.renderChart(selector, viewConfig, chartData);
                });

                deferredObj.fail(function (errObject) {
                    if (errObject['errTxt'] != null && errObject['errTxt'] != 'abort') {
                        showMessageInChart({selector: self.$el, msg: 'Error in fetching Details', type: 'bubblechart'});
                    }
                });
            }
        },

        renderChart: function (selector, viewConfig, data) {
            var chartViewConfig, chartData, chartModel, chartOptions;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(selector, data);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            this.chartModel = new ScatterChartModel(chartData, chartOptions);
            chartModel = this.chartModel;

            $(selector).data('chart', chartModel);
            if ($(selector).find('svg').length == 0) {
                $(selector).append('<svg></svg>');
            }

            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                });
            } else {
                d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
            }

            nv.utils.windowResize(function () {
                updateChartOnResize(selector, chartModel);
            });
            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation, which resolves once the chart is rendered
            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            $(selector).find('.loading-spinner').remove();
            //nv.addGraph(chartModel);
        }
    });

    function getChartViewConfig(selector, initResponse) {
        var chartOptions = ifNull(initResponse['chartOptions'], {}), chartData;
        var hoveredOnTooltip, tooltipTimeoutId;
        var xLbl = ifNull(initResponse['xLbl'], 'CPU (%)'),
            yLbl = ifNull(initResponse['yLbl'], 'Memory (MB)');

        var xLblFormat = ifNull(initResponse['xLblFormat'], d3.format()),
            yLblFormat = ifNull(initResponse['yLblFormat'], d3.format());

        var yDataType = ifNull(initResponse['yDataType'], '');

        if ($.inArray(ifNull(initResponse['title'], ''), ['vRouters', 'Analytic Nodes', 'Config Nodes', 'Control Nodes']) > -1) {
            initResponse['forceX'] = [0, 0.15];
            xLblFormat = ifNull(initResponse['xLblFormat'], d3.format('.02f'));
            //yLblFormat = ifNull(data['xLblFormat'],d3.format('.02f'));
        }
        if (initResponse['d'] != null)
            chartData = initResponse['d'];

        //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
        var dValues = $.map(chartData, function (obj, idx) {
            return obj['values'];
        });
        dValues = flattenList(dValues);

        if (initResponse['yLblFormat'] == null) {
            yLblFormat = function (y) {
                return parseFloat(d3.format('.02f')(y)).toString();
            };
        }

        //If the axis is bytes, check the max and min and decide the scale KB/MB/GB
        //Set size domain
        var sizeMinMax = getBubbleSizeRange(dValues);

        logMessage('scatterChart', 'sizeMinMax', sizeMinMax);

        //Decide the best unit to display in y-axis (B/KB/MB/GB/..) and convert the y-axis values to that scale
        if (yDataType == 'bytes') {
            var result = formatByteAxis(chartData);
            chartData = result['data'];
            yLbl += result['yLbl'];
        }
        chartOptions['multiTooltip'] = true;
        chartOptions['scatterOverlapBubbles'] = false;
        chartOptions['xLbl'] = xLbl;
        chartOptions['yLbl'] = yLbl;
        chartOptions['xLblFormat'] = xLblFormat;
        chartOptions['yLblFormat'] = yLblFormat;
        chartOptions['forceX'] = initResponse['forceX'];
        chartOptions['forceY'] = initResponse['forceY'];
        var seriesType = {};
        for (var i = 0; i < chartData.length; i++) {
            var values = [];
            if (chartData[i]['values'].length > 0)
                seriesType[chartData[i]['values'][0]['type']] = i;
            $.each(chartData[i]['values'], function (idx, obj) {
                obj['multiTooltip'] = chartOptions['multiTooltip'];
                obj['fqName'] = initResponse['fqName'];
                values.push(obj);
            })
            chartData[i]['values'] = values;
        }
        chartOptions['seriesMap'] = seriesType;
        var tooltipFn = chartOptions['tooltipFn'];
        chartOptions['tooltipFn'] = function (e, x, y, chart) {
            return scatterTooltipFn(e, x, y, chart, tooltipFn);
        };
        if (chartOptions['multiTooltip']) {
            chartOptions['tooltipFn'] = function (e, x, y, chart) {
                return scatterTooltipFn(e, x, y, chart, tooltipFn);
            }
            chartOptions['tooltipRenderedFn'] = function (tooltipContainer, e, chart) {
                if (e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length > 1) {
                    var result = getMultiTooltipContent(e, tooltipFn, chart);
                    //Need to remove
                    $.each(result['content'], function (idx, nodeObj) {
                        var key = nodeObj[0]['value'];
                        $.each(ifNull(result['nodeMap'][key]['point']['alerts'], []), function (idx, obj) {
                            if (obj['tooltipAlert'] != false)
                                nodeObj.push({lbl: ifNull(obj['tooltipLbl'], 'Events'), value: obj['msg']});
                        });
                    });

                    if (chartOptions['multiTooltip'] && result['content'].length > 1)
                        bindEventsOverlapTooltip(result, tooltipContainer);
                }
            }
        }
        if (chartOptions['scatterOverlapBubbles'])
            chartData = scatterOverlapBubbles(chartData);
        chartOptions['sizeMinMax'] = sizeMinMax;

        chartOptions['stateChangeFunction'] = function (e) {
            //nv.log('New State:', JSON.stringify(e));
        };


        chartOptions['elementClickFunction'] = function (e) {
            if (typeof(chartOptions['clickFn']) == 'function')
                chartOptions['clickFn'](e['point']);
            else
                processDrillDownForNodes(e);
        };
        chartOptions['elementMouseoutFn'] = function (e) {
            if (e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length > 1) {
                if (tooltipTimeoutId != undefined)
                    clearTimeout(tooltipTimeoutId);
                tooltipTimeoutId = setTimeout(function () {
                    tooltipTimeoutId = undefined;
                    if (hoveredOnTooltip != true) {
                        nv.tooltip.cleanup();
                    }
                }, 1500);
            }
        };
        chartOptions['elementMouseoverFn'] = function (e) {
            if (tooltipTimeoutId != undefined)
                clearTimeout(tooltipTimeoutId);
        }
        if (initResponse['hideLoadingIcon'] != false)
            $(this).parents('.widget-box').find('.icon-spinner').hide();
        if (initResponse['loadedDeferredObj'] != null)
            initResponse['loadedDeferredObj'].fail(function (errObj) {
                if (errObj['errTxt'] != null && errObj['errTxt'] != 'abort') {
                    showMessageInChart({
                        selector: $(selector),
                        chartObj: $(selector).data('chart'),
                        xLbl: chartOptions['xLbl'],
                        yLbl: chartOptions['yLbl'],
                        msg: 'Error in fetching details',
                        type: 'bubblechart'
                    });
                }
            });
        chartOptions['deferredObj'] = initResponse['deferredObj'];
        chartOptions['useVoronoi'] = false;

        if (initResponse['widgetBoxId'] != null)
            endWidgetLoading(initResponse['widgetBoxId']);

        return {selector: selector, chartData: chartData, chartOptions: chartOptions};
    };

    /**
     * function takes the parameters tooltipContainer object and the tooltip array for multitooltip and binds the
     * events like drill down on tooltip and click on left and right arrows
     * @param result
     * @param tooltipContainer
     */
    function bindEventsOverlapTooltip(result, tooltipContainer) {
        var page = 1;
        var perPage = result['perPage'];
        var pagestr = "";
        var data = [];
        result['perPage'] = perPage;
        data = $.extend(true, [], result['content']);
        result['content'] = result['content'].slice(0, perPage);
        if (result['perPage'] > 1)
            result['pagestr'] = 1 + " - " + result['content'].length + " of " + data.length;
        else if (result['perPage'] == 1)
            result['pagestr'] = 1 + " / " + data.length;
        $(tooltipContainer).find('div.enabledPointer').parent().html(formatLblValueMultiTooltip(result));
        $(tooltipContainer).find('div.left-arrow').on('click', function (e) {
            result['button'] = 'left';
            handleLeftRightBtnClick(result, tooltipContainer);
        });
        $(tooltipContainer).find('div.right-arrow').on('click', function (e) {
            result['button'] = 'right';
            handleLeftRightBtnClick(result, tooltipContainer);
        });
        $(tooltipContainer).find('div.tooltip-wrapper').find('div.chart-tooltip').on('click', function (e) {
            bubbleDrillDown($(this).find('div.chart-tooltip-title').find('p').text(), result['nodeMap']);
        });
        $(tooltipContainer).find('div.enabledPointer').on('mouseover', function (e) {
            //console.log("Inside the mouse over");
            hoveredOnTooltip = true;
        });
        $(tooltipContainer).find('div.enabledPointer').on('mouseleave', function (e) {
            //console.log("Inside the mouseout ");
            hoveredOnTooltip = false;
            nv.tooltip.cleanup();
        });
        $(tooltipContainer).find('button.close').on('click', function (e) {
            hoveredOnTooltip = false;
            nv.tooltip.cleanup();
        });

        function handleLeftRightBtnClick(result, tooltipContainer) {
            var content = [];
            var leftPos = 'auto', rightPos = 'auto';
            if (result['button'] == 'left') {
                if ($(tooltipContainer).css('left') == 'auto') {
                    leftPos = $(tooltipContainer).position()['left'];
                    $(tooltipContainer).css('left', leftPos);
                    $(tooltipContainer).css('right', 'auto');
                }
                if (page == 1)
                    return;
                page = page - 1;
                if (result['perPage'] > 1)
                    pagestr = (page - 1) * perPage + 1 + " - " + (page) * perPage;
                else if (result['perPage'] == 1)
                    pagestr = (page - 1) * perPage + 1;
                if (page <= 1) {
                    if (result['perPage'] > 1)
                        pagestr = 1 + " - " + (page) * perPage;
                    else if (result['perPage'] == 1)
                        pagestr = 1;
                }
                content = data.slice((page - 1) * perPage, page * perPage);
            } else if (result['button'] == 'right') {
                if ($(tooltipContainer).css('right') == 'auto') {
                    leftPos = $(tooltipContainer).position()['left'];
                    rightPos = $(tooltipContainer).offsetParent().width() - $(tooltipContainer).outerWidth() - leftPos;
                    $(tooltipContainer).css('right', rightPos);
                    $(tooltipContainer).css('left', 'auto');
                }
                if (Math.ceil(data.length / perPage) == page)
                    return;
                page += 1;
                if (result['perPage'] > 1)
                    pagestr = (page - 1) * perPage + 1 + " - " + (page) * perPage;
                else if (result['perPage'] == 1)
                    pagestr = (page - 1) * perPage + 1;
                content = data.slice((page - 1) * perPage, page * perPage);
                if (data.length <= page * perPage) {
                    if (result['perPage'] > 1)
                        pagestr = (data.length - perPage) + 1 + " - " + data.length;
                    else if (result['perPage'] == 1)
                        pagestr = (data.length - perPage) + 1;
                    content = data.slice((data.length - perPage), data.length);
                }
            }
            leftPos = $(tooltipContainer).position()['left'];
            rightPos = $(tooltipContainer).offsetParent().width() - $(tooltipContainer).outerWidth() - leftPos;
            result['content'] = content;
            if (result['perPage'] > 1)
                pagestr += " of " + data.length;
            else if (result['perPage'] == 1)
                pagestr += " / " + data.length;
            result['perPage'] = perPage;
            $(tooltipContainer).css('left', 0);
            $(tooltipContainer).css('right', 'auto');
            $(tooltipContainer).find('div.tooltip-wrapper').html("");
            for (var i = 0; i < result['content'].length; i++) {
                $(tooltipContainer).find('div.tooltip-wrapper').append(formatLblValueTooltip(result['content'][i]));
            }
            $(tooltipContainer).find('div.pagecount span').html(pagestr);
            if (result['button'] == 'left') {
                //Incase the tooltip doesnot accomodate in the right space available
                if ($(tooltipContainer).outerWidth() > ($(tooltipContainer).offsetParent().width() - leftPos)) {
                    $(tooltipContainer).css('right', 0);
                    $(tooltipContainer).css('left', 'auto');
                } else {
                    $(tooltipContainer).css('left', leftPos);
                }
            } else if (result['button'] == 'right') {
                //Incase the tooltip doesnot accomodate in the left space available
                if ($(tooltipContainer).outerWidth() > ($(tooltipContainer).offsetParent().width() - rightPos)) {
                    $(tooltipContainer).css('left', 0);
                } else {
                    $(tooltipContainer).css('right', rightPos);
                    $(tooltipContainer).css('left', 'auto');
                }
            }
            //binding the click on tooltip for bubble drill down
            $(tooltipContainer).find('div.tooltip-wrapper').find('div.chart-tooltip').on('click', function (e) {
                bubbleDrillDown($(this).find('div.chart-tooltip-title').find('p').text(), result['nodeMap']);
            });
        }

        function bubbleDrillDown(nodeName, nodeMap) {
            var e = nodeMap[nodeName];
            if (typeof(chartOptions['clickFn']) == 'function')
                chartOptions['clickFn'](e['point']);
            else
                processDrillDownForNodes(e);
        }

        $(window).off('resize.multiTooltip');
        $(window).on('resize.multiTooltip', function (e) {
            nv.tooltip.cleanup();
        });
    };

    return ScatterChartView;
});