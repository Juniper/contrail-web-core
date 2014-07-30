/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

(function ($) {
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
            createD3MemCPUChart(selector, url, options);
        },
        initD3TSChart: function (obj) {
            var selector = $(this);
            var url = (typeof(obj['url']) == 'function') ? obj['url']() : obj['url'];
            var cbParams = {selector: selector};
            chartHandler(url, "GET", null, null, 'parseTSChartData', "successHandlerTSChart", null, false, cbParams, 310000);
        },
        initScatterChart:function (data) {
            var selector = $(this), toFormat = '',
                chartOptions = ifNull(data['chartOptions'],{}), chart, yMaxMin, d;
            var hoveredOnTooltip,tooltipTimeoutId;
            var xLbl = ifNull(data['xLbl'], 'CPU (%)'),
                yLbl = ifNull(data['yLbl'], 'Memory (MB)');

            var xLblFormat = ifNull(data['xLblFormat'], d3.format()),
                yLblFormat = ifNull(data['yLblFormat'], d3.format());

            var yDataType = ifNull(data['yDataType'], '');

            if ($.inArray(ifNull(data['title'], ''), ['vRouters', 'Analytic Nodes', 'Config Nodes', 'Control Nodes']) > -1) {
                xLblFormat = ifNull(data['xLblFormat'], d3.format('.02f'));
                //yLblFormat = ifNull(data['xLblFormat'],d3.format('.02f'));
            }
            if (data['d'] != null)
                d = data['d'];

            //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
            var dValues = $.map(d,function(obj,idx) {
                return obj['values'];
            });
            dValues = flattenList(dValues);

            if(data['yLblFormat'] == null) {
                yLblFormat = function(y) {
                    return parseFloat(d3.format('.02f')(y)).toString();
                };
            }

            //If the axis is bytes, check the max and min and decide the scale KB/MB/GB
            //Set size domain
            var sizeMinMax = getBubbleSizeRange(dValues);

            logMessage('scatterChart', 'sizeMinMax', sizeMinMax);

            //Decide the best unit to display in y-axis (B/KB/MB/GB/..) and convert the y-axis values to that scale
            if (yDataType == 'bytes') {
                var result = formatByteAxis(d);
                d = result['data'];
                yLbl += result['yLbl'];
            }
            chartOptions['multiTooltip'] = true;
            chartOptions['scatterOverlapBubbles'] = false;
            chartOptions['xLbl'] = xLbl;
            chartOptions['yLbl'] = yLbl;
            chartOptions['xLblFormat'] = xLblFormat;
            chartOptions['yLblFormat'] = yLblFormat;
            chartOptions['forceX'] = data['forceX'];
            chartOptions['forceY'] = data['forceY'];
            var seriesType = {};
            for(var i = 0;i < d.length; i++ ) {
                var values = [];
                if(d[i]['values'].length > 0)
                    seriesType[d[i]['values'][0]['type']] = i;
                $.each(d[i]['values'],function(idx,obj){
                    obj['multiTooltip'] = chartOptions['multiTooltip'];
                    obj['fqName'] = data['fqName'];
                    values.push(obj);
                })
                d[i]['values'] = values;
            }
            chartOptions['seriesMap'] = seriesType;
            var tooltipFn = chartOptions['tooltipFn'];
            chartOptions['tooltipFn'] = function(e,x,y,chart) {
                                            return scatterTooltipFn(e,x,y,chart,tooltipFn);
                                        };
            if(chartOptions['multiTooltip']) {
                chartOptions['tooltipFn'] = function(e,x,y,chart) {
                    return scatterTooltipFn(e,x,y,chart,tooltipFn);
                }
                chartOptions['tooltipRenderedFn'] = function(tooltipContainer,e,chart) {
                    if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length >1) {
                       var result = getMultiTooltipContent(e,tooltipFn,chart);
                        //Need to remove
                        $.each(result['content'],function(idx,nodeObj) {
                            var key = nodeObj[0]['value'];
                            $.each(ifNull(result['nodeMap'][key]['point']['alerts'],[]),function(idx,obj) {
                                if(obj['tooltipAlert'] != false)
                                    nodeObj.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
                            });
                        });
                       
                       if(chartOptions['multiTooltip'] && result['content'].length > 1)
                           bindEventsOverlapTooltip(result,tooltipContainer);
                    }
                }
            }
            if(chartOptions['scatterOverlapBubbles'])
                d = scatterOverlapBubbles(d);
            chartOptions['sizeMinMax'] = sizeMinMax;

            chartOptions['stateChangeFunction'] = function (e) {
                //nv.log('New State:', JSON.stringify(e));
            };


            chartOptions['elementClickFunction'] = function (e) {
                if(typeof(chartOptions['clickFn']) == 'function')
                    chartOptions['clickFn'](e['point']);
                else
                    processDrillDownForNodes(e);
            };
            chartOptions['elementMouseoutFn'] = function (e) {
                if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length > 1) {
                    if(tooltipTimeoutId != undefined)
                        clearTimeout(tooltipTimeoutId);
                    tooltipTimeoutId = setTimeout(function(){
                        tooltipTimeoutId = undefined;  
                        if(hoveredOnTooltip != true){
                            nv.tooltip.cleanup();
                        }
                      },1500);    
                }
            };
            chartOptions['elementMouseoverFn'] = function(e) {
                if(tooltipTimeoutId != undefined)
                    clearTimeout(tooltipTimeoutId);
            }
            if(data['hideLoadingIcon'] != false)
                $(this).parents('.widget-box').find('.icon-spinner').hide();
            if(data['loadedDeferredObj'] != null)
                data['loadedDeferredObj'].fail(function(errObj){
                    if(errObj['errTxt'] != null && errObj['errTxt'] != 'abort') { 
                        showMessageInChart({selector:$(selector),chartObj:$(selector).data('chart'),xLbl:chartOptions['xLbl'],yLbl:chartOptions['yLbl'],
                            msg:'Error in fetching details',type:'bubblechart'});
                    }
                });
            chartOptions['deferredObj'] = data['deferredObj'];
            initScatterBubbleChart(selector, d, chart, chartOptions);

            if(data['widgetBoxId'] != null)
                endWidgetLoading(data['widgetBoxId']);

            /**
             * function takes the parameters tooltipContainer object and the tooltip array for multitooltip and binds the 
             * events like drill down on tooltip and click on left and right arrows
             * @param result
             * @param tooltipContainer
             */
            function bindEventsOverlapTooltip(result,tooltipContainer) {
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
                    //console.log("Inside the mouse over");
                    hoveredOnTooltip = true; 
                });
                $(tooltipContainer).find('div.enabledPointer').on('mouseleave',function(e){
                    //console.log("Inside the mouseout ");
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
        }
    })
})(jQuery);

