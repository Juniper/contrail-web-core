/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var globalObj = {},
    contentContainer = "#content-container";

globalObj['loadedScripts'] = [];
globalObj['orchModel'] = 'openstack';
globalObj.NUM_FLOW_DATA_POINTS = 1000;
var timeStampAlert = [],timeStampTolearence = 5 * 60 * 1000;//To check the mismatch between the browser time and the webserver time
var enableHardRefresh = false;  //Set to true if "Hard Refresh" provision need to be shown in UI
//Set to true if we want to discard ongoing requests while refreshing the dataSource and start fetching from beginnging
//Ajax calls shouldn't be aborted if we don't want to discard ongoing update
var discardOngoingUpdate = true;
var DEFAULT_TIME_SLICE = 3600000,
    pageContainer = "#content-container",
    dblClick = 0;
var CONTRAIL_STATUS_USER = [];
var CONTRAIL_STATUS_PWD = [];
var flowKeyStack = [];
var aclIterKeyStack = [];
var d3Colors = {red:'#dc6660',green:'#7dc48a',blue:'#7892dd',orange:'#ffbf87'};
if(typeof(built_at) == 'undefined')
    built_at = '';
var TENANT_API_URL = "/api/tenant/get-data";
var SANDESH_DATA_URL = "/api/admin/monitor/infrastructure/get-sandesh-data";
var INDENT_RIGHT = "&nbsp;&nbsp;&nbsp;&nbsp;";
var INST_PAGINATION_CNT = 50;
var NETWORKS_PAGINATION_CNT = 5;
var sevLevels = {
    ERROR   : 0, //Red
    WARNING : 1, //Orange
    NOTICE  : 2, //Blue
    INFO    : 3, //Green
}
var infraAlertMsgs = {
        'UVE_MISSING'           : "System Information unavailable", 
        'PARTIAL_UVE_MISSING'   : "Partial System Information",
        'CONFIG_MISSING'        : "Configuration unavailable",
        'CONFIG_IP_MISMATCH'    : "Configured IP mismatch",
        'IFMAP_DOWN'            : "Ifmap connection down",
        'BGP_CONFIG_MISMATCH'   : "BGP peer configuration mismatch",
        'PROCESS_STATES_MISSING': "Process States unavailable",
        'DOWN_CNT'              : "{0} Down",        //Used for displaying "XMPP Peers" & "BGP Peers" in node tooltip 
        'BGP_PEER_DOWN'         : "{0:BGP Peer;BGP Peers} down",
        'XMPP_PEER_DOWN'        : "{0:XMPP Peer;XMPP Peers} down",
        'INTERFACE_DOWN'        : "{0:Interface;Interfaces} down",
        'TIMESTAMP_MISMATCH_BEHIND'   : "Browser is {0} behind system time",
        'TIMESTAMP_MISMATCH_AHEAD'    : "Browser is {0} ahead of system time",
        'IFMAP_DOWN'            : "Ifmap Connection down",
        'PROCESS_DOWN'          : "{0:Process;Processes} down",
        'PROCESS_STOPPED'       : "{0} stopped",
        'PROCESS_COREDUMP'      : "{0:core dump;core dumps}",
        'PROCESS_RESTART'       : "{0:restart;restarts}"
    }
//Sets the following prototype if not defined already.
//Array.prototype.unique - returns unique values of an array.
//Array.prototype.diff - difference between two arrays.
//Array.prototype.move - moves an element from one index to another.
//String.prototype.trim - trims 'spaces' of a string, both preceeding and succeeding.
initializePrototypes();

function initializePrototypes() {
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return
            this.replace(/(?:(?:^|\n)s+|s+(?:$|\n))/g, "").replace(/s+/g, " ");
        };
    }
    if (!Array.prototype.diff) {
        Array.prototype.diff = function(a) {
            return this.filter(function(i) {return !(a.indexOf(i) > -1);});
        };
    }
    if (!Array.prototype.unique) {
	    Array.prototype.unique = function() {
	        var unique = [];
	        for (var i = 0; i < this.length; i++) {
	            if (unique.indexOf(this[i]) == -1) {
	                unique.push(this[i]);
	            }
	        }
	        return unique;
	    };
    }
    if (!Array.prototype.move) {
        Array.prototype.move = function (old_index, new_index) {
            while (old_index < 0) {
                old_index += this.length;
            }
            while (new_index < 0) {
                new_index += this.length;
            }
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
            return this;
        };
    }
}

function collapseElement(e) {
    $(e).toggleClass('icon-caret-right').toggleClass('icon-caret-down');
    var widgetBodyElem = $(e).parents('div.widget-box').find('div.widget-body');
    var widgetBoxElem = $(e).parents('div.widget-box');
    $(widgetBoxElem).toggleClass('collapsed');	
}

var templateLoader = (function ($, host) {
    //Loads external templates from path and injects in to page DOM
    return{
        loadExtTemplate:function (path, deferredObj, containerName) {
            //Load the template only if it doesn't exists in DOM
            var tmplLoader = $.get(path)
                .success(function (result) {
                    //Add templates to DOM
                    if (containerName != null) {
                        $('body').append('<div id="' + containerName + '"></div>');
                        $('#' + containerName).append(result);
                    } else
                        $("body").append(result);
                    if (deferredObj != null)
                        deferredObj.resolve();
                })
                .error(function (result) {
                    if(result['statusText'] != 'abort')
                        showInfoWindow("Error while loading page.",'Error');
                });

            tmplLoader.complete(function () {
                $(host).trigger("TEMPLATE_LOADED", [path]);
            });
        }
    };
})(jQuery, document);

var siteMap = {};
var siteMapSearchStrings = [];

function keys(obj) {
    var count = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
}

var defaultSeriesColors = [ "#70b5dd", "#1083c7", "#1c638d" ];
var defColors = ['#1c638d', '#4DA3D5'];


/**
 * @options['objectType']   project|network|flow|peer|port
 * @options['view']         chart|list
 * Do any logarthmic calculations here
 */
function chartsParseFn(options, response) {
    var obj = response;
    var view = options['view'];
    var objType = options['objectType'];
    var objSource = options['source'];
    var fqName = options['fqName'];
    var logScale = ifNull(options['logScale'], 0);
    if (options['chart'] != null) {
        var selector = options['chart'];
        if ($(selector).hasClass('negate') || (logScale > 0)) {
            var data = obj;
            var fields = [];
            var series = options['series'];
            $.each(series, function (idx, obj) {
                fields.push(obj['field']);
            });
            if ($(selector).hasClass('negate')) {
                $.each(data, function (idx, obj) {
                    $.each(fields, function (i, field) {
                        data[idx][field] = -1 * data[idx][field];
                    });
                });
            }
            if (logScale > 0) {
                $.each(data, function (idx, obj) {
                    $.each(fields, function (i, field) {
                        data[idx][field] = log2(data[idx][field]);
                    });
                });
            }
        }
    }

    if(objType == 'project' && objSource == 'uve') {
        obj = $.map(tenantNetworkMonitorUtils.filterVNsNotInCfg(response['value'],fqName), function (currObj, idx) {
            currObj['inBytes'] = jsonPath(currObj, '$..in_bytes')[0];
            currObj['outBytes'] = jsonPath(currObj, '$..out_bytes')[0];
            currObj['project'] = currObj['name'].split(':').slice(0, 2).join(':');
            return currObj;
        });
        var projArr = [], projData = {};
        $.each(obj, function (idx, d) {
            if (!(d['project'] in projData)) {
                projData[d['project']] = {
                    inBytes:0,
                    inThroughput:0,
                    outThroughput:0,
                    outBytes:0,
                    vnCount:0
                }
            }
            projData[d['project']]['inBytes'] += ifNull(jsonPath(d, '$..in_bytes')[0], 0);
            projData[d['project']]['outBytes'] += ifNull(jsonPath(d, '$..out_bytes')[0], 0);
            projData[d['project']]['inThroughput'] += ifNull(jsonPath(d, '$..in_bandwidth_usage')[0], 0);
            projData[d['project']]['outThroughput'] += ifNull(jsonPath(d, '$..out_bandwidth_usage')[0], 0);
            projData[d['project']]['vnCount']++;
        });
        $.each(projData, function (key, obj) {
            $.extend(obj, {name:key});
            projArr.push(obj);
        });
        obj = projArr;
    } else if (objType == 'network') {
        obj = tenantNetworkMonitorUtils.networkParseFn(response);
    } else if (objType == 'instance') {
        obj = tenantNetworkMonitorUtils.instanceParseFn(response);
    } else if (objType == 'port') {
    } else if (objType == 'peer') {
    } else if ($.inArray(objType, ['flow', 'flowdetail']) > -1) {
        obj = $.map(response, function (obj, idx) {
            obj['sourceip'] = long2ip(obj['sourceip']);
            obj['destip'] = long2ip(obj['destip']);
            //obj['protocol'] = formatProtocol(obj['protocol']);
            if (view == 'list') {
                //obj['bytes'] = formatBytes(obj['bytes']);
            }
            obj['name'] = ifNull(obj['sourceip'], obj['destip']);
            obj['name'] += ':' + ifNull(obj['sport'], obj['dport']);
            return obj;
        });
    }
    return obj;
}

