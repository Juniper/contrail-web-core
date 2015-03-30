/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

d3.scale.category5 = function () {
    return d3.scale.ordinal().range(d3_category5);
};

d3.scale.category2 = function () {
    return d3.scale.ordinal().range(d3_category2);
};

var d3_category2 = [ "#1f77b4", "#2ca02c"];

var d3_category5 = [ '#1f77b4', '#6baed6' , '#ff7f0e', '#2ca02c', '#9e9ac8'];

function chartHandler(dataUrl, methodType, postData, customInitHandler, dataParser, successCallBack, failureCallback, cacheEnabled, callbackParams, reqTimeOut) {
    var selector = callbackParams.selector, ajaxConfig = {};

    ajaxConfig['url'] = dataUrl;
    ajaxConfig['type'] = methodType;
    ajaxConfig['data'] = postData;
    ajaxConfig['cache'] = cacheEnabled;
    ajaxConfig['timeout'] = reqTimeOut;

    var initHandler = function() {
        if (typeof window[customInitHandler] === "function") {
            window[customInitHandler](callbackParams);
        } else {
            defaultChartInitHandler(callbackParams);
        }
    };

    var successHandler = function(response) {
        if (typeof window[dataParser] === "function") {
            var chartData = window[dataParser](response, callbackParams)
        } else {
            chartData = response;
        }
        endWidgetLoading($(selector).attr("id"));
        $(callbackParams.selector).empty();
        if (typeof window[successCallBack] === "function") {
            window[successCallBack](chartData, callbackParams);
        } else {
            defaultChartSuccessCallback(chartData, callbackParams);
        }
    };

    var failureHandler = function(response) {
        endWidgetLoading($(selector).attr("id"));
        if (response.responseText && response.responseText != "") {
            showInfoWindow(response.responseText, response.statusText);
        }
        if ((typeof(failure) != "undefined") && (typeof window[failure] === "function")) {
            window[failureCallback](response, cbParams);
        } else {
            defaultChartFailureCallback(response, callbackParams);
        }
    };

    contrail.ajaxHandler(ajaxConfig, initHandler, successHandler, failureHandler);
};

function defaultChartSuccessCallback(response, cbParams) {
    // TODO
}

function defaultChartFailureCallback(response, cbParams) {
    // TODO
}

function defaultChartInitHandler(cbParams) {
    var selector = cbParams.selector;
    startWidgetLoading($(selector).attr("id"));
}

function createD3MemCPUChart(selector, url, options) {
    var cbParams = {selector:selector, options:options};
    chartHandler(url(), "GET", null, null, options.parser, "successHandlerLineChart", null, false, cbParams, 310000);
}

function createD3SparkLines(selector, data, dataParser, propertyNames, slConfig) {
    var property, parentId;
    parentId = $(selector).attr('id');
    if (typeof window[dataParser] === "function") {
        var slineData = window[dataParser](data, propertyNames, slConfig);
        for (property in slineData) {
            try {
                drawSparkLine(parentId, property + '_sparkline', slineData[property].color, slineData[property].data);
            } catch (error) {
                console.log(error.stack);
            }
        }
    }
}

function successHandlerLineChart(data, cbParams) {
    var boxId = $(cbParams.selector).attr("id") + '-box';
    var selectorId = cbParams.options.lineChartId;
    var options = cbParams.options;
    if ($('#' + boxId).is(':visible')) {
        onClickLineChart(data, cbParams);
    }
    $('#' + selectorId).addClass('cursor-pointer');
    $('#' + selectorId).click(function () {
        toggleWidgetsVisibility(options.showWidgetIds, options.hideWidgetIds);
        onClickLineChart(data, cbParams)
    });
};

function onClickLineChart(data, cbParams) {
    var selectorId = $(cbParams.selector).attr("id"), property;
    $('#' + selectorId).empty();
    for (property in data) {
        var elementId = property + "-chart";
        cbParams.selector.append("<div id='" + elementId + "'></div>");
        if (property == 'cpu') {
            initCPULineChart("#" + selectorId + " #" + elementId, data[property]['ds'], cbParams.options);
        } else {
            initMemoryLineChart("#" + selectorId + " #" + elementId, data[property]['ds'], cbParams.options);
        }
    }
}

