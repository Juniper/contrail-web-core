/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
//Bucketization Options
var defaultBucketize = true;
//Maximum upto which the chart data should be bucketized
var defaultMaxBucketizeLevel = 3; 
//Determines what param will be used to depict the size of the bubble in infra charts
var defaultBucketSizeParam = "size"; 
//Determines how many buckets need to created per axis. If 7 creates 7 x 7 = 49 buckets and groups the nodes
var defaultBucketsPerAxis = 4;
//Cookie name to be used to store the settings for bucketization
var DO_BUCKETIZE_COOKIE = 'doBucketize';
//Cookie name to be used to store the settings for MaxBucketizeLevel
var BUCKETIZE_LEVEL_COOKIE = 'bucketizeLevel';
//Cookie name to be used to store the settings for BucketsPerAxis
var BUCKETS_PER_AXIS_COOKIE = 'bucketsPerAxis';
var dragSrc = d3.behavior.drag();
//If single click event is processed,disable dblClick action
var disableDblClick = false;
(function ($) {
    var hoveredOnTooltip;
    /**
        * function takes the parameters tooltipContainer object and the tooltip array for multitooltip and binds the 
        * events like drill down on tooltip and click on left and right arrows
        * @param result
        * @param tooltipContainer
        */
    function bindEventsOverlapTooltip(result,tooltipContainer,chartOptions) {
        var page = 1;
        var perPage = result['perPage'];
        var pagestr = "";
        var data = [];
        result['perPage'] = perPage;
        data = $.extend(true,[],result['content']); 
        result['content'] = result['content'].slice(0,perPage);
        if(result['perPage'] > 1)
            result['pagestr'] = 1 +" - "+result['content'].length +" of "+data.length;
        else if(result['perPage'] == 1)
            result['pagestr'] = 1 +" / "+data.length;
        $(tooltipContainer).find('div.enabledPointer').parent().html(formatLblValueMultiTooltip(result));
        $(tooltipContainer).find('div.left-arrow').on('click',function(e){
            result['button'] = 'left';
            handleLeftRightBtnClick(result,tooltipContainer);
        });
        $(tooltipContainer).find('div.right-arrow').on('click',function(e){
            result['button'] = 'right';
            handleLeftRightBtnClick(result,tooltipContainer);
        });
        $(tooltipContainer).find('div.tooltip-wrapper').find('div.chart-tooltip').on('click',function(e){
            bubbleDrillDown($(this).find('div.chart-tooltip-title').find('p').text(),result['nodeMap']);
        });
        $(tooltipContainer).find('div.enabledPointer').on('mouseover',function(e){
            hoveredOnTooltip = true; 
        });
        $(tooltipContainer).find('div.enabledPointer').on('mouseleave',function(e){
            hoveredOnTooltip = false;
            nv.tooltip.cleanup();
        });
        $(tooltipContainer).find('button.close').on('click',function(e){
            hoveredOnTooltip = false;
            nv.tooltip.cleanup();
        });
        function handleLeftRightBtnClick(result,tooltipContainer) {
                var content = [];
                var leftPos = 'auto',rightPos = 'auto';
                if(result['button'] == 'left') {
                    if($(tooltipContainer).css('left') == 'auto') {
                        leftPos = $(tooltipContainer).position()['left'];
                        $(tooltipContainer).css('left',leftPos);
                        $(tooltipContainer).css('right','auto');
                    }
                    if(page == 1)
                        return;
                    page = page-1;
                    if(result['perPage'] > 1)
                        pagestr = (page - 1) * perPage+1 +" - "+ (page) * perPage;
                    else if(result['perPage'] == 1)
                        pagestr = (page - 1) * perPage+1;
                    if(page <= 1) {
                        if(result['perPage'] > 1)
                            pagestr = 1 +" - "+ (page) * perPage;
                        else if(result['perPage'] == 1)
                            pagestr = 1;
                    }
                    content = data.slice((page-1) * perPage,page * perPage);
                } else if (result['button'] == 'right') {
                    if($(tooltipContainer).css('right') == 'auto') {
                        leftPos = $(tooltipContainer).position()['left'];
                        rightPos = $(tooltipContainer).offsetParent().width() - $(tooltipContainer).outerWidth() - leftPos;
                        $(tooltipContainer).css('right', rightPos);
                        $(tooltipContainer).css('left','auto');
                    }
                    if(Math.ceil(data.length/perPage) == page)
                        return;
                    page += 1;
                    if(result['perPage'] > 1)
                        pagestr = (page - 1) * perPage+1 +" - "+ (page) * perPage;
                    else if(result['perPage'] == 1)
                        pagestr = (page - 1) * perPage+1;
                    content = data.slice((page-1) * perPage,page * perPage);
                    if(data.length <= page * perPage) {
                        if(result['perPage'] > 1)
                            pagestr = (data.length-perPage)+1 +" - "+ data.length;
                        else if(result['perPage'] == 1)
                            pagestr = (data.length-perPage)+1;
                        content = data.slice((data.length - perPage),data.length);
                    } 
                }
                leftPos = $(tooltipContainer).position()['left'];
                rightPos = $(tooltipContainer).offsetParent().width() - $(tooltipContainer).outerWidth() - leftPos;
                result['content'] = content;
                if(result['perPage'] > 1)
                    pagestr += " of "+data.length;
                else if(result['perPage'] == 1)
                    pagestr += " / "+data.length;
                result['perPage'] = perPage;
                $(tooltipContainer).css('left',0);
                $(tooltipContainer).css('right','auto');
                $(tooltipContainer).find('div.tooltip-wrapper').html("");
                for(var i = 0;i<result['content'].length ; i++) {
                    $(tooltipContainer).find('div.tooltip-wrapper').append(formatLblValueTooltip(result['content'][i]));
                }
                $(tooltipContainer).find('div.pagecount span').html(pagestr);
                if(result['button'] == 'left') {
                //Incase the tooltip doesnot accomodate in the right space available 
                    if($(tooltipContainer).outerWidth() > ($(tooltipContainer).offsetParent().width() - leftPos)){
                        $(tooltipContainer).css('right',0);
                        $(tooltipContainer).css('left','auto');
                    } else {
                        $(tooltipContainer).css('left',leftPos);
                    }
                } else if(result['button'] == 'right') {
                    //Incase the tooltip doesnot accomodate in the left space available  
                    if($(tooltipContainer).outerWidth() > ($(tooltipContainer).offsetParent().width() - rightPos)){
                        $(tooltipContainer).css('left',0);
                    } else {
                        $(tooltipContainer).css('right',rightPos);
                        $(tooltipContainer).css('left','auto');
                    }
                }
                //binding the click on tooltip for bubble drill down
                $(tooltipContainer).find('div.tooltip-wrapper').find('div.chart-tooltip').on('click',function(e){
                    bubbleDrillDown($(this).find('div.chart-tooltip-title').find('p').text(),result['nodeMap']);
                });
        }
        function bubbleDrillDown(nodeName,nodeMap) {
            var e = nodeMap[nodeName];
            if(typeof(chartOptions['clickFn']) == 'function')
                chartOptions['clickFn'](e['point']);
            else
                processDrillDownForNodes(e);
        }
        $(window).off('resize.multiTooltip');
        $(window).on('resize.multiTooltip',function(e){
            nv.tooltip.cleanup();
        });
    }
    /*
    * This function accepts the crossfilterName,parameter on which the crossfilter chart need to be constructed,
    * formatFn(if required) and filterDimension constructs the crossfilter chart and returns it 
    */
    function getCrossFilterCharts(cfName,key,formatFn,filterDimension) {
        manageCrossFilters.addDimension(cfName, key, formatFn);
        var dimension = manageCrossFilters.getDimension(cfName, key);
        if(dimension.top(1).length > 0 ) {
            maxValue = parseFloat(d3.max(dimension.group().all(),function(d) {return d['key']}));
            barHeight = d3.max(dimension.group().all(),function(d) {return d['value']});
        }
        var axisCFChart =  barChart()
                    .dimension(dimension)
                    .group(dimension.group())
                .x(d3.scale.linear()
                    .domain([0,(maxValue+(maxValue * 0.1))])//Added 1% buffer 
                    .rangeRound([0, 300]))
                .y(d3.scale.linear()
                    .domain([0,barHeight])
                    .range([30,0]));
        return axisCFChart;
    }
    /*
    * This function constructs the dynamic axis in the chart settings
    */
    function showAxisParams(selector,settings) {
        var selParent = $(selector).parent('div');
        var doBucketize =  (!getCookie(DO_BUCKETIZE_COOKIE))? defaultBucketize : (getCookie(DO_BUCKETIZE_COOKIE) == 'yes')? true : false;
        var maxBucketizeLevel =  (!getCookie(BUCKETIZE_LEVEL_COOKIE))? defaultBucketsPerAxis : parseInt(getCookie(BUCKETIZE_LEVEL_COOKIE));
        var bucketsPerAxis =  (!getCookie(BUCKETS_PER_AXIS_COOKIE))? defaultMaxBucketizeLevel : parseInt(getCookie(BUCKETS_PER_AXIS_COOKIE));
        if(doBucketize){
            $(selParent).find('#checkbox-bucketize').prop('checked', true);
            $(selParent).find('#div-bucket-options').show();
        } else { 
            $(selParent).find('#checkbox-bucketize').prop('checked', false);
            $(selParent).find('#div-bucket-options').hide();
        }
        
        //on selection of bucketize checkbox add/remove bucketization
        $(selParent).find('#checkbox-bucketize').change(function(e){
            var origData = $(selector).data('origData');
            var chartObj = $.extend(true,{},origData);
            if ($(selParent).find('#checkbox-bucketize').is(":checked")){
                setCookie(DO_BUCKETIZE_COOKIE,'yes');
                $(selParent).find('#div-bucket-options').show();
                $(selParent).find('.bucketize-reset').show();
                if(chartOptions['isBucketize'] != true){
                    chartOptions['isBucketize'] = true;
                    chartObj['chartOptions'] = chartOptions;
                    $(selector).initScatterChart(chartObj);
                    // manageCrossFilters.fireCallBacks('vRoutersCF');
                }
            } else {
                setCookie(DO_BUCKETIZE_COOKIE,'no');
                $(selParent).find('#div-bucket-options').hide();
                $(selParent).find('.bucketize-reset').hide();
                chartOptions['isBucketize'] = false;
                chartObj['chartOptions'] = chartOptions;
                // manageCrossFilters.fireCallBacks('vRoutersCF');
                $(selector).initScatterChart(chartObj);
            }
        });
        //on click of the bucketization apply button apply the settings
        $(selParent).find('button.btnBucketSettingsApply').bind('click',function(clickEvt){
            var origData = $(selector).data('origData');
            var bucketOptions = origData.chartOptions.bucketOptions;
            if(bucketOptions == null){
                bucketOptions = {};
            }
            var maxBucketizeLevel = $(selParent).find('#chartSettingsBucketMaxBucketizeLevel').val();
            var bucketsPerAxis = $(selParent).find('#chartSettingsBucketPerAxis').val();
            //Save the values in cookies
            setCookie(BUCKETIZE_LEVEL_COOKIE,maxBucketizeLevel);
            setCookie(BUCKETS_PER_AXIS_COOKIE,bucketsPerAxis);
            
            bucketOptions.maxBucketizeLevel = maxBucketizeLevel;
            bucketOptions.bucketsPerAxis = bucketsPerAxis;
            origData.chartOptions.bucketOptions = bucketOptions;
            $(selector).data('origData',origData);
            var chartObj = $.extend(true,{},origData);
            $(selector).initScatterChart(chartObj);
        });
        //on click of bucketization remove 
        $(selParent).find('#chart-settings-bucketization-remove').bind('click',function(clickEvt){
            var origData = $(selector).data('origData');
            var chartObj = $.extend(true,{},origData);
            $(selParent).find('.bucketize-reset').hide();
            $(selParent).find('#checkbox-bucketize').attr("checked", false);
            $(selParent).find('#div-bucket-options').hide();
            chartOptions['isBucketize'] = false;
            chartObj['chartOptions'] = chartOptions;
            $(selector).initScatterChart(chartObj);
        });
        //show the settings on click of options link on the chart
        $(selParent).find('div.chart-settings-hide .chart-setting-options').bind('click',function(clickEvt){
            $('div.chart-settings-hide').addClass('hide');
            $('div.chart-settings-wrapper').removeClass('hide');
            $(selParent).find('div.chart-settings-wrapper').removeClass('hide');
            $(selParent).find('div i').on('click',function(){
                $('div.chart-settings-wrapper').addClass('hide');
                $('div.chart-settings-hide').removeClass('hide');
            });
            var chartObj = $.extend(true,{},data);
            var updateChartParams = chartObj['chartOptions'];
            //var chartData = d3.select($(selector).find('svg')[0]).datum(),values = [],defaultKeys = {},filterDimension;
            var origData = $(selector).data('origData'),values = [],defaultKeys = {},filterDimension,chartData;
            chartData = origData;
            $.each(chartData['d'],function(idx,data){
                values = $.merge(values,data['values']); 
            });
            //var dataCrossFilter = crossfilter(values);
            var cfName = chartOptions['crossFilter'];
            manageCrossFilters.updateCrossFilter(cfName, values);
            var dataCrossFilter = manageCrossFilters.getCrossFilter(cfName);
            var cfCharts = [],cfChart;
            $.each(settings,function(idx,setVal){
                var id = setVal['id'],data = [];
                var axisType = id.indexOf('xAxis') > -1 ? 'x' : 'y';
                $("#"+id).contrailDropdown({
                    dataTextField:"text",
                    dataValueField:"value",
                    change:function(e) {
                        var chartData = $(selector).data('origData')['d'],field,type,formatFn,dataType,lbl,key;
                        var selValue = $(e['target']).data('contrailDropdown').getSelectedData()[0]['text'];
                        updateChartParams['tooltipFn'] = tooltipFn;
                        $.each(chartData,function(idx,dataItem){
                            $.each(dataItem['values'],function(sIdx,value){
                                $.each(chartOptions[id],function(index,obj){
                                if(obj['lbl'] == selValue) {
                                    var range = [],updatedRange = [];
                                        /* here if type is null, considering it as default data type integer
                                        * In case of single point (which mean only one bubble or main bubbles with same x and y value)
                                        * minimum and maximum will be same so whole axis will have only two values so we are setting the domain.
                                        */
                                    field = axisType == 'x'? 'xField' : 'yField';
                                    type = obj['type'],dataType = obj['dataType'];
                                    lbl = obj['lbl'],key = obj['key'];
                                    if(obj['formatFn'] != null) {
                                        value[field] = obj['key'];
                                        value[obj['key']] = parseInt(obj['formatFn'](value[obj['key']]));
                                        formatFn = obj['formatFn'];
                                    } else {
                                        if(type != null) {
                                            updateChartParams[axisType+"LblFormat"] = d3.format('.02f');
                                            value[field] = obj['key'];
                                            value[obj['key']] = parseFloat(value[obj['key']]);
                                            formatFn = d3.format('.02f');
                                        } else {
                                            updateChartParams[axisType+"LblFormat"] = d3.format('0d');
                                            value[field] = obj['key'];
                                            value[obj['key']] = parseInt(value[obj['key']]);
                                            formatFn = d3.format('0d');
                                        }
                                    }
                                }
                                });
                            }); 
                        });
                        range = d3.extent(values,function(item){return item[item[field]]});
                        if(type == null && range[1] == range[0]) {
                            range[0] = (range[0] - range[0] * 0.05 < 0 ) ? 0 : Math.floor(range[0] - range[0] * 0.05);
                            range[1] = Math.ceil(range[1] + range[1] * 0.05);
                            updateChartParams[axisType+"Domain"] = [range[0],range[1]]; 
                        } 
                        if(dataType == 'bytes') {
                            var result = formatByteAxis(chartData);
                            chartData = result['data'];
                            updateChartParams[axisType+'Lbl'] = lbl + result[axisType+'Lbl'];
                        } else 
                            updateChartParams[axisType+'Lbl'] = lbl;
                        if (dataCrossFilter != null) {
                            var selParamCfChart = [];
                            //we are deleting the html content because crossfilter is checking for global tag empty and stops 
                            //rendering again
                            $('#'+id+"_crossfilter").html('');
                            var selParamCfChartObj = getCrossFilterCharts(cfName,key,formatFn,filterDimension);
                            selParamCfChart.push(selParamCfChartObj);
                            var selParamCfCharts =  d3.selectAll('#'+id+"_crossfilter")
                                                    .data(selParamCfChart)
                                                    .each(function(currChart){
                                                        currChart.on('brush',function(){
                                                            var filteredData = filterDimension.top(Infinity);
                                                            chartObj['d'] = filteredData;
                                                            //$(selector).initScatterChart(chartObj);
                                                        }).on("brushend",function(){
                                                            var filteredData = filterDimension.top(Infinity);
                                                            if (chartObj['chartOptions']['dataSplitFn'] != null && 
                                                                    typeof chartObj['chartOptions']['dataSplitFn'] == 'function') {
                                                                chartObj['d'] = chartObj['chartOptions']['dataSplitFn'](filteredData);
                                                            } else 
                                                                chartObj['d'] = filteredData;
                                                            $(selector).initScatterChart(chartObj);
                                                        });
                                                    });
                            renderAll(selParamCfCharts);
                        }
                        chartObj['d'] = chartData;
                        chartObj['chartOptions'] = updateChartParams;
                        $(selector).initScatterChart(chartObj);
                    }
                });
                $.each(chartOptions[id],function(idx,obj){
                    if(obj['defaultParam'])
                        defaultKeys[id] = obj;
                    var obj = {
                            id:obj['lbl'],
                            text:obj['lbl'],
                            value:obj['lbl']
                    };
                    data.push(obj);
                });
                $("#"+id).data('contrailDropdown').setData(data);
                if(dataCrossFilter != null) {
                    var formatFn;
                    if(defaultKeys[id]['formatFn'] != null) {
                        formatFn = defaultKeys[id]['formatFn'];
                    } else {
                        if(defaultKeys[id]['type'] != null)
                            formatFn = d3.format('.02f')
                        else
                            formatFn = d3.format('0d');
                    }
                    manageCrossFilters.addDimension(cfName, defaultKeys[id]['key'], formatFn);
                    /*
                    * Filter dimension to be used for data retrieval
                    */
                    filterDimension = manageCrossFilters.getDimension(cfName,axisType);
                    var dimension = manageCrossFilters.getDimension(cfName, defaultKeys[id]['key']);
                    if(dimension.top(1).length > 0 ) {
                        maxValue = parseFloat(d3.max(dimension.group().all(),function(d) {return d['key']}));
                        barHeight = d3.max(dimension.group().all(),function(d) {return d['value']});
                    }
                    var dataCrossFilterObj = getCrossFilterCharts(cfName,defaultKeys[id]['key'],formatFn,filterDimension);
                    $("#"+id+"_crossfilter").data('chartObj',dataCrossFilterObj);
                    $("#"+id+"_crossfilter").data('axis',axisType);
                    cfCharts.push(dataCrossFilterObj);
                }
            });
            if(cfCharts.length > 0) {
                var cfChart =  d3.selectAll('.chart')
                                .data(cfCharts)
                                .each(function(currChart){
                                    currChart.on('brush',function(){
                                        //nothing to do for now
                                    }).on("brushend",function() {
                                        var filteredData = filterDimension.top(Infinity);
                                        if (chartObj['chartOptions']['dataSplitFn'] != null && 
                                                typeof chartObj['chartOptions']['dataSplitFn'] == 'function') {
                                            chartObj['d'] = chartObj['chartOptions']['dataSplitFn'](filteredData);
                                        } else 
                                            chartObj['d'] = filteredData;
                                        $(selector).initScatterChart(chartObj);
                                        //renderAll(cfChart);
                                    });
                                });
            renderAll(cfChart);
            $('.reset').bind('click',function(){
                var cfDiv = $(this).closest('.chart');
                var cfObj = $(cfDiv).data('chartObj');
                var axis = $(cfDiv).data('axis');
                //Need to reset the filter based on the axis
                cfObj.filter(null);
                var filteredData = cfObj.dimension().top(Infinity);
                if (chartObj['chartOptions']['dataSplitFn'] != null && 
                        typeof chartObj['chartOptions']['dataSplitFn'] == 'function') {
                    chartObj['d'] = chartObj['chartOptions']['dataSplitFn'](filteredData);
                } else 
                    chartObj['d'] = filteredData;
                //chartObj['d'] = chartData['d'];
                $(selector).initScatterChart(chartObj);
                renderAll(cfChart);
            });
            }
    }); 
    }
    $.extend($.fn, {
        initMemCPUSparkLines: function(data, parser, propertyNames, slConfig) {
            var selector = $(this);
            createD3SparkLines(selector, data, parser, propertyNames, slConfig);
        },
        initMemCPULineChart:function (obj, height) {
            var selector = $(this);
            var options = {};
            var url = obj.url;
            options.titles = obj.titles;
            options.height = height;
            options.parser = obj.parser;
            options.plotOnLoad = obj.plotOnLoad;
            options.showWidgetIds = obj.showWidgetIds;
            options.hideWidgetIds = obj.hideWidgetIds;
            options.lineChartId = obj.lineChartId;
            createD3MemCPUChart(selector, url, options);
        },
        initD3TSChart: function (obj) {
            var selector = $(this);
            var url = (typeof(obj['url']) == 'function') ? obj['url']() : obj['url'];
            var cbParams = {selector: selector, height: contrail.checkIfExist(obj['height']) ? obj['height'] : 300};
            chartHandler(url, "GET", null, null, 'parseTSChartData', "successHandlerTSChart", null, false, cbParams, 310000);
        },
        initScatterChart:function (data) {
            var initResponse = $.extend(true,{},data);
            var origData = $.extend(true,{},initResponse);
            var selector = $(this), toFormat = '', chart, yMaxMin;
            var chartOptions = ifNull(initResponse['chartOptions'],{}) ;
            //Set data to populate to chart
            var chartData;
            var tooltipTimeoutId;
            var xLbl = ifNull(chartOptions['xLbl'], 'CPU (%)'),
                yLbl = ifNull(chartOptions['yLbl'], 'Memory (MB)');

            var xLblFormat = ifNull(chartOptions['xLblFormat'], d3.format()),
                yLblFormat = ifNull(chartOptions['yLblFormat'], d3.format());
            if(chartOptions['yLblFormat'] == null) {
                yLblFormat = function(y) {
                    return parseFloat(d3.format('.02f')(y)).toString();
                };
            }
            if ($.inArray(ifNull(initResponse['title'], ''), ['vRouters', 'Analytic Nodes', 'Config Nodes', 'Control Nodes']) > -1) {
                //Info:Revisit
                // chartOptions['forceX'] = [0, 0.15];
                xLblFormat = ifNull(chartOptions['xLblFormat'], d3.format('.02f'));
                //yLblFormat = ifNull(initResponse['xLblFormat'],d3.format('.02f'));
            }

            var yLbl = ifNull(chartOptions['yLbl'], 'Memory (MB)');
            var yDataType = ifNull(chartOptions['yDataType'], '');
            if (initResponse['d'] != null)
                chartData = initResponse['d'];
            //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
            var dValues = $.map(chartData,function(obj,idx) {
                return obj['values'];
            });
            dValues = flattenList(dValues);
            //copying the xfield and yfield values to x and y in charts data
            $.each(dValues,function(idx,obj){
                    if(obj['xField'] != null)
                        obj['x'] = obj[obj['xField']];
                    if(obj['yField'] != null)
                        obj['y'] = obj[obj['yField']];
                });
            var totalBucketizedNodes = 0;
            isBucketize = (chartOptions['isBucketize'])? true: false;
            if(isBucketize){
                chartData = doBucketization(chartData,chartOptions);
                totalBucketizedNodes = getTotalBucketizedNodes(chartData);
                //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
                var dValues = $.map(chartData,function(obj,idx) {
                    return obj['values'];
                });
            }


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
            chartOptions['useSizeAsRadius'] = true;
            var seriesType = {};
            for(var i = 0;i < chartData.length; i++ ) {
                var values = [];
                if(chartData[i]['values'].length > 0)
                    seriesType[chartData[i]['values'][0]['type']] = i;
                $.each(chartData[i]['values'],function(idx,obj){
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
            chartOptions['tooltipFn'] = function(e,x,y,chart) {
                                            return scatterTooltipFn(e,x,y,chart,tooltipFn,bucketTooltipFn,selector);
                                        };
            if(chartOptions['multiTooltip']) {
                chartOptions['tooltipFn'] = function(e,x,y,chart) {
                    return scatterTooltipFn(e,x,y,chart,tooltipFn,bucketTooltipFn,selector);
                }
                chartOptions['tooltipRenderedFn'] = function(tooltipContainer,e,chart,selector) {
                    if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length >1) {
                       var result = getMultiTooltipContent(e,tooltipFn,bucketTooltipFn,chart,selector);
                        //Need to remove
                        $.each(result['content'],function(idx,nodeObj) {
                            var key = nodeObj[0]['value'];
                            $.each(ifNull(result['nodeMap'][key]['point']['alerts'],[]),function(idx,obj) {
                                if(obj['tooltipAlert'] != false)
                                    nodeObj.push({label:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
                            });
                        });
                       
                       if(chartOptions['multiTooltip'] && result['content'].length > 1)
                           bindEventsOverlapTooltip(result,tooltipContainer,chartOptions);
                    }
                }
            }
            if(chartOptions['scatterOverlapBubbles'])
                chartData = scatterOverlapBubbles(chartData);

            chartOptions['elementClickFunction'] = function (e) {
                disableDblClick = true;
                console.info('elementClickFunction',disableDblClick);
                // d3.event.stopPropagation();
                if(e['point']['isBucket']){
                    zoomIn(e,selector);
                } else if(typeof(chartOptions['clickFn']) == 'function') {
                    chartOptions['clickFn'](e['point']);
                } else {
                    processDrillDownForNodes(e);
                }
            };
            
            chartOptions['elementDblClickFunction'] = function (e) {
                console.info('elementDblClickFunction',disableDblClick);
                // if(d3.event.defaultPrevented) return;
                if(disableDblClick == true) {
                    disableDblClick = false;
                    return;
                } else { 
                    zoomOut(selector);
                }
            };
            
            chartOptions['elementMouseoutFn'] = function (e) {
                //In case of overlapped tooltip,clean-up the tooltip if tooltip containter doesn't get mouse foucs within 1500ms
                if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length > 1 && e['point']['isBucket'] != true) {
                    if(tooltipTimeoutId != undefined)
                        clearTimeout(tooltipTimeoutId);
                    tooltipTimeoutId = setTimeout(function(){
                        tooltipTimeoutId = undefined;  
                        if(hoveredOnTooltip != true){
                            nv.tooltip.cleanup();
                        }
                      },1500);    
                } else
                    nv.tooltip.cleanup();
            };
            chartOptions['elementMouseoverFn'] = function(e) {
                if(tooltipTimeoutId != undefined)
                    clearTimeout(tooltipTimeoutId);
            }
            if(initResponse['hideLoadingIcon'] != false)
                $(this).parents('.widget-box').find('.icon-spinner').hide();
            chartOptions['useVoronoi'] = false;

            //Does all tweaks related to bubble size
            function normalizeBubbleSizes(chartData) {
                //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
                var dValues = $.map(chartData,function(obj,idx) {
                    return obj['values'];
                });
                //If the axis is bytes, check the max and min and decide the scale KB/MB/GB
                //Set size domain
                var sizeMinMax = getBubbleSizeRange(dValues);
                chartOptions['sizeMinMax'] = sizeMinMax;

                logMessage('scatterChart', 'sizeMinMax', sizeMinMax);

                //Adjust the size domain to have limit on minumum/maximum bubble size
                //Maintain the same multipler for range same as domain.
                //Let's say if domainMax/domainMin is 8,ensure rangeMax/rangeMin is 8
                // var sizeMinMaxMultiplier = 
                // var d3Scale = d3.scale.linear().range([1.5,6]).domain(chartOptions['sizeMinMax']);
                var d3SizeScale; 
                if(chartOptions['isBucketize']) {
                    // d3SizeScale = d3.scale.linear().range([Math.log2(chartOptions['sizeMinMax'][0]),Math.log2(chartOptions['sizeMinMax'][1])]).domain(chartOptions['sizeMinMax']);
                    // d3SizeScale = d3.scale.linear().range([1,Math.log2(chartOptions['sizeMinMax'][1] - chartOptions['sizeMinMax'][0])+1]).domain(chartOptions['sizeMinMax']);
                    var offset = 1.5;
                    if(sizeMinMax[0] != sizeMinMax[1]) {
                        //d3SizeScale = d3.scale.quantize().domain(chartOptions['sizeMinMax']).range([4,6,8,10,12,14]);
                        d3SizeScale = d3.scale.quantize().domain(chartOptions['sizeMinMax']).range([6,7,9,10,11,12]);
                        // d3SizeScale = d3.scale.log().base(2).range([1.5,6]).domain(chartOptions['sizeMinMax']);
                        // d3SizeScale = d3.scale.linear();
                        // d3SizeScale = d3.scale.linear().range([1.5,6]).domain(chartOptions['sizeMinMax']);
                    }
                }
                else {
                    d3SizeScale = d3.scale.linear().range([6,6]).domain(chartOptions['sizeMinMax']);
                }
                $.each(chartData,function(idx,currSeries) {
                    currSeries['values'] = $.each(currSeries['values'],function(idx,obj) {
                            obj = $.extend(obj, {
                                multiTooltip: true,
                                //size: d3SizeScale == null ? 1 : d3SizeScale(obj['size'])
                                size: (obj['size'] == 1) ? 6 : d3SizeScale(obj['size'])
                            });
                        });
                });
            }
            normalizeBubbleSizes(chartData);
            if(isBucketize) {
                //Bind drag event once scatterChart initialized
                function onInitializingScatterChart() {
                    addScatterChartDragHandler(selector);
                }
                chartOptions['onInitializingScatterChart'] = onInitializingScatterChart;
            }

            if(!isScatterChartInitialized(selector)) {
                if (initResponse['loadedDeferredObj'] != null) {
                     initResponse['loadedDeferredObj'].fail(function(errObj){
                         if(errObj['errTxt'] != null && errObj['errTxt'] != 'abort') { 
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
                initScatterBubbleChart(selector, chartData, chart, chartOptions);
                var chartid = $(selector).attr('id');
                $("#"+ chartid).data('origData',origData);
            } else {
                 chart = $(selector).data('chart');
                 var svg = $(selector).find('svg')[0];
                 chart = setChartOptions(chart,chartOptions);
                 d3.select(svg).datum(chartData);
                 if(chart.update != null)
                     chart.update();
            }
              var chartid = $(selector).attr('id');
              //Update the header if required with shown and total count
              // var totalCnt = $("#"+ chartid).data('origDataCount');
              // var filteredCnt = totalBucketizedNodes; 
            // if(chartOptions['updateHeaderCount'])
            //     updatevRouterLabel($(selector).parents().find('.widget-box').find('.widget-header'),filteredCnt,totalCnt);
            if(initResponse['widgetBoxId'] != null)
                endWidgetLoading(initResponse['widgetBoxId']);
        }
    })
})(jQuery);

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
                // if(finalMaxX[1] != Infinity)
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
                // if(finalMaxY[1] != Infinity)
                minMaxY[1] = finalMaxY[1];
                d.dx = 0;
                d.dy = 0;
                zoomIn({point: {minMaxX:minMaxX,minMaxY:minMaxY}},selector);
        })
    ).on('mousedown', function(d){
        d.offsetX = d3.event.offsetX;
        d.offsetY = d3.event.offsetY;
    })/*.call(d3.behavior.zoom().scaleExtent([1,10]).on('zoom',function() {
        zoomed(selector);
    }));*/
    d3.select('body').on('keyup', function(d) {
        if(d3.event.keyCode == 27) cancelDragEvent = true;
    });
}

function zoomed(selector) {
  d3.select($(selector)[0]).select('svg').select('g').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}


/**
 * TooltipFn for scatter chart
 */
function scatterTooltipFn(e,x,y,chart,tooltipFormatFn,bucketTooltipFn,selector) {
    e['point']['overlappedNodes'] = markOverlappedOrBucketizedBubblesOnHover(e,chart,selector).reverse();
    var tooltipContents = [];
    if(e['point']['isBucket']) {
        if(typeof(bucketTooltipFn) == "function"){
            tooltipContents = bucketTooltipFn(e['point'],'simple');
        }
        $.each(ifNull(e['point']['alerts'],[]),function(idx,obj) {
            if(obj['tooltipAlert'] != false)
                tooltipContents.push({label:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
        });
        return formatLblValueTooltip(tooltipContents);
    } else if(e['point']['overlappedNodes'] == undefined || e['point']['overlappedNodes'].length <= 1) {
        //To disable multiple-tooltip, set e['point']['overlappedNodes'].length < Infinity
        if(typeof(tooltipFormatFn) == 'function') {
            tooltipContents = tooltipFormatFn(e['point'],'simple');
        } 
        //Format the alerts to display in tooltip
        $.each(ifNull(e['point']['alerts'],[]),function(idx,obj) {
            if(obj['tooltipAlert'] != false)
                tooltipContents.push({label:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
        });
        return formatLblValueTooltip(tooltipContents);
    } else if(e['point']['multiTooltip'] == true) {
        result = getMultiTooltipContent(e,tooltipFormatFn,bucketTooltipFn,chart,selector);
        $.each(result['content'],function(idx,nodeObj) {
            var key = nodeObj[0]['value'];
            $.each(ifNull(result['nodeMap'][key]['point']['alerts'],[]),function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    nodeObj.push({label:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
            });
        });
        result['content'] = result['content'].slice(0,result['perPage']);
        return formatLblValueMultiTooltip(result);
    }
}

/**
 * function takes the parameters total node repsones(one in dashboard) and changes the x-axis and y-axis 
 * based on the buffer set to avoid overlap of bubble
 * 
 * @param data
 * @returns
 */

function scatterOverlapBubbles (data){
    var bubbles = data[0]['values'];
    for(var i = 0;i < bubbles.length; i++ ){
        var x = bubbles[i]['x'];
        var y = bubbles[i]['y'];
        var buffer = 4;//In percent
        $.each(bubbles,function(idx,obj){
            if((!isNaN(x) && !isNaN(y) && Math.abs(x-obj['x'])/x) * 100 <= buffer && (Math.abs(y-obj['y'])/y) * 100 <= buffer && bubbles[i]['name'] != obj['name']){
                if(idx % 2 !=0) {
                    obj['x'] = obj['x'] +obj['x']*(buffer/100);
                    //obj['y'] = obj['y'] +obj['y']*(buffer/100);
                } else if(idx % 2 ==0 || x !=0 || y !=0 ) {
                    obj['x'] = obj['x'] -obj['x']*(buffer/100);
                    //obj['y'] = obj['y'] -obj['y']*(buffer/100);
                }
            } else if (isNaN(x) && isNaN(y) && isNaN(obj['x']) && isNaN(obj['y'])){
                obj['x']
                if(idx % 2 !=0) {
                    obj['x'] = obj['x'] +obj['x']*(buffer/100);
                    //obj['y'] = obj['y'] +obj['y']*(buffer/100);
                } else if(idx % 2 ==0 || x !=0 || y !=0 ) {
                    obj['x'] = obj['x'] -obj['x']*(buffer/100);
                    //obj['y'] = obj['y'] -obj['y']*(buffer/100);
                }
            }
        });
    }
    data[0]['values'] = bubbles;
    return data;	
}

function concatenateDataFromMultipleSeries(d) {
    var combinedValues = [];
    $.each(d,function(idx,obj){
        combinedValues = combinedValues.concat(obj.values);
    });
    return combinedValues;
}

// Given node obj to disperse use the x and y values and size to randomly add minute values 
// to x and y so that the nodes appear dispersed instead of a single node. 
/* Moved to ScatterChartView.js
function disperseRandomly(nodes,maxVariation){
    for(var i=0;i < nodes.length; i++){
        var x = nodes[i]['x'];
        var y = nodes[i]['y'];
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
            return $.isNumeric(obj['x']) ? obj['x'] : 0;
        });
        minMaxY = d3.extent(combinedValues,function(obj){
            // return $.isNumeric(obj['y']) ? obj['y'] : 0;
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
        if(Math.abs(xDomainDiff/minMaxX[1]*100) < 5 || Math.abs(yDomainDiff/minMaxY[1]*100) < 5
            || combinedValues.length < 10) {
            // chartOptions['addDomainBuffer'] = false;
            //Max level of bucketization has reached now just disperse the nodes randomly in space
            for(var i = 0;i < data.length; i++ ) {
                data[i]['values'] = filterAndDisperseNodes(data[i]['values'],minMaxX,minMaxY); 
            }
        } else {
            // Bucketize based on d3Scale
            var xBucketScale = d3.scale.quantize().domain(minMaxX).range(d3.range(1,bucketsPerAxis));
            var yBucketScale = d3.scale.quantize().domain(minMaxY).range(d3.range(1,bucketsPerAxis));
            // var xBucketScale = d3.scale.threshold().domain(minMaxX).range(d3.range(1,bucketsPerAxis));
            // var yBucketScale = d3.scale.threshold().domain(minMaxY).range(d3.range(1,bucketsPerAxis));
            // var xBucketScale = d3.scale.quantile().domain($.map(combinedValues,function(obj) { return obj.x;})).range(d3.range(1,bucketsPerAxis));
            // var yBucketScale = d3.scale.quantile().domain($.map(combinedValues,function(obj) {return obj.y;})).range(d3.range(1,bucketsPerAxis));
            //d3Scale bucketization
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
                        isBucket: true,
                        children:nonXYNodes
                    });
                }
            });
        }
    }
    return data;
}

// Counts the total no. of nodes including the nodes in the buckets
function getTotalBucketizedNodes(d){
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
*/

/**
 * function checks for the overlapped points in the total data and returns 
 */
function markOverlappedBubblesOnHover (e,chart){
    var totalSeries = [],data = e['series'],xDiff,yDiff;
    xDiff = chart.xAxis.domain()[1] - chart.xAxis.domain()[0];
    yDiff = chart.yAxis.domain()[1] - chart.yAxis.domain()[0];
    for(var i = 0;i<data.length; i++){
        $.merge(totalSeries,data[i]['values']);
    }
    var x = e['point']['x'];
    var y = e['point']['y'];
    var buffer = 1.5;//In percent
    var overlappedNodes = [];
    $.each(totalSeries,function(idx,obj) {
        if((Math.abs(x-obj['x'])/xDiff) * 100 <= buffer && 
            (Math.abs(y-obj['y'])/yDiff) * 100 <= buffer) {
            overlappedNodes.push({name:obj['name'],type:obj['type']});
        } else if (isNaN(x) && isNaN(y) && isNaN(obj['x']) && isNaN(obj['y'])) {
            overlappedNodes.push({name:obj['name'],type:obj['type']});
        } else if (x == 0 && y == 0 && obj['x'] == 0 && obj['y'] == 0) {
            overlappedNodes.push({name:obj['name'],type:obj['type']});
        }
    });
    return overlappedNodes;
}

/**
 * function checks for the overlapped points in the total data and returns 
 */
function markOverlappedOrBucketizedBubblesOnHover (e,chart,selector){
    if(e['point'] != null && e['point']['isBucket']){
        /* TODO alternate logic which takes the minmax and derives the nodes in that point 
         * Use this if any problem with the other logic.
         */
        /*var bucketizedNodes =[];
        var data = $(selector).data('origData');
        var minMaxX = e['point']['minMaxX'];
        var minMaxY = e['point']['minMaxY'];
        if (data != null) {
            var d = data['d'];
            for(var i = 0;i < d.length; i++ ) {
                var values = [];
                //bucketizedNodes.concat(bucketize(d[i]['values'],minMaxX,minMaxY));
                var dataCF = crossfilter(d[i]['values']);
                var xDimension = dataCF.dimension(function(d) { return d.x; });
                var yDimension = dataCF.dimension(function(d) { return d.y; });
                var thirdDimension = dataCF.dimension(function(d) { return d.x; });
                bucketizedNodes = bucketizedNodes.concat(fetchNodesBetweenXAndYRange(dataCF, 
                                                                    xDimension,
                                                                    yDimension, 
                                                                    thirdDimension, 
                                                                    minMaxX, 
                                                                    minMaxY
                                                                    ));
            }
        }*/
        var bucketizedNodes = [];
        if(e['point'] != null && e['point']['children'] != null){
            bucketizedNodes = e['point']['children'];
        }
        return bucketizedNodes;
    } else {
        var totalSeries = [],data = e['series'],xDiff,yDiff;
        xDiff = chart.xAxis.domain()[1] - chart.xAxis.domain()[0];
        yDiff = chart.yAxis.domain()[1] - chart.yAxis.domain()[0];
        for(var i = 0;i<data.length; i++){
            $.merge(totalSeries,data[i]['values']);
        }
        var x = e['point']['x'];
        var y = e['point']['y'];
        var buffer = 1.5;//In percent
        var overlappedNodes = [];
        $.each(totalSeries,function(idx,obj) {
            if((Math.abs(x-obj['x'])/xDiff) * 100 <= buffer && 
                (Math.abs(y-obj['y'])/yDiff) * 100 <= buffer) {
                overlappedNodes.push({name:obj['name'],type:obj['type']});
            } else if (isNaN(x) && isNaN(y) && isNaN(obj['x']) && isNaN(obj['y'])) {
                overlappedNodes.push({name:obj['name'],type:obj['type']});
            } else if (x == 0 && y == 0 && obj['x'] == 0 && obj['y'] == 0) {
                overlappedNodes.push({name:obj['name'],type:obj['type']});
            }
        });
        return overlappedNodes;
    }
}


function isScatterChartInitialized(selector) {
    if($(selector).data('initialized') == true)
        return true;
    else 
        return false;
}


/**
 * This function takes event object and tooltip function which is used to get the content of the each tooltip
 * and chart and returns the object consists of all the tooltips of overlapped nodes and perpage etc info
 * @param e
 * @param tooltipFn
 * @param chart
 * @returns result
 */
function getMultiTooltipContent(e,tooltipFn,bucketTooltipFn,chart,selector) {
    var tooltipArray = [],result = {},nodeMap = {};
    //No. of tooltip contents to show per page
    var perPage = 1;
    var overlappedNodes = e['point']['overlappedNodes'];
    var series = concatenateDataFromMultipleSeries(e['series']);
    if(!e.point.isBucket) {
        for(var i = 0;i < overlappedNodes.length; i++){
            //Filter out nodes which are from disabled series
            var data = $.grep(series,function(obj,idx) {
                return (obj['name'] == overlappedNodes[i]['name'] && obj['type'] == overlappedNodes[i]['type'] && 
                        !chart.state()['disabled'][chart.seriesMap()[obj['type']]]);
            });
            
            if(!isEmptyObject(data)) {
                //data['point'] = data[0];
                tooltipArray.push(tooltipFn(data[0],'simple'));
                //Creates a hashMap based on first key/value in tooltipContent
                nodeMap[tooltipFn(data[0],'simple')[0]['value']] = {point:data[0]};
            }
        }
    } else {
        // Use this if you want to display all the nodes
        /*
         *   for(var i = 0;i < overlappedNodes.length; i++){
         *     tooltipArray.push(tooltipFn(overlappedNodes[i],null,null));
         *     //Creates a hashMap based on first key/value in tooltipContent
         *     nodeMap[tooltipFn(overlappedNodes[i])[0]['value']] = {point:overlappedNodes[i]};
         * }
         */
        tooltipArray.push(bucketTooltipFn(e['point'],'simple'));
        //Creates a hashMap based on first key/value in tooltipContent
        nodeMap[bucketTooltipFn(e['point'],'simple')[0]['value']] = {point:e['point']};
    }
    result['content'] = tooltipArray;
    result['nodeMap'] = nodeMap;
    result['perPage'] = perPage;
    //If no.of tooltipContents to show is less than perPage
    var limit = (result['content'].length >= result['perPage']) ? result['perPage'] : result['content'].length;
    if(result['perPage'] > 1)
        result['pagestr']  = 1+" - "+limit+" of "+result['content'].length ;
    else if(result['perPage'] == 1)
        result['pagestr']  = 1+" / "+result['content'].length ;
    return result;
}

function getOverlappedBubbles(e) {
    //Get the count of overlapping bubbles
    var series = [];
    for(var i = 0;i < e['series'].length; i++){
        $.merge(series,e['series'][i]['values']);
    }
    var matchedRecords = $.grep(series,function(currObj,idx) {
        return (currObj['x'] == e['point']['x']) && (currObj['y'] == e['point']['y']);
    });
    return matchedRecords;
}

//Start - Crossfilter chart routines
//Renders the specified chart or list.
function render(method) {
    d3.select(this).call(method);
}

//Whenever the brush moves, re-rendering everything.
function renderAll(chart) {
    chart.each(render);
    //list.each(render);
    //d3.select("#active").text(formatNumber(all.value()));
}

function reset(i) {
    /*charts[i].filter(null);
     renderAll(chart);*/
};

function barChart() {
    if (!barChart.id) barChart.id = 0;
    var toolTip_text = "";
    var margin = {top:0, right:10, bottom:10, left:10},
        x,
        y = d3.scale.linear().range([50, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().ticks(5).orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round,
        toolTip;

    function chart(div) {
        var width = x.range()[1],
            height = y.range()[0],
            xaxis_max_value = x.domain()[1];
        logMessage('crossFilterChart','Start');
        $.each(group.top(Infinity),function(idx,obj) {
            logMessage('crossFilterChart',obj['key'],obj['value']);
        });
        /*
         if(group.top(1).length > 0)
         y.domain([0, group.top(1)[0].value]);
         else
         y.domain([0, 0]);
         */

        div.each(function () {
            var div = d3.select(this),
                g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("span")
                    //.attr("href", "javascript:reset(" + id + ")") //Can be commented
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.insert("svg", "div.title")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);
                var bars = g.selectAll(".bar")
                    .data(["background", "foreground"])
                    .enter().append("path")
                    .attr("class", function (d) {
                        return d + " bar";
                    })
                    .datum(group.all());
                if (toolTip) {
                    var data;
                    bars.call(d3.helper.tooltip()
                        .style({color:'blue'})
                        .text(function (eve) {
                            return toolTip_text;
                        })
                    )
                        .on('mouseover', function (eve) {
                            var co = d3.mouse(this);
                            var x = co[0] * (xaxis_max_value / width);//scaling down the width(240) of the rectangle to x-axis(26) values
                            for (var i = 0; i < eve.length; i++) {
                                if (x >= eve[i].key && x <= (eve[i].key + 10)) {
                                    data = [
                                        {lbl:div.select('.title').text().split('reset')[0], value:eve[i].key},
                                        {lbl:'Virtual Routers', value:eve[i].value}
                                    ];
                                    toolTip_text = contrail.getTemplate4Id('lblval-tooltip-template')(data);
                                }
                            }
                        });
                }
                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);
                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }
            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title span").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", 0)
                        .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
            }
            if(path.length == 0)
                return null;
            else
                return path.join("");
        }

        function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function () {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title span").style("display", null);
    });

    brush.on("brush.chart", function () {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        extent[0] = Math.floor(extent[0]); 
        // dimension.filterRange(extent);
        dimension.filterFunction(function(d) { return d >= extent[0] && d < extent[1]});
    });

    brush.on("brushend.chart", function () {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title span").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
        }
    });

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.dimension = function (_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function (_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function (_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
    };

    chart.round = function (_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };
    chart.toolTip = function (_) {
        if (!arguments.length) return toolTip;
        toolTip = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
}

//End - Crossfilter chart routines

d3.helper = {};

d3.helper.tooltip = function () {
    var tooltipDiv;
    var bodyNode = d3.select('body').node();
    var attrs = {};
    var text = '';
    var styles = {};

    function tooltip(selection) {

        selection.on('mouseover.tooltip', function (pD, pI) {
            var name, value;
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div');
            tooltipDiv.attr(attrs);
            tooltipDiv.style(styles);
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left:(absoluteMousePos[0] + 10) + 'px',
                top:(absoluteMousePos[1] - 15) + 'px',
                position:'absolute',
                'z-index':1001
            });
            // Add text using the accessor function, Crop text arbitrarily
            // Info:commented the style calulating part of the tooltip because our tooltip template take care of it
            /*tooltipDiv.style('width', function (d, i) {
                return (text(pD, pI).length > 80) ? '300px' : null;
            })*/
            tooltipDiv.html(function (d, i) {
                    return text(pD, pI);
                });
        })
            .on('mousemove.tooltip', function (pD, pI) {
                // Move tooltip
                var absoluteMousePos = d3.mouse(bodyNode);
                //Info: null check in included to support in IE
                if(tooltipDiv != null) {
	                tooltipDiv.style({
	                    left:(absoluteMousePos[0] + 10) + 'px',
	                    top:(absoluteMousePos[1] - 15) + 'px'
	                });
	                // Keep updating the text, it could change according to position
	                tooltipDiv.html(function (d, i) {
	                    return text(pD, pI);
	                });
                }
            })
            .on('mouseout.tooltip', function (pD, pI) {
                // Remove tooltip
                tooltipDiv.remove();
            });

    }

    tooltip.attr = function (_x) {
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function (_x) {
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    tooltip.text = function (_x) {
        if (!arguments.length) return text;
        text = d3.functor(_x);
        return this;
    };

    return tooltip;
};

/*
 * Given an array of values, returns the min/max range to be set on size domain
 */
function getBubbleSizeRange(values) {
    var sizeMinMax = [];
    sizeMinMax = d3.extent(values, function (obj) {
        return  obj['size']
    });
    if (sizeMinMax[0] == sizeMinMax[1]) {
        sizeMinMax = [sizeMinMax[0] * .9, sizeMinMax[0] * 1.1];
    } else {
        sizeMinMax = [sizeMinMax[0], sizeMinMax[1]];
    }
    return sizeMinMax;
} 

var updateCharts = new updateChartsClass();
/*
 * Utility functions for progressive loading of charts
 */
function updateChartsClass() {
    this.getResponse = function(obj) {
        $(obj['selector']).closest('div.widget-box').find('i.icon-spinner').show();
        $.ajax({
            url:obj['url'],
        }).done(function(response) {
            var result = {};
            if(obj['type'] == 'bubblechart' && obj['parseFn'] != null) {
                result = obj['parseFn'](response,obj['url']);
            } else if(obj['type'] == 'timeseriescharts' && obj['parseFn'] != null) {
                result['data'] = obj['parseFn'](response,{selector:$(obj['selector']).parent('div.ts-chart')});
            }
            $.extend(result,obj);
            updateCharts.updateView(result);
        }).always(function(){
            $(obj['selector']).closest('div.widget-box').find('i.icon-spinner').hide();
        }).error(function(){
            var chart;
            if(obj['type'] == 'bubblechart')
                chart = $(obj['selector']).parent('div.stack-chart').data('chart');
            else if(obj['type'] == 'timeseriescharts')
                chart = $(obj['selector']).parent('div.ts-chart').data('chart');
            showMessageInChart({selector:$(obj['selector']).parent('div.ts-chart'),chartObj:chart,msg:'Error in fetching details.',type:obj['type']});
        });
    }

    /**
     * this methods sets the extra parameters like multitooltip etc which are needed to plot the chart
     */
    this.setUpdateParams = function(data) {
        var bubbleSizeMinMax = getBubbleSizeRange(data);
        var d3scale = d3.scale.linear().range([1,2]).domain(bubbleSizeMinMax);
        data = $.map(data,function(d){
            d = $.extend(d,{multiTooltip:true,size:d3scale(d['size'])}); 
            return d;
          });
        return data;
    }
    /**
     * Re-render the UI widget with updated data
     */
    this.updateView = function(obj) {
        if(obj['type'] == 'bubblechart') {
           if(obj['selector'] != null && $(obj['selector']).parent('div.stack-chart') != null) {
                var chart = $(obj['selector']).parent('div.stack-chart').data('chart');
                if(obj['axisFormatFn'] != null) {
                    var result = window[obj['axisFormatFn']](obj['data']);
                    obj['data'] = result['data'];
                    if(obj['yLbl'] != null)
                    chart.yAxis.axisLabel(obj['yLbl']+" "+result['yLbl']);
                }
                d3.select(obj['selector']).datum(obj['data']);
                chart.update();  
           }
        } else if(obj['type'] == 'infrabubblechart') {
           if(obj['selector'] != null && $(obj['selector']).parent('div') != null) {
                var chart = $(obj['selector']).parent('div').data('chart');
                if(obj['axisformatFn'] != null) {
                    var result = window[obj['axisformatFn']](obj['data']);
                    obj['data'] = result['data'];
                    chart.yAxis.axisLabel(obj['yLbl']+" "+result['yLbl']);
                }
                d3.select(obj['selector']).datum(obj['data']);
                if(chart != null)
                    chart.update();  
           }
        } else if(obj['type'] == 'timeseriescharts') {
            if(obj['selector'] != null && $(obj['selector']).parent('div.ts-chart') != null) {
                var chart = $(obj['selector']).parent('div.ts-chart').data('chart');
                var isEmptyObj = true;
                for(var i = 0;i < obj['data'].length;i++){
                    if(obj['data'][i]['values'].length > 0 )
                        isEmptyObj = false;
                }
                if(!isEmptyObj){
                    d3.select(obj['selector']).datum(obj['data']);
                    chart.update(); 
                } else {
                    showMessageInChart({selector:$(obj['selector']).parent('div.ts-chart'),chartObj:chart,msg:'No Data Available.',type:obj['type']});
                } 
            }
        }
    }
}

/**
 * Function displays message in the chart basesd on the selector passed and initializes the chart in case if the chart is not yet 
 * intialized
 */
function showMessageInChart(data){
    var chartData = [{key:'vRouters',values:[]}];
    if(data['selector'] != null) {
        //if chart object is null initialises it with empty data
        var selector = data['selector'];
        if(data['chartObj'] == null) {
            var deferredObj = $.Deferred();
            if(data['type'] == 'bubblechart' || data['type'] == 'infrabubblechart') {
                chartData = [{key:'vRouters',values:[]}];
                $(selector).initScatterChart({d:chartData,xLbl:ifNull(data['xLbl'],''),yLbl:ifNull(data['yLbl'],''),deferredObj:deferredObj});
            } else if(data['type'] == 'timeseriescharts') {
                chartData = [{"key": "In Bytes","values": [],"color": "#1f77b4"},{"key": "Out Bytes","values": [],"color": "#6baed6"}];
                initTrafficTSChart($(selector).attr('id'),chartData,{deferredObj:deferredObj,height:300},null);
            }
            deferredObj.done(function(){
                data['chartObj'] = $(selector).data('chart');
                updateChartMessage();
            })
        } else {
            updateChartMessage();
        }
    }
    
    function updateChartMessage(){
        $(selector).find('svg:first').children('g').remove();
        d3.select($(selector).find('svg')[0]).datum(chartData);
        data['chartObj'].update();
        $(selector).find('text.nv-noData').text(data['msg']);
        // Setting the customMsg flag because as we are rendering the chart with empty data onWindowResize chart update gets triggered 
        // and overriding the message to "No data Available". In such cases we check this flag and update the relevant message  
        $(selector).find('text.nv-noData').data('customMsg',true);
    }
}

/*
 * Format byte axis labels (KB/MB/GB..)based on min/max values
 */
function formatByteAxis(data) {
    var toFormat = '',yLbl = '';
    var dValues = $.map(data,function(obj,idx) {
        return obj['values'];
    });
    dValues = flattenList(dValues);
    yMaxMin = $.map(d3.extent(dValues, function (obj) {
        return  obj['y']
    }), function (value, idx) {
        return formatBytes(value);
    });
    if (yMaxMin[0].split(' ')[1] == yMaxMin[1].split(' ')[1]) {
        toFormat = yMaxMin[0].split(' ')[1];
    } else {
        toFormat = yMaxMin[1].split(' ')[1];
    }
    $.each(data,function(idx,obj) {
        data[idx]['values'] = $.map(data[idx]['values'], function (obj, idx) {
            obj['origY'] = obj['y'];
            obj['y'] = prettifyBytes({bytes:obj['y'], stripUnit:true, prefix:toFormat});
            return obj;
        });
    });
    if (toFormat != null) {
        yLbl += ' (' + toFormat + ')';
    }
    return {data:data,yLbl:yLbl};
}

/****
 * Selection handler for color filter in chart settings panel
 ****/
/*
 * $('body').on('click','.color-selection .circle',function() {
 *     //Get the chart handle
 *     var svgParent = $($(this)).closest('.chart-settings').parent().find('.nv-scatterChart').closest('div');
 *     var chart = $(svgParent).data('chart');
 *     var svgElem = d3.select($(svgParent).find('svg')[0]);
 *     var data = svgElem.datum();
 *     var currElem = $(this);
 * 
 *     //Add color filter
 *     var selectedColorElems = $(this).siblings('.circle.filled');
 *     var selColors = [];
 *     $.each(selectedColorElems,function(idx,obj) {
 *         $.each(d3Colors,function(currColorName,currColorCode) {
 *             if($(obj).hasClass(currColorName)) {
 *                 if(selColors.indexOf(currColorName) == -1)
 *                     selColors.push(currColorCode);
 *             }
 *         });
 *     });
 *     //Add current color
 *     if($(this).hasClass('filled') == false) {
 *         selColors.push(d3Colors[$(this).data('color')]);
 *     }
 *     var colorFilterFunc = function(d) {
 *         return selColors.indexOf(d) > -1;
 *     }
 *     filterUsingGlobalCrossFilter('vRoutersCF',null,null,colorFilterFunc);
 *     $(this).toggleClass('filled');
 * });
 */

function getColorFilterFn(selector) {
    //Add color filter
    var selectedColorElems = $(selector).find('.circle.filled');
    var selColors = [];
    $.each(selectedColorElems,function(idx,obj) {
        $.each(d3Colors,function(currColorName,currColorCode) {
            if($(obj).hasClass(currColorName)) {
                if(selColors.indexOf(currColorName) == -1)
                    selColors.push(currColorCode);
            }
        });
    });
    var colorFilterFunc = function(d) {
        return selColors.indexOf(d) > -1;
    }
    return colorFilterFunc;
}

function zoomIn(e,selector) {
    nv.tooltip.clearedTooltip = true;
    //As we display tool-tip with a delay,there is a chance that tooltip of drilled-down node to display in zoomed view
    nv.tooltip.cleanup();
    var origData = $(selector).data('origData');
    var data = $.extend(true,{},origData);
    var currLevel ;
    if(data != null && data['chartOptions'] != null && 
            data['chartOptions']['bucketOptions'] != null){
        currLevel = data['chartOptions']['bucketOptions']['currLevel'];
        if(currLevel != null){
            currLevel++;
        } else {
            currLevel = 1;//it is at first level now after the first click
        }
        data['chartOptions']['bucketOptions']['currLevel'] = currLevel;
    }
    
    var bucketOptions = {};
    if(data['chartOptions'] != null && data['chartOptions']['bucketOptions'] != null){
        bucketOptions = data['chartOptions']['bucketOptions'];
        bucketOptions['minMax'] = minMax
    }
    data.chartOptions['bucketOptions'] = bucketOptions;
    
    data.chartOptions.bucketOptions.minMax = minMax;
    $(selector).data('origData',data);
    var cfName = data.chartOptions['crossFilter'];
    var nameFilterFn = null;
    var selectedNames = [];
    //Drilled-down on a bubble
    if(e['point'] != null) { 
        var minMaxX = e['point']['minMaxX'];
        var minMaxY = e['point']['minMaxY'];
        var minMax = {minMaxX:minMaxX,minMaxY:minMaxY};
        if(minMax['minMaxX'] == null || minMax['minMaxY'] == null) {
            //e['point']['children'] will be available only in case of drill-down on a node and not on drag selection
            $.each(ifNull(e['point']['children'],[]),function(idx,obj) {
                selectedNames.push(obj['name']);
            });
            //We need to resort to nameFilterFn if the selected nodes have non-zero x/y values
            nameFilterFn = function(d) {
                return selectedNames.indexOf(d) > -1;
            }
        }
    } else {
        //Drag-selection
        if(e['selectedNames'] instanceof Array) {
            nameFilterFn = function(d) {
                return e['selectedNames'].indexOf(d) > -1;
            }
        }
    }
    filterUsingGlobalCrossFilter(cfName,minMaxX,minMaxY,getColorFilterFn(selector),nameFilterFn);
}

function zoomOut(selector) {
    // console.count("Hello");
    // console.trace();
    //alert('double clicked');
    var origData = $(selector).data('origData');
    var parentMinMax;
    var currMinMax,minMaxX,minMaxY,currLevel;
    var data = $.extend(true,{},origData);
    if(data['chartOptions']['isBucketize'] != true) {
        return;
    }
    
    var minMax = {minMaxX:minMaxX,minMaxY:minMaxY};
    data['chartOptions']['bucketOptions']['minMax'] = null;
    //since we are zooming out to first level
    data['chartOptions']['bucketOptions']['currLevel'] = 0;
    var cfName = data.chartOptions['crossFilter'];
    $(selector).data('origData',data);
    //Reset color-selection
    $(selector).find('.color-selection .circle').addClass('filled');
    filterUsingGlobalCrossFilter(cfName,null,null);
}

function filterUsingGlobalCrossFilter(cfName,xMinMax,yMinMax,colorFilterFn,nameFilterFn) {
    manageCrossFilters.applyFilter(cfName, 'x', xMinMax);
    manageCrossFilters.applyFilter(cfName, 'y', yMinMax);
    manageCrossFilters.applyFilter(cfName,'color',null,colorFilterFn);
    manageCrossFilters.applyFilter(cfName,'name',null,nameFilterFn);
    manageCrossFilters.fireCallBacks(cfName);
}