(function ($) {
    $.extend($.fn, {
        initWidgetHeader:function (data) {
            var widgetHdrTemplate = contrail.getTemplate4Id("widget-header-template");
            $(this).html(widgetHdrTemplate(data));
            if(data['widgetBoxId'] != undefined){
                startWidgetLoading(data['widgetBoxId']);
            }
            if (data['link'] != null)
                $(this).find('span').addClass('href-link');
            $(this).find('span').on('click', function () {
                if ((data['link'] != null) && (data['link']['hashParams'] != null))
                    layoutHandler.setURLHashObj(data['link']['hashParams']);
            });
        },
        initCharts:function (data) {
            var chartsTemplate = contrail.getTemplate4Id('charts-template');
            var networkChart, chartSelector;
            if ((data['chartType'] == null) && ($.inArray(ifNull(data['context'], ''), ['domain', 'network', 'connected-nw', 'project', 'instance']) > -1)) {
                networkChart = true;
                chartSelector = '.stack-chart';
            } else {
                networkChart = false;
                //chartSelector = '.d3-chart';
                chartSelector = '.stack-chart';
            }
            $(this).html(chartsTemplate(data));
            if (networkChart == true) {
                //Add durationStr
                $.each(data['d'], function (idx, obj) {
                    if (ifNull(obj['duration'], true)) {
                        if (obj['title'].indexOf('(') < 0)
                            obj['title'] += durationStr;
                    }
                });
                //Set the chart height to parent height - title height
            }
            //$(this).find('.stack-chart').setAvblSize();
            var charts = $(this).find(chartSelector);
            $.each(charts, function (idx, chart) {
                //Bind the function to pass on the context of url & objectType to schema parse function
                var chartData = data['d'][idx];
                var chartType = ifNull(chartData['chartType'], '');
                var fields;
                var objectType = chartData['objectType'];
                //Load asynchronously
                initDeferred($.extend({},chartData,{selector:$(this),renderFn:'initScatterChart'}));
                //If title is clickable
                if (chartData['link'] != null) {
                    var titleElem;
                    if ($(this).siblings('.example-title').length > 0)
                        titleElem = $(this).siblings('.example-title');
                    else
                        titleElem = $(this).parents('.widget-body').siblings('.widget-header').find('h4.smaller');
                    //titleElem.addClass('chart-title-link');
                    titleElem.on('click', function () {
                        if (chartData['link']['hashParams'] == null) {
                            var viewObj = tenantNetworkMonitorView;
                            var detailObj = chartData['link'];
                            //console.info(data['context']);
                            if (chartData['link']['context'] == 'instance') {
                                //Get the instance ip from drop-down
                                var instObj = getSelInstanceFromDropDown();
                                $.extend(detailObj, {ip:instObj['ip'], vnName:instObj['vnName']});
                            }
                            if (chartData['class'] != null)
                                viewObj = chartData['class'];
                            viewObj.loadSubView(detailObj);
                        } else {
                            //layoutHandler.setURLHashObj(chartData['link']['hashParams']);
                            layoutHandler.setURLHashParams(chartData['link']['hashParams']['q'], chartData['link']['conf']);
                        }
                    });
                }
            });
        },
        initSummaryStats:function (data) {
            var statsRowTemplate = Handlebars.compile($('#summary-stats-template').html());
            //If data['url'] == null,implies that populating the data will be handled by respective screen
            $(this).html(statsRowTemplate(data['list']));
            var self = $(this);
            var statsElem = $(this);
            var statsDatasource;
            if (data['url'] != null) {
                statsDatasource = new ContrailDataView({
                    remote:{
                        ajaxConfig:{
                            url:data['url']
                        },
                        dataParser:function (response) {
                            if (data['parseFn'] != null)
                                return data['parseFn'](response);
                            else
                                return [response];
                        }
                    },
                });
                statsDatasource.refreshData();
                statsElem.data('dataSource', statsDatasource);
            } else {
                ko.applyBindings(data['viewModel'], statsElem[0]);
            }
        },
        initTemplates:function (data) {
            
            var statsLen = $(this).find('.summary-stats').length;
            if (!(data['stats'] instanceof Array))
                data['stats'] = [data['stats']];
            if (!(data['grids'] instanceof Array))
                data['grids'] = [data['grids']];
            if (!(data['charts'] instanceof Array))
                data['charts'] = [data['charts']];
            $(this).find('.summary-stats').each(function (idx) {
                $(this).initSummaryStats(data['stats'][idx]);
            });
            //Assuming that all summary charts will be displayed at the bottom
            //console.info($(this).find('.summary-charts').parent().height());
            //$(this).find('.summary-charts').setAvblSize();
            $(this).find('.summary-charts').each(function (idx) {
                var contextObj = getContextObj(data);
                $(this).initCharts($.extend({}, data['charts'][idx], {context:data['context']}, contextObj));
            });
            $(this).find('.z-grid').each(function (idx) {
                //If grid height is set pass height as 100%
                if ($(this).height() > 0) {
                    if (data['grids'][idx]['config'] == null)
                        data['grids'][idx]['config'] = {};
                    $.extend(data['grids'][idx]['config'], {height:$(this).height()});
                }
                startWidgetLoading('charts');
                $(this).initGrid(data['grids'][idx]);
                endWidgetLoading('charts');
            });
            $(this).find('.ts-chart').each(function (idx) {
                $(this).initD3TSChart(data['ts-chart']);
            });
            if (data['topology'] != null && (typeof data['topology']['renderFn'] == 'function')) {
                data['topology']['renderFn']();
                //loadGraph();
            }
        },
        initHeatMap:function (response) {
        	var data=response['res'];
            var selector = $(this);
            var deferredObj = $.Deferred();
            var margin = { top:20, right:0, bottom:100, left:20 },
                width = 960 - margin.left - margin.right,
                height = 230 - margin.top - margin.bottom,
                gridSize = Math.floor(width / 64),
                legendElementWidth = gridSize * 2,
                buckets = 9,
                colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
                colors = ["white", "#599AC9"]; // alternatively colorbrewer.YlGnBu[9]
            var maxValue = d3.max(data, function (d) {
                return d.value;
            });
            if (maxValue == 0)
                colors = ['white'];
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, maxValue])
                .range(colors);

            var svg = d3.select($(selector)[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var xValues = [], yValues = [];
            for (var i = 0; i < 64; i++) {
                xValues.push(i);
            }
            for (var i = 0; i < 4; i++) {
                yValues.push(i);
            }
            var yLabels = svg.selectAll(".xLabel")
                .data(yValues)
                .enter().append("text")
                //.text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return i * gridSize;
                })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                .attr("class", function (d, i) {
                    return ((i >= 0 && i <= 4) ? "xLabel mono axis axis-workweek" : "xLabel mono axis");
                });

            var xLabels = svg.selectAll(".xLabel")
                .data(xValues)
                .enter().append("text")
                //.text(function(d) { return d; })
                .attr("x", function (d, i) {
                    return i * gridSize;
                })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function (d, i) {
                    return ((i >= 7 && i <= 16) ? "xLabel mono axis axis-worktime" : "xLabel mono axis");
                });

            var heatMap = svg.selectAll(".hour")
                .data(data)
                .enter().append("rect")
                .attr("x", function (d) {
                    return (d.x - 1) * gridSize;
                })
                .attr("y", function (d) {
                    return (d.y - 1) * gridSize;
                })
                //.attr("rx", 4)
                //.attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);
            heatMap.transition().duration(1000)
            .style("fill", function (d) {
                return colorScale(d.value);
            });
            heatMap.on('click',function(d){
               		var currHashObj = layoutHandler.getURLHashObj();
               		var startRange = ((64*d.y)+d.x)*256;
                	var endRange = startRange+255;
                	var params = {};
                	var protocolMap={'icmp':1,'tcp':6,'udp':17};
                	var divId = $($(selector)[0]).attr('id');
                	params['fqName'] = currHashObj['q']['fqName'];
                	params['port'] = startRange+"-"+endRange;
                	params['startTime'] = new XDate().addMinutes(-10).getTime();
                	params['endTime'] = new XDate().getTime();
               		params['portType'] = response['type'];
               		params['protocol'] = protocolMap[response['pType']];
               		layoutHandler.setURLHashParams(params,{p:'mon_net_networks'}); 
               	 });
            heatMap.on('mouseover',function(){
            	d3.select(this).style('cursor','pointer');
            });
            heatMap.append("title").text(function (d) {
                var startRange = ((64 * d.y) + d.x) * 256;
                //return 'Hello' + d.value;
                return startRange + ' - ' + (startRange + 255);
            });

            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function (d) {
                    return d;
                })
                .enter().append("g")
                .attr("class", "legend");
            /*
             legend.append("rect")
             .attr("x", function(d, i) { return legendElementWidth * i; })
             .attr("y", height)
             .attr("width", legendElementWidth)
             .attr("height", gridSize / 2)
             .style("fill", function(d, i) { return colors[i]; });

             legend.append("text")
             .attr("class", "mono")
             .text(function(d) { return "� " + Math.round(d); })
             .attr("x", function(d, i) { return legendElementWidth * i; })
             .attr("y", height + gridSize);
             */
            //});
        },
        initSummaryTemplate:function (data) {
            //Check for optional elements('ts-chart');
            $(this).find('.summary-stats').initSummaryStats(data['stats']);
            //$(this).find('.summary-charts').setAvblSize();
            $(this).find('.summary-charts').initCharts(data['charts']);
        },
        //Requires url & columns
        initGrid:function (data) {
            var gridDetailConfig = { };
            if (data['detailParseFn'] != null)
                gridDetailConfig = {
                    template:$('#gridDetailTemplate').html(),
                    onInit:function (e,dc) {
                        var detailTemplate = contrail.getTemplate4Id('detailTemplate');
                        var rowData = e.data;
                        var grid = $(e['srcElement']).closest('div.contrail-grid');
                        var dataItem = dc;
                        //Issue a call for fetching the details
                        if(dataItem['url'] != null) {
                            $.ajax({
                                url:dataItem['url']
                            }).done(function(result) {
                                //There will be only one entry in response,look at 0th element as we are requesting for specific VN/VM
                                var response = result;
                                if(result['value'] != null)
                                    response = result['value'][0];
                                e.detailRow.find('.row-fluid.advancedDetails').html('<div><pre style="background-color:white">' + syntaxHighlight(response) + '</pre></div>');
                                e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data['detailParseFn'](response)));
                                $(grid).data('contrailGrid').adjustDetailRowHeight(dataItem['id']);
                            });
                        } else
                            e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data['detailParseFn'](rowData)));
                    },
                    onCollapse:function (e,dc) {
                    }
                }
            var transportCfg = {};
            if(data['timeout'] != null)
                transportCfg = {timeout:data['timeout']};
            if(data['transportCfg'] != null)
                transportCfg = data['transportCfg'];
            var dataSource = {
                        remote:{
                            ajaxConfig: $.extend({
                                url:typeof data['url'] == 'function' ? data['url']() : data['url']
                            },transportCfg),
                            
                            dataParser: function(response){
                                if (data['parseFn'] != null) {
                                    if(transportCfg['url'] == '/api/tenant/get-data')
                                        return data['parseFn'](response[0]);
                                    else
                                        return data['parseFn'](response);
                                } else
                                    return response;
                            }
                        }
            };
            if(data['dataSource'] != null)
                dataSource = {dataView: data['dataSource']};
            if(data['isAsyncLoad']) 
                data['config']['showLoading'] = true;
            if (data != null) {
                var kGrid = $(this).contrailGrid($.extend({
                    header : {
                        title: {
                            text: data['config']['widgetGridTitle']
                        },
                        customControls:ifNull(data['config']['widgetGridActions'],[])
                    },
                    body: {
                        options: {
                            forceFitColumns:true,
                            enableColumnReorder:true,
                            //rowHeight:30,
                            autoHeight:true,
                            detail: !$.isEmptyObject(gridDetailConfig) ? gridDetailConfig : false,
                            sortable:true,
                            lazyLoading: data['isAsyncLoad'] != null ? data['isAsyncLoad'] : false
                        },
                        dataSource: dataSource,
                        statusMessages: {
                            loading: {
                                text: 'Loading..',
                            },
                            empty: {
                                text: ifNull(data['config']['noMsg'],'No data to display') 
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in fetching the details'
                            }
                        }
                    },
                    footer : {
                        pager : {
                            options : {
                                pageSize : 50,
                                pageSizeSelect : [ 5, 10, 50, 100 ]
                            }
                        }
                    },
                    columnHeader: {
                        columns:data['columns'],
                    },
                    /*dataBound:function (e) {
                        var sender = e.sender;
                        $(sender.element).data('loaded', true);
                        addExtraStylingToGrid(sender);
                    },
                    searchToolbar:(data['config'] != null && data['config']['widgetGridTitle'] != null) ? true : false*/
                }, data['config']));
                var cGrid = $(this).data('contrailGrid');
                if(data['idField'] != null)
                    $(this).data('idField',data['idField']);
                //If deferredObj is pending and record count is empty..then show loading icon implies that first set of records are not fetched yet
                if((data['deferredObj'] != null && data['deferredObj'].state() == 'pending' && data['dataSource'].getItems().length == 0)
                        || data['url'] != null) {
                    cGrid.showGridMessage('loading'); 
                }
                applyGridDefHandlers($(this).data('contrailGrid'),data['config']);
                //As events will not be triggered on cached dataSource,fire events manually
                //widget loading icon will be hidden when the deferredobj resolves or rejects
                if(data['deferredObj'] != null) {
                    if(data['deferredObj'].state() != 'pending' && data['error'] == null)
                        triggerDatasourceEvents(data['dataSource']);
                    else if(data['deferredObj'].state() != 'pending' && data['error'] != null && data['errTxt'] != 'abort')
                        cGrid.showGridMessage('error','Error in fetching the details');
                    data['deferredObj'].fail(function(errObj){
                        if(cGrid != null) {
                            if(errObj['errTxt'] != null && errObj['errTxt'] != 'abort')
                                cGrid.showGridMessage('error','Error in fetching the details');
                        } 
                    });
                    if(data['isAsyncLoad'] == true)
                        data['deferredObj'].always(function(){
                            if(cGrid != null) {
                                cGrid.removeGridLoading();
                            }
                        })
                }    
                //Bind deferred Obj
                if(data['loadedDeferredObj'] != null)
                    $(this).data('loadedDeferredObj',data['loadedDeferredObj']);
                //calling refreshview, because sometimes the grid seems cluttered with data in the datasource
                cGrid.refreshView();
            } else {
                $(this).contrailGrid();
            }
        },
        initListTemplate:function (data) {
            $(this).find('.z-grid').initGrid(data);
        },
        getUnusedSize:function (sizingProperty) {
            sizingProperty = ifNull(sizingProperty, 'height');
            var innerSizingFn, sizingFn, outerSizingFn;
            if (sizingProperty == 'height') {
                innerSizingFn = 'innerHeight';
                sizingFn = 'height';
                outerSizingFn = 'outerHeight';
            } else {
                innerSizingFn = 'innerWidth';
                sizingFn = 'width';
                outerSizingFn = 'outerWidth';
            }
            //With box-sizing:border-box, innerHeight is more than height!!
            var parentSize = Math.min($(this).parent()[innerSizingFn](), $(this).parent()[sizingFn]());
            //console.info('parentSize:',parentSize);
            //if($(this).parent()[0].style.height == 'auto')
            if (parentSize < 1)
                parentSize = $(this).parent().parent()[innerSizingFn]();
            var siblingsSize = 0;
            //Handle vertical margin collapse scenario
            $(this).siblings().each(function () {
                //Exclude hidden siblings;
                if ($(this).is(':visible') == false)
                    return;
                siblingsSize += $(this)[outerSizingFn](true);
                //console.info($(this),$(this).outerHeight(true));
            });
            //console.info(parentSize,parentSize-siblingsSize);
            return parentSize - siblingsSize;
        },
        setAvblSize:function (sizingProperty, buffer) {
            sizingProperty = ifNull(sizingProperty, 'height');
            var sizingFn;
            buffer = ifNull(buffer, 0);
            if (sizingProperty == 'height')
                sizingFn = 'height';
            else
                sizingFn = 'width';
            //To work for an array of elements
            $(this).each(function () {
                var unusedSize = $(this).getUnusedSize(sizingProperty);
                //logMessage('Setting Height:',$(this),unusedHeight);
                $(this)[sizingFn](unusedSize - buffer);
            });
        }
    });
})(jQuery);