function parseProcessMemCPUData(response, cbParams) {
    var flowSeries = response['flow-series'];
    var titles = cbParams.options.titles;
    var data = {}, time, cpuDS = [], memDS = [], startTime, endTime;
    startTime = parseInt(getValueByJsonPath(response,'summary;start_time'));
    endTime = parseInt(getValueByJsonPath(response,'summary;end_time'));
    if (flowSeries.length == 1) {
        addMemCPU2DS4Process(startTime, flowSeries[0], cpuDS, memDS);
        addMemCPU2DS4Process(endTime, flowSeries[0], cpuDS, memDS);
    } else {
        for (var i = 0; i < flowSeries.length; i++) {
            time = parseInt(flowSeries[i]['MessageTS']);
            addMemCPU2DS4Process(time, flowSeries[i], cpuDS, memDS);
        }
        if (time < endTime && flowSeries.length > 0) {
            addMemCPU2DS4Process(endTime, flowSeries[flowSeries.length - 1], cpuDS, memDS);
        }
    }
    data['cpu'] = {ds:[
        {values:cpuDS, key:titles.cpuTitle, color:d3_category2[0]}
    ]};
    data['memory'] = {ds:[
        {values:memDS, key:titles.memTitle, color:d3_category2[1]}
    ]};
    return data;
};

function addMemCPU2DS4Process(time, dataRecord, cpuDS, memDS) {
    var cpuShare = getValueByJsonPath(dataRecord,'cpuData;cpu_share');
    if (cpuShare != null && cpuShare != "-") {
        try {
            cpuShare = parseFloat(cpuShare);
            cpuDS.push({x:time, y:cpuShare});
        } catch (error) {
            // Ignore
        }
    }
    var resMemory = getValueByJsonPath(dataRecord,'memData;memInfo;res');
    if (resMemory != null && resMemory != "-") {
        try {
            resMemory = parseInt(resMemory);
            memDS.push({x:time, y:resMemory});
        } catch (error) {
            // Ignore
        }
    }
}

function parseSystemMemCPUData(response, cbParams) {
    var flowSeries = response['flow-series'];
    var titles = cbParams.options.titles;
    var data = {}, time, cpuDS = [], memDS = [];
    var startTime = parseInt(getValueByJsonPath(response,'summary;start_time'));
    var endTime = parseInt(getValueByJsonPath(response,'summary;end_time'));
    if (flowSeries.length == 1) {
        addMemCPU2DS4System(startTime, flowSeries[0], cpuDS, memDS);
        addMemCPU2DS4System(endTime, flowSeries[0], cpuDS, memDS);
    } else {
        for (var i = 0; i < flowSeries.length; i++) {
            time = parseInt(flowSeries[i]['MessageTS']);
            addMemCPU2DS4System(time, flowSeries[i], cpuDS, memDS);
        }
        if (time < endTime && flowSeries.length > 0) {
            addMemCPU2DS4System(endTime, flowSeries[flowSeries.length - 1], cpuDS, memDS);
        }
    }
    data['cpu'] = {ds:[
        {values:cpuDS, key:titles.cpuTitle, color:d3_category2[0]}
    ]};
    data['memory'] = {ds:[
        {values:memDS, key:titles.memTitle, color:d3_category2[1]}
    ]};
    return data;
};

function addMemCPU2DS4System(time, dataRecord, cpuDS, memDS) {
    var avgCPU = getValueByJsonPath(dataRecord,'cpuData;cpuLoadAvg;one_min_avg');
    if (avgCPU != null && avgCPU != "-") {
        try {
            avgCPU = parseFloat(avgCPU);
            cpuDS.push({x:time, y:avgCPU});
        } catch (error) {
            // Ignore
        }
    }
    var usedMem = getValueByJsonPath(dataRecord,'memData;sysMemInfo;used'); 
    if (usedMem != null && usedMem != "-") {
        try {
            usedMem = parseFloat(usedMem);
            memDS.push({x:time, y:usedMem});
        } catch (error) {
            // Ignore
        }
    }
}

