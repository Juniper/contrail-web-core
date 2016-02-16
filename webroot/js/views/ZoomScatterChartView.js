/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/ZoomScatterChartModel',
    'contrail-list-model',
    'core-basedir/js/views/ControlPanelView'
], function (_, ContrailView, ZoomScatterChartModel, ContrailListModel, ControlPanelView) {
    var ZoomScatterChartView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                deferredObj = $.Deferred(),
                cfDataSource = self.attributes.viewConfig.cfDataSource,
                selector = $(self.$el);

            if (self.model == null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model != null) {
                if(cfDataSource == null) {
                    self.renderChart(selector, viewConfig, self.model);
                } else if(self.model.loadedFromCache == true) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                if(cfDataSource != null) {
                    cfDataSource.addCallBack('updateChart',function(data) {
                        viewConfig['cfg'] = {};
                        viewConfig['cfg']['source'] = data['cfg']['source'];
                        $(selector).find('.filter-list-container .filter-criteria').hide();
                        self.renderChart(selector, viewConfig, self.model);
                        viewConfig['cfg'] = {};
                    });
                } else {
                    self.model.onAllRequestsComplete.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }

                if (viewConfig.loadChartInChunks !== false) {
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
            }

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find('.zoom-scatter-chart-container'), self.model, widgetConfig, null, null, null);
            }
        },

        renderChart: function (selector, viewConfig, dataListModel) {
            if (!($(selector).is(':visible')) || this.isMyRenderInProgress) {
                return;
            }

            var self = this,
                chartOptions = viewConfig['chartOptions'],
                chartConfig;

            self.isMyRenderInProgress = true;

            if (!contrail.checkIfExist(self.chartModel)) {
                $(selector).html(contrail.getTemplate4Id(cowc.TMPL_ZOOMED_SCATTER_CHART));

                chartConfig = getChartConfig(selector, chartOptions);
                self.chartModel = new ZoomScatterChartModel(dataListModel, chartConfig);
                self.zm = self.chartModel.zoomBehavior.on("zoom", getChartZoomFn(self, chartConfig));
                if(typeof(self.zoomBySelection) == "undefined")
                    self.zoomBySelection = false;
                renderControlPanel(self, chartConfig, chartOptions, selector);
            } else {
                $(selector).find('.chart-container').empty();
                chartConfig = getChartConfig(selector, chartOptions);
                self.chartModel.refresh(chartConfig);
                self.zm = self.chartModel.zoomBehavior.on("zoom", getChartZoomFn(self, chartConfig));
                if(typeof(self.zoomBySelection) == "undefined")
                    self.zoomBySelection = false;
            }

            renderZoomScatterChart(self, chartConfig, chartOptions, selector);
        },

        renderMessage: function(message, selector) {
            var self = this,
                message = contrail.handleIfNull(message, ""),
                selector = contrail.handleIfNull(selector, $(self.$el)),
                chartSVG = d3.select($(selector).find("svg")[0]),
                chartModel = self.chartModel,
                margin = chartModel.margin,
                chartMessageText = chartSVG.selectAll('.nv-noData').data([message]);

            chartMessageText.enter().append('text')
                .attr('class', 'nvd3 nv-noData')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            chartMessageText.attr('x', margin.left + chartModel.width / 2)
                .attr('y', (chartModel.height + margin.top + margin.bottom) / 2)
                .text(function (d) {
                    return d
                });

            if (chartModel.isRequestInProgress()) {
                chartMessageText.style('fill', '#000');
            }
        },

        removeMessage: function(selector) {
            var self = this,
                selector = contrail.handleIfNull(selector, $(self.$el));

            $(selector).find('.nv-noData').remove();
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
        var chartModel = chartView.chartModel,
            checkEmptyDataCB = function (data) {
                return (!data || data.length === 0);
            },
            chartDataRequestState = cowu.getRequestState4Model(chartModel, chartModel.data, checkEmptyDataCB);


        plotZoomScatterChart(chartView, chartConfig, chartOptions, selector);

        if (chartModel.isPrimaryRequestInProgress() && !chartModel.loadedFromCache) {
            dataLoadingHandler(chartView, chartConfig, chartOptions, chartDataRequestState)
        } else if (chartModel.isError() === true) {
            dataErrorHandler(chartView, chartDataRequestState);
        } else if(chartModel.isEmpty() === true) {
            dataEmptyHandler(chartView, chartConfig, chartDataRequestState)
        } else {
            dataSuccessHandler(chartView, chartConfig, chartOptions, chartDataRequestState)
        }

        chartView.isMyRenderInProgress = false;
    }

    function plotZoomScatterChart(chartView, chartConfig, chartOptions, selector) {
        var chartSVG, viewObjects,self=this,
            chartSelector = $(selector).find('.chart-container'),
            chartControlPanelSelector = $(selector).find('.chart-control-panel-container'),
            chartModel = chartView.chartModel,
            margin = chartConfig['margin'],
            width = chartModel.width,
            height = chartModel.height,
            cfDataSource = chartView.attributes.viewConfig.cfDataSource,
            maxCircleRadius = chartConfig.maxCircleRadius;

        $(chartSelector).height(height + margin.top + margin.bottom);
        //What if we want an icon to be active by default
        $(chartControlPanelSelector).find('.control-panel-item').removeClass('active');
        if(chartOptions['doBucketize'] == true && chartView.zoomBySelection == true)
            $(chartControlPanelSelector).find('.control-panel-item.zoomBySelectedArea').addClass('active');

        if(chartOptions['doBucketize'] != true) {
            chartSVG = d3.select($(chartSelector)[0]).append("svg")
                .attr("class", "zoom-scatter-chart")
            .attr("width", width + margin.left + margin.right + maxCircleRadius)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewbox", '0 0 ' + (width + margin.left + margin.right + maxCircleRadius) + ' ' + (height + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chartView.zm)
                .append("g")
                .on("mousedown", mouseDownCallback);
        } else {
            chartSVG = d3.select($(chartSelector)[0]).append("svg")
                .attr("class", "zoom-scatter-chart")
                .attr("width", width + margin.left + margin.right + maxCircleRadius)
                .attr("height", height + margin.top + margin.bottom)
                .attr("viewbox", '0 0 ' + (width + margin.left + margin.right + maxCircleRadius) + ' ' + (height + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chartView.zm)
                .on('dblclick.zoom',function() {
                    zoomOut({cfDataSource:cfDataSource});
                })
                .append("g")
                .on('mousedown.zoom',mouseDownCallback);
        }

        //Add color filter
        //Don't show CPU/Mem filters
        if(chartOptions['doBucketize'] == true) {
            if($(selector).find('.zs-chart-settings').length == 0) {
                var zsChartSettingsTmpl = contrail.getTemplate4Id('zs-chart-settings');
                $(selector).prepend(zsChartSettingsTmpl());
            }

            /*
            $(selector).find('.filter-list-container .filter-criteria').hide();
            //Show filters
            var d3Format = d3.format('.2f');
            var showFilterTemplate = contrail.getTemplate4Id('zs-show-filter-range');
            if(cfDataSource.getFilter('x') != null) {
                $(selector).find('.filter-list-container').show();
                $(selector).find('.filter-list-container .filter-criteria.x').show();
                var minMaxX = cfDataSource.getFilterValues('x');
                $(selector).find('.filter-criteria.x').html(showFilterTemplate({
                        lbl: 'CPU (%)',
                        minValue: d3Format(minMaxX[0]),
                        maxValue: d3Format(minMaxX[1])
                    }));
                $(selector).find('.filter-criteria.x').find('.icon-remove').on('click',function() {
                    $(this).parents('.filter-criteria').hide();
                    cfDataSource.removeFilter('x');
                    cfDataSource.fireCallBacks({source:'chartFilterRemoved'});
                });
            }
            if(cfDataSource.getFilter('y') != null) {
                $(selector).find('.filter-list-container').show();
                $(selector).find('.filter-list-container .filter-criteria.y').show();
                var minMaxY = cfDataSource.getFilterValues('y');
                $(selector).find('.filter-criteria.y').html(showFilterTemplate({
                        lbl: 'Mem (MB)',
                        minValue: d3Format(minMaxY[0]),
                        maxValue: d3Format(minMaxY[1])
                }));
                $(selector).find('.filter-criteria.y').find('.icon-remove').on('click',function() {
                    $(this).parents('.filter-criteria').hide();
                    cfDataSource.removeFilter('y');
                    cfDataSource.fireCallBacks({source:'chartFilterRemoved'});
                });
            }*/
        }

        chartSVG.append("rect")
            .attr('class','zs-rect')
            .attr("width", width + maxCircleRadius)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + maxCircleRadius + ",0)")

        chartSVG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + maxCircleRadius + "," + height + ")")
            .call(chartModel.xAxis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 8);

        chartSVG.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + maxCircleRadius + ",0)")
            .call(chartModel.yAxis)
            .selectAll("text")
            .attr("x", -8)
            .attr("y", 0);

        viewObjects = chartSVG.append("svg")
            .attr("class", "objects")
            .attr("width", width + maxCircleRadius)
            .attr("height", height + maxCircleRadius);

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

                    rect.remove();
                    if(chartOptions['doBucketize'] != true) {
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
                            var xTranslate = chartModel.xScale(d[chartConfig.xField]) + maxCircleRadius,
                                yTranslate = chartModel.yScale(d[chartConfig.yField]);
                            //Position the non x/y nodes at axis start
                            if(!$.isNumeric(xTranslate))
                                xTranslate = chartModel.xScale.range()[0] + maxCircleRadius;
                            if(!$.isNumeric(yTranslate))
                                yTranslate = chartModel.yScale.range()[0];
                            return "translate(" + xTranslate + "," + yTranslate + ")";
                        });
                    } else {
                        //Bucketize the dragged selection
                        //As x-axis is transformated 50px and again 7px with circle radius
                        //y-axis is transformed 0px from svg
                        var xOffset = 10,yOffset = 0;
                        var minMaxX = [];
                        var xValue1 = chartModel.xScale.invert(origin[0] - xOffset);
                        var xValue2 = chartModel.xScale.invert(m[0] - xOffset);
                        minMaxX[0] = Math.min(xValue1, xValue2);
                        minMaxX[1] = Math.max(xValue1, xValue2);
                        var minMaxY = [];
                        var yValue1 = chartModel.yScale.invert(origin[1] - yOffset);
                        var yValue2 = chartModel.yScale.invert(m[1] - yOffset);
                        minMaxY[0] = Math.min(yValue1, yValue2);
                        minMaxY[1] = Math.max(yValue1, yValue2);
                        //Get the data associated with the chart
                        var d = d3.select($(chartView.$el).find('svg rect.zs-rect')[0]).data()[0];
                        zoomIn({
                            xRange: minMaxX,
                            yRange: minMaxY,
                            d     : d,
                            selector: selector,
                            viewConfig: chartView.attributes.viewConfig,
                            cfDataSource : cfDataSource
                        });
                    }
                }, true);
            d3.event.stopPropagation();
        };
        if(chartOptions['doBucketize'] == true) {
            if(chartView.zoomBySelection == true) {
                $('svg.zoom-scatter-chart').find('rect').addClassSVG('cursor-crosshair');
            }
            /*
            addScatterChartDragHandler({
                viewConfig: chartView.attributes.viewConfig,
                selector: chartView.$el,
                chartModel: chartView.chartModel,
                cfDataSource: chartView.attributes.viewConfig.cfDataSource
            });*/
            //Bind drag event once scatterChart initialized
            if(chartView.bindListeners == null) {
                chartView.bindListeners = true;
                addSelectorClickHandlers({
                    selector: chartView.$el,
                    chartModel: chartView.chartModel,
                    cfDataSource: chartView.attributes.viewConfig.cfDataSource
                });
            }
        }
    }

    function zoomOut(obj) {
        //Reset color-selection
        // $(selector).find('.color-selection .circle').addClass('filled');
        if(obj['cfDataSource'] != null) {
            var cfDataSource = obj['cfDataSource'];
            // cfDataSource.removeFilter('chartFilter');
            cfDataSource.removeFilter('x');
            cfDataSource.removeFilter('y');
            cfDataSource.fireCallBacks({source:'chartFilterRemoved'});
        }
    }

    function getColorFilterFn(selector) {
        //Add color filter
        var selectedColorElems = $(selector).find('.circle.filled');
        // selectedColorElems = $(selector).parents('.control-panel-filter-group').find('input:checked').siblings('span');
        var selColors = [];
        $.each(selectedColorElems,function(idx,obj) {
            $.each(cowc.COLOR_SEVERITY_MAP,function(currColorName,currColorCode) {
                if($(obj).hasClass(currColorName)) {
                    // if(selColors.indexOf(currColorName) == -1)
                        selColors.push(currColorCode);
                }
            });
        });
        var colorFilterFunc = function(d) {
            return selColors.indexOf(d) > -1;
        }
        return colorFilterFunc;
    }

    function addSelectorClickHandlers(obj) {
        /****
        * Selection handler for color filter in chart settings panel
        ****/
        $(obj['selector']).on('click','.zs-chart-settings .color-selection .circle',function() {
            var currElem = $(this);
            $(this).toggleClass('filled');

            var colorFilterFunc = getColorFilterFn($(this).parents('.color-selection'));
            if(obj['cfDataSource'] != null) {
                obj['cfDataSource'].applyFilter('colorFilter',colorFilterFunc);
                obj['cfDataSource'].fireCallBacks({source:'chart'});
            }
        });
    }

    function addScatterChartDragHandler(obj) {
        //Will be set to true on pressing "Esc" key
        var cancelDragEvent;
        var selector=obj['selector'],chartModel = obj['chartModel'];

        var dragSrc = d3.behavior.drag();
        //drag support
        d3.select($(selector)[0]).select('svg rect.zs-rect').call(dragSrc
            .on('dragstart',function(d,i) {
                var p = d3.mouse(this);
                this.__origin__ = {};
                this.__origin__.x = p[0];
                this.__origin__.y = p[1];
                this.__origin__.dx  = 0,this.__origin__.dy = 0;
                d3.select($(selector)[0]).select('svg').append('rect').attr('id','rect1');
            })
            .on("drag", function(d, i){
                cancelDragEvent = false;
                this.__origin__.dx += d3.event.dx;
                this.__origin__.dy += d3.event.dy;
                var xMirror = 1,yMirror =1,
                    offsetX = this.__origin__.x,offsetY = this.__origin__.y;
                //Working only when we negate both scale & x/y coordinates
                if(this.__origin__.dx < 0) {
                    xMirror = -1;
                    offsetX = -offsetX;
                }
                if(this.__origin__.dy < 0) {
                    yMirror = -1;
                    offsetY = -offsetY;
                }

                d3.select($(selector).find('svg rect#rect1')[0])
                .attr('x',offsetX)
                .attr('y',offsetY)
                .attr('width',Math.abs(d3.event.x - this.__origin__.x))
                .attr('height',Math.abs(d3.event.y - this.__origin__.y))
                .attr('style',"stroke:lightgrey;stroke-width:2;fill:lightgrey;fill-opacity:0.5;")
                .attr('transform', 'scale(' + xMirror + ',' + yMirror +')');
            })
            .on("dragend", function(d,i) {
                    if(cancelDragEvent == true) {
                        cancelDragEvent = false;
                        $('#rect1').remove();
                        return;
                    }
                    if(d.dx == 0 && d.dy == 0) {
                        $('#rect1').remove();
                        return;
                    }
                    $(selector).find('#rect1').remove();
                    //As x-axis is transformated 50px and again 7px with circle radius
                    //y-axis is transformed 10px from svg
                    var xOffset = 50+10,yOffset = 10;
                    var minMaxX = [];
                    var xValue1 = chartModel.xScale.invert(this.__origin__.x - xOffset);
                    var xValue2 = chartModel.xScale.invert(this.__origin__.x + this.__origin__.dx - xOffset);
                    minMaxX[0] = Math.min(xValue1, xValue2);
                    minMaxX[1] = Math.max(xValue1, xValue2);
                    var minMaxY = [];
                    var yValue1 = chartModel.yScale.invert(this.__origin__.y - yOffset);
                    var yValue2 = chartModel.yScale.invert(this.__origin__.y + this.__origin__.dy - yOffset);
                    minMaxY[0] = Math.min(yValue1, yValue2);
                    minMaxY[1] = Math.max(yValue1, yValue2);
                    zoomIn({
                        xRange: minMaxX,
                        yRange: minMaxY,
                        d     : d,
                        selector: selector,
                        viewConfig: obj['viewConfig'],
                        cfDataSource : obj['cfDataSource']
                    });
                    delete this.__origin__;
            })
        ).on('mousedown', function(d){
            //To store the initial co-ordinates??
            // d.offsetX = d3.event.offsetX;
            // d.offsetY = d3.event.offsetY;
        })
        d3.select('body').on('keyup', function(d) {
            if(d3.event.keyCode == 27) cancelDragEvent = true;
        });
    }

    function zoomIn(obj) {
        var minMaxX = obj['xRange'],
            minMaxY = obj['yRange'],
            viewConfig = obj.viewConfig,
            cfDataSource = obj['cfDataSource'],
            selector = obj['selector'],
            d = obj['d'];
        //adjust min and max values to include missed bubbles
        var combinedValues = [];

        if(d instanceof Array) {
            $.each(d,function(idx,item) {
                //Include all nodes whose center position falls within the dragged region
                if(item.x >= minMaxX[0] && item.x <= minMaxX[1]
                    && item.y >= minMaxY[0] && item.y <= minMaxY[1]) {
                    combinedValues.push(item);
                }
            });
        } else {
            minMaxX = d['minMaxX'];
            minMaxY = d['minMaxY'];
            combinedValues = [d];
        }
        var minMaxXs = [],minMaxYs = [];

        //If there is no node within dragged selection,ignore
        if(combinedValues.length == 0) {
            return;
        }
        var selectedNodes = [];
        $.each(combinedValues,function(idx,obj) {
            if(obj['isBucket'] || obj['children']) {
                $.each(obj['children'],function(idx,currNode) {
                    selectedNodes.push(currNode);
                });
            } else {
                selectedNodes.push(obj);
            }
        });
        minMaxX = d3.extent(selectedNodes,function(d) { return d.x;});
        minMaxY = d3.extent(selectedNodes,function(d) { return d.y;});
        var selNames = $.map(selectedNodes,function(obj,idx) {
           return obj['name'];
        });

        //Zoomin on the selected region
        if(obj['cfDataSource'] != null) {
            var cfDataSource = obj['cfDataSource'];
            if(cfDataSource.getDimension('x') == null) {
                cfDataSource.addDimension('x',function(d) {
                    return d['x'];
                });
            }
            if(cfDataSource.getDimension('y') == null) {
                cfDataSource.addDimension('y',function(d) {
                    return d['y'];
                });
            }
            if(cfDataSource.getDimension('chartFilter') == null) {
                cfDataSource.addDimension('chartFilter',function(d) {
                    return d['name'];
                });
            }
            var dataMinMaxX = d3.extent(cfDataSource.getFilteredData(),function(d) { return d.x;});
            var dataMinMaxY = d3.extent(cfDataSource.getFilteredData(),function(d) { return d.y;});
            //Apply the filter only if there are nodes less than the select min and greater than the selected max
            if(dataMinMaxX[0] < minMaxX[0] || dataMinMaxX[1] > minMaxX[1]) {
                cfDataSource.applyFilter('x',function(d) {
                    return d >= minMaxX[0] && d <= minMaxX[1];
                },minMaxX);
            }
            if(dataMinMaxY[0] < minMaxY[0] || dataMinMaxY[1] > minMaxY[1]) {
                cfDataSource.applyFilter('y',function(d) {
                    return d >= minMaxY[0] && d <= minMaxY[1];
                },minMaxY);
            }

            cfDataSource.fireCallBacks({source:'chart'});
        }
    }

    function dataLoadingHandler(chartView, chartConfig, chartOptions, chartDataRequestState) {
        var chartMessage = chartConfig.statusMessageHandler(chartDataRequestState);
        plotZoomScatterChartData(chartView, chartConfig, chartOptions);
        chartView.svg.attr('opacity', '0.8');
        if (chartConfig.defaultDataStatusMessage) {
            chartView.renderMessage(chartMessage);
        }
    }

    function dataEmptyHandler(chartView, chartConfig, chartDataRequestState) {
        var chartMessage = contrail.checkIfExist(chartConfig.noDataMessage) ? chartConfig.noDataMessage : chartConfig.statusMessageHandler(chartDataRequestState);

        chartView.renderMessage(chartMessage);
        updateFilteredCntInHeader(chartView);
    }

    function dataErrorHandler(chartView, chartDataRequestState) {
        var chartMessage = chartConfig.statusMessageHandler(chartDataRequestState);
        chartView.renderMessage(chartMessage);
        updateFilteredCntInHeader(chartView);
    }

    function dataSuccessHandler(chartView, chartConfig, chartOptions, chartDataRequestState) {
        plotZoomScatterChartData(chartView, chartConfig, chartOptions);
    }

    function updateFilteredCntInHeader(chartView) {
        var cfDataSource = chartView.attributes.viewConfig.cfDataSource;
        //Update cnt in title
        var headerElem = chartView.$el.parents('.widget-body').siblings('.widget-header')[0];
        if(headerElem != null && cfDataSource != null) {
            var filteredCnt = cfDataSource.getFilteredRecordCnt(),
                totalCnt = cfDataSource.getRecordCnt();
            var infoElem = ifNull($($(headerElem).contents()[1]),$(headerElem));
            var innerText = infoElem.text().split('(')[0].trim();
            if (filteredCnt == totalCnt) {
                innerText += ' (' + totalCnt + ')';
            } else {
                innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
            }
            infoElem.text(innerText);
        }
    }

    function plotZoomScatterChartData(chartView, chartConfig, chartOptions) {
        var viewObjects = chartView.viewObjects,
            chartModel = chartView.chartModel,
            chartData = chartModel.chartData,
            tooltipConfigCB = chartOptions.tooltipConfigCB,
            bucketTooltipFn = chartOptions.bucketTooltipFn,
            clickCB = chartOptions.clickCB,
            overlapMap = getOverlapMap(chartData),
            timer = null, maxCircleRadius = chartConfig.maxCircleRadius;


        //Bind data to chart
        d3.select($(chartView.$el).find('svg rect.zs-rect')[0]).data([chartModel.data]);

        updateFilteredCntInHeader(chartView);
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
                var xTranslate = chartModel.xScale(d[chartConfig.xField]) + maxCircleRadius,
                    yTranslate = chartModel.yScale(d[chartConfig.yField]);
                //Position the non x/y nodes at axis start
                if(!$.isNumeric(xTranslate))
                    xTranslate = chartModel.xScale.range()[0] + maxCircleRadius;
                if(!$.isNumeric(yTranslate))
                    yTranslate = chartModel.yScale.range()[0];
                return "translate(" + xTranslate + "," + yTranslate + ")";
            })
            .attr("opacity", "0.6")
            .on("mouseenter", function (d) {
                var tooltipData = d;
                if(tooltipData['isBucket'] == true) {
                    tooltipConfigCB = bucketTooltipFn;
                }
                var selfOffset = $(this).offset(),
                    tooltipConfig = tooltipConfigCB(tooltipData);

                clearTimeout(timer);
                timer = setTimeout(function () {
                    constructTooltip(selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData,chartView);
                }, contrail.handleIfNull(tooltipConfig.delay, cowc.TOOLTIP_DELAY));
            })
            .on("mouseleave", function (d) {
                clearTimeout(timer);
            })
            .on("click", function (d) {
                clearTimeout(timer);
                if(chartOptions['doBucketize'] == true && getValueByJsonPath(d,'children',[]).length > 1) {
                    zoomIn({
                        d : d,
                        viewConfig : chartView.attributes.viewConfig,
                        cfDataSource : chartView.attributes.viewConfig.cfDataSource,
                        selector: chartView.$el
                    });
                } else {
                    if(getValueByJsonPath(d,'children',[]).length == 1) {
                        d = d['children'][0];
                    }
                    clickCB(d);
                }
            });
    }

    function renderChartMessage(chartView, noDataMessage) {
        var chartSVG = chartView.svg,
            chartModel = chartView.chartModel,
            margin = chartModel.margin,
            noDataText = chartSVG.selectAll('.nv-noData').data([noDataMessage]);

        noDataText.enter().append('text')
            .attr('class', 'nvd3 nv-noData')
            .attr('dy', '-.7em')
            .style('text-anchor', 'middle');

        noDataText.attr('x', chartModel.width / 2)
            .attr('y', margin.top + (chartModel.height / 2))
            .text(function (d) {
                return d
            });

        if (chartModel.isRequestInProgress()) {
            noDataText.style('fill', '#000');
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
                var xTranslate = chartModel.xScale(d[chartConfig.xField]) + chartConfig.maxCircleRadius,
                    yTranslate = chartModel.yScale(d[chartConfig.yField]);
                //Position the non x/y nodes at axis start
                if(!$.isNumeric(xTranslate))
                    xTranslate = chartModel.xScale.range()[0] + chartConfig.maxCircleRadius;
                if(!$.isNumeric(yTranslate))
                    yTranslate = chartModel.yScale.range()[0];
                return "translate(" + xTranslate + "," + yTranslate + ")";
            });
        };
    };

    function initZoomEvents(controlPanelSelector, chartView, chartConfig) {
        var zoomFn = getChartZoomFn(chartView, chartConfig);

        $(controlPanelSelector).find('.zoom-in').on('click', function (event) {
            if (!$(this).hasClass('disabled')) {
                event.preventDefault();
                if (chartView.zm.scale() < chartConfig.maxScale) {
                    chartView.zm.scale(chartView.zm.scale() * (1.25));
                    zoomFn();
                }

            }
        });

        $(controlPanelSelector).find('.zoom-out').on('click', function (event) {
            if (!$(this).hasClass('disabled')) {
                event.preventDefault();
                if (chartView.zm.scale() > chartConfig.minScale) {
                    chartView.zm.scale(chartView.zm.scale() * (100 / 125));
                    zoomFn();
                }
            }
        });

        $(controlPanelSelector).find('.zoom-reset').on('click', function (event) {
            if (!$(this).hasClass('disabled')) {
                event.preventDefault();
                if(chartConfig.doBucketize == true) {
                    zoomOut({
                        cfDataSource:chartView.attributes.viewConfig.cfDataSource
                    })
                    return;
                }
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
                        var xTranslate = chartModel.xScale(d[chartConfig.xField]) + chartConfig.maxCircleRadius,
                            yTranslate = chartModel.yScale(d[chartConfig.yField]);
                        //Position the non x/y nodes at axis start
                        if(!$.isNumeric(xTranslate))
                            xTranslate = chartModel.xScale.range()[0] + chartConfig.maxCircleRadius;
                        if(!$.isNumeric(yTranslate))
                            yTranslate = chartModel.yScale.range()[0];
                        return "translate(" + xTranslate + "," + yTranslate + ")";
                    });
                chartView.zm.scale(1);
                chartView.zm.translate([0, 0]);
            }
        });

        function translateChart(xy, constant) {
            return chartView.zm.translate()[xy] + (constant * (chartView.zm.scale()));
        };
    };

    function getControlPanelConfig(chartView, chartConfig, chartOptions, selector) {
        var zoomEnabled = true;
        var chartControlPanelExpandedSelector = $(selector).find('.chart-control-panel-expanded-container'),
            controlPanelConfig = {
                default: {
                    zoom: {
                        enabled: zoomEnabled,
                        doBucketize: chartConfig['doBucketize'],
                        events: function (controlPanelSelector) {
                            initZoomEvents(controlPanelSelector, chartView, chartConfig)
                        }
                    }
                },
                custom: {
                }
            };
            controlPanelConfig.custom.zoomBySelectedArea = {
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

        //Don't show Bucketize icon
        /*
        if(chartConfig['doBucketize'] == true) {
            controlPanelConfig.custom.zoomReset = {
                iconClass: 'icon-remove-circle active',
                    title: 'Reset',
                events: {
                    click: function (event, self, controlPanelSelector) {
                        $(self).toggleClass('active');
                        $(self).removeClass('refreshing');
                        zoomOut({cfDataSource:chartView.attributes.viewConfig.cfDataSource});
                        $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                    }
                }
            }
        }*/
        /*
        if(chartConfig['doBucketize'] == true) {
            controlPanelConfig.custom.bucketize = {
                iconClass: 'icon-align-left active',
                    title: 'Bucketize',
                events: {
                    click: function (event, self, controlPanelSelector) {
                        $(self).toggleClass('active');
                        $(self).toggleClass('bucketize');
                        var viewConfig = chartView.attributes.viewConfig;
                        if($(self).hasClass('bucketize')) {
                            viewConfig['chartOptions']['doBucketize'] = true;
                        } else {
                            viewConfig['chartOptions']['doBucketize'] = false;
                        }
                        $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                        $(self).removeClass('refreshing');
                        chartView.renderChart(selector,viewConfig,chartView.model);
                    }
                }
            }
        }*/
        if(contrail.checkIfKeyExistInObject(true, chartOptions, 'controlPanelConfig.filter.enable') && chartOptions.controlPanelConfig.filter.enable) {
            controlPanelConfig.custom.filter = getControlPanelFilterConfig(chartOptions.controlPanelConfig.filter, chartControlPanelExpandedSelector, chartView.model,{
                cfDataSource:chartView.attributes.viewConfig.cfDataSource})
        }

        if(contrail.checkIfKeyExistInObject(true, chartOptions, 'controlPanelConfig.legend.enable') && chartOptions.controlPanelConfig.legend.enable) {
            controlPanelConfig.custom.legend = getControlPanelLegendConfig(chartOptions.controlPanelConfig.legend, chartControlPanelExpandedSelector)
        }

        return controlPanelConfig;
    };

    var getControlPanelFilterConfig = function(customControlPanelFilterConfig, chartControlPanelExpandedSelector, listModel,filterCfg) {
        var filterCfg = ifNull(filterCfg,{});
        var cfDataSource = filterCfg['cfDataSource'];
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
                        var controlPanelExpandedTemplate = contrail.getTemplate4Id(cowc.TMPL_CONTROL_PANEL_FILTER);

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
                                        if(cfDataSource == null) {
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
                                        } else {
                                            var itemCheckedLength = $('#control-panel-filter-group-items-' + groupValue.id).find('input:checked').length;
                                            if (itemCheckedLength == 0) {
                                                $('#control-panel-filter-group-items-' + groupValue.id).find('input').prop('checked', true);
                                            }
                                            var colorFilterFunc = getColorFilterFn($(this));
                                            if(cfDataSource != null) {
                                                cfDataSource.applyFilter('colorFilter',colorFilterFunc);
                                                cfDataSource.fireCallBacks({source:'chart'});
                                            }
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

                    event.stopPropagation();
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

                    event.stopPropagation();
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

    function constructTooltip(selfOffset, tooltipData, tooltipConfigCB, overlapMap, chartData,chartView) {
        var tooltipConfig = tooltipConfigCB(tooltipData),
            tooltipElementObj = generateTooltipHTML(tooltipConfig),
            tooltipElementKey = tooltipData['x'] + ',' + tooltipData['y'],
            overlappedElementsDropdownElement = null;

        destroyTooltip(null, overlappedElementsDropdownElement);
        $('body').append(tooltipElementObj);
        tooltipElementObj.addClass('zoomed-scatter-popover-tooltip');

        if (tooltipElementKey in overlapMap) {
            var overlappedElementData = $.map(overlapMap[tooltipElementKey], function (overlapMapValue, overlapMapKey) {
                var overlappedElementName = contrail.handleIfNull(chartData[overlapMapValue].name, '-'),
                    overlappedElementType = contrail.checkIfKeyExistInObject(true, tooltipConfig.content, 'overlappedElementConfig.dropdownTypeField') ?
                        ctwl.get(chartData[overlapMapValue][tooltipConfig.content.overlappedElementConfig.dropdownTypeField]) : null;

                if (!_.isEqual(chartData[overlapMapValue], tooltipData)) {
                    return {id: overlapMapValue, text: overlappedElementName + ((overlappedElementType !== null) ? ' (' + overlappedElementType + ')' : '')}
                }
                return null;
            });

            $(tooltipElementObj).find('.popover-tooltip-footer').append('<div class="overlapped-elements-dropdown"></div>');
            overlappedElementsDropdownElement = $(tooltipElementObj).find('.overlapped-elements-dropdown');

            overlappedElementsDropdownElement.contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'id',
                placeholder: 'View more (' + overlappedElementData.length + ')',
                defaultValueId: -1,
                dropdownCssClass: 'min-width-250',
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
                //Drill-down only if it's a bucket comprising of multiple nodes
                if(tooltipData['isBucket'] == true && getValueByJsonPath(tooltipData,'children',[]).length > 1) {
                    zoomIn({
                        d : tooltipData,
                        viewConfig : chartView.attributes.viewConfig,
                        cfDataSource : chartView.attributes.viewConfig.cfDataSource,
                        selector: chartView.$el
                    });
                } else {
                    actionCallback(tooltipData);
                }
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
            maxCircleRadius: 10,
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
            noDataMessage: chartOptions['noDataMessage'],
            doBucketize : chartOptions['doBucketize'],
            bubbleSizeFn: chartOptions['bubbleSizeFn'],
            defaultDataStatusMessage: true,
            statusMessageHandler: cowm.getRequestMessage
        };

        return chartViewConfig;
    };

    return ZoomScatterChartView;
});
