/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ZoomScatterChartModel = function (dataListModel, chartConfig) {
        var self = this, forceX = chartConfig.forceX,
            forceY = chartConfig.forceY, margin = chartConfig.margin,
            chartData, d3Scale;

        self.margin = margin;
        self.noDataMessage = chartConfig['noDataMessage'];

        self.classes = ['error', 'warning', 'medium', 'okay', 'default'];

        self.loadedFromCache = dataListModel.loadedFromCache;

        self.isRequestInProgress = function() {
            return dataListModel.isRequestInProgress()
        };

        self.isPrimaryRequestInProgress = function() {
            return dataListModel.isPrimaryRequestInProgress()
        };

        self.isError = function() {
            if (contrail.checkIfExist(dataListModel.error) && dataListModel.error === true && dataListModel.errorList.length > 0) {
                var xhr = dataListModel.errorList[0];
                if(!(xhr.status === 0 && xhr.statusText === 'abort')) {
                    return true;
                }
            }
            return false;
        };

        self.isEmpty = function() {
            if (contrail.checkIfExist(dataListModel.empty)) {
                return (dataListModel.empty) ? true : ((dataListModel.getFilteredItems().length == 0) ? true : false);
            }
            return false;
        };

        self.refresh = function(chartConfig) {
            var rawData = dataListModel.getFilteredItems();
            self.data = contrail.checkIfFunction(chartConfig['dataParser']) ? chartConfig['dataParser'](rawData) : rawData;

            if(chartConfig['doBucketize'] == true)
                self.data = doBucketization(self.data,chartConfig);
            chartData = $.extend(true,[],self.data);
            self.chartData = chartData;
            self.sizeFieldName = contrail.handleIfNull(chartConfig['sizeFieldName'], 'size');
            self.sizeMinMax = getSizeMinMax(self.data, self.sizeFieldName);

            d3Scale = d3.scale.linear().range([6, 10]).domain(self.sizeMinMax);
            if(chartConfig['doBucketize'] == true) {
                //All nodes have same size
                if(self.sizeMinMax[0] != self.sizeMinMax[1]) {
                    d3SizeScale = d3.scale.quantize().domain(self.sizeMinMax).range([6,7,9,10,11,12]);
                }
            }

            $.each(chartData, function (idx, chartDataPoint) {
                if(chartConfig['doBucketize'] == true) {
                    chartDataPoint['size'] = (chartDataPoint['size'] == 0) ? 6 : d3SizeScale(chartDataPoint[self.sizeFieldName]);
                } else {
                    chartDataPoint['size'] = contrail.handleIfNaN(d3Scale(chartDataPoint[self.sizeFieldName]), 6);
                }
                // Add default color for the bubble if not already set
                chartDataPoint['color'] = chartDataPoint['color'] ? chartDataPoint['color']: "default";
            });

            self.width = chartConfig['width'] - margin.left - margin.right;
            self.height = chartConfig['height'] - margin.top - margin.bottom;

            forceX = cowu.getForceAxis4Chart(chartData, chartConfig.xField, chartConfig.forceX);
            forceY = cowu.getForceAxis4Chart(chartData, chartConfig.yField, chartConfig.forceY);

            self.xMin = forceX[0];
            self.xMax = forceX[1];

            self.yMin = forceY[0];
            self.yMax = forceY[1];

            self.xScale = d3.scale.linear().domain([self.xMin, self.xMax]).range([0, self.width]);
            self.yScale = d3.scale.linear().domain([self.yMin, self.yMax]).range([self.height, 0]);

            self.zoomBehavior = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 4]);

            self.maxColorFilterFields = d3.max(chartData, function (d) {
                return +d[chartConfig.colorFilterFields]
            });

            //Set tickFormat only if specified
            self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(10)
                .tickSize(-self.height)
            if(chartConfig.xLabelFormat != null)
                self.xAxis.tickFormat(chartConfig.xLabelFormat);
            self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(5)
                .tickSize(-self.width)
            if(chartConfig.yLabelFormat)
                self.yAxis.tickFormat(chartConfig.yLabelFormat)

            self.xMed = median(_.map(chartData, function (d) {
                return d[chartConfig.xField];
            }));

            self.yMed = median(_.map(chartData, function (d) {
                return d[chartConfig.yField];
            }));
        };

        self.refresh(chartConfig);

        return self;
    };

    /*
     * Start: Bucketization functions
     */

    function doBucketization(data,chartOptions){
        var data = $.extend(true,[],data);
        var retData = [];
        var minMax, minMaxX, minMaxY, parentMinMax, currLevel, maxBucketizeLevel, bucketsPerAxis,
            defaultBucketsPerAxis = 4;
        // var bucketOptions = chartOptions.bucketOptions;
        // if(chartOptions.bucketOptions != null) {
        //     currLevel = bucketOptions.currLevel;
        //     minMax = bucketOptions.minMax;
        //     //maxBucketizeLevel = bucketOptions.maxBucketizeLevel;
        //     parentMinMax = bucketOptions.parentMinMax;
        //     //bucketsPerAxis = bucketOptions.bucketsPerAxis;
        // } else {
        //     currLevel = 0;
        // }

        // var chartOptions = {};
        // maxBucketizeLevel = (!getCookie(BUCKETIZE_LEVEL_COOKIE))? defaultMaxBucketizeLevel : parseInt(getCookie(BUCKETIZE_LEVEL_COOKIE));
        // bucketsPerAxis = (!getCookie(BUCKETS_PER_AXIS_COOKIE))? defaultBucketsPerAxis : parseInt(getCookie(BUCKETS_PER_AXIS_COOKIE));
        bucketsPerAxis = defaultBucketsPerAxis;

        if (data != null) {
            var combinedValues = data;
            var cf = crossfilter(data),
                xDim = cf.dimension(function(d) { return d.x;}),
                yDim = cf.dimension(function(d) { return d.y;});



            minMaxX = d3.extent(combinedValues,function(obj){
                return obj['x'];
            });
            minMaxY = d3.extent(combinedValues,function(obj){
                return obj['y'];
            });
            // minMaxX = [xDim.top(1),xDim.bottom(1)];
            // minMaxY = [yDim.top(1),yDim.bottom(1)];
            //set forceX and  forceY to fix the axes boundaries
            chartOptions.forceX = minMaxX;
            chartOptions.forceY = minMaxY;
            // if(parentMinMax == null){
            //     parentMinMax = [];
            // }
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
                    retData = data;
            } else {
                /* Bucketize based on d3Scale */
                var xBucketScale = d3.scale.quantize().domain(minMaxX).range(d3.range(1,bucketsPerAxis));
                var yBucketScale = d3.scale.quantize().domain(minMaxY).range(d3.range(1,bucketsPerAxis));
                var buckets = {};
                //Group nodes into buckets
                $.each(data,function(idx,obj) {
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
                                if(typeof(chartOptions['bubbleSizeFn']) == 'function') {
                                    obj['size'] = chartOptions['bubbleSizeFn'](buckets[x][y]);
                                } else {
                                    obj['size'] = buckets[x][y].length;
                                }
                                //Show overlapped nodes with black storke
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
                                //If bucket contains only one node,minX and maxX will be same
                                obj['minMaxX'] = d3.extent(buckets[x][y],function(obj)  {
                                    return obj['x'];
                                });
                                obj['minMaxY'] = d3.extent(buckets[x][y],function(obj) {
                                    return obj['y'];
                                });

                                obj['children'] = buckets[x][y];
                                retData.push(obj);
                            } else {
                                nonXYNodes = nonXYNodes.concat(buckets[x][y]);
                            }
                        }
                    });
                });
                //Nodes with non-x/y values
                if(nonXYNodes.length > 0) {
                        retData.push({
                        size:typeof(chartOptions['bubbleSizeFn']) == 'function' ? chartOptions['bubbleSizeFn'](nonXYNodes) : nonXYNodes.length,
                        color:nonXYNodes[0]['color'],
                        stroke: 'black',
                        isBucket: true,
                        children:nonXYNodes
                    });
                }
            }
        }
        return retData;
    }

    /*
     * End: Bucketization fucntions
     */

    function median(values) {
        values.sort(function (a, b) {
            return a - b;
        });
        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];
        else
            return (parseFloat(values[half - 1]) + parseFloat(values[half])) / 2.0;
    };

    function getSizeMinMax(chartData, sizeFieldName) {
        //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
        var sizeMinMax, dValues;

        dValues = flattenList(chartData);

        sizeMinMax = getBubbleSizeRange(dValues, sizeFieldName);
        return sizeMinMax;
    }

    function getBubbleSizeRange(values, sizeFieldName) {
        var sizeMinMax = d3.extent(values, function (obj) {
            return  contrail.handleIfNaN(obj[sizeFieldName], 0)
        });
        if (sizeMinMax[0] == sizeMinMax[1]) {
            sizeMinMax = [sizeMinMax[0] * .9, sizeMinMax[0] * 1.1];
        } else {
            sizeMinMax = [sizeMinMax[0], sizeMinMax[1]];
        }
        return sizeMinMax;
    }

    return ZoomScatterChartModel;
});