function formatLblValueTooltip(infoObj) {
    var tooltipTemplateSel = 'title-lblval-tooltip-template';
    var tooltipTemplate = contrail.getTemplate4Id(tooltipTemplateSel);
    return tooltipTemplate(infoObj);
}

function formatLblValueMultiTooltip(data) {
    var tooltipTemplateSel = 'overlapped-bubble-tooltip';
    var tooltipTemplate = contrail.getTemplate4Id(tooltipTemplateSel);
    return tooltipTemplate(data);
}
/**
 * As dataSource events don't trigger on cached dataSource's, trigger events manually
 */
function triggerDatasourceEvents(dataSource){
    if(dataSource != null) {
        $(dataSource).trigger('change');
    }
}

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
                data['forceX'] = [0, 0.15];
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
            if(data['xPositive'] != null)
                chartOptions['xPositive'] = data['xPositive'];
            if(data['yPositive'] != null)
                chartOptions['yPositive'] = data['yPositive'];
            if(data['addDomainBuffer'] != null)
                chartOptions['addDomainBuffer'] = data['addDomainBuffer'];
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
            chartOptions['tooltipFn'] = ifNull(data['tooltipFn'], bgpMonitor.nodeTooltipFn);
            if(chartOptions['multiTooltip'] || chartOptions['forcedTooltip']) {
                //d = markOverlappedBubbles(d);
                chartOptions['tooltipRenderedFn'] = function(tooltipContainer,e,chart) {
                    if(e['point']['overlappedNodes'] != undefined && e['point']['overlappedNodes'].length >1) {
                       var result = {};
                       if(e['point']['type'] == 'project')
                           result = getMultiTooltipContent(e,tenantNetworkMonitor.getProjectTooltipContents,chart);
                       else if(e['point']['type'] == 'network')
                           result = getMultiTooltipContent(e,tenantNetworkMonitor.getNetworkTooltipContents,chart);
                       else if(e['point']['type'] == 'sport' || e['point']['type'] == 'dport')
                           result = getMultiTooltipContent(e,tenantNetworkMonitor.getPortTooltipContents,chart);
                       else
                           result = getMultiTooltipContent(e,bgpMonitor.getTooltipContents,chart);
                       
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
                                leftPos = $(tooltipContainer).offset()['left'];
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
                              leftPos = $(tooltipContainer).offset()['left'];
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
                      leftPos = $(tooltipContainer).offset()['left'];
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


function prettifyBytes(obj) {
    var bytes = obj['bytes'];
    var maxPrecision = obj['maxPrecision'];
    var noDecimal = obj['noDecimal'];
    var stripUnit = obj['stripUnit'];
    if (!$.isNumeric(bytes))
        return '-';
    if (bytes == 0)
        return (stripUnit != null) ? 0 : '0 B';
    var formatStr = '';
    var decimalDigits = 2;
    if ((maxPrecision != null) && (maxPrecision == true))
        decimalDigits = 6;
    if (noDecimal != null && noDecimal == true)
        decimalDigits = 0;
    //Ensure that bytes is always positive
    bytes = parseInt(bytes);
    bytes = makePositive(bytes);
    var bytePrefixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
    var multipliers = [1, 1024, 1024 * 1024, 1024 * 1024 * 1024];
    var prefixIdx = 0;
    var multiplier = 1;
    if ($.inArray(obj['prefix'], bytePrefixes) > -1) {
        prefixIdx = $.inArray(obj['prefix'], bytePrefixes);
        multiplier = multipliers[prefixIdx];
    } else
        $.each(bytePrefixes, function (idx, prefix) {
            //Can be converted into higher unit
            if (bytes / multiplier > 1024) {
                multiplier = multiplier * 1024;
                prefixIdx++;
            } else
                return false;
        });
    if (stripUnit != null)
        formatStr = parseFloat((bytes / multiplier).toFixed(decimalDigits));
    else
        formatStr = contrail.format('{0} {1}', (bytes / multiplier).toFixed(decimalDigits), bytePrefixes[prefixIdx]);
    logMessage('formatBytes', bytes, multiplier, prefixIdx, bytes / multiplier);
    return formatStr;
}

function formatThroughput(bytes,noDecimal,maxPrecision) {
    return formatBytes(bytes,noDecimal,maxPrecision).replace('B','b') + 'ps';
}

function formatBytes(bytes, noDecimal, maxPrecision, precision) {
    if (!$.isNumeric(bytes))
        return '-';
    if (bytes == 0)
        return '0 B';
    var formatStr = '';
    var decimalDigits = 2;
    if ((maxPrecision != null) && (maxPrecision == true)) {
        decimalDigits = 6;
    } else if(precision != null) {
        decimalDigits = precision < 7 ? precision : 6;
    }
    if (noDecimal != null && noDecimal == true)
        decimalDigits = 0;
    //Ensure that bytes is always positive
    bytes = parseInt(bytes);
    bytes = makePositive(bytes);
    var bytePrefixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB']
    $.each(bytePrefixes, function (idx, prefix) {
        if (bytes < 1024) {
            formatStr = contrail.format('{0} {1}', parseFloat(bytes.toFixed(decimalDigits)), prefix);
            return false;
        } else {
            //last iteration
            if (idx == (bytePrefixes.length - 1))
                formatStr = contrail.format('{0} {1}', parseFloat(bytes.toFixed(decimalDigits)), prefix);
            else
                bytes = bytes / 1024;
        }
    });
    return formatStr;
}

function convertToBytes(formattedBytes) {
    var formatStr;
    var decimalDigits = 2;
    var arr = formattedBytes.split(" ");
    var value = arr[0];
    var unit = arr[1];
    var unitMultiplier = {'B':1, 'KB':1024, 'MB':1024 * 1024, 'GB':1024 * 1024 * 1024};
    return value * unitMultiplier[unit];
}

function fixDecimals(number, maxPrecision) {
    try {
        return parseInt(number).toFixed(maxPrecision);
    } catch (e) {
        return number;
    }
}

function ifNull(value, defValue) {
    if (value == null)
        return defValue;
    else
        return value;
}

function ifNotNumeric(value,defValue) {
    if($.isNumeric(value))
        return value;
    else
        return defValue;
}

function ifNullOrEmptyObject(value, defValue) {
    //If value is null or an empty object
    if (value == null || ($.isPlainObject(value) && $.isEmptyObject(value)))
        return defValue;
    else
        return value;
}

function ifEmpty(value, defValue) {
    if (value == '')
        return defValue;
    else
        return value;
}

function ifNullOrEmpty(value, defValue) {
    if (value == null || value == '')
        return defValue;
    else
        return value;
}

function ifNotEmpty(value,defValue) {
    if(value != '')
        return defValue;
    else
        value;
}

function makePositive(num) {
    if (num < 0)
        return -1 * num;
    else
        return num;
}

function makeNegative(num) {
    if (num > 0)
        return -1 * num;
    else
        return num;
}

function dot2num(dot) {
    var d = dot.split('.');
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

function num2dot(num) {
    var d = num % 256;
    for (var i = 3; i > 0; i--) {
        num = Math.floor(num / 256);
        d = num % 256 + '.' + d;
    }
    return d;
}

function ip2long(ip) {
    if (typeof(ip) != 'string')
        return ip;
    var ipl = 0;
    ip.split('.').forEach(function (octet) {
        ipl <<= 8;
        ipl += parseInt(octet);
    });
    return(ipl >>> 0);
}

function long2ip(ipl) {
    if (typeof(ipl) != 'number')
        return ipl;
    return ( (ipl >>> 24) + '.' +
        (ipl >> 16 & 255) + '.' +
        (ipl >> 8 & 255) + '.' +
        (ipl & 255) );
}

function pushBreadcrumb(breadcrumbsArr) {
    for (var i = 0; i < breadcrumbsArr.length; i++) {
        //Remove active class
        $('#breadcrumb').children('li').removeClass('active');
        if (i == 0) {
            //Add divider icon for previous breadcrumb
            $('#breadcrumb').children('li:last').append('<span class="divider"><i class="icon-angle-right"></i></span>')
        }
        if (i == breadcrumbsArr.length - 1) {
            $('#breadcrumb').append('<li class="active"><a>' + breadcrumbsArr[i] + '</a></li>');
        } else {
            $('#breadcrumb').append('<li><a>' + breadcrumbsArr[i] + '</a><span class="divider"><i class="icon-angle-right"></i></span></li>');
        }
    }
}

function MenuHandler() {
    var self = this;
    var menuObj;
    self.deferredObj = $.Deferred();
    var menuDefferedObj = $.Deferred(), orchDefferedObj = $.Deferred(), statDefferredObj = $.Deferred();

    this.loadMenu = function () {
        $.get('/menu.xml?built_at=' + built_at, function (xml) {
            menuObj = $.xml2json(xml);
            processXMLJSON(menuObj);
            menuDefferedObj.resolve();
        });
        orchDefferedObj.resolve();
        //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
        
        $.ajax({
            url:'/api/service/networking/web-server-info'
        }).done(function (response) {
            if(response['serverUTCTime'] != null) {
                response['timeDiffInMillisecs'] =  response['serverUTCTime'] - new Date().getTime();
               if(Math.abs(response['timeDiffInMillisecs']) > timeStampTolearence){
                    if(response['timeDiffInMillisecs'] > 0)
                        timeStampAlert = [{msg:infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(),new XDate(response['serverUTCTime']),'rounded')),
                                sevLevel:sevLevels['INFO']}];
                    else
                        timeStampAlert = [{msg:infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(response['serverUTCTime']),new XDate(),'rounded')),
                                sevLevel:sevLevels['INFO']}];
                }
                globalObj['webServerInfo'] = response;
            }    
        });
        
        $.ajax({
            url:'/api/admin/webconfig/qe/enable_stat_queries'
        }).done(function (result) {
                globalObj['enable_stat_queries'] = result['enable_stat_queries'];
                statDefferredObj.resolve();
        });

        $.when.apply(window, [menuDefferedObj, orchDefferedObj, statDefferredObj]).done(function () {
            self.deferredObj.resolve();
        });
    }

    this.toggleMenuButton = function (menuButton, currPageHash, lastPageHash) {
        var currentBCTemplate = contrail.getTemplate4Id('current-breadcrumb');
        var currPageHashArray, subMenuId, reloadMenu, linkId;
        if (menuButton == null) {
            currPageHashArray = currPageHash.split('_');
            //Looks scalable only till 2nd level menu
            subMenuId = '#' + currPageHashArray[0] + '_' + currPageHashArray[1];
            linkId = '#' + currPageHashArray[0] + '_' + currPageHashArray[1] + '_' + currPageHashArray[2];
            menuButton = getMenuButtonName(currPageHashArray[0]);
            //If user has switched between top-level menu
            reloadMenu = check2ReloadMenu(lastPageHash, currPageHashArray[0]);
        }
        if (reloadMenu == null || reloadMenu) {
            $('#menu').html('');
            $('#menu').html(contrail.getTemplate4Id(menuButton + '-menu-template')({globalObj: globalObj}));
            if ($('#sidebar').hasClass('menu-min')) {
                $('#sidebar-collapse').find('i').toggleClass('icon-chevron-left').toggleClass('icon-chevron-right');
            }
            this.selectMenuButton("#btn-" + menuButton);
        }
        if (subMenuId == null) {
            subMenuId = "#" + $('.item:first').find('ul:first').attr("id");
            window.location = $(subMenuId).find('li:first a').attr("href"); // TODO: Avoid reload of page; fix it via hash.
        } else {
            toggleSubMenu($(subMenuId), linkId);
            var currURL = window.location.href.split(window.location.host)[1];
            //Modify breadcrumb only if current URL is same as default one
            //Reset to default menu breadcrumbs
            //if($(linkId + ' a').attr('href') == currURL) {
            //var breacrumbsArr = [$(linkId).parents('li').parents('ul').children('li:first').children('a').text().trim(),
            //    $(linkId + ' a').text().trim(),$(linkId).parents('li').children('a').text().trim()];
            var breadcrumbsArr = [{
                href:$(linkId + ' a:first').attr('href').trim(),
                link:$(linkId + ' a:first').text().trim()
            }];
            if ($(linkId).parents('ul').length == 2) {
                breadcrumbsArr.unshift({
                    href:$(linkId).parents('li').children('a:first').attr('data-link').trim(),
                    link:$(linkId).parents('li').children('a:first').text().trim()
                });
                breadcrumbsArr.unshift({
                    href:$(linkId).parents('li').parents('ul').children('li:first').children('a:first').attr('data-link').trim(),
                    link:$(linkId).parents('li').parents('ul').children('li:first').children('a:first').text().trim()
                });
            } else {
                breadcrumbsArr.unshift({
                    href:$(linkId).parents('li').parents('ul').children('li:first').children('a:first').attr('data-link').trim(),
                    link:$(linkId).parents('li').parents('ul').children('li:first').children('a:first').text().trim()
                });
            }
            $('#breadcrumb').html(currentBCTemplate(breadcrumbsArr));
            //}
        }
    }

    this.selectMenuButton = function (buttonId) {
        $('#btn-monitor').removeClass("active");
        $('#btn-configure').removeClass("active");
        $('#btn-query').removeClass("active");
        $('#btn-setting').removeClass("active");
        $(buttonId).addClass("active");
    }

    /*
     * post-processing of menu XML JSON
     * JSON expectes item to be an array,but xml2json make item as an object if there is only one instance
     */
    function processXMLJSON(json) {
        if ((json['items'] != null) && (json['items']['item'] != null)) {
            if (json['items']['item'] instanceof Array) {
                for (var i = 0; i < json['items']['item'].length; i++) {
                    processXMLJSON(json['items']['item'][i]);
                    add2SiteMap(json['items']['item'][i]);
                }
            } else {
                processXMLJSON(json['items']['item']);
                add2SiteMap(json['items']['item']);
                json['items']['item'] = [json['items']['item']];
            }
        }
    }

    function add2SiteMap(item) {
        var searchStrings = item.searchStrings, hash = item.hash, queryParams = item.queryParams;
        if (hash != null && searchStrings != null) {
            var searchStrArray = splitString2Array(searchStrings, ',');
            siteMap[hash] = {searchStrings:searchStrArray, queryParams:queryParams};
            for (var j = 0; j < searchStrArray.length; j++) {
                siteMapSearchStrings.push(searchStrArray[j]);
            }
        }
    }

    function isDependencyOk(dependencies) {
        return true;
    }

    /*
     * Strip down the menu object to only required fields
     */
    function formatMenuObj(currMenu) {
        var retMenuObj = {};
        $.each(['label', 'class', 'name'], function (index, value) {
            if (value == 'class') {
                if ((currMenu[value] == null) && (currMenu['loadFn'] == null))
                    retMenuObj['cls'] = 'disabled';
                else
                    retMenuObj['cls'] = 'enabled';
                if (currMenu['hide'] == 'true')
                    retMenuObj['cls'] = 'hide';
            } else {
                retMenuObj[value] = currMenu[value];
            }
        });
        return retMenuObj;
    }

    function processMenu(menuObj) {
        var retMenuObj = [];
        for (var i = 0, j = 0; i < menuObj.length; i++) {
            //Process this menu only if dependencies are OK
            if (isDependencyOk(menuObj[i])) {
                retMenuObj[j] = formatMenuObj(menuObj[i]);
                if ((menuObj[i]['items'] != null) && (menuObj[i]['items']['item'] != null) && (menuObj[i]['items']['item'].length > 0)) {
                    retMenuObj[j]['items'] = {};
                    retMenuObj[j]['items'] = processMenu(menuObj[i]['items']['item']);
                }
                j++;
            }
        }
        return retMenuObj;
    }

    this.destroyView = function (currMenuObj) {
        if (currMenuObj == null)
            return;
        //Call destory function on viewClass which is being unloaded
        if ((currMenuObj['class'] != null) && (typeof(window[currMenuObj['class']]) == 'function' || typeof(window[currMenuObj['class']]) == 'object') &&
            (typeof(window[currMenuObj['class']]['destroy']) == 'function')) {
			$.allajax.abort();
			
            try {
                window[currMenuObj['class']]['destroy']();
            } catch (error) {
                console.log(error.stack);
            }
        }
        //window[currMenuObj['class']] = null;
    }

    this.getMenuObjByHash = function (menuHash, currMenuObj) {
        if (currMenuObj == null)
            currMenuObj = menuObj['items']['item'];
        for (var i = 0; i < currMenuObj.length; i++) {
            //console.info(currMenuObj[i]['hash']);
            if (currMenuObj[i]['hash'] == menuHash)
                return currMenuObj[i];
            if ((currMenuObj[i]['items'] != null) && (currMenuObj[i]['items']['item'] != null) && (currMenuObj[i]['items']['item'].length > 0)) {
                var retVal = self.getMenuObjByHash(menuHash, currMenuObj[i]['items']['item']);
                if (retVal != -1)
                    return retVal;
            }
        }
        return -1;
    }

    this.getMenuObjByName = function (menuName) {
        menuName = menuName.replace('menu_', '');
        var currMenuObj = menuObj;
        for (var i = 0; i < menuName.length; i++) {
            var currMenuIdx = menuName[i];
            currMenuObj = currMenuObj['items']['item'][currMenuIdx];
        }
        return currMenuObj;
    }

    this.loadResourcesFromMenuObj = function(currMenuObj,deferredObj) {
        if (currMenuObj['rootDir'] != null) {
            //Update page Hash only if we are moving to a different view
            var currHashObj = layoutHandler.getURLHashObj();
            if (currHashObj['p'] != currMenuObj['hash']) {
                layoutHandler.setURLHashObj({p:currMenuObj['hash'], q:currMenuObj['queryParams']});
                globalObj.hashUpdated = 1;
            }
            var deferredObjs = [];
            var rootDir = currMenuObj['rootDir'];
            var viewDeferredObjs = [];
            if (currMenuObj['view'] != null) {
                if (!(currMenuObj['view'] instanceof Array)) {
                    currMenuObj['view'] = [currMenuObj['view']];
                }
                $.each(currMenuObj['view'], function () {
                    var viewDeferredObj = $.Deferred();
                    viewDeferredObjs.push(viewDeferredObj);
                    var viewPath = rootDir + '/views/' + this + '?built_at=' + built_at;
                    templateLoader.loadExtTemplate(viewPath, viewDeferredObj, currMenuObj['hash']);
                });
            } 
            //View file need to be downloaded first before executing any JS file
            $.when.apply(window, viewDeferredObjs).done(function() {
                if (currMenuObj['js'] instanceof Array) {
                } else
                    currMenuObj['js'] = [currMenuObj['js']];
                var isLoadFn = currMenuObj['loadFn'] != null ? true : false;
                var isReloadRequired = true;
                //Restrict not re-loading scripts only for monitor infrastructure and monitor networks for now
                if(currMenuObj['class'] == 'infraMonitorView' || currMenuObj['class'] == 'tenantNetworkMonitorView')
                    isReloadRequired = false;
                $.each(currMenuObj['js'], function () {
                    //Load the JS file only if it's not loaded already
                    //if (window[currMenuObj['class']] == null)
                    if(($.inArray(rootDir + '/js/' + this,globalObj['loadedScripts']) == -1) ||
                        (isLoadFn == true) || (isReloadRequired == true))
                        deferredObjs.push(getScript(rootDir + '/js/' + this));
                });
                /*$.each(currMenuObj['css'],function() {
                     deferredObjs.push(loadCSS(rootDir + '/css/' + this));
                 });*/
                $.when.apply(window, deferredObjs).done(function () {
                    deferredObj.resolve();
                });
            });
        }
    }

    this.loadViewFromMenuObj = function (currMenuObj) {
        //Store in globalObj
        globalObj.currMenuObj = currMenuObj;
        var deferredObj = $.Deferred();
        try {
                self.loadResourcesFromMenuObj(currMenuObj,deferredObj);
                deferredObj.done(function () {
                    if (currMenuObj['loadFn'] != null) {
                        window[currMenuObj['loadFn']]();
                    } else if (currMenuObj['class'] != null) {
                        //Cleanup the container
                        $(contentContainer).html('');
                        window[currMenuObj['class']].load({containerId:contentContainer, hashParams:layoutHandler.getURLHashParams()});
                    }
                });
        } catch (error) {
            console.log(error.stack);
        }
    }

    function loadViewByName(name) {
        //Destory current view
        self.destroyView(globalObj.currMenuObj);
        var currMenuObj = self.getMenuObjByName(name);
        self.loadViewFromMenuObj(currMenuObj);
    }
}

