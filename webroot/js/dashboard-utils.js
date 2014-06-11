/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

function infraMonitorClass() {
    var self = this;
    var viewModels=[]; 
    var dashboardConfig = [];
    var tabs = [];

    //Show down node count only if it's > 0
    function showHideDownNodeCnt() {
        var downSelectors = $('[data-bind="text:downCnt"]');
        $.each(downSelectors,function(idx,elem) {
            if($(elem).text() == "0")
                $(elem).hide();
            else
                $(elem).show();
        });
    }

    /*Selenium Testing*/
    this.getDashboardDataObj = function(){
        return dashboardViewModel;
    }
    /*End of Selenium Testing*/    

    this.destroy = function () {
        //Cancel the pending ajax calls
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }

    this.updateViewByHash = function (hashObj, lastHashObj) {
        self.load({hashParams:hashObj});
    }
    
    this.updateAlertsAndInfoBoxes = function() {
         var infoListTemplate = contrail.getTemplate4Id("infoList-template");
         var alertTemplate=contrail.getTemplate4Id("alerts-template");
         var dashboardDataArr = [];
         var alerts_fatal=[],alerts_stop=[],alerts_nodes=[],alerts_core=[],alerts_shutdown=[];
         var nodeAlerts=self.getNodeAlerts(viewModels);
         $.each(viewModels,function(idx,currViewModel) {
             dashboardDataArr = dashboardDataArr.concat(currViewModel.data());
         });
         for(var i=0;i<nodeAlerts.length;i++){
             alerts_nodes.push({nName:nodeAlerts[i]['name'],pName:nodeAlerts[i]['type'],sevLevel:nodeAlerts[i]['sevLevel'],
                timeStamp:nodeAlerts[i]['timeStamp'],msg:nodeAlerts[i]['msg']});
         }
         var processAlerts = self.getAllProcessAlerts(viewModels);
         var allAlerts = alerts_nodes.concat(processAlerts);
         allAlerts.sort(bgpMonitor.sortInfraAlerts);
         var dashboardCF = crossfilter(dashboardDataArr);
         var nameDimension = dashboardCF.dimension(function(d) { return d.name });
         var verDimension = dashboardCF.dimension(function(d) { return d.version });
         var verGroup = verDimension.group();
         var verArr = [];
         var systemCnt = nameDimension.group().all().length;
         var infoData = [{lbl:'No of servers',value:systemCnt}];
         //Distinct Versions
         if(verGroup.all().length > 1) {
             //verArr = verGroup.order(function(d) { return d.value;}).top(2);
             verArr = verGroup.top(Infinity);
             var unknownVerInfo = [];
             $.each(verArr,function(idx,value) {
                 if(verArr[idx]['key'] == '' || verArr[idx]['key'] ==  '-')
                    unknownVerInfo.push({lbl:'Logical nodes with version unknown',value:verArr[idx]['value']}) ;
                 else
                     infoData.push({lbl:'Logical nodes with version ' + verArr[idx]['key'],value:verArr[idx]['value']});
             });
             if(unknownVerInfo.length > 0)
                 infoData = infoData.concat(unknownVerInfo);
         } else if(verGroup.all().length == 1)
             infoData.push({lbl:'version',value:verGroup.all()[0]['key']});
         $('#system-info-stat').html(infoListTemplate(infoData));
         endWidgetLoading('sysinfo');
         if(timeStampAlert.length > 0)
             allAlerts = allAlerts.concat(timeStampAlert)
         globalObj['alertsData'] = allAlerts;
         if(globalObj.showAlertsPopup){
             loadAlertsContent();
         }
         var detailAlerts = [];
         for(var i = 0; i < allAlerts.length; i++ ){
             if(allAlerts[i]['detailAlert'] != false)
                 detailAlerts.push(allAlerts[i]);
         }
         //Display only 5 alerts in "Dashboard"
         $('#alerts-box-content').html(alertTemplate(detailAlerts.slice(0,5)));
         endWidgetLoading('alerts');
         $("#moreAlertsLink").click(loadAlertsContent);
    }
    

    this.addInfoBox = function(infoBoxObj) {
        //If dashboard is not already loaded,load it
        if($('.infobox-container').length == 0)
            this.load();
        dashboardConfig.push(infoBoxObj);
        viewModels.push(infoBoxObj['viewModel']);
        var infoBoxTemplate  = contrail.getTemplate4Id('infobox-template');
        var obj = infoBoxObj;
        $('#topStats').append(infoBoxTemplate({title:obj['title'],totalCntField:'totalCnt',
            activeCntField:'upCnt',inactiveCntField:'downCnt'})); 
        var tabContentTemplate = contrail.getTemplate4Id(obj['template']);
        $('#dashboard-charts').append($('<div>').addClass('dashboard-chart-item').addClass('row-fluid').addClass('hide').html(tabContentTemplate));
        ko.applyBindings(obj['viewModel'],$('#topStats').children(':last')[0]);
        //Issue calls to fetch data
        var nodeDS = new SingleDataSource(obj['dataSourceObj']);
        var result = nodeDS.getDataSourceObj();
        var dataSource = result['dataSource'];
        var deferredObj = result['deferredObj'];
        //Update the viewModel
        $(nodeDS).on('change',function() {
            var data = dataSource.getItems();
            obj['viewModel'].data(data);
            self.updateAlertsAndInfoBoxes();
        });
        infoBoxObj['viewModel'].downCnt.subscribe(function(newValue) {
            showHideDownNodeCnt();
        });
    }

    function loadLogs() {
        function getLogs(deferredObj) {
            var retArr = [];
            $.ajax({
                url: monitorInfraUrls['QUERY'] + '?where=&filters=&level=4&fromTimeUTC=now-10m' + 
                    '&toTimeUTC=now&table=MessageTable&limit=10'
            }).done(function(result) {
                retArr = $.map(result['data'],function(obj,idx) {
                    obj['message'] = formatXML2JSON(obj['Xmlmessage']);
                    obj['timeStr'] = diffDates(new XDate(obj['MessageTS']/1000),new XDate());
                    if(obj['Source'] == null)
                        obj['moduleId'] = contrail.format('{0}',obj['ModuleId']);
                    else
                        obj['moduleId'] = contrail.format('{0} ({1})',obj['ModuleId'],obj['Source']);
                    return obj;
                });
                deferredObj.resolve(retArr);
            }).fail(function(result) {
                deferredObj.resolve(retArr);
            });
        }
        var logListTemplate = contrail.getTemplate4Id("logList-template");
        var logDeferredObj = $.Deferred();
        getLogs(logDeferredObj);
        logDeferredObj.done(function(data) {
            //Display only recent 3 log messages
        	$('#logs-box .widget-main').empty().html(logListTemplate(data.reverse().slice(0,3)));
            endWidgetLoading('logs');
        });
    }

    function loadInfoBoxes() {

        $('.infobox-container').on('click','.infobox',function() {
            tabs = [];
            $.each(dashboardConfig,function(idx,obj) {
                tabs.push(obj['tabId']);
            });
            var tabIdx = $(this).index();
            layoutHandler.setURLHashParams({tab:tabs[tabIdx]},{triggerHashChange:false});
            //Hide all tab contents
            $('#dashboard-charts .dashboard-chart-item').hide();
            $('.infobox').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
            $($('.infobox')[tabIdx]).removeClass('infobox-grey').addClass('infobox-blue infobox-dark active');
            var currTabContainer = $('#dashboard-charts .dashboard-chart-item')[tabIdx];
            //Show the current tab content
            $(currTabContainer).show();
            //Trigger refresh on svg charts
            $(currTabContainer).find('svg').trigger('refresh');
        });

        //When all node details are fetched,upedate alerts & info boxes
        /*
        var deferredObjs = [];
        $.when.apply(window,deferredObjs).done(
            function(vRouterResult,ctrlNodeResult,analyticsResult,configResult) {
                self.updateAlertsAndInfoBoxes();
            });
        */
    }

    //Concatenate Process alerts across all nodes
    this.getAllProcessAlerts = function(data) {
        var alertsList = [];
        $.each(viewModels,function(idx,currViewModel) {
            $.each(currViewModel.data(),function(i,obj) {
                alertsList = alertsList.concat(obj['processAlerts']);
            });
        });
        return alertsList;
    }

    //Construct Node-specific Alerts looping through all nodes
    this.getNodeAlerts = function(data) {
        var alertsList = [];
        $.each(viewModels,function(idx,currViewModel) {
            $.each(currViewModel.data(),function(i,obj) {
                alertsList = alertsList.concat(obj['nodeAlerts']);
            });
        });
        return alertsList;
    }

    this.load = function (obj) {
        var infraDashboardTemplate = contrail.getTemplate4Id('infra-dashboard');
        $(contentContainer).html('');
        $(contentContainer).html(infraDashboardTemplate);

        loadInfoBoxes();
        loadLogs();

        //Initialize the common stuff
        $($('#dashboard-stats .widget-header')[0]).initWidgetHeader({title:'Logs',widgetBoxId :'logs'});
        $($('#dashboard-stats .widget-header')[1]).initWidgetHeader({title:'System Information', widgetBoxId: 'sysinfo'});
        $($('#dashboard-stats .widget-header')[2]).initWidgetHeader({title:'Alerts', widgetBoxId: 'alerts' });

    }
    this.selectTabByHash = function() {
        var hashParams = layoutHandler.getURLHashParams();
        //Select node tab based on URL hash parameter
        var tabIdx = $.inArray(ifNull(hashParams['tab']),tabs);
        if(tabIdx <= -1)
            tabIdx = 0;
        $($('.infobox-container .infobox')[tabIdx]).trigger('click');
    }
}

