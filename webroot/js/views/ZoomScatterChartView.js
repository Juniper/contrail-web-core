/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/models/ZoomScatterChartModel',
    'contrail-list-model',
    'js/views/ControlPanelView'
], function (_, Backbone, ZoomScatterChartModel, ContrailListModel, ControlPanelView) {
    var ZoomScatterChartView = Backbone.View.extend({
        renderChartInProgress: false,
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if (self.model == null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model != null) {
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if (viewConfig.loadChartInChunks !== false) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }

                $(selector).bind("refresh", function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                nv.utils.windowResize(function () {
                    self.renderChart(selector, viewConfig, self.model);
                });
            }
        },

        renderChart: function (selector, viewConfig, dataListModel) {
            if (!($(selector).is(':visible')) || this.renderChartInProgress) {
                return;
            }

            var self = this,
                chartOptions = viewConfig['chartOptions'],
                chartConfig;

            self.renderChartInProgress = true;

            if (!contrail.checkIfExist(self.chartModel)) {
                $(selector).html(contrail.getTemplate4Id(cowc.TMPL_ZOOMED_SCATTER_CHART));

                chartConfig = getChartConfig(selector, chartOptions);
                self.chartModel = new ZoomScatterChartModel(dataListModel, chartConfig);
                self.zm = self.chartModel.zoomBehavior.on("zoom", getChartZoomFn(self, chartConfig));
                self.zoomBySelection = false;
                renderControlPanel(self, chartConfig, chartOptions, selector);
            } else {
                $(selector).find('.chart-container').empty();
                chartConfig = getChartConfig(selector, chartOptions);
                self.chartModel.refresh();
                self.zm = self.chartModel.zoomBehavior.on("zoom", getChartZoomFn(self, chartConfig));
                self.zoomBySelection = false;
            }

            renderZoomScatterChart(self, chartConfig, chartOptions, selector);
        }
    });

    function renderControlPanel(chartView, chartConfig, chartOptions, selector) {
        var chartControlPanelSelector = $(selector).find('.chart-control-panel-container'),
            viewAttributes = {
                viewConfig: getControlPanelConfig(chartView, chartConfig, chartOptions, selector)
            },
            controlPanelView = new ControlPanelView({
                el: chartControlPanelSelector,
                attributes: viewAttributes
            });

        controlPanelView.render();
    };

    function renderZoomScatterChart(chartView, chartConfig, chartOptions, selector) {
        var chartSVG, viewObjects,
            chartSelector = $(selector).find('.chart-container'),
            chartControlPanelSelector = $(selector).find('.chart-control-panel-container'),
            chartModel = chartView.chartModel,
            chartData = chartModel.data,
            tooltipConfigCB = chartOptions.tooltipConfigCB,
            clickCB = chartOptions.clickCB,
            overlapMap = getOverlapMap(chartData),
            margin = chartConfig['margin'],
            width = chartModel.width,
            height = chartModel.height,
            timer = null, circleRadius = chartConfig.circleRadius;

        $(chartSelector).height(height + margin.top + margin.bottom)
        $(chartControlPanelSelector).find('.control-panel-item').removeClass('active');

        chartSVG = d3.select($(chartSelector)[0]).append("svg")
            .attr("class", "zoom-scatter-chart")
            .attr("width", width + margin.left + margin.right + circleRadius)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewbox", '0 0 ' + (width + margin.left + margin.right + circleRadius) + ' ' + (height + margin.top + margin.bottom))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chartView.zm)
            .append("g")
            .on("mousedown", mouseDownCallback);

        chartSVG.append("rect")
            .attr("width", width + circleRadius)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + circleRadius + ",0)")

        chartSVG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + circleRadius + "," + height + ")")
            .call(chartModel.xAxis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 8);

        chartSVG.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + circleRadius + ",0)")
            .call(chartModel.yAxis)
            .selectAll("text")
            .attr("x", -8)
            .attr("y", 0);

        viewObjects = chartSVG.append("svg")
            .attr("class", "objects")
            .attr("width", width + circleRadius)
            .attr("height", height + circleRadius);

        viewObjects.selectAll("circle")
            .data(chartData)
            .enter()
            .append("circle")
            .attr("r", function (d) {
                return d['size'];
            })
            .attr("class", function (d) {
                return getBubbleColor(d[chartConfig.colorFilterFields], chartModel.classes, chartModel.maxColorFilterFields);
            })
            .attr("transform", function (d) {
                return "translate(" + (chartModel.xScale(d[chartConfig.xField]) + circleRadius) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
            })
            .attr("opacity", "0.6")
            .on("mouseenter", function (d) {
                var tooltipData = d,
                    selfOffset = $(this).offset(),
                    tooltipConfig = tooltipConfigCB(tooltipData);

                clearTimeout(timer);
                timer = setTimeout(function () {
                    constructTooltip(selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData);
                }, contrail.handleIfNull(tooltipConfig.delay, cowc.TOOLTIP_DELAY));
            })
            .on("mouseleave", function (d) {
                clearTimeout(timer);
            })
            .on("click", function (d) {
                clearTimeout(timer);
                clickCB(d);
            });

        chartSVG.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom - 10)
            .text(chartConfig.xLabel);

        chartSVG.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(chartConfig.yLabel);

        chartView.svg = chartSVG;
        chartView.viewObjects = viewObjects;

        renderChartMessage(chartView);

        function mouseDownCallback() {
            if (!chartView.zoomBySelection) {
                return;
            }

            destroyTooltip(null);

            var e = this,
                origin = d3.mouse(e),
                rect = chartSVG.append("rect").attr("class", "zoom");
            d3.select("body").classed("noselect", true);
            origin[0] = Math.max(0, Math.min(width, origin[0]));
            origin[1] = Math.max(0, Math.min(height, origin[1]));
            d3.select(window)
                .on("mousemove.zoomRect", function () {
                    destroyTooltip(null);

                    var m = d3.mouse(e);
                    m[0] = Math.max(0, Math.min(width, m[0]));
                    m[1] = Math.max(0, Math.min(height, m[1]));
                    rect.attr("x", Math.min(origin[0], m[0]))
                        .attr("y", Math.min(origin[1], m[1]))
                        .attr("width", Math.abs(m[0] - origin[0]))
                        .attr("height", Math.abs(m[1] - origin[1]));
                })
                .on("mouseup.zoomRect", function () {
                    destroyTooltip(null);

                    d3.select(window).on("mousemove.zoomRect", null).on("mouseup.zoomRect", null);
                    d3.select("body").classed("noselect", false);
                    var m = d3.mouse(e);
                    m[0] = Math.max(0, Math.min(width, m[0]));
                    m[1] = Math.max(0, Math.min(height, m[1]));
                    if (m[0] !== origin[0] && m[1] !== origin[1]) {
                        chartModel.zoomBehavior.x(
                            chartModel.xScale.domain([origin[0], m[0]].map(chartModel.xScale.invert).sort(function (a, b) {
                                return a - b;
                            }))
                        )
                            .y(
                            chartModel.yScale.domain([origin[1], m[1]].map(chartModel.yScale.invert).sort(function (a, b) {
                                return a - b;
                            }))
                        );
                    }
                    rect.remove();

                    chartSVG.select(".x.axis")
                        .call(chartModel.xAxis)
                        .selectAll("text")
                        .attr("x", 0)
                        .attr("y", 8);

                    chartSVG.select(".y.axis")
                        .call(chartModel.yAxis)
                        .selectAll("text")
                        .attr("x", -8)
                        .attr("y", 0);

                    chartSVG.selectAll("circle").attr("transform", function (d) {
                        return "translate(" + (chartModel.xScale(d[chartConfig.xField]) + circleRadius) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                    });
                }, true);
            d3.event.stopPropagation();
        };

        chartView.renderChartInProgress = false;
    }

    function renderChartMessage(chartView) {
        var chartSVG = chartView.svg,
            chartModel = chartView.chartModel,
            chartData = chartModel.data,
            margin = chartModel.margin;

        if (!chartData || !chartData.length) {
            var noDataText = chartSVG.selectAll('.nv-noData').data([chartModel.getNoDataMessage()]);

            noDataText.enter().append('text')
                .attr('class', 'nvd3 nv-noData')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            noDataText.attr('x', chartModel.width / 2)
                .attr('y', margin.top + (chartModel.height / 2))
                .text(function (d) {
                    return d
                });
        } else {
            chartSVG.selectAll('.nv-noData').remove();
        }
    };

    function getChartZoomFn(chartView, chartConfig) {
        return function () {
            var chartModel = chartView.chartModel;

            //Restrict translation to 0 value
            var reset_s = 0;
            if ((chartModel.xScale.domain()[1] - chartModel.xScale.domain()[0]) >= (chartModel.xMax - chartModel.xMin)) {
                chartModel.zoomBehavior.x(chartModel.xScale.domain([chartModel.xMin, chartModel.xMax]));
                reset_s = 1;
            }
            if ((chartModel.yScale.domain()[1] - chartModel.yScale.domain()[0]) >= (chartModel.yMax - chartModel.yMin)) {
                chartModel.zoomBehavior.y(chartModel.yScale.domain([chartModel.yMin, chartModel.yMax]));
                reset_s += 1;
            }
            if (reset_s == 2) {
                // Both axes are full resolution. Reset.
                chartModel.zoomBehavior.scale(1);
                chartModel.zoomBehavior.translate([0, 0]);
            }
            else {
                if (chartModel.xScale.domain()[0] < chartModel.xMin) {
                    chartModel.xScale.domain([chartModel.xMin, chartModel.xScale.domain()[1] - chartModel.xScale.domain()[0] + chartModel.xMin]);
                }
                if (chartModel.xScale.domain()[1] > chartModel.xMax) {
                    var xdom0 = chartModel.xScale.domain()[0] - chartModel.xScale.domain()[1] + chartModel.xMax;
                    chartModel.xScale.domain([xdom0, chartModel.xMax]);
                }
                if (chartModel.yScale.domain()[0] < chartModel.yMin) {
                    chartModel.yScale.domain([chartModel.yMin, chartModel.yScale.domain()[1] - chartModel.yScale.domain()[0] + chartModel.yMin]);
                }
                if (chartModel.yScale.domain()[1] > chartModel.yMax) {
                    var ydom0 = chartModel.yScale.domain()[0] - chartModel.yScale.domain()[1] + chartModel.yMax;
                    chartModel.yScale.domain([ydom0, chartModel.yMax]);
                }
            }

            chartView.svg
                .select(".x.axis").call(chartModel.xAxis)
                .selectAll("text")
                .attr("x", 0)
                .attr("y", 8);

            chartView.svg
                .select(".y.axis").call(chartModel.yAxis)
                .selectAll("text")
                .attr("x", -8)
                .attr("y", 0);

            chartView.svg.selectAll("circle").attr("transform", function (d) {
                return "translate(" + (chartModel.xScale(d[chartConfig.xField]) + chartConfig.circleRadius) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
            });
        };
    };

    function initZoomEvents(controlPanelSelector, chartView, chartConfig) {
        var zoomFn = getChartZoomFn(chartView, chartConfig);

        $(controlPanelSelector).find('.zoom-in').on('click', function (event) {
            event.preventDefault();
            if (chartView.zm.scale() < chartConfig.maxScale) {
                chartView.zm.scale(chartView.zm.scale() * (1.25));
                zoomFn();
            }
        });

        $(controlPanelSelector).find('.zoom-out').on('click', function (event) {
            event.preventDefault();
            if (chartView.zm.scale() > chartConfig.minScale) {
                chartView.zm.scale(chartView.zm.scale() * (100 / 125));
                zoomFn();
            }
        });

        $(controlPanelSelector).find('.zoom-reset').on('click', function (event) {
            event.preventDefault();
            var chartModel = chartView.chartModel;
            chartModel.zoomBehavior
                .x(chartModel.xScale.domain([chartModel.xMin, chartModel.xMax]).range([0, chartModel.width]))
                .y(chartModel.yScale.domain([chartModel.yMin, chartModel.yMax]).range([chartModel.height, 0]));

            chartView.svg.select(".x.axis")
                .call(chartModel.xAxis)
                .selectAll("text")
                .attr("x", 0)
                .attr("y", 8);
            chartView.svg.select(".y.axis")
                .call(chartModel.yAxis)
                .selectAll("text")
                .attr("x", -8)
                .attr("y", 0);

            chartView.svg.selectAll("circle")
                .attr("transform", function (d) {
                    return "translate(" + (chartModel.xScale(d[chartConfig.xField]) + chartConfig.circleRadius) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                });

            chartView.zm.scale(1);
            chartView.zm.translate([0, 0]);
        });

        function translateChart(xy, constant) {
            return chartView.zm.translate()[xy] + (constant * (chartView.zm.scale()));
        };
    };

    function getControlPanelConfig(chartView, chartConfig, chartOptions, selector) {
        var chartControlPanelExpandedSelector = $(selector).find('.chart-control-panel-expanded-container'),
            controlPanelConfig = {
                default: {
                    zoom: {
                        enabled: true,
                        events: function (controlPanelSelector) {
                            initZoomEvents(controlPanelSelector, chartView, chartConfig)
                        }
                    }
                },
                custom: {
                    zoomBySelectedArea: {
                        iconClass: 'icon-crop',
                        title: 'Zoom By Selection',
                        events: {
                            click: function (event, self, controlPanelSelector) {
                                chartView.zoomBySelection = !chartView.zoomBySelection;
                                $(self).toggleClass('active');
                                $(self).removeClass('refreshing');
                                if ($(self).hasClass('active')) {
                                    $('svg.zoom-scatter-chart').find('rect').addClassSVG('cursor-crosshair');
                                } else {
                                    $('svg.zoom-scatter-chart').find('rect').removeClassSVG('cursor-crosshair');
                                    $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                                }
                            }
                        }
                    }
                }
            };

        if(contrail.checkIfKeyExistInObject(true, chartOptions, 'controlPanelConfig.filter.enable') && chartOptions.controlPanelConfig.filter.enable) {
            controlPanelConfig.custom.filter = getControlPanelFilterConfig(chartOptions.controlPanelConfig.filter, chartControlPanelExpandedSelector, chartView.model)
        }

        if(contrail.checkIfKeyExistInObject(true, chartOptions, 'controlPanelConfig.legend.enable') && chartOptions.controlPanelConfig.legend.enable) {
            controlPanelConfig.custom.legend = getControlPanelLegendConfig(chartOptions.controlPanelConfig.legend, chartControlPanelExpandedSelector)
        }

        return controlPanelConfig;
    };

    var getControlPanelFilterConfig = function(customControlPanelFilterConfig, chartControlPanelExpandedSelector, listModel) {
        var scatterFilterFn = function(item, args) {
            if (args.itemCheckedLength == 0) {
                return true;
            } else if (args.itemValue.filterFn(item)) {
                return args.itemChecked;
            } else {
                return true;
            }
        };

        return {
            iconClass: 'icon-filter',
                title: 'Filter',
            events: {
                click: function (event, self, controlPanelSelector) {
                    var controlPanelExpandedTemplateConfig = customControlPanelFilterConfig.viewConfig;

                    if (chartControlPanelExpandedSelector.find('.control-panel-filter-container').length == 0) {
                        var controlPanelExpandedTemplate = contrail.getTemplate4Id(cowc.TMPL_ZOOMED_SCATTER_CHART_CONTROL_PANEL_FILTER);

                        chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));
                    }

                    $(self).toggleClass('active');
                    $(self).toggleClass('refreshing');

                    chartControlPanelExpandedSelector.toggle();

                    if (chartControlPanelExpandedSelector.is(':visible')) {
                        $.each(controlPanelExpandedTemplateConfig.groups, function (groupKey, groupValue) {
                            $.each(groupValue.items, function (itemKey, itemValue) {
                                $($('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey])
                                    .off('click')
                                    .on('click', function (event) {
                                        var itemChecked = $(this).is(':checked'),
                                            itemCheckedLength = $('#control-panel-filter-group-items-' + groupValue.id).find('input:checked').length,
                                            scatterFilterArgs = {
                                                itemChecked: itemChecked,
                                                itemCheckedLength: itemCheckedLength,
                                                itemValue: itemValue
                                            };


                                        if (itemCheckedLength == 0) {
                                            $('#control-panel-filter-group-items-' + groupValue.id).find('input').prop('checked', true);
                                        }

                                        listModel.setFilterArgs(scatterFilterArgs);
                                        listModel.setFilter(scatterFilterFn);

                                        if (contrail.checkIfKeyExistInObject(true, itemValue, 'events.click')) {
                                            itemValue.events.click(event)
                                        }
                                    });
                            });
                        });

                        chartControlPanelExpandedSelector.find('.control-panel-filter-close')
                            .off('click')
                            .on('click', function() {
                                chartControlPanelExpandedSelector.hide();
                                $(self).removeClass('active');
                                $(self).removeClass('refreshing');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                            });

                        chartControlPanelExpandedSelector.find('.control-panel-group-filter-title')
                            .off('click')
                            .on('click', function() {
                                listModel.setFilter(function(item) {
                                    return true;
                                });

                                $(this).parent().find('.control-panel-filter-group-items').find('input').prop('checked', true);
                            });
                    } else {
                        $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                    }
                }
            }
        };
    };

    var getControlPanelLegendConfig = function(customControlPanelFilterConfig, chartControlPanelExpandedSelector) {
        return {
            iconClass: 'icon-info-sign',
            title: 'Information',
            events: {
                click: function (event, self, controlPanelSelector) {
                    var controlPanelExpandedTemplate = contrail.getTemplate4Id(cowc.TMPL_ZOOMED_SCATTER_CHART_CONTROL_PANEL_LEGEND),
                        controlPanelExpandedTemplateConfig = customControlPanelFilterConfig.viewConfig;

                    $(self).toggleClass('active');
                    chartControlPanelExpandedSelector.toggle();

                    if (chartControlPanelExpandedSelector.is(':visible')) {
                        chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));

                        $.each(controlPanelExpandedTemplateConfig.groups, function (groupKey, groupValue) {
                            $.each(groupValue.items, function (itemKey, itemValue) {
                                $($('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey])
                                    .on('click', itemValue.events.click);
                            });
                        });

                        chartControlPanelExpandedSelector.find('.control-panel-legend-close')
                            .off('click')
                            .on('click', function() {
                                chartControlPanelExpandedSelector.hide();
                                $(self).removeClass('active');
                                $(self).removeClass('refreshing');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');

                            });
                    }
                }
            }
        };
    };

    function getOverlapMap(data) {
        var tempMap = {},
            finalOverlapMap = {};
        $.each(data, function (index, value) {
            var key = (value['x'] + ',' + value['y']);
            if (key in finalOverlapMap) {
                finalOverlapMap[key].push(index);
            } else {
                if (key in tempMap) {
                    tempMap[key].push(index);
                    finalOverlapMap[key] = tempMap[key];
                    delete tempMap[key];
                } else {
                    var overlapArray = [];
                    overlapArray.push(index);
                    tempMap[key] = overlapArray;
                }
            }
        });
        return finalOverlapMap;
    };

    function generateTooltipHTML(tooltipConfig) {
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

        return tooltipElementObj;
    };

    function onDocumentClicktHandler(e) {
        if (!$(e.target).closest('.zoomed-scatter-popover-tooltip').length) {
            $('.zoomed-scatter-popover-tooltip').remove();
        }
    };

    function destroyTooltip(tooltipElementObj, overlappedElementsDropdownElement) {
        if (contrail.checkIfExist(overlappedElementsDropdownElement) && contrail.checkIfExist(overlappedElementsDropdownElement.data('contrailDropdown'))) {
            overlappedElementsDropdownElement.data('contrailDropdown').destroy();
        }
        if (tooltipElementObj !== null) {
            $(tooltipElementObj).remove();
        } else {
            $('.zoomed-scatter-popover-tooltip').remove();
        }

    };

    function constructTooltip(selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData) {
        var tooltipConfig = tooltipConfigCB(tooltipData),
            tooltipElementObj = generateTooltipHTML(tooltipConfig),
            tooltipElementKey = tooltipData['x'] + ',' + tooltipData['y'],
            overlappedElementsDropdownElement = null;

        destroyTooltip(null, overlappedElementsDropdownElement);
        $('body').append(tooltipElementObj);
        tooltipElementObj.addClass('zoomed-scatter-popover-tooltip');

        if (tooltipElementKey in overlapMap) {
            var overlappedElementData = $.map(overlapMap[tooltipElementKey], function (overlapMapValue, overlapMapKey) {
                var overlappedElementName = contrail.handleIfNull(chartData[overlapMapValue].name, '-');
                if (tooltipData.name != overlappedElementName) {
                    return {id: overlapMapValue, text: overlappedElementName}
                }
                return null;
            });

            $(tooltipElementObj).find('.popover-tooltip-footer').append('<div class="overlapped-elements-dropdown"></div>');
            overlappedElementsDropdownElement = $(tooltipElementObj).find('.overlapped-elements-dropdown');

            overlappedElementsDropdownElement.contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'id',
                placeholder: 'View more (' + overlappedElementData.length + ')',
                ignoreFirstValue: true,
                dropdownCssClass: 'min-width-150',
                data: overlappedElementData,
                change: function (e) {
                    var selectedTooltipKey = e.added.id,
                        selectedTooltipData = chartData[selectedTooltipKey];

                    $(tooltipElementObj).remove();
                    constructTooltip(selfOffset, selectedTooltipData, tooltipConfigCB, overlapMap, chartData);
                }
            });
        }

        var tooltipWidth = tooltipElementObj.width(),
            tooltipHeight = tooltipElementObj.height(),
            windowWidth = $(document).width(),
            tooltipPositionTop = 0,
            tooltipPositionLeft = selfOffset.left;

        if (selfOffset.top > tooltipHeight / 2) {
            tooltipPositionTop = selfOffset.top - tooltipHeight / 2;
        }

        if ((windowWidth - selfOffset.left) < tooltipWidth) {
            tooltipPositionLeft = selfOffset.left - tooltipWidth - 10;
        } else {
            tooltipPositionLeft += 20;
        }

        $(tooltipElementObj).css({
            top: tooltipPositionTop,
            left: tooltipPositionLeft
        });

        $(tooltipElementObj).find('.popover-tooltip-footer').find('.btn')
            .off('click')
            .on('click', function () {
                var actionKey = $(this).data('action'),
                    actionCallback = tooltipConfig.content.actions[actionKey].callback;

                destroyTooltip(tooltipElementObj, overlappedElementsDropdownElement);
                actionCallback(tooltipData);
            });

        $(tooltipElementObj).find('.popover-remove')
            .off('click')
            .on('click', function (e) {
                destroyTooltip(tooltipElementObj, overlappedElementsDropdownElement);
            });

        $(document)
            .off('click', onDocumentClicktHandler)
            .on('click', onDocumentClicktHandler);

        $(window).on('popstate', function (event) {
            $('.zoomed-scatter-popover-tooltip').remove();
        });
    };

    function getBubbleColor(val, array, maxColorFilterFields) {
        if (val == null) {
            return 'default';
        } else {
            return val;
        }
    };

    function computeBubbleColor(val, array, maxColorFilterFields) {
        if (val > (0.9 * maxColorFilterFields)) {
            return array[0];
        } else if (val > (0.75 * maxColorFilterFields)) {
            return array[1];
        } else if (val > (0.50 * maxColorFilterFields)) {
            return array[2];
        } else if (val > (0.25 * maxColorFilterFields)) {
            return array[3];
        } else {
            return array[4];
        }
    };

    function getChartConfig(selector, chartOptions) {
        var margin = $.extend(true, {}, {top: 20, right: 5, bottom: 50, left: 50}, chartOptions['margin']),
            chartSelector = $(selector).find('.chart-container'),
            width = $(chartSelector).width() - 10,
            height = 275;

        var chartViewConfig = {
            circleRadius: 7.0,
            maxScale: 5,
            minScale: 1 / 5,
            yLabel: chartOptions.yLabel,
            xLabel: chartOptions.xLabel,
            yLabelFormat: chartOptions.yLabelFormat,
            xLabelFormat: chartOptions.xLabelFormat,
            xField: 'x',
            yField: 'y',
            forceX: chartOptions.forceX,
            forceY: chartOptions.forceY,
            colorFilterFields: 'color',
            titleKey: chartOptions.titleField,
            categoryKey: 'project',
            margin: margin,
            height: height,
            width: width,
            dataParser: chartOptions['dataParser'],
            sizeFieldName: chartOptions['sizeFieldName'],
            noDataMessage: chartOptions['noDataMessage']
        };

        return chartViewConfig;
    };

    return ZoomScatterChartView;
});