function strUtil() {
    this.splitStrToChunks = function (value) {
        var valueArr = [];
        var startIdx = 0;
        do {
            valueArr.push(value.substr(startIdx, 10));
            startIdx += 10;
        } while (startIdx < value.length)
        valueArr.push(value.substr(startIdx));
        //console.info(valueArr);
        return valueArr;
    }
}

var stringUtil = new strUtil();

function isInitialized(selector) {
    if ($(selector).attr('data-role') != null)
        return true;
    else
        return false;
}

function isGridInitialized(selector) {
    if ($(selector).attr('class') != null && $(selector).attr('class').indexOf('contrail-grid') != -1)
        return true;
    else 
        return false;
}

function isDropdownInitialized(selector){
    if($('#s2id_' + selector).length > 0)
        return true;
    else 
        return false;
}

function isScatterChartInitialized(selector){
	if ($(selector + ' > svg') != [])
        return true;
    else
        return false;
}

function flattenList(arr) {
    //Flatten one-level of the list
    return $.map(arr, function (val) {
        return val;
    });
}
function flattenArr(arr) {
    var retArr = [];
    $.each(arr, function (idx, obj) {
        if (obj['length'] != null)
            $.each(obj, function (idx, obj) {
                retArr.push(obj);
            });
        else
            retArr.push(obj);
    });
    return retArr;
}

