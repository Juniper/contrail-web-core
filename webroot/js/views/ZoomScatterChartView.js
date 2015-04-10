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

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        if (!this.renderChartInProgress) {
                            //TODO: We should render chart less often
                            self.renderChart(selector, viewConfig, self.model);
                        }
                    });
                }

                $(selector).bind("refresh", function () {
                    $(selector).empty();
                    self.renderChart(selector, viewConfig, self.model);
                });

                nv.utils.windowResize(function () {
                    $(selector).empty();
                    self.renderChart(selector, viewConfig, self.model);
                });
            }
        },

        renderChart: function (selector, viewConfig, dataListModel) {
            if (!($(selector).is(':visible'))) {
                return;
            }

            this.renderChartInProgress = true;
            $(selector).html(contrail.getTemplate4Id(cowc.TMPL_ZOOMED_SCATTER_CHART));

            var self = this,
                chartSelector = $(selector).find('.chart-container'),
                chartControlPanelSelector = $(selector).find('.chart-control-panel-container'),
                chartControlPanelExpandedSelector = $(selector).find('.chart-control-panel-expanded-container'),
                chartOptions = viewConfig['chartOptions'],
                chartConfig = getChartConfig(chartSelector, chartOptions),
                data = dataListModel.getFilteredItems(),
                error = dataListModel.error,
                chartModel = new ZoomScatterChartModel(data, chartConfig),
                chartData = chartModel.data,
                zoomBySelection = false,
                zm = chartModel.zoomBehavior.on("zoom", getZoomFn(self, chartModel, chartConfig)),
                tooltipConfigCB = chartOptions.tooltipConfigCB,
                clickCB = chartOptions.clickCB,
                overlapMap = getOverlapMap(chartData);

            self.zm = zm;
            self.zoomBySelection = zoomBySelection;

            var viewAttributes = {
                    viewConfig: getControlPanelConfig(self, chartModel, chartConfig, chartControlPanelExpandedSelector)
                },
                controlPanelView = new ControlPanelView({
                    el: chartControlPanelSelector,
                    attributes: viewAttributes
                });

            controlPanelView.render();

            var svg, viewObjects,
                margin = chartConfig['margin'],
                width = chartModel.width,
                height = chartModel.height;

            svg = d3.select($(chartSelector)[0]).append("svg")
                .attr("id", "scatter")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(self.zm)
                .append("g")
                .on("mousedown", function () {
                    if (!self.zoomBySelection) return;
                    var e = this,
                        origin = d3.mouse(e),
                        rect = svg.append("rect").attr("class", "zoom");
                    d3.select("body").classed("noselect", true);
                    origin[0] = Math.max(0, Math.min(width, origin[0]));
                    origin[1] = Math.max(0, Math.min(height, origin[1]));
                    d3.select(window)
                        .on("mousemove.zoomRect", function () {
                            var m = d3.mouse(e);
                            m[0] = Math.max(0, Math.min(width, m[0]));
                            m[1] = Math.max(0, Math.min(height, m[1]));
                            rect.attr("x", Math.min(origin[0], m[0]))
                                .attr("y", Math.min(origin[1], m[1]))
                                .attr("width", Math.abs(m[0] - origin[0]))
                                .attr("height", Math.abs(m[1] - origin[1]));
                        })
                        .on("mouseup.zoomRect", function () {
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

                            svg.select(".x.axis")
                                .call(chartModel.xAxis)
                                .selectAll("text")
                                .attr("x", 0)
                                .attr("y", 8);

                            svg.select(".y.axis")
                                .call(chartModel.yAxis)
                                .selectAll("text")
                                .attr("x", -8)
                                .attr("y", 0);

                            svg.selectAll("circle").attr("transform", function (d) {
                                return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                            });
                        }, true);
                    d3.event.stopPropagation();
                });

            svg.append("rect")
                .attr("width", width)
                .attr("height", height);


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(chartModel.xAxis)
                .selectAll("text")
                .attr("x", 0)
                .attr("y", 8);

            svg.append("g")
                .attr("class", "y axis")
                .call(chartModel.yAxis)
                .selectAll("text")
                .attr("x", -8)
                .attr("y", 0);

            viewObjects = svg.append("svg")
                .attr("class", "objects")
                .attr("width", width)
                .attr("height", height + chartConfig.circleRadius);

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
                    return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                })
                .attr("opacity", "0.5")
                .on("mouseover", function (d) {
                    var tooltipData = d,
                        selfOffset = $(this).offset();
                    constructTooltip(selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData);
                })
                .on("click", function (d) {
                    clickCB(d);
                });

            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + margin.bottom - 10)
                .text(chartConfig.xLabel);

            svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", -margin.left)
                .attr("x", 0)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text(chartConfig.yLabel);

            self.svg = svg;
            self.viewObjects = viewObjects;

            this.renderChartInProgress = false;
            //initFilterEvent()
        }
    });

    var getZoomFn = function (chartView, chartModel, chartConfig) {
        return function () {
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
                return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
            });
        };
    };

    var initZoomEvents = function (controlPanelSelector, chartView, chartModel, chartConfig) {
        var zm = chartView.zm,
            zoomFn = getZoomFn(chartView, chartModel, chartConfig);

        $(controlPanelSelector).find('.zoom-in').on('click', function (event) {
            event.preventDefault();
            if (zm.scale() < chartConfig.maxScale) {
                //zm.translate([translateChart(0, -10), translateChart(1, -350)]);
                zm.scale(zm.scale() * (1.25));
                zoomFn();
            }
        });

        $(controlPanelSelector).find('.zoom-out').on('click', function (event) {
            event.preventDefault();
            if (zm.scale() > chartConfig.minScale) {
                zm.scale(zm.scale() * (100 / 125));
                //zm.translate([translateChart(0, 10), translateChart(1, 350)]);
                zoomFn();
            }
        });

        $(controlPanelSelector).find('.zoom-reset').on('click', function (event) {
            event.preventDefault();
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
                    return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                });

            zm.scale(1);
            zm.translate([0, 0]);
            //zoomFn();
        });

        function translateChart(xy, constant) {
            return zm.translate()[xy] + (constant * (zm.scale()));
        };
    };

    var getControlPanelConfig = function (chartView, chartModel, chartConfig) {
        return {
            default: {
                zoom: {
                    enabled: true,
                    events: function (controlPanelSelector) {
                        initZoomEvents(controlPanelSelector, chartView, chartModel, chartConfig)
                    }
                }
            },
            custom: {
                zoomBySelectedArea: {
                    iconClass: 'icon-crop',
                    title: 'Zoom By Selection',
                    events: {
                        click: function () {
                            return function (event) {
                                chartView.zoomBySelection = !chartView.zoomBySelection;
                                $(this).toggleClass('active');
                            }
                        }
                    }
                },
                /* filter: {
                    iconClass: 'icon-filter',
                    title: 'Filter',
                    events: {
                        click: function() {
                            return function(event) {
                                var controlPanelExpandedTemplate = contrail.getTemplate4Id('core-zoomed-scatter-chart-control-panel-filter-template'), //TODO
                                    controlPanelExpandedTemplateConfig = {
                                        groups: [
                                            {
                                                id: 'by-node-color',
                                                title: 'By Node Color',
                                                type: 'radio',
                                                items: [
                                                    {
                                                        text: 'Filter 1',
                                                        events: {
                                                            click: function(event) {
                                                                console.log('Filter 1');
                                                            }
                                                        }
                                                    },
                                                    {
                                                        text: 'Filter 2',
                                                        events: {
                                                            click: function(event) {
                                                                console.log('Filter 2');
                                                            }
                                                        }
                                                    },
                                                    {
                                                        text: 'Filter 3',
                                                        events: {
                                                            click: function(event) {
                                                                console.log('Filter 3');
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    };

                                $(this).toggleClass('active');
                                chartControlPanelExpandedSelector.toggle();

                                if (chartControlPanelExpandedSelector.is(':visible')) {
                                    chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));

                                    $.each(controlPanelExpandedTemplateConfig.groups, function(groupKey, groupValue) {
                                        $.each(groupValue.items, function(itemKey, itemValue) {
                                            //console.log($('#control-panel-filter-group-items-' + groupValue.id)
                                            //    .find('input'))
                                            $($('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey])
                                                .on('click', itemValue.events.click);
                                        });
                                    });

                                }

                            }
                        }
                    }
                }*/
            }
        }
    };

    var getOverlapMap = function (data) {
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

    var generateTooltipHTML = function (tooltipConfig) {
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

        return tooltipElementObj;
    };

    var onDocumentClicktHandler = function (e) {
        if (!$(e.target).closest('.zoomed-scatter-popover-tooltip').length) {
            $('.zoomed-scatter-popover-tooltip').remove();
        }
    };

    var destroyTooltip = function (tooltipElementObj, overlappedElementsDropdownElement) {
        if (contrail.checkIfExist(overlappedElementsDropdownElement) && contrail.checkIfExist(overlappedElementsDropdownElement.data('contrailDropdown'))) {
            overlappedElementsDropdownElement.data('contrailDropdown').destroy();
        }
        if (tooltipElementObj !== null) {
            $(tooltipElementObj).remove();
        } else {
            $('.zoomed-scatter-popover-tooltip').remove();
        }

    };

    var constructTooltip = function (selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData) {
        var tooltipConfig = tooltipConfigCB(tooltipData),
            tooltipElementObj = generateTooltipHTML(tooltipConfig),
            tooltipElementKey = tooltipData['x'] + ',' + tooltipData['y'],
            overlappedElementsDropdownElement = null;

        destroyTooltip(null, overlappedElementsDropdownElement);
        $('body').append(tooltipElementObj);
        tooltipElementObj.addClass('zoomed-scatter-popover-tooltip');

        if (tooltipElementKey in overlapMap) {
            var overlappedElementData = $.map(overlapMap[tooltipElementKey], function (overlapMapValue, overlapMapKey) {
                var overlappedElementName = chartData[overlapMapValue].name;
                return {id: overlapMapValue, text: overlappedElementName}
            });

            $(tooltipElementObj).find('.popover-tooltip-footer').append('<div class="overlapped-elements-dropdown"></div>');
            overlappedElementsDropdownElement = $(tooltipElementObj).find('.overlapped-elements-dropdown');

            overlappedElementsDropdownElement.contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'id',
                placeholder: 'View more',
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

    var getBubbleColor = function (val, array, maxColorFilterFields) {
        if (val == null) {
            return 'default';
        } else {
            return val;
        }
    };

    var computeBubbleColor = function (val, array, maxColorFilterFields) {
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

    function getChartConfig(chartSelector, chartOptions, chartSize) {
        var margin = {top: 20, right: 5, bottom: 50, left: 75},
            width = $(chartSelector).width(),
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
            dataParser: chartOptions['dataParser']
        };

        return chartViewConfig;
    };

    //TODO: Implement Filter
    function initFilterEvent() {
        // cache jQuery element calls:
        var nt = $('#navToggle'),
            nla = $('#navListContainer').find('input[type="checkbox"]'),
            rn = $('#resetNav');

        // Show/hide nav list when button is clicked
        nt.off('click').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).next('#navListContainer').slideDown();
            } else {
                $(this).next('#navListContainer').slideUp();
            }
        });

        // Filter points by category:
        nla.off('click').on('click', function (e) {
            if ($(this).prop("checked")) {
                categories.push($(this).val());
            } else {
                categories = _.without(categories, $(this).val());
            }
            filter();
            if (categories.length > 0) {
                var cats = '',
                    showedNames = 0;
                $.each(categories, function (i) {
                    if ((cats + categories[i] + '; ').length < 130) {
                        var gap = (categories.length > 1 && i < categories.length - 1) ? '; ' : '';
                        showedNames++;
                        cats += categories[i] + gap;
                    } else {
                        return false;
                    }
                });
                if ((categories.length - showedNames) > 1)
                    cats = cats.substring(0, cats.length - 2) + ' + ' + (categories.length - showedNames) + ' other categories';
                else if ((categories.length - showedNames) > 0)
                    cats = cats.substring(0, cats.length - 2) + ' + 1 other category';
            }
        });

        // Reset categories
        rn.off('click').on('click', function (e) {
            e.preventDefault();
            categories = [];
            filter();
            nla.prop("checked", false);
        });

        // Reset categories AND close categories menu
        $('#doneNav').off('click').on('click', function (e) {
            e.preventDefault();
            categories = [];
            filter();
            $('#navListContainer').slideUp();
            nla.prop("checked", false);
        });
    };

    return ZoomScatterChartView;
});