/**
 * TooltipFn for scatter chart
 */
function scatterTooltipFn(e,x,y,chart,tooltipFormatFn) {
    e['point']['overlappedNodes'] = markOverlappedBubblesOnHover(e,chart).reverse();
    var tooltipContents = [];
    if(e['point']['overlappedNodes'] == undefined || e['point']['overlappedNodes'].length <= 1) {
        if(typeof(tooltipFormatFn) == 'function') {
            tooltipContents = tooltipFormatFn(e['point']);
        } 
        //Format the alerts to display in tooltip
        $.each(ifNull(e['point']['alerts'],[]),function(idx,obj) {
            if(obj['tooltipAlert'] != false)
                tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
        });
        return formatLblValueTooltip(tooltipContents);
    } else if(e['point']['multiTooltip'] == true) {
        result = getMultiTooltipContent(e,tooltipFormatFn,chart);
        $.each(result['content'],function(idx,nodeObj) {
            var key = nodeObj[0]['value'];
            $.each(ifNull(result['nodeMap'][key]['point']['alerts'],[]),function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    nodeObj.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
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

function isScatterChartInitialized(selector) {
   if($(selector + ' > svg').length > 0)
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
function getMultiTooltipContent(e,tooltipFn,chart) {
    var tooltipArray = [],result = {},nodeMap = {};
    var perPage = 1;
    var overlappedNodes = e['point']['overlappedNodes'];
    var series = [];
    for(var i = 0;i < e['series'].length; i++){
        $.merge(series,e['series'][i]['values']);
    }
    for(var i = 0;i < overlappedNodes.length; i++){
        var data = $.grep(series,function(obj,idx) {
            return (obj['name'] == overlappedNodes[i]['name'] && obj['type'] == overlappedNodes[i]['type'] && 
                    !chart.state()['disabled'][chart.seriesMap()[obj['type']]]);
        });
        if(!isEmptyObject(data)) {
            //data['point'] = data[0];
            tooltipArray.push(tooltipFn(data[0]));
            //Creates a hashMap based on first key/value in tooltipContent
            nodeMap[tooltipFn(data[0])[0]['value']] = {point:data[0]};
        }
    }
    result['content'] = tooltipArray;
    result['nodeMap'] = nodeMap;
    result['perPage'] = perPage;
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
        axis = d3.svg.axis().orient("bottom"),
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
        dimension.filterRange(extent);
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