$.deparam = function (query) {
    var query_string = {};
    var query = ifNull(query,'');
    if (query.indexOf('?') > -1)
        query = query.substr(query.indexOf('?') + 1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        pair[0] = decodeURIComponent(pair[0]);
        pair[1] = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
};


function reloadGrid(grid){
	grid.refreshData();
}

/**
 * Template to show the tooltip on grid cells
 */
function cellTemplate(options) {
    var name = null, nameStr = '', cellText = '', titleStr = '', nameCls = '', tooltipCls = '', onclickAction = '',colorCls = '';
    if (options == null)
        options = {};
    name = ifNull(options['name'], name);
    cellText = ifNull(options['cellText'], cellText);
    //Assign title attribute only if tooltipCls is present
    if ((cellText != null) && (cellText.indexOf('#') != 0))
        cellText = '#=' + cellText + '#';
    var tooltipText = cellText;
    tooltipText = ifNull(options['tooltipText'], tooltipText);

    if (name != null) {
        nameStr = 'name="' + name + '"';
        nameCls = 'cell-hyperlink';
    }
    if ((options['tooltip'] == true) || (options['tooltipText'] != null) || (options['tooltipFn'] != null)) {
        tooltipCls = 'mastertooltip';
        if (options['tooltipFn'] != null) {
            titleStr = 'title="#=tooltipFns.' + options['tooltipFn'] + '(data)#"';
        } else
            titleStr = 'title="' + tooltipText + '"';
    }
    if (options['onclick'] != null) {
        onclickAction = 'onclick="' + options['onclick'] + '"';
    }
    if (options['applyColor']){
        colorCls = '#=decideColor(\'{1}\',hostNameColor)#';
    } else {
        colorCls = nameCls;
    }
    return contrail.format("<div class='{1} {5}' {0} {2} {4}>{3}</div>", nameStr, tooltipCls, titleStr, cellText, onclickAction, colorCls);
}

/* 
 * Function to style links on grid cell
 */
function cellTemplateLinks(options) {
    var name = null, nameStr = '', cellText = '', titleStr = '', nameCls = '', tooltipCls = '', onclickAction = '',statusBubble = '';
    if (options == null)
        options = {};
    name = ifNull(options['name'], name);
    var rowData = ifNull(options['rowData'],{});
    cellText = ifNull(options['cellText'], cellText);
    //Assign title attribute only if tooltipCls is present
    if ((cellText != null) && (cellText.indexOf('#') != 0))
        cellText = ifNull(rowData[cellText],'-');
    var tooltipText = cellText;
    tooltipText = ifNull(options['tooltipText'], tooltipText);

    if (name != null) {
        nameStr = 'name="' + name + '"';
    }
    if ((options['tooltip'] == true) || (options['tooltipText'] != null) || (options['tooltipFn'] != null)) {
        tooltipCls = 'mastertooltip';
        if (options['tooltipFn'] != null) {
            titleStr = 'title="#=tooltipFns.' + options['tooltipFn'] + '(data)#"';
        } else
            titleStr = 'title="' + tooltipText + '"';
    }
    if (options['onclick'] != null) {
        onclickAction = 'onclick="' + options['onclick'] + '"';
    }
    if(options['statusBubble'] == true)
        statusBubble = getNodeStatusForSummaryPages(rowData,'summary');
    return contrail.format("<div class='{1}' {0} {2} {4}>{5}{3}</div>", nameStr, tooltipCls, titleStr, cellText, onclickAction, statusBubble);
}

/**
 * Default jQuery Ajax Error Handler
 */
function ajaxDefErrorHandler(xhr) {
    return;
    var responseText = x.responseText;
    if (x.status == 0) {
        showInfoWindow('You are offline!!n Please Check Your Network. ' + responseText);
    } else if (x.status == 404) {
        showInfoWindow('Requested URL not found. ' + responseText);
    } else if (x.status == 500) {
        showInfoWindow('Internel Server Error. ' + responseText);
    } else if (e == 'parsererror') {
        showInfoWindow('Error Parsing JSON Request failed. ' + responseText);
    } else if (e == 'timeout') {
        showInfoWindow('Request Time out. ' + responseText);
    } else {
        showInfoWindow('Unknow Error.n ' + x.responseText);
    }
}

function renderSparkLines(cellNode,row,dataContext,colDef) {
    $(cellNode).find('.gridSparkline').each(function() {
            drawSparkLine4Selector(this, 'blue-grid-sparkline', dataContext['histCpuArr']);
        });
}

function applyGridDefHandlers(cGrid, options) {
    var options = ifNull(options,{});
    if (typeof cGrid == "undefined")
        return;
    var noMsg = 'No data to display';
    var dataSource = cGrid._dataView;
    if (options['noMsg'] != null)
        noMsg = options['noMsg'];
    dataSource.onUpdateData.subscribe(function(){
       if(dataSource.getItems().length == 0)
           cGrid.showGridMessage('empty',noMsg);
    });
}

function updateCpuSparkLines(kGrid,data){
	//clear the sparklines before updating them
	$('.gridSparkline').html('');
	$('.gridSparkline').each(function() {
        var rowIndex = $(this).closest('td').parent().index();
        var data;
        if(kGrid.dataSource.at(rowIndex) != null)
        	data = kGrid.dataSource.at(rowIndex)['histCpuArr'];
        if(data != null) {
            drawSparkLine4Selector(this, 'blue-grid-sparkline', data.toJSON());
        }
    });
}

function sort(object) {
    if (Array.isArray(object)) {
        return object.sort();
    }
    else if (typeof object !== "object" || object === null) {
        return object;
    }

    return Object.keys(object).sort().map(function (key) {
        return {
            key:key,
            value:sort(object[key])
        };
    });
}

function isCellSelectable(elem) {
    if ($(elem).find('*[name]').length > 0)
        return $(elem).find('*[name]').attr('name');
    else
        return false;
}

function selectTab(tabStrip,tabIdx) {
    $( '#'+tabStrip ).tabs( "option", "active", tabIdx );
}

function displayAjaxError(jQueryElem, xhr, textStatus, errorThrown) {
    showProgressMask(jQueryElem, false);
    var errMsg = "";
    if (textStatus == 'timeout')
        errMsg = "Timeout occured in fetching the details";
    else
        errMsg = 'Unexpected Error in fetching the details';
    jQueryElem.html(contrail.format('<div class="ajax-error">{0}</div>', errMsg));
}

function logMessage() {
    return;
    var allTypes = ['flowSeriesChart','hashChange','scatterChart','formatBytes'];
    var reqTypes = [];
    var timeMessages = ['flowSeriesChart'];
    var args = [], logType;
    if (arguments.length != 0) {
        args = Array.prototype.slice.call(arguments);
        logType = args.shift();
    }
    if ($.inArray(logType, reqTypes) == -1)
        return;
    //Can make the last argument as a context for message that enables controlling the logmessages
    //Append time only for certain types
    if($.inArray(logType,timeMessages) > -1)
        args.push(new Date());
    //args.unshift(logType);
    console.log.apply(console, args);
}

function formatProtocol(proto) {
    var protMAP = {17:'UDP', 6:'TCP', 2:'IGMP', 1:'ICMP'}
    return (protMAP[proto] != null) ? protMAP[proto] : proto;
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

function log2(val) {
    return Math.log(val) / Math.LN2;
}

function getContextObj(data) {
    var contextObj = {};
    $.each(['fqName', 'srcVN', 'destVN', 'vnName', 'ip', 'objectType', 'context'], function (idx, field) {
        if (data[field] != null)
            contextObj[field] = data[field];
    });
    return contextObj;
}

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}

function constructChartDS(obj, elem) {
    var chartDS;
    if (obj['url'] != null) {
        chartDS = {
            transport:{
                read:{
                    url:function () {
                        //If user has changed the default selection in the chart navigator
                        if (globalObj.startDt != null && (typeof(obj['url']) == 'string')) {
                            var url = obj['url'];
                            var urlParams = $.deparam(obj['url']);
                            //delete urlParams['minsSince'];
                            delete urlParams['sampleCnt'];
                            urlParams['startTime'] = globalObj.startDt.getTime();
                            urlParams['endTime'] = globalObj.endDt.getTime();
                            var path = url.split('?')[0];
                            return path + '?' + $.param(urlParams);
                        } else if (typeof(obj['url'] == 'string')) {
                            return obj['url'];
                        }
                    }
                }
            },
            schema:{
                parse:function (response) {
                    if (obj['parseFn'] != null)
                        return obj['parseFn'](response);
                }
            }
        }
        if (typeof(obj['url']) != 'string') {
            $.extend(true, chartDS, {transport:{read:{url:obj['url']}}});
        }
    } else
        chartDS = obj['dataSource'];
    return chartDS;
}

var tooltipFns = {
    multiPathTooltip:function (data) {
        if (data['alternatePaths'].length > 0) {
            return 'Source:' + data['alternatePaths'][0]['source'] + '<br/>' +
                'AS Path:' + data['alternatePaths'][0]['as_path'];
        } else
            return data['source'].split(':').pop();
    }
}

function monitorRefresh(selector) {
    if (selector == null)
        selector = $(pageContainer);
    //Refresh summary stats
    $(selector).find('.summary-stats').each(function (idx, elem) {
        var elemDS = $(elem).data('dataSource');
        $(elem).data('loaded', false);
        if(elemDS != null)
            elemDS.read();
    });
    $(selector).find('.contrail-grid').each(function (idx) {
        var gridDS = $(this).data('contrailGrid')._dataView;
        $(this).data('loaded', false);
        gridDS.refreshData();
    });
}


var bgpMonitor = {
    nodeTooltipFn:function (e,x,y,chart) {
        var result = {};
            //markOverlappedBubblesOnHover reuturns Overlapped nodes in ascending order of severity
            //Reverse the nodes such that high severity nodes are displayed first in the tooltip 
            e['point']['overlappedNodes'] = markOverlappedBubblesOnHover(e,chart).reverse();
            if(e['point']['overlappedNodes'] == undefined || e['point']['overlappedNodes'].length <= 1) {
                return formatLblValueTooltip(bgpMonitor.getTooltipContents(e));
            } else if(e['point']['multiTooltip'] == true) {
                result = getMultiTooltipContent(e,bgpMonitor.getTooltipContents,chart);
                result['content'] = result['content'].slice(0,result['perPage']);
                return formatLblValueMultiTooltip(result);
            }
    },
    getNextHopType:function (data) {
    	var type = data['path']['nh']['NhSandeshData']['type'];
    	if($.type(type) != "string"){
    		return '-';
    	} else {
    		return type;
    	}
    },
    /**
     * Sort alerts first by severity and with in same severity,sort by timestamp if available
     */
    sortInfraAlerts: function(a,b) {
        if(a['sevLevel'] != b['sevLevel'])
            return a['sevLevel'] - b['sevLevel'];
        if(a['sevLevel'] == b['sevLevel']) {
            if(a['timeStamp'] != null && b['timeStamp'] != null)
                return b['timeStamp'] - a['timeStamp'];
        }
        return 0;
    },
    sortNodesByColor: function(a,b) {
        var colorPriorities = [d3Colors['green'],d3Colors['blue'],d3Colors['orange'],d3Colors['red']];
        var aColor = $.inArray(a['color'],colorPriorities); 
        var bColor = $.inArray(b['color'],colorPriorities);
        return aColor-bColor;
    },
    getTooltipContents:function(e) {
        //Get the count of overlapping bubbles
        var series = e['series'];
        var processDetails = e['point']['processDetails'];
        var tooltipContents = [
            //{lbl:'Host Name', value:matchedRecords.length > 1 ? e['point']['name'] +
              //  contrail.format(' ({0})',matchedRecords.length) : e['point']['name']},
            {lbl:'Host Name', value: e['point']['name']},
            {lbl:'Version', value:e['point']['version']},
            //{lbl:'CPU', value:e['point']['x'].toFixed(2) + ' %'},
            //{lbl:'Memory', value:parseInt(e['point']['y']) + ' MB'}
            {lbl:'CPU', value:$.isNumeric(e['point']['cpu']) ? e['point']['cpu'] + '%' : e['point']['cpu']},
            {lbl:'Memory', value:e['point']['memory']}
        ];
        if (e['point']['type'] == 'vRouter') {
            //tooltipContents.push({lbl:'Throughput', value:e['point']['size']-1});
            $.each(e['point']['alerts'],function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
            });
        } else if (e['point']['type'] == 'controlNode') {
            $.each(e['point']['alerts'],function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
            });
        } else if (e['point']['type'] == 'analyticsNode') {
            if(e['point']['pendingQueryCnt'] != null && e['point']['pendingQueryCnt'] > 0)
              tooltipContents.push({lbl:'Pending Queries', value:e['point']['pendingQueryCnt']});
            $.each(e['point']['alerts'],function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
            });
        } else if (e['point']['type'] == 'configNode') {
            $.each(e['point']['alerts'],function(idx,obj) {
                if(obj['tooltipAlert'] != false)
                    tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
            });
        }
        return tooltipContents;
    },
    getNextHopDetails:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], tunnelType = nextHopData['tunnel_type'], valid = nextHopData['valid'], vrf = nextHopData['vrf'];
        if (nhType == 'arp') {
            //return contrail.format('Intf: {0} VRF: {1} Mac: {2} Source IP: {3}',nextHopData['itf'],nextHopData['vrf'],nextHopData['mac'],nextHopData['sip']);
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn'])  + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +  wrapLabelValue('Destination IP', dip) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) +
            		 wrapLabelValue('Tunnel type', tunnelType) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'discard') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType.toLowerCase() == 'composite' || nhType.toLowerCase().search('l3 composite') != -1) {
            var vrf = nextHopData['vrf'];
            var refCount = nextHopData['ref_count'];
            var policy = nextHopData['policy'];
            var valid = nextHopData['valid'];
            var label = nhData['label'];
            var mcDataString = '';
            var mcData;
            if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
                mcData = nextHopData['mc_list']['list']['McastData'];
                if (mcData.length > 1) {
                    for (var a = 0; a < mcData.length; a++) {
                        mcDataString = mcDataString.concat("{");
                        var dataObj = mcData[a]
                        for (x in dataObj) {
                            if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                                mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                        }
                        mcDataString = mcDataString.concat("}");
                    }
                } else {
                    mcDataString = mcDataString.concat("{");
                    for (x in mcData) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            }
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', lbl));
                return x;
        }
    },
    getNextHopDetailsForMulticast:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        // var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        //var sip = nextHopData['sip'], dip = nextHopData['dip']
        var refCount = nextHopData['ref_count'];
        var valid = nextHopData['valid'];
        var policy = nextHopData['policy'];
        var sip = nextHopData['sip'];
        var dip = nextHopData['dip'];
        var vrf = nextHopData['vrf'];
        var label = nextHopData['label'];
        var mcDataString = '';
        var mcData;
        if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
            mcData = nextHopData['mc_list']['list']['McastData'];
            if (mcData.length > 1) {
                for (var a = 0; a < mcData.length; a++) {
                    mcDataString = mcDataString.concat("{");
                    var dataObj = mcData[a]
                    for (x in dataObj) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            } else {
                mcDataString = mcDataString.concat("{");
                for (x in mcData) {
                    if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                        mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                }
                mcDataString = mcDataString.concat("}");
            }
        }
        if (nhType == 'arp') {
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('Source IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'receive') {
            return contrail.format(wrapLabelValue('Reference Count', refCount) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Destination IP', dip) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else {
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } 
    },
    getNextHopDetailsForL2:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], valid = nextHopData['valid'], vrf = nextHopData['vrf'], tunnelType = nextHopData['tunnel_type'];
        if (nhType == 'arp') {
            //return contrail.format('Intf: {0} VRF: {1} Mac: {2} Source IP: {3}',nextHopData['itf'],nextHopData['vrf'],nextHopData['mac'],nextHopData['sip']);
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +  wrapLabelValue('Destination IP', dip) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy) + wrapLabelValue('Vrf', vrf) 
            		+ wrapLabelValue('Label', lbl) + wrapLabelValue('Tunnel type', tunnelType));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'discard') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']));
        } else if (nhType.toLowerCase() == 'composite'  || nhType.toLowerCase().search('l2 composite') != -1) {
            var vrf = nextHopData['vrf'];
            var refCount = nextHopData['ref_count'];
            var policy = nextHopData['policy'];
            var valid = nextHopData['valid'];
            var label = nhData['label'];
            var mcDataString = '';
            var mcData;
            if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
                mcData = nextHopData['mc_list']['list']['McastData'];
                if (mcData.length > 1) {
                    for (var a = 0; a < mcData.length; a++) {
                        mcDataString = mcDataString.concat("{");
                        var dataObj = mcData[a]
                        for (x in dataObj) {
                            if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                                mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                        }
                        mcDataString = mcDataString.concat("}");
                    }
                } else {
                    mcDataString = mcDataString.concat("{");
                    for (x in mcData) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            }
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', lbl));
                return x;
        }
    },
    
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
            data['point'] = data[0];
            tooltipArray.push(tooltipFn(data));
            nodeMap[tooltipFn(data)[0]['value']] = data;
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

