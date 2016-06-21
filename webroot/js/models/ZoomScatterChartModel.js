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

            if(chartConfig['doBucketize'] == true) {
                self.data = doBucketization(self.data,chartConfig);
            }
            chartData = JSON.parse(JSON.stringify(self.data));
            self.chartData = chartData;
            self.sizeFieldName = contrail.handleIfNull(chartConfig['sizeFieldName'], 'size');
            self.sizeMinMax = getSizeMinMax(self.data, self.sizeFieldName,chartConfig);

            d3Scale = d3.scale.linear().range([6, 10]).domain(self.sizeMinMax);
            if(chartConfig['doBucketize'] == true) {
                //All nodes have same size
                if(self.sizeMinMax[0] != self.sizeMinMax[1]) {
                    d3SizeScale = d3.scale.quantize().domain(self.sizeMinMax).range([6,7,8,9,10,11]);
                }
            }

            $.each(chartData, function (idx, chartDataPoint) {
                if(chartConfig['doBucketize'] == true) {
                    //In case of single-node,plot with default size (radius 6)
                    chartDataPoint['size'] = ((chartDataPoint['size'] == 0) || (self.chartData.length == 1)) ? 6 : d3SizeScale(chartDataPoint[self.sizeFieldName]);
                } else {
                    chartDataPoint['size'] = contrail.handleIfNaN(d3Scale(chartDataPoint[self.sizeFieldName]), 6);
                }
                // Add default color for the bubble if not already set
                chartDataPoint['color'] = chartDataPoint['color'] ? chartDataPoint['color']: "default";
            });

            self.width = chartConfig['width'] - margin.left - margin.right;
            self.height = chartConfig['height'] - margin.top - margin.bottom;

            if(chartConfig['doBucketize'] == true) {
                var chartOffset = 20;
                forceX = getAxisMinMaxForBucketization(chartData, chartConfig.xField, chartConfig.forceX);
                forceY = getAxisMinMaxForBucketization(chartData, chartConfig.yField, chartConfig.forceY);
                var xMin,xMax;
                //Keep 20px chart empty on either side such that nodes are not plotted on edges
                if(forceX[0] != forceX[1]) {
                    var xDiff = forceX[1] - forceX[0];
                    var domainRangePerPixel = xDiff/self.width;
                    var xDomainOffset = (domainRangePerPixel*chartOffset);
                    xMin = forceX[0]-xDomainOffset,xMax=forceX[1]+xDomainOffset;
                } else {
                    xMin = forceX[0] * .9;
                    xMax = forceX[0] * 1.1;
                }
                if(forceX[0] >= 0 && xMin < 0)
                    xMin = 0;
                forceX = [xMin,xMax];

                var yMin,yMax;
                if(forceY[0] != forceY[1]) {
                    var yDiff = forceY[1] - forceY[0];
                    var domainRangePerPixel = yDiff/self.height;
                    var yDomainOffset = (domainRangePerPixel*chartOffset);
                    yMin= forceY[0]-yDomainOffset,yMax=forceY[1]+yDomainOffset;
                } else {
                    yMin = forceY[0] * .9;
                    yMax = forceY[0] * 1.1;
                }
                if(forceY[0] >= 0 && yMin < 0)
                    yMin = 0;
                forceY = [yMin,yMax];
            } else {
                forceX = cowu.getForceAxis4Chart(chartData, chartConfig.xField, chartConfig.forceX);
                forceY = cowu.getForceAxis4Chart(chartData, chartConfig.yField, chartConfig.forceY);
            }

            self.xMin = forceX[0];
            self.xMax = forceX[1];

            self.yMin = forceY[0];
            self.yMax = forceY[1];

            //Round-off yMin/yMax to nearest 100
            /*self.yMin = self.yMin - (self.yMin%100)
            self.yMax = self.yMax + (100 - self.yMax%100)

            function decimalPlaces(num) {
            var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
            if (!match) { return 0; }
            return Math.max(
                0,
                // Number of digits right of decimal point.
                (match[1] ? match[1].length : 0)
                // Adjust for scientific notation.
                - (match[2] ? +match[2] : 0));
            }

            //Round-off xMin/xMax to 2 decimal
            if(d3.round(self.xMin,2) != d3.round(self.xMax,2)) {
                self.xMin = Math.min(self.xMin,d3.round(self.xMin,2));
                self.xMax = Math.max(d3.round(self.xMax,2),self.xMax);
            } else if(d3.round(self.xMin,3) != d3.round(self.xMax,3)) {
                self.xMin = Math.min(self.xMin,d3.round(self.xMin,3));
                self.xMax = Math.max(self.xMax,d3.round(self.xMax,3));
            } else if(d3.round(self.xMin,4) != d3.round(self.xMax,4)) {
                self.xMin = Math.min(d3.round(self.xMin,4),self.xMin);
                self.xMax = Math.max(d3.round(self.xMax,4),self.xMax);
            }*/

            self.xScale = d3.scale.linear().domain([self.xMin, self.xMax]).range([0, self.width]);
            self.yScale = d3.scale.linear().domain([self.yMin, self.yMax]).range([self.height, 0]);

            var scaleExtentRange = [1,4];
            if(chartConfig['doBucketize'] == true) {
                scaleExtentRange = [1,1];
            }
            self.zoomBehavior = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent(scaleExtentRange);

            self.maxColorFilterFields = d3.max(chartData, function (d) {
                return +d[chartConfig.colorFilterFields]
            });

            //Set tickFormat only if specified
            self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(10)
                .tickSize(-self.height)
                // .outerTickSize(0)
            if(chartConfig['doBucketize'] != true) {
                self.xAxis.tickFormat(chartConfig.xLabelFormat);
            } else if(chartConfig.xLabelFormat != null) {
                self.xAxis.tickFormat(chartConfig.xLabelFormat);
            }
            self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(5)
                .tickSize(-self.width)
                // .outerTickSize(0)
            if(chartConfig['doBucketize'] != true) {
                self.yAxis.tickFormat(chartConfig.yLabelFormat)
            } else if(chartConfig.yLabelFormat != null) {
                self.yAxis.tickFormat(chartConfig.yLabelFormat)
            }

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

    function getAxisMinMaxForBucketization(chartData, fieldName, forceAxis) {
        var axisMin = 0, axisMax;

        //If all nodes are closer,then adding 10% buffer on edges makes them even closer
        if(chartData.length > 0) {
            axisMax = d3.max(chartData, function (d) {
                    return +d[fieldName];
                });
            axisMin = d3.min(chartData, function (d) {
                    return +d[fieldName];
                });

            if (axisMax == null) {
                axisMax = 1;
            }

            if (axisMin == null) {
                axisMin = 0;
            } 

        } else {
            axisMax = 1;
            axisMin = 0;
        }

        if (forceAxis) {
            if (axisMin > forceAxis[0]) {
                axisMin = forceAxis[0];
            }

            if (axisMax < forceAxis[1]) {
                axisMax = forceAxis[1];
            }
        }

        return [axisMin, axisMax];
    };

    //Ensure the input data is not modified
    function doBucketization(data,chartOptions){
        // var data = $.extend(true,[],data);
        var retData = [];
        var minMax, minMaxX, minMaxY, parentMinMax, currLevel, maxBucketizeLevel, bucketsPerAxis,
            defaultBucketsPerAxis = 6;
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
                var xPartitions = [],yPartitions = [];
                $.each(d3.range(1,bucketsPerAxis),function(idx,obj) {
                   xPartitions.push(xBucketScale.invertExtent(obj)[0]);
                   yPartitions.push(yBucketScale.invertExtent(obj)[0]);
                });
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
                                //To Plot at center of bucket
                                // avgX = d3.mean(xBucketScale.invertExtent(parseInt(x)),function(d) { return d});
                                // avgY = d3.mean(yBucketScale.invertExtent(parseInt(y)),function(d) { return d});
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
                                //If bucket contains only one node,minX and maxX will be same
                                obj['minMaxX'] = d3.extent(buckets[x][y],function(obj)  {
                                    return obj['x'];
                                });
                                obj['minMaxY'] = d3.extent(buckets[x][y],function(obj) {
                                    return obj['y'];
                                });
                                // obj['minMaxX'] = xBucketScale.invertExtent(parseInt(x));
                                // obj['minMaxY'] = yBucketScale.invertExtent(parseInt(y));

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

    function getSizeMinMax(chartData, sizeFieldName,chartConfig) {
        //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
        var sizeMinMax, dValues;

        dValues = flattenList(chartData);

        sizeMinMax = getBubbleSizeRange(dValues, sizeFieldName,chartConfig);
        return sizeMinMax;
    }

    function getBubbleSizeRange(values, sizeFieldName,chartConfig) {
        var sizeMinMax = d3.extent(values, function (obj) {
            return  contrail.handleIfNaN(obj[sizeFieldName], 0)
        });
        if (sizeMinMax[0] == sizeMinMax[1]) {
            sizeMinMax = [sizeMinMax[0] * .9, sizeMinMax[0] * 1.1];
        } else {
            sizeMinMax = [sizeMinMax[0], sizeMinMax[1]];
            if(chartConfig['doBucketize'] == true) {
                //Ensure that Max is atleast 4 times Min
                // && Min value should not be 0 for this calculation.
                var validMinSize = sizeMinMax[0];
                if (validMinSize == 0) {
                    sortedValues = _.sortBy(values, 'size').filter(function (obj) {return obj[sizeFieldName] > 0});
                    validMinSize = sortedValues[0] != null ? (sortedValues[0]['size'] != null ? sortedValues[0]['size'] : 0) :0;
                }
                if((validMinSize * 4) > sizeMinMax[1])
                    sizeMinMax[1] = validMinSize * 4;
            }
        }
        return sizeMinMax;
    }

    return ZoomScatterChartModel;
});