function parseMemCPUData4SparkLines(data, propertyNames, slConfig) {
    var key, slData = {};
    var endTime = slConfig.endTime;
    var startTime = slConfig.startTime;
    for (key in propertyNames) {
        var properties = propertyNames[key];
        for (var i = 0; i < properties.length; i++) {
            var propValues, propValue, propValueArray, propdata = [];
            try{
            	propValues = data[key][properties[i].name];
            }catch(e){}
            if (propValues != null && propValues.length > 0) {
                propValue = propValues[0]['history-10'];
                propValueArray = convertMemCPUJSON2Array(propValue);
                propdata = interpolateMemCPUSparkLineData(propValueArray, startTime, endTime);
            }
            slData[properties[i].name] = {data:propdata, color:properties[i].color};
        }
    }
    return slData;
};

function initCPULineChart(selector, data, options) {
    var svgElement = selector + " svg";

    if(!($(selector).is(':visible'))) {
        return;
    }

    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }

    $(selector).append("<svg style='height:" + options.height + "px'></svg>");

    nv.addGraph(function () {
        var chart = nv.models.lineChart().margin({top:30, right:60, bottom:30, left:50});
        chart.xAxis.tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d / 1000));
        });
        chart.yAxis.tickFormat(function (d) {
            return d3.format(',.02f')(d);
        });
        chart.lines.forceY([0]);
        d3.select(svgElement).datum(data).transition().duration(options.height).call(chart);
        nv.utils.windowResize(function () {
            d3.select(svgElement).call(chart)
        });
        return chart;
    });
};

function initMemoryLineChart(selector, data, options) {
    var svgElement = selector + " svg";

    if(!($(selector).is(':visible'))) {
        return;
    }

    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    $(selector).append("<svg style='height:" + options.height + "px;'></svg>");
    nv.addGraph(function () {
        var chart = nv.models.lineChart().margin({top:30, right:60, bottom:30, left:50});
        chart.xAxis.tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d / 1000));
        });
        chart.yAxis.tickFormat(function (d) {
            return formatBytes(d * 1024, false, false, 1);
            //return d3.format(',.001f')(d / 1024);
        });
        chart.lines.forceY([0]);
        d3.select(svgElement).datum(data).transition().duration(options.height).call(chart);
        nv.utils.windowResize(function () {
            d3.select(svgElement).call(chart)
        });
        return chart;
    });
};

function startWidgetLoading(selectorId) {
    $("#" + selectorId + "-loading").show();
    $("#" + selectorId + "-box").find('a[data-action="collapse"]').hide();
    $("#" + selectorId + "-box").find('a[data-action="settings"]').hide();
};

function endWidgetLoading(selectorId) {
    setTimeout(function(){     
        $("#" + selectorId + "-loading").hide();
        $("#" + selectorId + "-box").find('a[data-action="collapse"]').show(); 
        $("#" + selectorId + "-box").find('a[data-action="settings"]').show();
    },500);  
};

function drawSparkLine(parentId, selectorId, className, data) {
    var selector = "#" + parentId + ' #' + selectorId;
    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    drawSparkLine4Selector(selector, className, data);
};

function drawSparkLineBar(selector, data) {
	if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    var w = 57, h = 38, maxValue = 0, maxBarValue = 36;
    
    $.each(data.data, function(key,val){
    	if(maxValue < parseInt(val.value)){
    		maxValue = parseInt(val.value);
    	}
    });
    var svg = d3.select(selector)
    	.append("svg")
    	.attr("width", w)
    	.attr("height", h);
    
    svg.selectAll("rect")
	    .data(data.data)
	    .enter()
	    .append("rect")
	    .attr("x",function(d, i) {
	    	return i * 7;
	    })
	    .attr("y", function(d){
	    	if(maxValue != 0){
	    		d = parseInt(d.value) * maxBarValue / maxValue;
	    	}
	    	return h - (d + 2);
	    })
	    .attr("width", 5)
	    .attr("height", function(d) {
	    	if(maxValue != 0){
	    		d = parseInt(d.value) * maxBarValue / maxValue;
	    	}
	    	return d + 2; 
	    })
	    .attr("fill", "steelblue")
	    .on("mouseover", function(d,i) { 
	    	$('body').find('.nvtooltip').remove();
	    	var div = d3.select('body').append("div")   
		    .attr("class", "nvtooltip");
	    	
            div.transition().duration(10);      
                    
            div.html('<span class="lbl">' + parseInt(d.value) + '</span> vRouters with <span class="lbl">' + d.name +'</span> ' + data.title)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
         })                 
        .on("mouseout", function(d) {       
            $('body').find('.nvtooltip').remove();
        });
};