var tenantNetworkMonitor = {
    projectTooltipFn : function(e,x,y,chart) {
        //Get the count of overlapping bubbles
        var matchedRecords = getOverlappedBubbles(e);
        e['point']['overlappedNodes'] =  matchedRecords;
        if(matchedRecords.length <= 1) {
            var tooltipContents = tenantNetworkMonitor.getProjectTooltipContents(e);
            return formatLblValueTooltip(tooltipContents);
        } else if(e['point']['multiTooltip']) {
           var result = getMultiTooltipContent(e, tenantNetworkMonitor.getProjectTooltipContents,chart);
           result['content'] = result['content'].slice(0,result['perPage']);
           return formatLblValueMultiTooltip(result);
        }
    },
    getProjectTooltipContents : function(e) {
        var tooltipContents = [
           //{lbl:'Name', value:matchedRecords.length > 1 ? e['point']['name'] +
               //contrail.format(' ({0})',matchedRecords.length) : e['point']['name']},
           {lbl:'Name', value:e['point']['name']},
           {lbl:'Interfaces', value:e['point']['x']},
           {lbl:'Networks', value:e['point']['y']},
           {lbl:'Throughput', value:formatThroughput(e['point']['throughput'])}
        ];
        return tooltipContents;
    },
    networkTooltipFn:function (e,x,y,chart) {
        var matchedRecords = getOverlappedBubbles(e);
        e['point']['overlappedNodes'] =  matchedRecords;
        if(matchedRecords.length <= 1) {
            var tooltipContents = tenantNetworkMonitor.getNetworkTooltipContents(e); 
            return formatLblValueTooltip(tooltipContents);
        } else if(e['point']['multiTooltip']) {
            var result = getMultiTooltipContent(e, tenantNetworkMonitor.getNetworkTooltipContents,chart);
            result['content'] = result['content'].slice(0,result['perPage']);
            return formatLblValueMultiTooltip(result);
        }
    },
    getNetworkTooltipContents : function(e) {
        var tooltipContents = [
           //{lbl:'Name', value:matchedRecords.length > 1 ? e['point']['name'] +
               //contrail.format(' ({0})',matchedRecords.length) : e['point']['name']},
           {lbl:'Name', value:e['point']['name']},
           {lbl:'Interfaces', value:e['point']['x']},
           {lbl:'Connected Networks', value:e['point']['y']},
           {lbl:'Throughput', value:formatThroughput(e['point']['throughput'])}
        ];
        return tooltipContents;
    },
    portTooltipFn: function(e,x,y,chart) {
        /*var tooltipContents = [
         {lbl:'Name', value:typeof(e) == 'string' ? e : e['point']['type']},
         ];*/
        e['point']['overlappedNodes'] = markOverlappedBubblesOnHover(e,chart);
        if(e['point']['overlappedNodes'] == undefined || e['point']['overlappedNodes'].length <= 1) {
            var tooltipContents = tenantNetworkMonitor.getPortTooltipContents(e);
            return formatLblValueTooltip(tooltipContents);
        } else if(e['point']['multiTooltip']) {
            var result = getMultiTooltipContent(e, tenantNetworkMonitor.getPortTooltipContents,chart);
            if(result['content'].length == 1){
                var tooltipContents = tenantNetworkMonitor.getPortTooltipContents(e);
                return formatLblValueTooltip(tooltipContents);
            }
            result['content'] = result['content'].slice(0,result['perPage']);
            return formatLblValueMultiTooltip(result);
        }
    },
    getPortTooltipContents: function(e) {
        if(e['point']['type'] == 'sport')
            titlePrefix = 'Source';
        else if(e['point']['type'] == 'dport')
            titlePrefix = 'Destination';
        if(e['point']['name'].toString().indexOf('-') > -1)
            name = titlePrefix + ' Port Range (' + e['point']['name'] + ')';
        else
            name = titlePrefix + ' Port ' + e['point']['name'];
        var tooltipContents = [
            {lbl:'Port Range', value:name},
            {lbl:'Flows', value:e['point']['flowCnt']},
            {lbl:'Bandwidth', value:formatBytes(ifNull(e['point']['origY'],e['point']['y']))},
            //{lbl:'Type', value:e['point']['type']}
        ];
        return tooltipContents;
    }
}
function wrapValue(str) {
    return '<span class="text-info">' + str + '</span>';
}

function wrapLbl(str) {
    return '<span class="lighter">' + str + '</span>';
}

function wrapLabelValue(lbl, value) {
	value = ifNullOrEmptyObject(value,"");
    return '<span class="label-value-text">' + lbl + ': <span class="value">' + value + '</span></span>';
}


function formatTooltipDate(str) {
    return new XDate(str).toString('M/d/yy h:mm:ss');
}

//Get the number of keys in an object
function getKeyCnt(obj) {
    var len = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i))
            len++;
    }
    return len;
}

/*
function diffDateString(startDt, endDt,rounded) {
    //If either startDt/endDt is null, return '-'
    var dayCnt = 0, hrCnt = 0, minCnt = 0;
    //No of days
    dayCnt = startDt.diffDays(endDt);
    var timeDiff = Math.abs(startDt.getTime() - endDt.getTime());
    var timeMultiplier = [1,1000,1000*60,1000*60*60,1000*60*60*24,1000*60*60*24*30];
    var timeMultiplierStrings = ['ms','s','m','h']
    var timeStrArray = "",localTimeDiff = 0;
    var i = 0;
    do {
        localTimeDiff = Math.floor(timeDiff/timeMultiplier[i]);
        i++;
    } while(timeDiff/timeMultiplier[i] > 1)
    timeStrArray.push(localTimeDiff + ' ' + timeMultiplierStrings[i]);

    if(rounded == true) {
    } else {
        timeStr.push(diffDateString(timeDiff - localTimeDiff*timeMultiplier[i]));
    }
    return timeStrArray.join(' ');
}*/

