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
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        if(!this.renderChartInProgress) {
                            //TODO: We should render chart less often
                            self.renderChart(selector, viewConfig, self.model);
                        }
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, dataListModel) {
            this.renderChartInProgress = true;

            var data = dataListModel.getFilteredItems(),
                error = dataListModel.error,
                chartViewConfig, chartData, chartModel, chartOptions;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(selector, data);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            this.chartModel = new ScatterChartModel(chartData, chartOptions);
            chartModel = this.chartModel;

            if(dataListModel.isRequestInProgress()) {
                chartModel.noData(cowc.CHART_LOADING_MESSAGE);
            } else if(chartModel['noDataMessage']) {
                chartModel.noData(chartModel['noDataMessage']);
            } else if (error) {
                chartModel.noData(cowc.DATA_ERROR_MESSAGE);
            }

            $(selector).data('chart', chartModel);
            if ($(selector).find('svg').length == 0) {
                $(selector).append('<svg></svg>');
            }
            //Add color filter
            if(chartOptions['isBucketize']) {
                if($(selector).find('.color-selection').length == 0) {
                    $(selector).prepend($('<div/>', {
                            class: 'chart-settings'
                        }));
                    $(selector).find('.chart-settings').append(contrail.getTemplate4Id('color-selection'));
                }
            }
            //If scatterChart not initialized
            if(!isScatterChartInitialized(selector)) {
                addSelectorClickHandlers(selector,chartOptions,chartModel);
                nv.addGraph(function() {
                    if (!($(selector).is(':visible'))) {
                        $(selector).find('svg').bind("refresh", function () {
                            d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                        });
                    } else {
                        d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                    }
                    return chartModel;
                    },function() {
                        if(typeof(chartOptions['onInitializingScatterChart']) == 'function') {
                            chartOptions['onInitializingScatterChart']();
                        }
                        $(selector).data('initialized',true);
                    });
            } else {
                if (!($(selector).is(':visible'))) {
                    $(selector).find('svg').bind("refresh", function () {
                        d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                    });
                } else {
                    d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                }
            }

            nv.utils.windowResize(function () {
                updateChartOnResize(selector, chartModel);
            });
            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation, which resolves once the chart is rendered
            if (chartOptions['deferredObj'] != null) {
                chartOptions['deferredObj'].resolve();
            }

            $(selector).find('.loading-spinner').remove();
            this.renderChartInProgress = false;
        }
    });

    function getChartViewConfig(selector, initResponse) {
        var chartOptions = ifNull(initResponse['chartOptions'], {}),
            chartData;

        var origData = $.extend(true,{},initResponse);
        //TODO - move values to constants
        var xLbl = ifNull(initResponse['xLbl'], 'CPU (%)'),
            yLbl = ifNull(initResponse['yLbl'], 'Memory (MB)');
        var xLblFormat = ifNull(initResponse['xLblFormat'], d3.format()),
            yLblFormat = ifNull(initResponse['yLblFormat'], d3.format());
        var yDataType = ifNull(initResponse['yDataType'], '');
        var tooltipTimeoutId;

        if (initResponse['yLblFormat'] == null) {
            yLblFormat = function (y) {
                return parseFloat(d3.format('.02f')(y)).toString();
            };
        }

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

        //copying the xfield and yfield values to x and y in charts data
        $.each(dValues,function(idx,obj){
                if(obj['xField'] != null) {
                    obj['x'] = obj[obj['xField']];
                }
                if(obj['yField'] != null) {
                    obj['y'] = obj[obj['yField']];
                }
            });
        var totalBucketizedNodes = 0;
        isBucketize = (chartOptions['isBucketize'])? true: false;
        if(isBucketize){
            chartData = doBucketization(chartData,chartOptions);
            totalBucketizedNodes = getTotalBucketizedNodes(chartData);
            //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
            dValues = $.map(chartData,function(obj,idx) {
                return obj['values'];
            });
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
        chartOptions['multiTooltip'] = false; 
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
        //In case of multi-series,seriesMap is maintained to filter out the nodes from disabled series while showing overlapped nodes
        chartOptions['seriesMap'] = seriesType;
        var tooltipFn = chartOptions['tooltipFn'];
        var bucketTooltipFn = chartOptions['bucketTooltipFn'];
        chartOptions['tooltipFn'] = function (e, x, y, chart) {
            return constructScatterChartTooltip(e, x, y, chart, tooltipFn,bucketTooltipFn);
        };

        chartOptions['tooltipRenderedFn'] = function (tooltipContainer, e, chart) {
            var tooltipData = e.point,
                overlappedNodes = tooltipData['overlappedNodes'];

            initTooltipEvents(tooltipContainer, tooltipFn, tooltipData, overlappedNodes);
        }

        if (chartOptions['scatterOverlapBubbles']) {
            chartData = scatterOverlapBubbles(chartData);
        }

        chartOptions['sizeMinMax'] = sizeMinMax;

        chartOptions['stateChangeFunction'] = function (e) {
            //nv.log('New State:', JSON.stringify(e));
        };

        chartOptions['elementClickFunction'] = function (e) {
            // d3.event.stopPropagation();
            if(e['point']['isBucket']){
                zoomIn(e,selector);
            } else if(typeof(chartOptions['clickFn']) == 'function') {
                chartOptions['clickFn'](e['point']);
            } else {
                processDrillDownForNodes(e);
            }
        };

        chartOptions['elementDoubleClickFunction'] = function(e) {
            d3.event.stopPropagation();
        };

        chartOptions['elementDblClickFunction'] = function (e) {
            zoomOut(selector);
        };

        /*
         * chartOptions['elementMouseoutFn'] = function (e) {
         *     //In case of overlapped tooltip,clean-up the tooltip if tooltip containter doesn't get mouse foucs within 1500ms
         *     if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length > 1 && e['point']['isBucket'] != true) {
         *         if(tooltipTimeoutId != undefined)
         *             clearTimeout(tooltipTimeoutId);
         *         tooltipTimeoutId = setTimeout(function(){
         *             tooltipTimeoutId = undefined;  
         *             if(hoveredOnTooltip != true){
         *                 nv.tooltip.cleanup();
         *             }
         *             },1500);    
         *     } else
         *         nv.tooltip.cleanup();
         * };
         */
        chartOptions['elementMouseoverFn'] = function(e) {
            if(tooltipTimeoutId != undefined)
                clearTimeout(tooltipTimeoutId);
        }
        if (initResponse['hideLoadingIcon'] != false)
            $(this).parents('.widget-box').find('.icon-spinner').hide();
        chartOptions['useVoronoi'] = false;
        var d3SizeScale; 
        if(chartOptions['isBucketize']) {
            chartOptions['sizeDomain'] = [4,14];
            chartOptions['sizeRange'] = [4,14];
            if(sizeMinMax[0] != sizeMinMax[1]) {
                d3SizeScale = d3.scale.quantize().domain(chartOptions['sizeMinMax']).range([6,7,9,10,11,12]);
            }
        }
        else
            d3SizeScale = d3.scale.linear().range([6,6]).domain(chartOptions['sizeMinMax']);
        if(isBucketize) {
            $.each(chartData,function(idx,currSeries) {
                currSeries['values'] = $.each(currSeries['values'],function(idx,obj) {
                        obj = $.extend(obj, {
                            multiTooltip: true,
                            size: (obj['size'] == 1) ? 6 : d3SizeScale(obj['size'])
                        });
                    });
            });
        }
        if(isBucketize) {
            //Bind drag event once scatterChart initialized
            function onInitializingScatterChart() {
                addScatterChartDragHandler(selector);
            }
            chartOptions['onInitializingScatterChart'] = onInitializingScatterChart;
        }

        if(!isScatterChartInitialized(selector)) {
            if (initResponse['loadedDeferredObj'] != null) {
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
            }
            if(chartOptions['deferredObj'] != null && chartOptions['deferredObj'].state() == 'pending') {
                chartOptions['deferredObj'].done(function(){
                    var settings = [];
                    if(chartOptions['xAxisParams'] != null) { 
                        settings.push({id:'xAxisParams',lbl:'X-Axis'});
                    }
                    if(chartOptions['yAxisParams'] != null) {
                        settings.push({id:'yAxisParams',lbl:'Y-Axis'});
                    }
                    if(chartOptions['showSettings'] && $(selector).parent('div').find('.chart-settings').length == 0) {
                        $(selector).parent('div').prepend(contrail.getTemplate4Id('chart-settings')(settings));
                        showAxisParams(selector,settings);
                    }
                });
            }
            var chartid = $(selector).attr('id');
            $("#"+ chartid).data('origData',origData);
        } else {
                var chart = $(selector).data('chart');
                var svg = $(selector).find('svg')[0];
                chart = setChartOptions(chart,chartOptions);
                d3.select(svg).datum(chartData);
                if(chart.update != null)
                    chart.update();
        }
        var chartid = $(selector).attr('id');
        if (initResponse['widgetBoxId'] != null)
            endWidgetLoading(initResponse['widgetBoxId']);

        return {selector: selector, chartData: chartData, chartOptions: chartOptions};
    };

    function addSelectorClickHandlers(selector,chartOptions,chartModel) {
        d3.select($(selector).find('svg')[0]).on('dblclick',
        function() {
            chartOptions['elementDblClickFunction']();
        });

        /****
        * Selection handler for color filter in chart settings panel
        ****/
        $(selector).on('click','.chart-settings .color-selection .circle',function() {
            //Get the chart handle
            var chart = chartModel; 
            var svgElem = d3.select($(selector).find('svg')[0]);
            var data = svgElem.datum();
            var currElem = $(this);

            //Add color filter
            var selectedColorElems = $(this).siblings('.circle.filled');
            var selColors = [];
            $.each(selectedColorElems,function(idx,obj) {
                $.each(d3Colors,function(currColorName,currColorCode) {
                    if($(obj).hasClass(currColorName)) {
                        if(selColors.indexOf(currColorName) == -1)
                            selColors.push(currColorCode);
                    }
                });
            });
            //Add current color
            if($(this).hasClass('filled') == false) {
                selColors.push(d3Colors[$(this).data('color')]);
            }
            var colorFilterFunc = function(d) {
                return selColors.indexOf(d) > -1;
            }
            if(chartOptions['crossFilter'] != null) {
                filterUsingGlobalCrossFilter(chartOptions['crossFilter'],null,null,colorFilterFunc);
            }
            $(this).toggleClass('filled');
        });
    }

    function addScatterChartDragHandler(selector) {
        //Will be set to true on pressing "Esc" key
        var cancelDragEvent;

        //drag support
        d3.select($(selector)[0]).select('svg').call(dragSrc
            .on('dragstart',function(d,i) {
                console.info('dragstart');
                d.dx = 0;
                d.dy = 0;
            })
            .on("drag", function(d, i){
                cancelDragEvent = false;
                d.x  = d3.event.x;
                d.y = d3.event.y;
                if(d.dx == null) {
                    d.dx = 0
                }   
                if(d.dy == null) {
                    d.dy = 0
                }                     
                d.dx += d3.event.dx;
                d.dy -= d3.event.dy;
                if(d3.select($(selector)[0]).select('#rect1')[0][0] != null) {
                    $('#rect1').remove();
                }
                var offsetX = d.offsetX, offsetY = d.offsetY, xMirror = 1 , yMirror = 1;                     
                //If dragging left-side
                if(d.dx < 0) {
                    offsetX = -d.offsetX;
                    xMirror = -1;
                }
                if(d.dy > 0) {
                    offsetY = -d.offsetY;
                    yMirror = -1;
                }                   
                
                d3.select($(selector)[0]).select('svg').append('rect').attr('id','rect1')
                .attr('x', offsetX)
                .attr('y',offsetY)
                .attr('width',Math.abs(d.dx))
                .attr('height',Math.abs(d.dy))
                .attr('style',"stroke:lightgrey;stroke-width:2;fill:lightgrey;fill-opacity:0.5;")
                .attr('transform', 'scale(' + xMirror + ',' + yMirror +')');
            })
            .on("dragend", function(d,i){
                    if(d3.select($(selector)[0]).select('#rect1')[0][0] != null) {
                        $('#rect1').remove();
                    }                
                    if(cancelDragEvent == true) {
                        cancelDragEvent = false;
                        $('#rect1').remove();
                        return;
                    }
                    if(d.dx == 0 && d.dy == 0) {
                        $('#rect1').remove();
                        return;
                    }
                    d.offsetX = d.offsetX - 75;
                    d.offsetY = d.offsetY - 30;
                    var minMaxX = [];
                    var xValue1 = $(selector).data('chart').scatter.xScale().invert(d.offsetX);
                    var xValue2 = $(selector).data('chart').scatter.xScale().invert(d.offsetX + d.dx);
                    minMaxX[0] = Math.min(xValue1, xValue2);
                    minMaxX[1] = Math.max(xValue1, xValue2);
                    var minMaxY = [];
                    var yValue1 = $(selector).data('chart').scatter.yScale().invert(d.offsetY);
                    var yValue2 = $(selector).data('chart').scatter.yScale().invert(d.offsetY - d.dy);
                    minMaxY[0] = Math.min(yValue1, yValue2);
                    minMaxY[1] = Math.max(yValue1, yValue2);
                    //adjust min and max values to include missed bubbles
                    var combinedValues = [];
                    $.each(d,function(idx,obj){
                        $.each(obj.values,function(currIdx,item){
                            //Include all nodes whose center position falls within the dragged region
                            if(item.x >= minMaxX[0] && item.x <= minMaxX[1]
                                && item.y >= minMaxY[0] && item.y <= minMaxY[1]) {
                                combinedValues.push(item);
                            }
                        });
                    });
                    //If there is no node within dragged selection,ignore
                    if(combinedValues.length == 0) {
                        return;
                    }
                    //To align drag selection with bucket min/max values
                    var finalMinX = d3.extent(combinedValues,function(obj){
                        if(obj['isBucket']) 
                            return obj['minMaxX'][0]; 
                        else 
                            return ifNull(obj['origX'],obj['x']);
                    });
                    minMaxX[0] = finalMinX[0];
                    var finalMaxX = d3.extent(combinedValues,function(obj){
                        if(obj['isBucket']) 
                            return obj['minMaxX'][1];
                        else 
                            return  ifNull(obj['origX'],obj['x']);
                    });
                    minMaxX[1] = finalMaxX[1]; 
                    var finalMinY = d3.extent(combinedValues,function(obj){
                        if(obj['isBucket']) 
                            return obj['minMaxY'][0]; 
                        else 
                            return  ifNull(obj['origY'],obj['y']);
                    });
                    minMaxY[0] = finalMinY[0];
                    var finalMaxY = d3.extent(combinedValues,function(obj){
                        if(obj['isBucket']) 
                            return obj['minMaxY'][1]; 
                        else 
                            return  ifNull(obj['origY'],obj['y']);
                    });
                    minMaxY[1] = finalMaxY[1];
                    d.dx = 0;
                    d.dy = 0;
                    zoomIn({point: {minMaxX:minMaxX,minMaxY:minMaxY}},selector);
            })
        ).on('mousedown', function(d){
            d.offsetX = d3.event.offsetX;
            d.offsetY = d3.event.offsetY;
        })
        d3.select('body').on('keyup', function(d) {
            if(d3.event.keyCode == 27) cancelDragEvent = true;
        });
    }
    /*
     * Start: Bucketization functions
     */
    /** Given node obj to disperse use the x and y values and size to randomly add minute values 
    * to x and y so that the nodes appear dispersed instead of a single node. */
    function disperseRandomly(nodes,maxVariation){
        for(var i=0;i < nodes.length; i++){
            var x = $.isNumeric(nodes[i]['x']) ? nodes[i]['x'] : 0;
            var y = $.isNumeric(nodes[i]['y']) ? nodes[i]['y'] : 0;
            //In case of random scatter,assign size as 1 as each node is plotted independently
            nodes[i]['size'] = 1;
            var newX = getRandomValue(x - (x* maxVariation), x + (x* maxVariation)); 
            var newY = getRandomValue(y - (y* maxVariation), y + (y* maxVariation));
            nodes[i]['origX'] = x;
            nodes[i]['origY'] = y;
            nodes[i]['x'] = newX;
            nodes[i]['y'] = newY;
        }
        return nodes;
    }

    function disperseNodes(obj){
        var retNodes = []
        if(obj != null && obj['isBucket']){
            retNodes = obj['children'];
            retNodes = disperseRandomly(retNodes,0.05);
        }
        return retNodes;
    }

    function filterAndDisperseNodes(data,minMaxX,minMaxY){   
        var ret = data;
        ret = disperseRandomly(data,0.05);
        return ret;
    }

    function concatenateDataFromMultipleSeries(d) {
        var combinedValues = [];
        $.each(d,function(idx,obj){
            combinedValues = combinedValues.concat(obj.values);
        });
        return combinedValues;
    }

    function doBucketization(data,chartOptions){
        var data = $.extend(true,[],data);
        var minMax, minMaxX, minMaxY, parentMinMax, currLevel, maxBucketizeLevel, bucketsPerAxis;
        var bucketOptions = chartOptions.bucketOptions;
        if(chartOptions.bucketOptions != null) {
            currLevel = bucketOptions.currLevel;
            minMax = bucketOptions.minMax;
            //maxBucketizeLevel = bucketOptions.maxBucketizeLevel;
            parentMinMax = bucketOptions.parentMinMax;
            //bucketsPerAxis = bucketOptions.bucketsPerAxis;
        } else {
            currLevel = 0;
        }

        maxBucketizeLevel = (!getCookie(BUCKETIZE_LEVEL_COOKIE))? defaultMaxBucketizeLevel : parseInt(getCookie(BUCKETIZE_LEVEL_COOKIE));
        bucketsPerAxis = (!getCookie(BUCKETS_PER_AXIS_COOKIE))? defaultBucketsPerAxis : parseInt(getCookie(BUCKETS_PER_AXIS_COOKIE));

        if (data != null) {
            var combinedValues = concatenateDataFromMultipleSeries(data);
            minMaxX = d3.extent(combinedValues,function(obj){
                return obj['x'];
            });
            minMaxY = d3.extent(combinedValues,function(obj){
                return obj['y'];
            });
            //set forceX and  forceY to fix the axes boundaries
            chartOptions.forceX = minMaxX;
            chartOptions.forceY = minMaxY;        
            if(parentMinMax == null){
                parentMinMax = [];
            }
            var xDomainDiff = minMaxX[1]-minMaxX[0];
            var yDomainDiff = minMaxY[1]-minMaxY[0];
            //Heuristics to decide whether bucketization is needed
            // 1. If maxX/minX < 5%
            // 2. If maxY/minY < 5%
            // 3. No of nodes < 10
            // 4. Nodes having only non-numeric x/y values i.e xDomainDiff/yDomainDiff is null
            if(Math.abs(xDomainDiff/minMaxX[1]*100) < 5 || Math.abs(yDomainDiff/minMaxY[1]*100) < 5
                || combinedValues.length < 10
                || !$.isNumeric(yDomainDiff) || !$.isNumeric(xDomainDiff)) {
                // chartOptions['addDomainBuffer'] = false;
                //Max level of bucketization has reached now just disperse the nodes randomly in space
                for(var i = 0;i < data.length; i++ ) {
                    data[i]['values'] = filterAndDisperseNodes(data[i]['values'],minMaxX,minMaxY); 
                }
            } else {
                /* Bucketize based on d3Scale */
                var xBucketScale = d3.scale.quantize().domain(minMaxX).range(d3.range(1,bucketsPerAxis));
                var yBucketScale = d3.scale.quantize().domain(minMaxY).range(d3.range(1,bucketsPerAxis));
                $.each(data,function(idx,currSeries) {
                    var buckets = {};
                    //Group nodes into buckets
                        $.each(currSeries['values'],function(idx,obj) {
                        var xBucket = xBucketScale(obj['x']);
                        var yBucket = yBucketScale(obj['y']);
                        if(buckets[xBucket] == null) {
                            buckets[xBucket] = {};
                        }
                        if(buckets[xBucket][yBucket] == null) {
                            buckets[xBucket][yBucket] = [];
                        }
                        buckets[xBucket][yBucket].push(obj);
                    });
                    data[idx]['values'] = [];
                    //Nodes that don't have numeric x & y values and those will be plotted at intersection of axis 
                    var nonXYNodes = [];
                    //Merge all nodes in a single bucket to a single node
                    $.each(buckets,function(x,xBuckets) {
                        $.each(buckets[x],function(y,bucket) {
                            if(buckets[x][y] != null && buckets[x][y] instanceof Array) {
                                if($.isNumeric(x) && $.isNumeric(y)) {
                                    var obj = {};
                                    avgX = d3.mean(buckets[x][y],function(d){return d.x});
                                    avgY = d3.mean(buckets[x][y],function(d){return d.y});
                                    obj['x'] = avgX;
                                    obj['y'] = avgY;
                                    obj['size'] = buckets[x][y].length;
                                    if(buckets[x][y].length > 1) {
                                        obj['isBucket'] = true;
                                        obj['stroke'] = 'black';
                                    } else {
                                        obj['isBucket'] = false;
                                        obj['name'] = buckets[x][y][0]['name'];
                                    }
                                    buckets[x][y].sort(dashboardUtils.sortNodesByColor);
                                    var nodeCnt = buckets[x][y].length;
                                    obj['color'] = buckets[x][y][nodeCnt-1]['color'];
                                    obj['clickFn'] = 'processBucket';
                                    // obj['minMaxX'] = xBucketScale.invertExtent(parseInt(x));
                                    // obj['minMaxY'] = yBucketScale.invertExtent(parseInt(y));
                                    obj['minMaxX'] = d3.extent(buckets[x][y],function(obj)  {
                                        return obj['x'];
                                    });
                                    obj['minMaxY'] = d3.extent(buckets[x][y],function(obj) {
                                        return obj['y'];
                                    });
                                    // obj['minMaxX'] = $.map(obj['minMaxX'],function(value,idx) {
                                    //     return parseFloat(value.toFixed(4));
                                    // });
                                    // obj['minMaxY'] = $.map(obj['minMaxY'],function(value,idx) {
                                    //     return parseFloat(value.toFixed(4));
                                    // });

                                    obj['children'] = buckets[x][y];
                                    data[idx]['values'].push(obj);
                                } else {
                                    nonXYNodes = nonXYNodes.concat(buckets[x][y]);
                                }
                            }
                        });
                    });
                    //Nodes with non-x/y values
                    if(nonXYNodes.length > 0) {
                            data[idx]['values'].push({
                            size:nonXYNodes.length,
                            color:nonXYNodes[0]['color'],
                            stroke: 'black',
                            isBucket: true,
                            children:nonXYNodes
                        });
                    }
                });
            }
        }
        return data;
    }

    /** Counts the total no. of nodes including the nodes in the buckets */
    function getTotalBucketizedNodes(d) {
        var totalBucketizedNodes = 0;
        $.each(concatenateDataFromMultipleSeries(d),function(j,obj){
            if(obj['isBucket']){
                // add the count if its a bucket
                totalBucketizedNodes += obj['size'];
            } else {
                // add 1 if its a single node
                totalBucketizedNodes += 1;
            }
        });
        return totalBucketizedNodes;
    }
    /*
     * End: Bucketization fucntions
     */


    var initTooltipEvents = function (tooltipContainer, tooltipFn, tooltipData, overlappedNodes) {
        var overlappedElementsDropdownElement = null

        $(tooltipContainer).css('pointer-events', 'all');
        $(tooltipContainer).addClass('nvtooltip-popover');

        if (overlappedNodes != undefined && overlappedNodes.length > 1) {
            var overlappedElementData = $.map(overlappedNodes, function(nodeValue, nodeKey) {
                if (tooltipData.name != nodeValue.name) {
                    return {id: nodeKey, text: nodeValue.name}
                }
                return null;
            });

            $(tooltipContainer).find('.popover-tooltip-footer').append('<div class="overlapped-elements-dropdown"></div>')
            overlappedElementsDropdownElement = $(tooltipContainer).find('.overlapped-elements-dropdown');

            overlappedElementsDropdownElement.contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'id',
                placeholder: 'View more (' + overlappedElementData.length + ')',
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

        $(window).on('popstate', function (event) {
            nv.tooltip.cleanup();
        });
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
        if(e['point']['isBucket']) {
            if(typeof(bucketTooltipFn) == "function"){
                tooltipContents = bucketTooltipFn(e['point']);
            }
        } else if(contrail.checkIfFunction(tooltipFormatFn)) {
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