function drawNVD3SparkLine(parentId, selectorId, className, data) {
    var selector = "#" + parentId + ' #' + selectorId;
    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    $(selector).append("<svg class='" + className + "'></svg>");
    nv.addGraph({
        generate:function () {
            var chart = nv.models.sparkline().width(200).height(10);
            d3.select(selector + ' svg').datum(data).call(chart);
            return chart;
        },
        callback:function (graph) {
        }
    });
};

function drawSparkLine4Selector(selector, className, data) {
    var sortedData = ([].concat(data)).sort(function (a, b) {
        return a - b
    });
    var graph = d3.select(selector).append("svg:svg").attr('class', className);
    var maxY = sortedData[sortedData.length - 1];
    var x = d3.scale.linear().domain([0, 10]).range([0, 100]);
    var y = d3.scale.linear().domain([sortedData[0], maxY * 1.2]).range([10, 0]);
    var sparkLine = d3.svg.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d) {
            return y(d);
        });
    graph.append("svg:path").attr("d", sparkLine(data));
}

function drawNVD3SparkLinePlus(parentId, selectorId, className, data) {
    var selector = "#" + parentId + ' #' + selectorId;
    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    $(selector).append("<svg class='" + className + "'></svg>");
    nv.addGraph(function () {
        var chart = nv.models.sparklinePlus().width(200).height(10);
        chart.x(function (d, i) {
            return i
        }).xTickFormat(function (d) {
                return d3.time.format('%x')(new Date(data[d].x))
            });
        d3.select(selector + ' svg').datum(data).transition().duration(250).call(chart);
        return chart;
    });
};

function convertMemCPUJSON2Array(json) {
    var time, array = [], timeJSON, ts;
    for (time in json) {
        timeJSON = JSON.parse(time);
        ts = Math.floor(timeJSON['ts'] / 1000);
        array.push({ts:ts, value:json[time]})
    }
    array = sortArrayByKey(array, 'ts');
    return array;
};

function sortArrayByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
};

function formatMemCPUSparkLineData(propValueArray) {
    var results = [];
    for(var i = 0; i < propValueArray.length; i++) {
        results.push(propValueArray[i].value);
    }
    return results;
}

function interpolateMemCPUSparkLineData(propValueArray, startTime, endTime) {
    var results = [], msTime, length = propValueArray.length, lastTime, firstTime;
    startTime = startTime - 1800000;
    if (length > 0) {
        lastTime = propValueArray[length - 1]['ts'];
        firstTime = propValueArray[0]['ts'];
        if (lastTime <= startTime) {
            for (var j = 0; j < 10; j++) {
                results.push(propValueArray[length - 1].value);
            }
        } else if (lastTime > startTime) {
            for (var j = 0; j < propValueArray.length; j++) {
                msTime = propValueArray[j].ts
                if (msTime >= startTime) {
                    results.push(propValueArray[j].value);
                }
            }
            for (var k = results.length; k < 10; k++) {
                results.push(propValueArray[length - 1].value);
            }
        }
    }
    return results;
};

function parseTSChartData(response, cbParams) {
    var rawdata = response['flow-series'],
        inBytes = {key:"In Bytes", values:[], color: d3_category5[0]}, outBytes = {key:"Out Bytes", values:[], color: d3_category5[1]},
        inPackets = {key:"In Packets", values:[]}, outPackets = {key:"Out Packets", values:[]},
        chartData = [inBytes, outBytes];

    for (var i = 0; i < rawdata.length; i++) {
        var ts = Math.floor(rawdata[i].time / 1000);
        inBytes.values.push({x:ts, y:rawdata[i].inBytes});
        outBytes.values.push({x:ts, y:rawdata[i].outBytes});
        inPackets.values.push({x:ts, y:rawdata[i].inPkts});
        outPackets.values.push({x:ts, y:rawdata[i].outPkts});
    }
    return chartData;
}

function successHandlerTSChart(data, cbParams) {
    var selectorId = "#" + $(cbParams.selector).attr('id');
    var options = {
        height:300,
        yAxisLabel: 'Bytes per 30 secs',
        y2AxisLabel: 'Bytes per min'
    };
    initTrafficTSChart(selectorId, data, options, null, "formatSumBytes", "formatSumBytes");
};