function diffDates(startDt, endDt, type) {
    //If either startDt/endDt is null, return '-'
    var dayCnt = 0, hrCnt = 0, minCnt = 0;
    //No of days
    dayCnt = startDt.diffDays(endDt);
    dayCnt = (dayCnt > 0)?Math.floor(dayCnt):Math.ceil(dayCnt);
    hrCnt = startDt.diffHours(endDt);
    hrCnt = (hrCnt > 0)?Math.floor(hrCnt):Math.ceil(hrCnt);
    minCnt = startDt.diffMinutes(endDt);
    minCnt = (minCnt > 0)?Math.floor(minCnt):Math.ceil(minCnt);
    hrCnt = hrCnt - (dayCnt * 24);
    minCnt = minCnt - (((dayCnt * 24) + hrCnt) * 60);
    if(type == 'rounded'){
        if(dayCnt > 0 && hrCnt > 0 && minCnt > 0)
            return  dayCnt +' day(s)';
        else if(hrCnt > 0 && minCnt > 0)
            return hrCnt +' hour(s)';
        else if(minCnt > 0)
            return minCnt + ' mins';
    } else {
        if (dayCnt == 0 && hrCnt == 0)
            return  minCnt + 'm';
        else if (dayCnt == 0)
            return hrCnt + 'h ' + minCnt + 'm';
        else
            return dayCnt + 'd ' + hrCnt + 'h ' + minCnt + 'm';
    }
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


String.prototype.padleft = function (length, character) {
    return new Array(length - this.length + 1).join(character || ' ') + this;
}

function get64binary(int) {
    if (int >= 0)
        return int
            .toString(2)
            .padleft(64, "0");
    // else
    return (-int - 1)
        .toString(2)
        .replace(/[01]/g, function (d) {
            return +!+d;
        })// hehe: inverts each char
        .padleft(64, "1");
};

function get32binary(int) {
    if (int >= 0)
        return int
            .toString(2)
            .padleft(32, "0");
    // else
    return (-int - 1)
        .toString(2)
        .replace(/[01]/g, function (d) {
            return +!+d;
        })// hehe: inverts each char
        .padleft(32, "1");
};

/**
 * Delay execution of UI widgets, until the given deferred object is resolved,
 * which gives the data for UI widgets
 */
function initDeferred(data) {
    var deferredObj = $.Deferred();
    //To load asynchronously
    if (data['deferredObj'] != null) {
        deferredObj = data['deferredObj'];
    } else if (data['url'] != null) {
        $.ajax({
            url:data['url'],
        }).done(function (result) {
                deferredObj.resolve(result);
            });
    } else {
        deferredObj.resolve(data);
    }
    deferredObj.done(function (response) {
        if (data['parseFn'] != null && typeof(data['parseFn']) == 'function') {
            response = data['parseFn'](response);
        }
        $(data['selector'])[data['renderFn']](response);
    });
    //Show error message on deferred object reject
    deferredObj.fail(function(errObj) {
        if(errObj['errTxt'] != null && errObj['errTxt'] != 'abort') {
            if(data['renderFn'] == 'initScatterChart') {
                showMessageInChart({selector:$(data['selector']),msg:'Error in fetching Details',type:'bubblechart'});
            }
        }
    });
}

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

//DNS TTL Validations
function validateTTLRange(v){
    if(v >=0 && v<=2147483647)
        return true;
    return false;
}

function  allowNumeric(v){
    for(var i=0;i<v.length;i++){
        if(v[i] ==="-")
            continue;
        if(isNaN(parseInt(v[i],10)))
            return false;
    }
    return true;
}

function validateIPAddress(inputText){
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(inputText.match(ipformat))
        return true;
    else
        return false;
}

function bucketizeCFData(dataCF,accessorFn,cfg) {
    var retArr = [],value;
    var dimension = dataCF.dimension(accessorFn);
    var cfGroup = dimension.group();
    var maxKey = 0;
    var cfg = ifNull(cfg,{});
    var bucketCnt = ifNull(cfg['bucketCnt'],8);
    if(cfGroup.all().length > 0)
        maxKey = cfGroup.all()[cfGroup.all().length-1]['key'];
    
    //Max no of occurrences in any bucket
    var maxValue = 0;
    $.each(cfGroup.all(),function(idx,obj) {
        if(obj['value'] > maxValue)
            maxValue = obj['value'];
    });
    var zeroValue = 0.01;
    var bucketRange = parseInt(maxKey / 8) + 1;
    //Have buckets 0-8
    if(maxKey <= 8) {
        maxKey = 8;
    } else {
    	bucketRange = Math.ceil(maxKey/bucketCnt);
    }
    for(var i=0;i<=maxKey;i+=bucketRange) {
        dimension.filterAll();
        if(bucketRange == 1) {
            value = dimension.filter(i).top(Infinity).length;
            if(value == 0)
                value = zeroValue;
            retArr.push({name:i,min:i,max:i+bucketRange-1,value:value});
        } else {
            value = dimension.filter(function(d) { return ((d >= i) && (d <= (i+bucketRange-1))); }).top(Infinity).length;
            if(value == 0)
                value = zeroValue;
            retArr.push({name:i + '-' + (i+bucketRange-1),min:i,max:i+bucketRange-1,value:value});
        }
    }
    dimension.filterAll();
    return {data:retArr,zeroValue:zeroValue};
}

function getMaxNumericValueInArray(inputArray) {
    var maxVal;
    if(inputArray != null && inputArray instanceof Array){
        maxVal = inputArray[0];
        for(var i = 1; i < inputArray.length; i++){
            if(inputArray[i] > maxVal)
                maxVal = inputArray[i];
        }
        return maxVal;
    } else {
        return inputArray;
    }
}

function toggleDivs(hideDetailId,showDetailId){
    $('#'+hideDetailId).hide();
    $('#'+showDetailId).show();
}

function showMoreAlerts(){
    var currentUrl=layoutHandler.getURLHashObj();
    if(currentUrl['p']=='mon_infra_dashboard') {
        loadAlertsContent();
    } else {
        layoutHandler.setURLHashObj({p:'mon_infra_dashboard',q:{tab:'vRouter'}});
        globalObj['showAlertsPopup']=true;
    }
}

/**
 * function takes the parameters event object of bubble chart as parameter
 * and redirects to corresponding page on drill down. 
 * 
 * @param e
 */

function processDrillDownForNodes(e) {
     if (e['point']['type'] == 'vRouter') {
         layoutHandler.setURLHashParams({node:'vRouters:' + e['point']['name'], tab:''}, {p:'mon_infra_compute'});
     } else if (e['point']['type'] == 'controlNode') {
         layoutHandler.setURLHashParams({node:'Control Nodes:' + e['point']['name'], tab:''}, {p:'mon_infra_control'});
     } else if (e['point']['type'] == 'analyticsNode') {
         layoutHandler.setURLHashParams({node:'Analytics Nodes:' + e['point']['name'], tab:''}, {p:'mon_infra_analytics'});
     } else if (e['point']['type'] == 'configNode') {
         layoutHandler.setURLHashParams({node:'Config Nodes:' + e['point']['name'], tab:''}, {p:'mon_infra_config'});
     } else if (e['point']['type'] == 'network') {
         layoutHandler.setURLHashParams({fqName:e['point']['name']}, {p:'mon_net_networks'});
     } else if (e['point']['type'] == 'project') {
         layoutHandler.setURLHashParams({fqName:e['point']['name']}, {p:'mon_net_projects'});
     } else if ($.inArray(e['point']['type'], ['sport' | 'dport'] > -1)) {
         var obj= {
             fqName:e['point']['fqName'],
             port:e['point']['range']
         };
         if(e['point']['startTime'] != null && e['point']['endTime'] != null) {
             obj['startTime'] = e['point']['startTime'];
             obj['endTime'] = e['point']['endTime'];
         }

         if(e['point']['type'] == 'sport')
             obj['portType']='src';
         else if(e['point']['type'] == 'dport')
             obj['portType']='dst';
         if(obj['fqName'].split(':').length == 2) {
             layoutHandler.setURLHashParams(obj,{p:'mon_net_projects'});
         } else
             layoutHandler.setURLHashParams(obj,{p:'mon_net_networks'});
     }
}

function loadAlertsContent(){
    if(globalObj.alertsData!=undefined) {
        var data = globalObj.alertsData;
        var renderPopupEveryTime = true,alertsData = [];
        $('#header ul li.nav-header').text(data.length+' New Alerts');
        var alerts = contrail.getTemplate4Id("alerts-template");
        for(var i=0;i<data.length;i++) {
            if(data[i]['detailAlert'] != false)
                alertsData.push(data[i]);
        }
        var alertsTemplate = contrail.getTemplate4Id('moreAlerts-template');
        var statusTemplate = contrail.getTemplate4Id('statusTemplate');
        var alertsGrid;
        if(renderPopupEveryTime || $("#moreAlerts").length == 0) {
            $("#moreAlerts").remove();
            $('body').append(alertsTemplate({}));
            alertsWindow = $("#moreAlerts");
            alertsWindow.modal({backdrop:'static',keyboard:false,show:false});
            $("#alertsClose").click(function(){
                alertsWindow.hide();
            });
            $("#alertContent").contrailGrid({
                header : {
                    title : {
                        text : 'Details',
                        cssClass : 'blue',
                    },
                    customControls: []
                },
                body: {
                    options: {
                        forceFitColumns:true,
                        autoHeight : false,
                        gridHeight : 300
                    },
                    forceFitColumns: true,
                    dataSource: {
                        data: alertsData
                    }
                },
                columnHeader: {
                    columns:[ 
                        {
                            field:'nName',
                            name:'Node',
                            formatter: function(r,c,v,cd,dc){
                                if(typeof(dc['sevLevel']) != "undefined" && typeof(dc['nName']) != "undefined")
                                    return "<span>"+statusTemplate({sevLevel:dc['sevLevel'],sevLevels:sevLevels})+dc['nName']+"</span>";
                                else
                                    return dc['nName'];
                            }
                        },{
                            field:'pName',
                            name:'Process',
                            width:170
                        },{
                            field:'msg',
                            name:'Status',
                            formatter: function(r,c,v,cd,dc) {
                                if(typeof(dc['popupMsg']) != "undefined")
                                    return dc['popupMsg'];
                                else
                                    return dc['msg'];
                            }
                        },{
                            field:'timeStamp',
                            name:'Time',
                            width:160,
                            formatter:function(r,c,v,cd,dc) {
                                if(typeof(dc['timeStamp']) != "undefined")
                                    return getFormattedDate(dc['timeStamp']/1000);
                                else
                                    return "";
                            }
                        }]
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                }
            });
        }
        alertsGrid = $('#alertContent').data('contrailGrid');

        alertsWindow.modal('show');
        alertsGrid.refreshView();
        alertsGrid._grid.resizeCanvas();
        alertsGrid.removeGridMessage();
        globalObj.showAlertsPopup = false;
    }
}



/**
* deferredObj 
* The above deferredObj is passed to populateFn which will resolved this once all data is fetched
* dataSource will be incrementally populated in case of pagination
* ongoing will be true until we fetch all the records
* lastUpdate will be set when all records are fetched
*/
function ManageDataSource() {
    //Setting the resetTime to 0 as want to show the latest data always
    var resettime = 0;//In minutes
    //As cache resetTime is 0 minutes,don't show the hard refresh for now 
    var lastupdatedTimeViewModel = ko.observable({
        timeObj : {
            time:new XDate().getTime(),
            timeStr:function() {return " "+diffDates(new XDate(this.get("time")),new XDate());}
        }
    });
    var timerId;
    this.load = function() {
        var obj = {
                //Virtual Networks Data
                'networkDS':{
                    name:'networkDS',
                    ongoing:false,
                    populateFn:'getVirtualNetworksData',
                    updateStartTime:null,   //Time at which update started
                    lastUpdated:null,
                    deferredObj:null,
                    data:null,
                    dataSource:null,
                    error:null
                },
                //Instances Data
                'instDS':{
                    name:'instDS',
                    ongoing:false,
                    lastUpdated:null,
                    populateFn:'getAllInstances',
                    deferredObj:null,
                    dataSource:null,
                    error:null
                },

                //PortRange data for Port Distribution drill-down
                'portRangeData':{
                },
                'controlNodeDS':{
                    ongoing:false,
                    lastUpdated:null,
                    populateFn:['getAllControlNodes','getGeneratorsForInfraNodes'],
                    deferredObj:null,
                    dataSource:null
                },
                'computeNodeDS':{
                    ongoing:false,
                    lastUpdated:null,
                    populateFn:['getAllvRouters','getGeneratorsForInfraNodes'],
                    deferredObj:null,
                    dataSource:null,
                    cachedData:true//whether we maintain backend cache
                },
                'analyticsNodeDS':{
                    ongoing:false,
                    lastUpdated:null,
                    populateFn:['getAllAnalyticsNodes','getGeneratorsForInfraNodes'],
                    deferredObj:null,
                    dataSource:null
                },
                'configNodeDS':{
                    ongoing:false,
                    lastUpdated:null,
                    populateFn:['getAllConfigNodes','getGeneratorsForInfraNodes'],
                    deferredObj:null,
                    dataSource:null
                },
            };
        globalObj['dataSources'] = obj;
        //ko.applyBindings(lastupdatedTimeViewModel,$('div.hardrefresh'));
        $("#breadcrumbs").find('span.refresh').live('click',onHardRefresh);
    }

    //Given a DataSource name, it will return the deferredObj
    //    1. If data is already fetched, the returned deferredObj will be resolved immediately
    //    2. If data is not fetched / ongoing,that deferredObj will be resolved once entire data is fetched
    this.getDataSource = function(dsName) {
        var dsObj = globalObj['dataSources'][dsName];
        //If it's ongoing for first time then lastUpdated won't be available
        //Check if cache need to be updated
        if((dsObj['lastUpdated'] == null && dsObj['ongoing'] == false) ||
            (dsObj['ongoing'] == false && dsObj['lastUpdated'] != null && (dsObj['lastUpdated'] + resettime*60*1000 <= new Date().getTime())) ||
             (dsObj['ongoing'] == true && discardOngoingUpdate == true))  {
                return manageDataSource.refreshDataSource(dsName);
        } else {
            if(dsObj['ongoing'] == true) {
                manageDataSource.setLastupdatedTime(dsObj,{status:'inprogress'});
            } else if(dsObj['lastUpdated'] != null) { //Not on-going and cache is valid
                manageDataSource.setLastupdatedTime(dsObj,{status:'done'});
            }
            return dsObj;
        }
    }
    
    /*
     * Reloads the given dataSource by fetching data from backend
     */
    this.refreshDataSource = function(dsName) {
        var dsObj = globalObj['dataSources'][dsName];
        var deferredObj = $.Deferred();
        dsObj['deferredObj'] = deferredObj.promise();
        var dataSource = new ContrailDataView();
        if(dsObj['dataSource'] != null) 
            dataSource = dsObj['dataSource'];
        else
            dsObj['dataSource'] = dataSource;
            
        //Set updateStartTime before calling populateFn
        dsObj['updateStartTime'] = new XDate().getTime();
        //Set ongoing to true before issuing the calls for refreshing the dataSource
        dsObj['ongoing'] = true;
        if(dsObj['populateFn'] instanceof Array) {
            window[dsObj['populateFn'][0]](deferredObj,dataSource,dsObj,dsName);
            $.each(dsObj['populateFn'].slice(1),function(idx,populateFn) {
                    var secondDefObj = $.Deferred();
                    deferredObj.done(function(dsData) {
                        window[populateFn](secondDefObj,dsData['dataSource'],dsName);
                    });
                    secondDefObj.done(function(response) {
                        //Update the dataSource with the combined response from populateFns
                        dataSource.setData(response);
                    });
            });
        } else
            window[dsObj['populateFn']](deferredObj,dataSource,dsObj,dsName);
        manageDataSource.setLastupdatedTime(dsObj,{status:'inprogess'});
        deferredObj.fail(function(errObj){
            dsObj['ongoing'] = false;
            dsObj['lastUpdated'] = new Date().getTime();
            dsObj['error'] = errObj;
            //Update last updated time even in case of error
            manageDataSource.setLastupdatedTime(dsObj,{status:'done'});
        });
        deferredObj.done(function(response){
            if(dsObj['data'] != null)
                dsObj['data'] = response;
            dsObj['ongoing'] = false;
            dsObj['lastUpdated'] = new Date().getTime();
            dsObj['error'] = null;
            manageDataSource.setLastupdatedTime(dsObj,{status:'done'});
        });
        return dsObj;
    }
    
    /**
     * Cache the portRange data retrieved at 2nd level (Port Range) in Port Distribution drill-down to use at 3rd level (Specific Port)
     */
    this.setPortRangeData = function(fqName,data) {
        globalObj['dataSources']['portRangeData'][fqName] = data;
    }
    
    this.getPortRangeData = function(fqName) {
        return ifNull(globalObj['dataSources']['portRangeData'][fqName],[]);
    }
    
    this.setLastupdatedTime = function(obj,cfg) {
       /*Need to revisit changing lastupdatedTimeViewModel to knockout
        if(cfg['status'] == 'done') {
			if(obj['lastUpdated'] != null){
	            lastupdatedTimeViewModel.set('timeObj.time',obj['lastUpdated']);
	            manageDataSource.setlastupdatedTimeViewModel();
			}
            if(enableHardRefresh) {
                $("#breadcrumbs").find('span.refresh').show();
                $("#breadcrumbs").find('span.loading').hide();
            }
        } else if(cfg['status'] == 'inprogess') {
            if(enableHardRefresh) {
                $("#breadcrumbs").find('div.hardrefresh').css('display','inline-block');
                $("#breadcrumbs").find('span.loading').show();
                $("#breadcrumbs").find('span.refresh').hide();
            }
        }*/ 
    }
    
    this.triggerTimer = function() {
        //setting time for the first time when the timer triggers to avoid the wrong display of time
        manageDataSource.setlastupdatedTimeViewModel();
        if(timerId != null)
            clearInterval(timerId);
        timerId = setInterval(function(){
            manageDataSource.setlastupdatedTimeViewModel();
        },60 * 1000);
    }

    this.setlastupdatedTimeViewModel = function() {
        var time = lastupdatedTimeViewModel.get('timeObj.time');
        lastupdatedTimeViewModel.set('timeObj.timeStr'," "+diffDates(new XDate(time),new XDate()));
    }
    this.stopTimer = function() {
    	clearInterval(timerId);
    }
}
var manageDataSource = new ManageDataSource();
manageDataSource.load();

/**
 * Whenever a feature need to refer to a singleDataSource, need to create an instance of SingleDataSource by passing the dataSourceName as an argument
 * It will maintain an list of listeners for each singleDataSource and triggers the change event on all of them whenever singleDataSource updates
 */
function SingleDataSource(dsName) {
    var instances = SingleDataSource.instances;
    var subscribeFns = SingleDataSource.subscribeFns;
    if(instances[dsName] == null) {
        instances[dsName] = [];
    }
    if(subscribeFns[dsName] == null) {
       subscribeFns[dsName] = [];
    }
    //At any point of time,there should be only one instance of a dataSource to be active
    instances[dsName] = [];
    instances[dsName].push(this);
    var singleDSObj = manageDataSource.getDataSource(dsName);
    //singleDSObj['dataSource'].onPagingInfoChanged.unsubscribeAll();
    var subscribeFn = function () {
           $.each(instances[dsName],function(idx,obj) {
               $(obj).trigger('change');
           });
       };
    //Unsubscribe old listeners for this dataSource
    $.each(subscribeFns[dsName],function(idx,fn) {
       singleDSObj['dataSource'].onUpdateData.unsubscribe(fn);
    });
    subscribeFns[dsName] = [];
    subscribeFns[dsName].push(subscribeFn);
    singleDSObj['dataSource'].onUpdateData.subscribe(subscribeFn);

    this.getDataSourceObj = function() {
        return singleDSObj;
    }

    this.destroy = function() {
        $.each(instances[dsName],function(idx,obj) {
            if(obj == this) {
                instances[dsName].splice(idx,1);
            }
        });
    }
}
//Maintain an array of instances referring to each dataSource
SingleDataSource.instances = {};
//Maintain an array of subscribeFns for each dataSource which is required as we need to pass on those function pointers to unsubscribe from onPagingInfoChanged event
SingleDataSource.subscribeFns = {};

/**
* This method checks the current class from globalobj 
* and invokes hardrefresh method of that class
*/
function onHardRefresh() {
    var hashObj = layoutHandler.getURLHashObj();
    if(window[globalObj['currMenuObj']['class']] != null && window[globalObj['currMenuObj']['class']]['onHardRefresh'] != null)
        window[globalObj['currMenuObj']['class']]['onHardRefresh'](hashObj);
}

function showHardRefresh() {
    if(enableHardRefresh) {
        $("#breadcrumbs").find('div.hardrefresh').show();
        manageDataSource.triggerTimer();
    }
}

function hideHardRefresh() {
    if(enableHardRefresh) {
        $("#breadcrumbs").find('div.hardrefresh').hide();
        manageDataSource.stopTimer();
    }
}

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
 * Function is event handler for the more and hide link in the overall node status of infra details page
 * accepts parameters of type array or single element but need to send with '#' or '.'
 * eg:  ['#id','#id1','#id2'] ,['.class1','.class2']
 */
function toggleOverallNodeStatus(selector) {
    if(selector instanceof Array) {
        for(var i = 0;i < selector.length; i++)
            $(selector[i]).toggleClass('hide');
    } else 
        $(selector).toggleClass('hide');
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


/**
 * Get the value of a property inside a json object with a given path
 */
function getValueByJsonPath(obj,pathStr,defValue) {
    try {
    	var currObj = $.extend(true,{},obj);
        var pathArr = pathStr.split(';');
        var arrLength = pathArr.length;
        for(var i=0;i<arrLength;i++) {
            if(currObj[pathArr[i]] != null) {
                currObj = currObj[pathArr[i]];
            } else
                return defValue;
        }
        return currObj;
    } catch(e) {
        return defValue;
    }
}


/**
 * cfg['loadedDeferredObj'] - resolved when all records are fetched
 *                          - reject when any ajax call fails
 */
function getOutputByPagination(dataSource,cfg,dsObj) {
    var currData = ifNull(cfg['currData'],[]);
    var transportCfg = ifNull(cfg['transportCfg'],{});
    var dsObj = ifNull(dsObj,{});
    var dsName = dsObj['name'];
    var urlParams = $.deparam(transportCfg['url']);
    urlParams['startAt'] = dsObj['updateStartTime'];
    transportCfg['url'] = ifNull(transportCfg['url'],'').split('?')[0] + '?' + $.param(urlParams);
    if(cfg['deferredObj'] != null) {
        cfg['deferredObj'].done(waitForDeferred);
    } else
        waitForDeferred();
    function waitForDeferred() {
        $.ajax($.extend({
            abortOnNavigate:discardOngoingUpdate == true ? true : false
        },transportCfg)).done(function(response) {
            //Check if the response is for the current series of requests
            var urlParams = $.deparam(transportCfg['url']);
            if(dsName != null && globalObj['dataSources'][dsName] != null) {
                if(urlParams['startAt'] != globalObj['dataSources'][dsName]['updateStartTime']) {
                    return; 
                }
            }
            var dataResponse = response['data'];
            if(cfg['parseFn'] != null) {
            	if(response['data'] != null){
            		dataResponse = cfg['parseFn'](response['data']);
            	} else {
            		dataResponse = cfg['parseFn'](response);
            	}
            } else {
            	dataResponse = dataResponse['value'];
            } 
            //Purging the old response if the request is for first N records.
            if(transportCfg['url'].indexOf('lastKey') == -1) {
                currData = [];
            }
            //No need to update dataSource if there no records to display in current pagination request and it's not the last request.
            if(dataResponse.length == 0 && response['more'] == true) {
                //Nothing to do
            } else {
                currData = $.merge(currData,dataResponse);
                dataSource.setData(currData);
            }
            if(response['more'] == null || response['more'] == false){
            	if(cfg['loadedDeferredObj'] != null) {
                    //Info: Any reason to resolve with an object??
            		cfg['loadedDeferredObj'].resolve({dataSource:dataSource});
                }
            } else if (response['more'] == true) {
                var urlParams = $.deparam(transportCfg['url']);
                urlParams['lastKey'] = response['lastKey'];
                cfg['currData'] = currData;
                transportCfg['url'] = transportCfg['url'].split('?')[0] + '?' + $.param(urlParams);
                getOutputByPagination(dataSource,cfg,dsObj);
            } 
        })
        .fail(function(errObj,status,errorText){
            if(cfg['loadedDeferredObj'] != null)
                cfg['loadedDeferredObj'].reject({errObj:errObj,status:status,errTxt:errorText});
        });
    }
}

/**
 * Formats the given string removing the place holders enclosed with {} with the corresponding values
 * a. Will replace {0} inside string with first argument and so on
 * b. Supports specifiying singular/plural string 
 *  Will replace {0:BGP peer;BGP peers} inside string to "1 BGP peer" when passed 1 as argument and as "2 BGP peers" when passed 2 as argument
 */
String.prototype.format = function() {
    var args = arguments;
    var retStr = this.toString();
    var formatHolders = this.toString().match(/{[a-zA-Z0-9:; ]*}/g);
    for(var argIdx=0; argIdx < args.length ; argIdx++) {
        if(formatHolders[argIdx] == null)
            continue;
        var currHolder = formatHolders[argIdx].replace(/[{}\d:]+/g,'');
        var currValue = args[argIdx];
        var strVariants = currHolder.split(';');
        if((currHolder.length > 0) && (strVariants.length > 0)) {
            if(args[argIdx] > 1)
                currValue += ' ' + strVariants[1];
            else
                currValue += ' ' + strVariants[0];
        }
        retStr = retStr.replace(formatHolders[argIdx],currValue);
    }
    return retStr;
};

/**
 * Removes the duplicates in an array
 */
function uniqueArray(arr) {
    var retArr = [];
    $.each(arr,function(idx,value) {
        if($.inArray(value,retArr) == -1)
            retArr.push(value);
    });
    return retArr;
}
