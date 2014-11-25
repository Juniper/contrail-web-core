/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var globalObj = {},
    contentContainer = "#content-container";

globalObj['loadedScripts'] = [];
globalObj['loadedCSS'] = [];
globalObj['orchModel'] = 'openstack';
globalObj.NUM_FLOW_DATA_POINTS = 1000;
var globalAlerts = [],timeStampTolearence = 5 * 60 * 1000;//To check the mismatch between the browser time and the webserver time
var enableHardRefresh = false;  //Set to true if "Hard Refresh" provision need to be shown in UI
//Set to true if we want to discard ongoing requests while refreshing the dataSource and start fetching from beginnging
//Ajax calls shouldn't be aborted if we don't want to discard ongoing update
var discardOngoingUpdate = true;
var DEFAULT_TIME_SLICE = 3600000,
    pageContainer = "#content-container",
    dblClick = 0;
var CONTRAIL_STATUS_USER = [];
var roles = {TENANT : "member",ADMIN : "superAdmin"};
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
var NETWORKS_PAGINATION_CNT = 25;
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
        'PROCESS_DOWN_MSG'      : "{0} down",
        'PROCESS_COREDUMP'      : "{0:core dump;core dumps}",
        'PROCESS_RESTART'       : "{0:restart;restarts}"
    }
////Contant to check if a nodemanger is installed in the setup or not and use is appropriately
var IS_NODE_MANAGER_INSTALLED = true;

var NO_RELOAD_JS_CLASSLIST = [
    'infraMonitorView',
    'tenantNetworkMonitorView',
    'clustersPageLoader',
    'serversPageLoader',
    'imagesPageLoader',
    'packagesPageLoader',
    'smLoader'
];

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