function initTrafficTSChart(selector, data, options, chart, yFormatter, y2Formatter) {
    var svgElement = selector + " svg";

    if ($(selector).find("svg") != null) {
        $(selector).empty();
    }
    $(selector).append("<svg style='height:" + options.height + "px;'></svg>");

    if(chart == null) {
        nv.addGraph(function () {
            var values = data[0].values,sampleCnt = values.length, start, end, brushExtent = null;
            if(options.defaultSelRange != null && sampleCnt >= options.defaultSelRange) {
                start = values[sampleCnt - options.defaultSelRange];
                end = value[sampleCnt - 1 ]
            } else if (sampleCnt >= 20) {
                start = values[sampleCnt - 20];
                end = values[sampleCnt - 1];
                brushExtent = [getViewFinderPoint(start.x), getViewFinderPoint(end.x)];
            }

            chart = nv.models.lineWithExtendedFocusChart().height2(options.height == 250 ? 70 : 90).margin2({top:10, right:30, bottom:20, left:60}).brushExtent(brushExtent);

            chart.interpolate(interpolateSankey);

            chart.xAxis.tickFormat(function (d) {
                return d3.time.format('%H:%M:%S')(new Date(d));
            });

            chart.x2Axis.tickFormat(function (d) {
                return d3.time.format('%H:%M:%S')(new Date(d));
            });

            chart.yAxis.axisLabel(options.yAxisLabel).tickFormat(window[yFormatter]);

            chart.y2Axis.axisLabel(options.y2AxisLabel).tickFormat(window[y2Formatter]);

            chart.lines.forceY([0]);
            chart.lines2.forceY([0]);
            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chart);
            if(!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function() {
                    d3.select(svgElement).datum(data).transition().duration(500).call(chart);
                });
            } else {
                d3.select(svgElement).datum(data).transition().duration(500).call(chart);
            }
            nv.utils.windowResize(function(){
                updateChartOnResize(selector,chart);
            });
            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation,which resolves once the chart is rendered
            if(options['deferredObj'] != null)
                options['deferredObj'].resolve();
            return chart;
        });
    } else {
        d3.select(svgElement).datum(data).transition().duration(500).call(chart);
        nv.utils.windowResize(function(){
            updateChartOnResize(selector,chart);
        });
    }
};
/**
 * This function retains the existing message based on the flag('customMsg') on chart update
 * 
 */
function updateChartOnResize(selector,chart){
	if(selector != null && $(selector).is(':visible') && chart != null) {
        if($(selector).find('.nv-noData').data('customMsg')) {
            var msg = $(selector).find('.nv-noData').text();
            chart.update();
            $(selector).find('.nv-noData').text(msg);
        } else if($(selector).data('chart') != null)
            $(selector).data('chart').update();
    }
}

