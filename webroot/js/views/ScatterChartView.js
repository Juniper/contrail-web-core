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
        renderChartInProgress: false,
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if(self.model == null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if(self.model != null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    var chartData = self.model.getFilteredItems();
                    self.renderChart(selector, viewConfig, chartData);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    var chartData = self.model.getFilteredItems();
                    self.renderChart(selector, viewConfig, chartData, self.model.error);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        var chartData = self.model.getFilteredItems();
                        if(!this.renderChartInProgress) {
                            //TODO: We should render chart less often
                            self.renderChart(selector, viewConfig, chartData);
                        }
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, data, error) {
            this.renderChartInProgress = true;

            var chartViewConfig, chartData, chartModel, chartOptions;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(selector, data);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            this.chartModel = new ScatterChartModel(chartData, chartOptions);
            chartModel = this.chartModel;

            if(chartModel['noDataMessage']) {
                chartModel.noData(chartModel['noDataMessage']);
            } else if (error) {
                chartModel.noData(cowc.DATA_ERROR_MESSAGE);
            }

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
            this.renderChartInProgress = false;
            //nv.addGraph(chartModel);
        }
    });

    function getChartViewConfig(selector, initResponse) {
        var chartOptions = ifNull(initResponse['chartOptions'], {}),
            chartData;

        //TODO - move values to constants
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
            return constructScatterChartTooltip(e, x, y, chart, tooltipFn);
        };
        if (chartOptions['multiTooltip']) {
            chartOptions['tooltipFn'] = function (e, x, y, chart) {
                return constructScatterChartTooltip(e, x, y, chart, tooltipFn);
            };

            chartOptions['tooltipRenderedFn'] = function (tooltipContainer, e, chart) {
                var tooltipData = e.point,
                    overlappedNodes = tooltipData['overlappedNodes'];

                initTooltipEvents(tooltipContainer, tooltipFn, tooltipData, overlappedNodes);
            }
        }

        if (chartOptions['scatterOverlapBubbles']) {
            chartData = scatterOverlapBubbles(chartData);
        }

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

        chartOptions['elementMouseoutFn'] = function (e) {};
        chartOptions['elementMouseoverFn'] = function (e) {};

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

    var initTooltipEvents = function (tooltipContainer, tooltipFn, tooltipData, overlappedNodes) {
        var overlappedElementsDropdownElement = null

        $(tooltipContainer).css('pointer-events', 'all');
        $(tooltipContainer).addClass('nvtooltip-popover');

        if (overlappedNodes != undefined && overlappedNodes.length > 1) {
            var overlappedElementData = $.map(overlappedNodes, function(nodeValue, nodeKey) {
                    return {id: nodeKey, text: nodeValue.name}
                });

            $(tooltipContainer).find('.popover-tooltip-footer').append('<div class="overlapped-elements-dropdown"></div>')
            overlappedElementsDropdownElement = $(tooltipContainer).find('.overlapped-elements-dropdown');

            overlappedElementsDropdownElement.contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'id',
                placeholder: 'View more',
                ignoreFirstValue: true,
                dropdownCssClass: 'min-width-150',
                data: overlappedElementData,
                change: function(e) {
                    var selectedNodeKey = e.added.id,
                        selectedNodeData = overlappedNodes[selectedNodeKey];

                    $(tooltipContainer).html(generateTooltipHTML(tooltipFn(selectedNodeData)));
                    initTooltipEvents(tooltipContainer, tooltipFn, selectedNodeData, overlappedNodes);
                }
            });
        }

        $(tooltipContainer).find('.popover').find('.btn')
            .off('click')
            .on('click', function() {
                var actionKey = $(this).data('action'),
                    tooltipConfig = tooltipFn(tooltipData),
                    actionCallback = tooltipConfig.content.actions[actionKey].callback;

                if(contrail.checkIfExist(overlappedElementsDropdownElement) && contrail.checkIfExist(overlappedElementsDropdownElement.data('contrailDropdown'))) {
                    overlappedElementsDropdownElement.data('contrailDropdown').destroy();
                }

                actionCallback(tooltipData);
            });

        $(tooltipContainer).find('.popover-remove')
            .off('click')
            .on('click', function(e) {
                if(contrail.checkIfExist(overlappedElementsDropdownElement) && contrail.checkIfExist(overlappedElementsDropdownElement.data('contrailDropdown'))) {
                    overlappedElementsDropdownElement.data('contrailDropdown').destroy();
                }
                nv.tooltip.cleanup();
            });

        $(document)
            .off('click', onDocumentClickHandler)
            .on('click', onDocumentClickHandler);
    };

    var onDocumentClickHandler = function(e) {
        if(!$(e.target).closest('.nvtooltip').length) {
            nv.tooltip.cleanup();

        }
    };

    var constructScatterChartTooltip = function(e, x, y, chart, tooltipFormatFn, bucketTooltipFn, selector) {
        var tooltipContents = [],
            overlappedNodes = getOverlappedNodes(e, chart, selector).reverse();

        e['point']['overlappedNodes'] = overlappedNodes;

        if(contrail.checkIfFunction(tooltipFormatFn)) {
            tooltipContents = tooltipFormatFn(e['point']);
        }
        //Format the alerts to display in tooltip
        $.each(ifNull(e['point']['alerts'],[]),function(idx,obj) {
            if(obj['tooltipAlert'] != false)
                tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
        });
        return generateTooltipHTML(tooltipContents);
    };

    var getOverlappedNodes = function(e, chart, selector){
        var currentNode = e.point,
            series = e.series,
            overlappedNodes = [],
            buffer = 1.5, //In percent
            currentX = currentNode.x,
            currentY = currentNode.y,
            totalSeries = [],
            xDiff = chart.xAxis.domain()[1] - chart.xAxis.domain()[0],
            yDiff = chart.yAxis.domain()[1] - chart.yAxis.domain()[0];

        $.each(series, function(seriesKey, seriesValue) {
            $.merge(totalSeries, seriesValue.values);
        });

        $.each(totalSeries, function(totalSeriesKey, totalSeriesValue) {
            if((Math.abs(currentX - totalSeriesValue.x) / xDiff) * 100 <= buffer && (Math.abs(currentY - totalSeriesValue.y) / yDiff) * 100 <= buffer) {
                overlappedNodes.push(totalSeriesValue);
            }
        });

        return overlappedNodes;
    };

    var generateTooltipHTML = function(tooltipConfig) {
        var tooltipElementTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP),
            tooltipElementTitleTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_TITLE),
            tooltipElementContentTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT),
            tooltipElementObj, tooltipElementTitleObj, tooltipElementContentObj;

        tooltipConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig);

        tooltipElementObj = $(tooltipElementTemplate(tooltipConfig)),
        tooltipElementTitleObj = $(tooltipElementTitleTemplate(tooltipConfig.title)),
        tooltipElementContentObj = $(tooltipElementContentTemplate(tooltipConfig.content));

        tooltipElementObj.find('.popover-title').append(tooltipElementTitleObj);
        tooltipElementObj.find('.popover-content').append(tooltipElementContentObj);

        return tooltipElementObj.prop('outerHTML');
    };

    return ScatterChartView;
});