function collapseElement(e,collapseDivID) {
    if($(e).prop("tagName").toUpperCase() == "I"){
        $(e).toggleClass('icon-caret-right').toggleClass('icon-caret-down');
    } else {
        $(e).find("i").toggleClass('icon-caret-right').toggleClass('icon-caret-down');
    }
    //var widgetBodyElem = $(e).parents('div.widget-box').find('div.widget-body');
    var widgetBoxElem;
    if(collapseDivID != null && collapseDivID != "" && collapseDivID != undefined){
        widgetBoxElem = $(collapseDivID);
       // widgetBoxElem.toggleClass('hide');	
    }
    else 
        widgetBoxElem = $(e).parents('div.widget-box');
    $(widgetBoxElem).toggleClass('collapsed');	
}


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
                                $.extend(detailObj, 
                                        {
                                            ip:instObj['ip_address'],
                                            vnName:instObj['virtual_network']
                                        }
                                );
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
                        },successCallback:function(response) {
                            statsDatasource.setData(response);
                            var statViewModel = new (function() {
                                var self = this;
                                self.toNetwork = ko.observable('');
                                self.fromNetwork = ko.observable('');
                            })();
                            statViewModel.toNetwork(response[0]['toNetwork']);
                            statViewModel.fromNetwork(response[0]['fromNetwork']);
                            ko.applyBindings(statViewModel, statsElem[0]);
                        }
                    },
                });
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
                        var grid = $(e['target']).closest('div.contrail-grid');
                        var dataItem = dc;
                        //Issue a call for fetching the details
                        if(dataItem['url'] != null) {
                            $.ajax({
                                url:dataItem['url']
                            }).done(function(result) {
                                //There will be only one entry in response,look at 0th element as we are requesting for specific VN/VM
                                var response = result;
                                if(result['value'] != null && result['value'][0] != null) {
                                    response = result['value'][0];
                                    e.detailRow.find('.row-fluid.advancedDetails').html('<div><pre style="background-color:white">' + syntaxHighlight(response) + '</pre></div>');
                                    //DataItem consists of row data,passing it as a parameter to the parsefunction
                                    e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data['detailParseFn'](response,dataItem)));
                                    $(grid).data('contrailGrid').adjustDetailRowHeight(dataItem['cgrid']);
                                } else if(!isEmptyObject(response)) {
                                    e.detailRow.find('.row-fluid.advancedDetails').html('<div><pre style="background-color:white">' + syntaxHighlight(response) + '</pre></div>');
                                    e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data['detailParseFn'](response,dataItem)));
                                    $(grid).data('contrailGrid').adjustDetailRowHeight(dataItem['cgrid']);
                                } else {
                                    $(e.detailRow).html('<p class="error"><i class="icon-warning"></i>Error in fetching the details</p>');
                                }
                            }).fail(function(){
                                $(e.detailRow).html('<p class="error"><i class="icon-warning"></i>Error in fetching the details</p>'); 
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
                            detail: !$.isEmptyObject(gridDetailConfig) ? gridDetailConfig : false,
                            sortable:true,
                            lazyLoading: data['isAsyncLoad'] != null ? data['isAsyncLoad'] : false,
                            actionCell: data['config']['actionCell']
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
                //If deferredObj is pending and record count is empty..then show loading icon implies that first set of records are not fetched yet
                if((data['deferredObj'] != null && data['deferredObj'].state() == 'pending' && data['dataSource'].getItems().length == 0)
                        || data['url'] != null) {
                    cGrid.showGridMessage('loading'); 
                }
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
    var multipliers = [
        1, //B
        1024, //KB
        1024 * 1024, //MB
        1024 * 1024 * 1024, //GB
        1024 * 1024 * 1024 * 1024, //TB
        1024 * 1024 * 1024 * 1024 * 1024, //PB
        1024 * 1024 * 1024 * 1024 * 1024 * 1024, //EB
        1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 //ZB
    ];
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
/*
 * This function formats the Throughput value if the input is integer/float which inturn uses the
 * formatBytes function 
 * example of output 1234 bps 
 */
function formatThroughput(bytes,noDecimal,maxPrecision) {
    var data = formatBytes(bytes,noDecimal,maxPrecision);
    if(data != '-')
        return data.replace('B','b') + 'ps';
    else
        return '-';
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
    //onHashChange is triggered once it is resolved
    self.deferredObj = $.Deferred();
    var menuDefferedObj = $.Deferred(),statDefferredObj = $.Deferred(),webServerDefObj = $.Deferred();

    this.loadMenu = function () {
        $.get('/menu.xml?built_at=' + built_at, function (xml) {
            $.get('/api/admin/webconfig/features/disabled?built_at=' + built_at, function(disabledFeatures) {
                menuObj = $.xml2json(xml);
                webServerDefObj.always(function(){
                    processXMLJSON(menuObj, disabledFeatures);
                    globalObj['webServerInfo']['disabledFeatures'] = ifNull(disabledFeatures,[]);
                    var menuShortcuts = contrail.getTemplate4Id('menu-shortcuts')(menuHandler.filterMenuItems(menuObj['items']['item'],'menushortcut'));
                    $("#sidebar-shortcuts").html(menuShortcuts);
                    ['items']['item'] = menuHandler.filterMenuItems(menuObj['items']['item']);
                    menuDefferedObj.resolve();
                });            
            })
        });
        //Add an event listener for clicking on menu items
        $('#menu').on('click','ul > li > a',function(e) {
            var href = $(this).attr('href');
            loadFeature($.deparam.fragment(href));
            if(!e.ctrlKey){
                e.preventDefault();//Stop the page to navigate to the url set in href
            }
        });
        //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
        $.ajax({
            url:'/api/service/networking/web-server-info'
        }).done(function (response) {
            if(response['serverUTCTime'] != null) {
                response['timeDiffInMillisecs'] =  response['serverUTCTime'] - new Date().getTime();
               if(Math.abs(response['timeDiffInMillisecs']) > timeStampTolearence){
                    if(response['timeDiffInMillisecs'] > 0)
                        globalAlerts.push({msg:infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(),new XDate(response['serverUTCTime']),'rounded')),
                                sevLevel:sevLevels['INFO']});
                    else
                        globalAlerts.push({msg:infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(response['serverUTCTime']),new XDate(),'rounded')),
                                sevLevel:sevLevels['INFO']});
                }
                globalObj['webServerInfo'] = response;
            }    
        }).always(function(){
            webServerDefObj.resolve();
        });

        $.when.apply(window, [menuDefferedObj, webServerDefObj]).done(function () {
            self.deferredObj.resolve();
        });
    }
    
    //Filter the menu items based 
    //  * allowedRolesList for each feature and comparing them with the logged-in user roles
    //  * allowedOrchestrationModels for each feature and comparing it against loggedInOrchestrationMode 
    //type = menushortcut returns only the first level menu (Configure,Monitor)
    this.filterMenuItems = function(items,type){
        if(type == null) {
            items = items.filter(function(value){
                var hasAccess = false;
                hasAccess = checkForAccess(value);
                if(value['items'] != null && value['items']['item'] instanceof Array && hasAccess)
                    value['items']['item'] = menuHandler.filterMenuItems(value['items']['item']);
                return hasAccess;
            });
            return items;
        } else if(type == 'menushortcut') {
            var result = [];
            for(var i = 0;i < items.length; i++){
                var obj = {};
                obj['iconClass'] = items[i]['iconClass'],obj['id'] = items[i]['name'],obj['label'] = items[i]['label'];
                /*If top level item has access tag then check for it
                  else check for the access tag in the sub menu items
                */
                if(items[i]['access'] != null)
                    obj['cssClass'] = checkForAccess(items[i]) ? "btn-"+items[i]['name'] : "disabledBtn";
                else if(items[i]['items'] != null && items[i]['items']['item'] instanceof Array) {
                    var subMenu = items[i]['items']['item'],allowed = false;
                    for(var j = 0; j < subMenu.length; j++) {
                        if(subMenu[j]['access'] != null) {
                            /*
                             * if atleast one submenu item is allowed then menu button should not be disabled
                             */
                            if(checkForAccess(subMenu[j]))
                                allowed = true;
                        /*
                         * if any submenu item has no access tag which mean it is accessible to everyone so menu button should not be disabled
                         */
                        } else {
                            allowed = true;
                            break;
                        }
                    }
                    obj['cssClass'] = allowed ? "btn-"+items[i]['name'] : "disabledBtn";
                //Menu with no sub items,so disabling it
                } else 
                    obj['cssClass'] = "disabledBtn";
                result.push(obj);
            }
            return result;
        }
    }
    
    /*
     * This function checks whether the user(from globalObj) is permitted to view the menu item(which the parameter)
     * and returns true if permitted else false
     */
    function checkForAccess(value) {
        var roleExists = false,orchExists = false,accessFnRetVal = false; 
        var orchModel = globalObj['webServerInfo']['loggedInOrchestrationMode'];
        var loggedInUserRoles = globalObj['webServerInfo']['role'];
        if(value.access != null) {
            if(value.access.roles != null) {
                if(!(value.access.roles.role instanceof Array))
                    value.access.roles.role = [value.access.roles.role];
                var rolesArr = value.access.roles.role;
                var allowedRolesList = [];

                //If logged-in user has superAdmin role,then allow all features
                if($.inArray(roles['ADMIN'],loggedInUserRoles) > -1) {
                    roleExists = true;
                } else {
                    //If any one of userRole is in allowedRolesList
                    for(var i=0;i<rolesArr.length;i++) {
                        if($.inArray(rolesArr[i],loggedInUserRoles) > -1) {
                            roleExists = true;
                            break;
                        }
                    }
                }
            } else
                roleExists = true;

            if(value.access.accessFn != null) {
                if(typeof(menuAccessFns[value.access.accessFn]) == 'function')
                    accessFnRetVal = menuAccessFns[value.access.accessFn]();
            } else
                accessFnRetVal = true;

            if(value.access.orchModels != null) {
                if(!(value.access.orchModels.model instanceof Array))
                    value.access.orchModels.model = [value.access.orchModels.model];
                var orchModels = value.access.orchModels.model;

                for(var i = 0;i < orchModels.length; i++ ){
                    if ((orchModels[i] == orchModel) || ('none' == orchModel)) {
                        orchExists = true; 
                    }
                }
            } else
                orchExists = true;
            return (roleExists && orchExists && accessFnRetVal);
        } else {
            return true;
        }
    }
    
    this.toggleMenuButton = function (menuButton, currPageHash, lastPageHash) {
        var currentBCTemplate = contrail.getTemplate4Id('current-breadcrumb');
        var currPageHashArray, subMenuId, reloadMenu, linkId;
        if (menuButton == null) {
            currPageHashArray = currPageHash.split('_');
            //Looks scalable only till 2nd level menu
            linkId = '#' + currPageHashArray[0] + '_' + currPageHashArray[1] + '_' + currPageHashArray[2];
            subMenuId = $(linkId).parent('ul.submenu');
            menuButton = getMenuButtonName(currPageHashArray[0]);
            //If user has switched between top-level menu
            reloadMenu = check2ReloadMenu(lastPageHash, currPageHashArray[0]);
        }
        if (reloadMenu == null || reloadMenu) {
            var menu = {};
            for(var i = 0;i < menuObj['items']['item'].length; i++) {
                if(menuObj['items']['item'][i]['name'] == menuButton)
                    menu =  menuObj['items']['item'][i];
            }
            $('#menu').html('');
            $('#menu').html(contrail.getTemplate4Id('menu-template')(menu));
            if ($('#sidebar').hasClass('menu-min')) {
                $('#sidebar-collapse').find('i').toggleClass('icon-chevron-left').toggleClass('icon-chevron-right');
            }
            this.selectMenuButton("#btn-" + menuButton);
        }
        if (subMenuId == null) {
            subMenuId = $('.item:first').find('ul:first');
            var href = $('.item:first').find('ul:first').find('li:first a').attr("href");
            loadFeature($.deparam.fragment(href));
        } else {
            subMenuId = $(linkId).parent('ul.submenu');
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
     * Here we are checking whether the hash exists in the menu object
     */
    this.isHashExists = function (hashObj) {
        //if the hash is null,which means no change in the current hash conveys that already it exists in menuObj
        if(hashObj != null && (hashObj['p'] == null || menuHandler.getMenuObjByHash(hashObj['p']) != -1))
            return true;
        else 
            return false;
                
    }
    
    /*
     * post-processing of menu XML JSON
     * JSON expectes item to be an array,but xml2json make item as an object if there is only one instance
     */
    function processXMLJSON(json, disabledFeatures) {
        if((json['resources'] != null) && json['resources']['resource'] != null) {
            if(!(json['resources']['resource'] instanceof Array))
                json['resources']['resource'] = [json['resources']['resource']];
        }
        if ((json['items'] != null) && (json['items']['item'] != null)) {
            if (json['items']['item'] instanceof Array) {
                    var currItem = json['items']['item'];
                    for (var i = (currItem.length - 1); i > -1; i--) {
                        //remove diabled features from the menu obeject
                        if(currItem[i]['hash'] != undefined 
                                && disabledFeatures.disabled != null && disabledFeatures.disabled.indexOf(currItem[i]['hash']) !== -1) {
                            currItem.splice(i, 1);
                        } else {
                            if(currItem[i] != undefined) {
                                processXMLJSON(currItem[i], disabledFeatures);
                                add2SiteMap(currItem[i]);
                            }
                        }
                    }
            } else {
                processXMLJSON(json['items']['item'], disabledFeatures);
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
        if(currMenuObj['resources'] != null) {
            $.each(getValueByJsonPath(currMenuObj, 'resources;resource', []), function (idx, currResourceObj) {
                if ((currResourceObj['class'] != null) && (typeof(window[currResourceObj['class']]) == 'function' || typeof(window[currResourceObj['class']]) == 'object') &&
                    (typeof(window[currResourceObj['class']]['destroy']) == 'function')) {
                    $.allajax.abort();

                    try {
                        window[currResourceObj['class']]['destroy']();
                    } catch (error) {
                        console.log(error.stack);
                    }
                }
                //window[currResourceObj['class']] = null;
            });
        }
    }

    /**
     * parentsArr is used to load the resources specified in the menu hierarchy
     */
    this.getMenuObjByHash = function (menuHash, currMenuObj, parentsArr) {
        parentsArr = ifNull(parentsArr,[]) ;
        if (currMenuObj == null)
            currMenuObj = menuObj['items']['item'];
        for (var i = 0; i < currMenuObj.length; i++) {
            //console.info(currMenuObj[i]['hash']);
            if (currMenuObj[i]['hash'] == menuHash){
                currMenuObj[i]['parents'] = parentsArr;
                return currMenuObj[i];
            }
            if ((currMenuObj[i]['items'] != null) && (currMenuObj[i]['items']['item'] != null) && (currMenuObj[i]['items']['item'].length > 0)) {
                parentsArr.push(currMenuObj[i]);
                var retVal = self.getMenuObjByHash(menuHash, currMenuObj[i]['items']['item'], parentsArr);
                if (retVal != -1) {
                    return retVal;
                } else {
                    parentsArr.pop();
                }
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
        var parents = currMenuObj['parents'];
        if (currMenuObj['rootDir'] != null || getValueByJsonPath(currMenuObj,'resources;resource',[]).length > 0) {
            //Update page Hash only if we are moving to a different view
            var currHashObj = layoutHandler.getURLHashObj();
            if (currHashObj['p'] != currMenuObj['hash']) {
                layoutHandler.setURLHashObj({p:currMenuObj['hash'], q:currMenuObj['queryParams']});
                globalObj.hashUpdated = 1;
            }
            var deferredObjs = [];
            var rootDir = currMenuObj['rootDir'];
            var viewDeferredObjs = [];

            function loadViewResources(menuObj,hash) {
                $.each(getValueByJsonPath(menuObj,'resources;resource',[]),function(idx,currResourceObj) {
                    if (!(currResourceObj['view'] instanceof Array)) {
                        currResourceObj['view'] = [currResourceObj['view']];
                    }
                    if(currResourceObj['view'] != null && currResourceObj['view'].length > 0 && currResourceObj['view'][0] != null) {
                        $.each(currResourceObj['view'], function () {
                            var viewDeferredObj = $.Deferred();
                            viewDeferredObjs.push(viewDeferredObj);
                            var viewPath = currResourceObj['rootDir'] + '/views/' + this + '?built_at=' + built_at;
                            templateLoader.loadExtTemplate(viewPath, viewDeferredObj, hash);
                        });
                    }
                })
            }

            function loadCssResources(menuObj,hash) {
                $.each(getValueByJsonPath(menuObj,'resources;resource',[]),function(idx,currResourceObj) {
                    if(currResourceObj['css'] == null)
                        return;
                    if (!(currResourceObj['css'] instanceof Array)) {
                        currResourceObj['css'] = [currResourceObj['css']];
                    }
                    $.each(currResourceObj['css'],function() {
                        var cssPath = currResourceObj['rootDir'] + '/css/' + this;
                        if($.inArray(cssPath,globalObj['loadedCSS']) == -1) {
                            globalObj['loadedCSS'].push(cssPath);
                            var cssLink = $("<link rel='stylesheet' type='text/css' href='"+cssPath+"'>");
                            $('head').append(cssLink);
                        }
                    });
                });
            }
            
            function loadJsResources(menuObj) {
                $.each(getValueByJsonPath(menuObj,'resources;resource',[]),function(idx,currResourceObj) {
                    if (!(currResourceObj['js'] instanceof Array)) 
                        currResourceObj['js'] = [currResourceObj['js']];
                    var isLoadFn = currResourceObj['loadFn'] != null ? true : false;
                    var isReloadRequired = true;
                    //Restrict not re-loading scripts only for monitor infrastructure and monitor networks for now
                    if(NO_RELOAD_JS_CLASSLIST.indexOf(currResourceObj['class']) != -1) {
                        isReloadRequired = false;
                    }
                    $.each(currResourceObj['js'], function () {
                        //Load the JS file only if it's not loaded already
                        //if (window[currResourceObj['class']] == null)
                        if(($.inArray(currResourceObj['rootDir'] + '/js/' + this,globalObj['loadedScripts']) == -1) ||
                            (isLoadFn == true) || (isReloadRequired == true))
                            deferredObjs.push(getScript(currResourceObj['rootDir'] + '/js/' + this));
                    });
                });
            }

            //Load the parent views
            if(parents != null && parents.length > 0){
                $.each(parents,function(i,parent){
                    var parentRootDir = parent['rootDir'];
                    if (parentRootDir != null || getValueByJsonPath(parent,'resources;resource',[]).length > 0) {
                        loadViewResources(parent,currMenuObj['hash']);
                        loadCssResources(parent,currMenuObj['hash']);
                    }
                });
            }
            //Load the feature views
            loadViewResources(currMenuObj,currMenuObj['hash']);
            //Load the feature css files
            loadCssResources(currMenuObj);

            //View file need to be downloaded first before executing any JS file
            $.when.apply(window, viewDeferredObjs).done(function() {
                //Load the parent js
                if(parents != null && parents.length > 0){
                    $.each(parents,function(i,parent){
                        var parentRootDir = parent['rootDir'];
                        if (parentRootDir != null || getValueByJsonPath(parent,'resources;resource',[]).length > 0) {
                            loadJsResources(parent);
                        }
                    });
                }
                loadJsResources(currMenuObj);
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
                    //set the global variable
                    IS_NODE_MANAGER_INSTALLED = getValueByJsonPath(globalObj,'webServerInfo;uiConfig;nodemanager;installed',true);
                    //Cleanup the container
                    $(contentContainer).html('');
                    $.each(getValueByJsonPath(currMenuObj,'resources;resource',[]),function(idx,currResourceObj) {
                        if (currResourceObj['class'] != null) {
                            if(window[currResourceObj['class']] != null)
                                window[currResourceObj['class']].load({containerId:contentContainer, hashParams:layoutHandler.getURLHashParams()});
                        }
                    });
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


var menuAccessFns = {
     hideInFederatedvCenter : function() {
        //Hide in case of multiple orchestration modes along with vCenter and loggedInOrchestrationMode is vCenter
        if(globalObj['webServerInfo']['loggedInOrchestrationMode'] == 'vcenter' &&
                globalObj['webServerInfo']['orchestrationModel'].length > 1 &&
                globalObj['webServerInfo']['orchestrationModel'].indexOf('vcenter') > -1)
            return false;
        else
            return true;
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

$.deparamURLArgs = function (query) {
    var query_string = {};
    var query = ifNull(query,'');
    if (query.indexOf('?') > -1) {
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
    }
    return query_string;
};


function reloadGrid(grid){
	grid.refreshData();
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
     if (e['point']['type'] == 'network') {
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

function loadAlertsContent(deferredObj){
    var alertsDS = globalObj['dataSources']['alertsDS']['dataSource'];
    var renderPopupEveryTime = true,alertsData = [];
    //$('#header ul li.nav-header').text(data.length+' New Alerts');
    var alerts = contrail.getTemplate4Id("alerts-template");
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
                    lazyLoading: true
                },
                dataSource: {
                    dataView: alertsDS,
                },
                statusMessages: {
                    empty: {
                        text: 'No Alerts to display'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Data.'
                    }
                }
            },
            columnHeader: {
                columns:[ 
                    {
                        field:'name',
                        name:'Node',
                        minWidth:150,
                        formatter: function(r,c,v,cd,dc){
                            if(typeof(dc['sevLevel']) != "undefined" && typeof(dc['name']) != "undefined")
                                return "<span>"+statusTemplate({sevLevel:dc['sevLevel'],sevLevels:sevLevels})+dc['name']+"</span>";
                            else
                                return dc['name'];
                        }
                    },{
                        field:'type',
                        name:'Process',
                        minWidth:100
                    },{
                        field:'msg',
                        name:'Status',
                        minWidth:200,
                    },{
                        field:'timeStamp',
                        name:'Time',
                        minWidth:100,
                        formatter:function(r,c,v,cd,dc) {
                            if(typeof(dc['timeStamp']) != "undefined")
                                return getFormattedDate(dc['timeStamp']/1000);
                            else
                                return "";
                        }
                    }]
            }
        });
    }
    alertsWindow.modal('show');
    alertsGrid = $('#alertContent').data('contrailGrid');
    if(alertsGrid != null) {
        alertsGrid.refreshView();
        alertsGrid._grid.resizeCanvas();
        if(deferredObj != null) {
            deferredObj.always(function(){
                alertsGrid.removeGridLoading();
                alertsGrid._eventHandlerMap.dataView['onUpdateData']();
            }); 
        } else {
            alertsGrid.removeGridLoading();
            alertsGrid._eventHandlerMap.dataView['onUpdateData']();
        }
    }
    globalObj.showAlertsPopup = false;
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
                    populateFn:'networkPopulateFns.getVirtualNetworksData',
                    onChange:'networkPopulateFns.networkDSChangeHandler',
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
                    populateFn:'instancePopulateFns.getAllInstances',
                    onChange:'instancePopulateFns.instanceDSChangeHandler',
                    deferredObj:null,
                    dataSource:null,
                    error:null
                },
                //PortRange data for Port Distribution drill-down
                'portRangeData':{
                },
                //type flag added to differentiate infra dashboard datasource with other datasources
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
                    populateFn:['getAllAnalyticsNodes','getGeneratorsForInfraNodes','startFetchingCollectorStateGenInfos'],
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
                'projectDS':{
                        data:null,
                        dataSource:null
                }
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
            var defObjArr = [];
                defObjArr.push(deferredObj);
                if(dsObj['populateFn'][0].indexOf('.') > -1) {
                    var fnArr = dsObj['populateFn'][0].split('.');
                    window[fnArr[0]][fnArr[1]](defObjArr[0],dataSource,dsObj,dsName);
                } else
                    window[dsObj['populateFn'][0]](defObjArr[0],dataSource,dsObj,dsName);  
              for(var i = 0; i < dsObj['populateFn'].length; i++) {
                  var loopDefObj = $.Deferred();
                  defObjArr.push(loopDefObj);
                  defObjArr[i].done(function(i){
                      return function(arguments){
                          if(window[dsObj['populateFn'][i + 1]] != null && dsObj['populateFn'][i + 1].indexOf('.') == -1)
                              window[dsObj['populateFn'][i + 1]](defObjArr[i + 1],arguments['dataSource'],dsName);
                          else if(window[dsObj['populateFn'][i + 1]] != null && dsObj['populateFn'][i + 1].indexOf('.') > -1) {
                              var fnArr = dsObj['populateFn'][i + 1].split('.');
                              window[fnArr[0]][fnArr[1]](defObjArr[i + 1],arguments['dataSource'],dsName);
                          } else
                              dataSource.setData(arguments['dataSource'].getItems());
                      };
                  }(i));
              }
        } else {
            if(dsObj['populateFn'].indexOf('.') > -1) {
                var fnArr = dsObj['populateFn'].split('.');
                window[fnArr[0]][fnArr[1]](deferredObj,dataSource,dsObj,dsName);
            } else
                window[dsObj['populateFn']](deferredObj,dataSource,dsObj,dsName);
        }
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
            dsObj['clean'] = true;
            manageDataSource.setLastupdatedTime(dsObj,{status:'done'});
        });
        return dsObj;
    }
    /**
     * This function returns the state of the Datasource, whether it is populated or in progress based on the deferred object state
     */
    this.isLoading = function(dsObj) {
        if(dsObj['deferredObj'] != null) {
            var defObj = dsObj['deferredObj'],state = defObj.state();
            if(state == 'pending')
                return true;
            else(state == 'resolved' || state == 'rejected')
                return false;
        }
        return null;
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
    var subscribeFn = function (e,arguments) {
        var dataViewEventArgs = arguments;
           $.each(instances[dsName],function(idx,obj) {
               if(singleDSObj['onChange'] != null) {
                   $(obj).trigger('startLoading');
                   var deferredObj = $.Deferred();
                   if(singleDSObj['onChange'].indexOf('.') > -1) {
                       var fnArr = singleDSObj['onChange'].split('.');
                       window[fnArr[0]][fnArr[1]](singleDSObj['dataSource'],dataViewEventArgs,deferredObj);
                   } else
                       window[singleDSObj['onChange']](singleDSObj['dataSource'],dataViewEventArgs,deferredObj);
                   deferredObj.always(function(){
                       $(obj).trigger('endLoading'); 
                   });
               }
               $(obj).trigger('change');
           });
       };
    //Unsubscribe old listeners for this dataSource
    $.each(subscribeFns[dsName],function(idx,fn) {
       singleDSObj['dataSource'].onDataUpdate.unsubscribe(fn);
    });
    subscribeFns[dsName] = [];
    subscribeFns[dsName].push(subscribeFn);
    singleDSObj['dataSource'].onDataUpdate.subscribe(subscribeFn);

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
//Maintain an array of subscribeFns for each dataSource which is required as we need to pass on 
//those function pointers to unsubscribe from onPagingInfoChanged event
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
 * Get the value of a property inside a json object with a given path
 */
function getValueByJsonPath(obj,pathStr,defValue) {
    try {
    	var currObj = obj;
        var pathArr = pathStr.split(';');
        var arrLength = pathArr.length;
        for(var i=0;i<arrLength;i++) {
            if(currObj[pathArr[i]] != null) {
                currObj = currObj[pathArr[i]];
            } else
                return defValue;
        }
        if(currObj instanceof Array)
            return $.extend(true,[],currObj);
        else if(typeof(currObj) == "object")
            return $.extend(true,{},currObj);
        else
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
    var urlParams = $.deparamURLArgs(transportCfg['url']);
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
            var urlParams = $.deparamURLArgs(transportCfg['url']);
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
                var urlParams = $.deparamURLArgs(transportCfg['url']);
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

function showAdvancedDetails(){
    $('#divBasic').hide();
    $('#divStatus').hide();
    $('#divAdvanced').show();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4').append('<span class="subtitle">(Advanced)</span>')
}

function showBasicDetails(){
    $('#divAdvanced').hide();
    $('#divStatus').hide();
    $('#divBasic').show();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
}

function getFormattedDate(timeStamp){
    if(!$.isNumeric(timeStamp))
        return '';
    else{
    var date=new Date(timeStamp),fmtDate="",mnth,hrs,mns,secs,dte;
    dte=date.getDate()+"";
    if(dte.length==1)
        dte="0"+dte;
    mnth=parseInt(date.getMonth()+1)+"";
    if(mnth.length==1)
        mnth="0"+mnth;
    hrs=parseInt(date.getHours())+"";
    if(hrs.length==1)
        hrs="0"+hrs;
    mns=date.getMinutes()+"";
    if(mns.length==1)
        mns="0"+mns;
    secs=date.getSeconds()+"";
    if(secs.length==1)
        secs="0"+secs;
    fmtDate=date.getFullYear()+"-"+mnth+"-"+dte+"  "+hrs+":"+mns+":"+secs;
    return fmtDate;}
}

//Returns true if the loggedInOrchestrationMode is vcenter
function isVCenter() {
    if(globalObj['webServerInfo']['loggedInOrchestrationMode'] == 'vcenter')
        return true;
    else
        return false; 
}
//Returns the corresponding NetMask for a givne prefix length
function prefixToNetMask(prefixLen) {
    var prefix = Math.pow(2,prefixLen) - 1;
    var binaryString = prefix.toString(2);
    for(var i=binaryString.length;i<32;i++) {
            binaryString += '0';
    }
    return v4.Address.fromHex(parseInt(binaryString,2).toString(16)).address;
}