function initScatterBubbleChart(selector, data, chart, chartOptions) {
    nv.addGraph(function () {
        //No need to set the sizeDomain,as we already normalize the sizes before invoking this function
        chart = nv.models.scatterChart()
            .showDistX(false)
            .showDistY(false)
            .sizeDomain([0.7,2])
            //.sizeRange([50,500])
            .tooltipXContent(null)
            .tooltipYContent(null)
            .showTooltipLines(false)
            .tooltipContent(chartOptions['tooltipFn']);
        
        if(chartOptions['tooltipRenderedFn'] != null)
        	chart.tooltipRenderedFn(chartOptions['tooltipRenderedFn']);
        if (chartOptions['forceX'] != null)
            chart.forceX(chartOptions['forceX']);
        if (chartOptions['forceY'] != null)
            chart.forceY(chartOptions['forceY']);
        if(chartOptions['seriesMap'] != null)
            chart.seriesMap(chartOptions['seriesMap']);
        if(chartOptions['xPositive'] != null && chart.scatter != null)
            chart.scatter.xPositive(chartOptions['xPositive']);
        if(chartOptions['yPositive'] != null && chart.scatter != null)
            chart.scatter.yPositive(chartOptions['yPositive']);
        if(chartOptions['addDomainBuffer'] != null && chart.scatter != null)
            chart.scatter.addDomainBuffer(chartOptions['addDomainBuffer']);
        if(chartOptions['useVoronoi'] != null && chart.scatter != null)
            chart.scatter.useVoronoi(chartOptions['useVoronoi']);

        //If there is only set of bubbles and showLegend is set to false then disable the legend 
        if(data.length == 1 || chartOptions['showLegend'] == false) {
            chart.showLegend(false);
        }

        $(selector).data('chart', chart);
        chart.xAxis.tickFormat(chartOptions['xLblFormat']);
        chart.yAxis.tickFormat(chartOptions['yLblFormat']);
        chart.xAxis.showMaxMin(false);
        chart.yAxis.showMaxMin(false);
        chart.yAxis.axisLabel(chartOptions['yLbl']);
        chart.xAxis.axisLabel(chartOptions['xLbl']);
        chart.yAxis.ticks(3);

        $(selector).append('<svg></svg>');

        chart.dispatch.on('stateChange', chartOptions['stateChangeFunction']);
        chart.scatter.dispatch.on('elementClick', chartOptions['elementClickFunction']);
        chart.scatter.dispatch.on('elementMouseout',chartOptions['elementMouseoutFn']);
        chart.scatter.dispatch.on('elementMouseover',chartOptions['elementMouseoverFn']);
        $(selector).on('dblclick',chartOptions['elementDblClickFunction']);
        if(!($(selector).is(':visible'))) {
            $(selector).find('svg').bind("refresh", function() {
                d3.select($(selector)[0]).select('svg').datum(data).call(chart);
            });
        } else {
            d3.select($(selector)[0]).select('svg').datum(data).call(chart);
        }

        nv.utils.windowResize(function(){
            updateChartOnResize(selector,chart);
        });
        //Seems like in d3 chart renders with some delay so this deferred object helps in that situation,which resolves once the chart is rendered
        if(chartOptions['deferredObj'] != null)
            chartOptions['deferredObj'].resolve();
        return chart;
    });
}

function setChartOptions(chart,chartOptions){
    
    chartOptions = ifNull(chartOptions,{});
    // In case of dynamic axis while updating the chart with new parameters earlier properties 
    // of the chart object will retain so we are setting to null if any property not exists
    chart.tooltipRenderedFn(ifNull(chartOptions['tooltipRenderedFn'],null));
    chart.forceX(ifNull(chartOptions['forceX'],null));
    if(chartOptions['forceX'] != null) {
        chart.xAxis.tickValues(chartOptions.xStops);
    }    
    chart.forceY(ifNull(chartOptions['forceY'],null));
    if(chartOptions['forceY'] != null) {
        chart.yAxis.tickValues(chartOptions.yStops);
    }     
    chart.seriesMap(ifNull(chartOptions['seriesMap'],null));
    chart.scatter.xPositive(ifNull(chartOptions['xPositive'],null));
    chart.scatter.yPositive(ifNull(chartOptions['yPositive'],null));
    chart.scatter.addDomainBuffer(ifNull(chartOptions['addDomainBuffer'],null));
    chart.scatter.xDomain(ifNull(chartOptions['xDomain'],null));
    chart.scatter.yDomain(ifNull(chartOptions['yDomain'],null));
    chart.xAxis.tickFormat(chartOptions['xLblFormat']);
    chart.yAxis.tickFormat(chartOptions['yLblFormat']);
    chart.xAxis.showMaxMin(false);
    chart.yAxis.showMaxMin(false);
    chart.yAxis.axisLabel(chartOptions['yLbl']);
    chart.xAxis.axisLabel(chartOptions['xLbl']);
    chart.dispatch.on('stateChange', chartOptions['stateChangeFunction']);
    chart.scatter.dispatch.on('elementClick', chartOptions['elementClickFunction']);
    chart.scatter.dispatch.on('elementMouseout',chartOptions['elementMouseoutFn']);
    chart.scatter.dispatch.on('elementMouseover',chartOptions['elementMouseoverFn']);
    return chart;
}
function formatSumBytes(d) {
    return formatBytes(d, false, false, 1);
};

function formatSumPackets(d) {
    return d3.format("d")(d);
};

function getViewFinderPoint(time) {
    var navDate = d3.time.format('%x %H:%M')(new Date(time));
    return new Date(navDate).getTime();
};

function getCurrentTime4MemCPUCharts() {
    var now = new Date(), currentTime;
    currentTime = now.getTime();
    return currentTime;
};