var infraDashboardView = new infraMonitorClass();

/**
 * This function takes parsed nodeData from the infra parse functions and returns object with all alerts displaying in dashboard tooltip,
 * and tooltip messages array
 */
function getNodeStatusForSummaryPages(data,page) {
    var result = {},msgs = [],tooltipAlerts = [];
    for(var i = 0;i < data['alerts'].length; i++) {
        if(data['alerts'][i]['tooltipAlert'] != false) {
            tooltipAlerts.push(data['alerts'][i]);
            msgs.push(data['alerts'][i]['msg']);
        }
    }
    //Status is pushed to messages array only if the status is "UP" and tooltip alerts(which are displaying in tooltip) are zero
    if(ifNull(data['status'],"").indexOf('Up') > -1 && tooltipAlerts.length == 0) {
        msgs.push(data['status']);
        tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['INFO']});
    } else if(ifNull(data['status'],"").indexOf('Down') > -1) {
        //Need to discuss and add the down status 
        //msgs.push(data['status']);
        //tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['ERROR']})
    }
    result['alerts'] = tooltipAlerts;
    result['nodeSeverity'] = data['alerts'][0] != null ? data['alerts'][0]['sevLevel'] : sevLevels['INFO'];
    result['messages'] = msgs;
     var statusTemplate = contrail.getTemplate4Id('statusTemplate');
    if(page == 'summary') 
        return statusTemplate({sevLevel:result['nodeSeverity'],sevLevels:sevLevels});
    return result;
}

var dashboardUtils = {
    sortNodesByColor: function(a,b) {
        var colorPriorities = [d3Colors['green'],d3Colors['blue'],d3Colors['orange'],d3Colors['red']];
        var aColor = $.inArray(a['color'],colorPriorities); 
        var bColor = $.inArray(b['color'],colorPriorities);
        return aColor-bColor;
    },
    getDownNodeCnt : function(data) {
        var downNodes = $.grep(data,function(obj,idx) {
                           return obj['color'] == d3Colors['red']; 
                        });
        return downNodes.length;
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
}
