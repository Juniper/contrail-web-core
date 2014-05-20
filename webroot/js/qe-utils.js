/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var featureTitle = {
	'fqq' : 'Flow',
	'lqq' : 'Log',
	'sqq' : 'Stats'
};

var serializer = new XMLSerializer(),
    domParser = new DOMParser(),
    loadingOTGridColumns = [
        {id:"MessageTS", field:"MessageTS", name:"Time", width:210 },
        {id:"Source", field:"Source", name:"Source", width:210 },
        {id:"ModuleId", field:"ModuleId", name:"Module Id", width:210 },
        {id:"Xmlmessage", field:"Xmlmessage", name:"Log" }
    ],
    placeHolders = {"Xmlmessage": ["Use RegEx= operator to search Xmlmessage"], "ObjectLog": ["Use RegEx= operator to search ObjectLog"], "SystemLog": ["Use RegEx= operator to search SystemLog"], "protocol_sport":["Protocol", "Any Source Port"], "protocol_dport":["Protocol", "Any Destination Port"], "sourcevn_sourceip":["Source VN", "Any Source IP"], "destvn_destip":["Destination VN", "Any Destination IP"]},
    flowWhereFields = [
        {"name":"Source VN, Source IP", "value":"sourcevn_sourceip"},
        {"name":"Dest. VN, Dest. IP", "value":"destvn_destip"},
        {"name":"Protocol, Source Port", "value":"protocol_sport"},
        {"name":"Protocol, Dest. Port", "value":"protocol_dport"}
    ];

var queries = {
    fs: getQueryModel(),
    fr: getQueryModel(),
    sl: getQueryModel(),
    ot: getQueryModel(),
    acpu: getQueryModel("Query CPU Information"),
    qeperf: getQueryModel("Query QE Performance"),
    vna: getQueryModel("Query VN Agent"),
    smsg: getQueryModel("Query Sandesh Messages")
};

var slColumnsDisplay = [
    {
        field:"MessageTS",
        name:"Time",
        width:180,
        minWidth: 180,
        formatter: function(r, c, v, cd, dc) {
            return (dc.MessageTS && dc.MessageTS!='') ? formatMicroDate(dc.MessageTS) : '';
        }
    },
    {
        field:"Source",
        name:"Source",
        width:100,
        formatter: function(r, c, v, cd, dc) {
            return handleNull4Grid(dc.Source);
        }
    },
    {
        field:"ModuleId",
        name:"Module Id",
        width:120,
        minWidth:120,
        formatter: function(r, c, v, cd, dc) {
            return handleNull4Grid(dc.ModuleId);
        }
    },
    {
        field:"Category",
        name:"Category",
        width:100,
        formatter: function(r, c, v, cd, dc) {
            return handleNull4Grid(dc.Category);
        }
    },
    {
        field:"Messagetype",
        name:"Log Type",
        width:120,
        formatter: function(r, c, v, cd, dc) {
            return handleNull4Grid(dc.Messagetype);
        }
    },
    {
        field:"Level",
        name:"Level",
        width:100,
        hidden:true,
        formatter: function(r, c, v, cd, dc) {
            return getLevelName4Value(dc.Level);
        }
    },
    {
        field:"Xmlmessage",
        name:"Log",
        width:500,
        formatter: function(r, c, v, cd, dc) {
            return '<span class="word-break-normal">' + formatXML2JSON(dc.Xmlmessage) + '</span>';
        }
    }
];

var queryQueue = {
    fqq:{},
    lqq:{},
    sqq:{}
};

function getQueueColumnDisplay(queueId) {
    return [
        {	
        	id: "startTime", 
        	field: "startTime", 
        	name:"Date", 
        	width:150, 
        	minWidth: 150,
        	formatter: function(r, c, v, cd, dc) {
        		return moment(dc.startTime).format('YYYY-MM-DD HH:mm:ss');
        	}
        },
        {
        	id:"opsQueryId", 
        	field:"opsQueryId", 
        	name:"Query Id", 
        	width:200, 
        	sortable:false
        },
        {	
        	id:"reRunTimeRange",
        	field:"reRunTimeRange", 
        	name:"Time Range", 
        	width:100,
        	minWidth: 100,
        	formatter: function(r, c, v, cd, dc) {
        		return formatReRunTime(dc.reRunTimeRange);
        	}, 
        	sortable:false
        },
        {
            id: "engQuery",
            field: "engQueryStr",
            name: "Query",
            width: 400,
            formatter: function(r, c, v, cd, dc) {
        		var engQueryObj = JSON.parse(dc.engQueryStr),
        			engQueryStr = '';
        		
        		$.each(engQueryObj, function(key, val){
        			if(key == 'select' && val != ''){
        				engQueryStr += '<div class="row-fluid"><span class="bold">' + key.toUpperCase() + '</span> &nbsp;*</div>';
        			}
        			else if((key == 'where' || key == 'filter') && val == ''){
        				engQueryStr += '';
        			}
        			else {
        				engQueryStr += '<div class="row-fluid word-break-normal"><span class="bold">' + key.toUpperCase() + '</span> &nbsp;' + val + '</div>';
        			}
        		});
        		return engQueryStr;
        	},
            sortable:false
        },
        {
        	id:"progress", 
        	field:"progress", 
        	name:"Progress", 
        	width:75, 
        	formatter: function(r, c, v, cd, dc) {
        		return (dc.status != 'error' && dc.progress != '' && parseInt(dc.progress) > 0) ? (dc.progress + '%') : '-';
        	}
        },
        {	
        	id:"count", 
        	field:"count", 
        	name:"Records", 
        	width:75},
        {
        	id:"status", 
        	field:"status", 
        	name:"Status", 
        	width:100
        },
        {
        	id:"timeTaken",
        	field:"timeTaken", 
        	name:"Time Taken", 
        	width:100, 
        	formatter: function(r, c, v, cd, dc) {
        		return ((dc.timeTaken == -1) ? '-' : (parseInt(dc.timeTaken) + ' secs')); 
        	}, 
        	sortable:true
        }
    ];
};

function formatReRunTime(reRunTimeRange) {
    var formattedReRunTime = 'custom', timeInSecs;
    if(reRunTimeRange != null && reRunTimeRange != '0') {
        timeInSecs = parseInt(reRunTimeRange);
        if(timeInSecs <= 3600) {
            formattedReRunTime = 'Last ' + timeInSecs/60 + ' mins';
        } else if ( timeInSecs <= 43200) {
            formattedReRunTime = 'Last ' + timeInSecs/3600 + ' hrs';
        }
    }
    return formattedReRunTime;
};

function getQueueActionColumn(queueId, dc) {
	var queueId4Redis = splitString2Array(queueId, "-")[0];
        status = dc.status, 
        queryId = dc.queryId, 
        errorMessage = dc.errorMessage,
        reRunTimeRange = dc.reRunTimeRange, 
        reRunQueryString = dc.reRunQueryString;

    if(status == 'queued'){
    	return [];
    }
        
    var returnArray = [];
    if(status != "error") {
    	returnArray.push({
    		title: 'View Results',
			iconClass: 'icon-list-alt',
			onClick: function(rowIndex){
				viewQueryResult(queueId, rowIndex, reRunTimeRange, reRunQueryString);
			}
    	});
	} else if(errorMessage != null) {
		if(errorMessage.message != null && errorMessage.message != '') {
			errorMessage = errorMessage.message;
		}
		
		returnArray.push({
    		title: 'View Error',
			iconClass: 'icon-exclamation-sign',
			onClick: function(rowIndex){
				showInfoWindow(errorMessage,'Error');
			}
    	});
	}
    if(reRunTimeRange != null && reRunTimeRange != '0') {
    	returnArray.push({
    		title: 'Rerun Query',
			iconClass: 'icon-repeat',
			onClick: function(rowIndex){
				viewQueryResult(queueId, rowIndex, reRunTimeRange, reRunQueryString, true);
			}
    	});
    }
    
    returnArray.push({
		title: 'Delete Query',
		iconClass: 'icon-trash',
		onClick: function(rowIndex){
			deleteQueryCache4Id(queueId, rowIndex, queueId4Redis, queryId);
		}
	});
    
    return returnArray;
    
}

function createNewDTPicker(queryPrefix, elementId, showFunction, selectFunction, defaultTime) {
    $("#" + elementId).contrailDateTimePicker({
        onShow: function(cdt) {
            this.setOptions(showFunction(queryPrefix, cdt));
        },
        onClose: function(cdt) {
            this.setOptions(showFunction(queryPrefix, cdt));
        },
        onSelectDate: function(cdt) {
            this.setOptions(selectFunction(queryPrefix, cdt));
        }
    });
    $("#" + elementId).data('contrailDateTimePicker').val(defaultTime);
};

function showFromTime(queryPrefix, cdt) {
    var d = new Date($('#' + queryPrefix + '-to-time').val());
    var dateString = moment(d).format('MMM DD, YYYY');
    var timeString = moment(d).format('hh:mm:ss A');
    
    return {
        maxDate: dateString ? dateString : false,
        maxTime: timeString ? timeString : false
    };
};

function showToTime(queryPrefix, cdt) {
    var d = new Date($('#' + queryPrefix + '-from-time').val());
    var dateString = moment(d).format('MMM DD, YYYY');
    var timeString = moment(d).format('hh:mm:ss A');
    
    return {
        minDate: dateString ? dateString : false,
        minTime: timeString ? timeString : false
    };
};

function onSelectFromDate(queryPrefix, cdt) {
    var d = new Date($('#' + queryPrefix + '-to-time').val());
    var toDateString = moment(d).format('MMM DD, YYYY');
    var timeString = moment(d).format('hh:mm:ss A');
    var fromDateString = moment(cdt).format('MMM DD, YYYY');

    return {
        maxDate: toDateString ? toDateString : false,
        maxTime: (fromDateString == toDateString) ? timeString : false
    };
};

function onSelectToDate(queryPrefix, cdt) {
    var d = new Date($('#' + queryPrefix + 'fs-from-time').val());
    var fromDateString = moment(d).format('MMM dd, yyyy');
    var timeString = moment(d).format('hh:mm:ss A');
    var toDateString = moment(cdt).format('MMM DD, YYYY');

    return {
        minDate: fromDateString ? fromDateString : false,
        minTime: (toDateString == fromDateString) ? timeString : false
    };
};

function deleteAppendedWhere(id) {
    $('#' + id).remove();
};

function viewQueryResult(gridId, rowIndex, reRunTimeRange, reRunQueryObj, reRun) {
	$('#' + gridId).data('contrailGrid').collapse();
    var element =  $('#' + gridId),
    	dataItem = $(element).data('contrailGrid')._dataView.getItem(rowIndex);
    var tableName = dataItem.tableName, timeRange, now, fromTime, toTime,
        queryPrefix = getQueryPrefix4Table(tableName),
        timeObj = {}, reRun = reRun != null ? reRun : false,
        params = {tableName: tableName, reRun: reRun, timeObj: timeObj, reRunTimeRange: reRunTimeRange, reRunQueryObj: reRunQueryObj};

    if(reRunTimeRange != null) {
        timeRange = parseInt(reRunTimeRange);
        now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        toTime = now.getTime();
        fromTime = toTime - (timeRange * 1000);
        if(queryPrefix !== 'fs') {
            timeObj['fromTime'] = "now-" + reRunTimeRange + "s";
            timeObj['toTime'] = "now";
        } else {
            timeObj['fromTime'] = fromTime;
            timeObj['toTime'] = toTime;
        }
        timeObj['fromTimeUTC'] = fromTime;
        timeObj['toTimeUTC'] = toTime;
        timeObj['reRunTimeRange'] = reRunTimeRange;
    }
    if (dataItem.progress == 100) {
        params['queryPrefix'] = queryPrefix;
        if (tableName == 'FlowRecordTable') {
            viewFRQueryResults(dataItem, params);
        } else if (tableName == 'FlowSeriesTable') {
            viewFSQueryResults(dataItem, params);
        } else if (tableName == 'MessageTable') {
            viewSLQueryResults(dataItem, params);
        } else if (tableName.indexOf('StatTable.') != -1) {
            viewStatQueryResults(dataItem, params);
        }
    }
};

function getQueryPrefix4Table(tableName) {
    var queryPrefix = null,
        acpuStatTables = [
            'StatTable.AnalyticsCpuState.cpu_info',
            'StatTable.ComputeCpuState.cpu_info',
            'StatTable.ConfigCpuState.cpu_info',
            'StatTable.ControlCpuState.cpu_info'
        ];
    if (tableName == 'FlowRecordTable') {
        queryPrefix = 'fr';
    } else if (tableName == 'FlowSeriesTable') {
        queryPrefix = 'fs';
    } else if (tableName == 'MessageTable') {
        queryPrefix = 'sl';
    } else if (acpuStatTables.indexOf(tableName) != -1 ) {
        queryPrefix = 'acpu';
    } else if (tableName == 'StatTable.QueryPerfInfo.query_stats') {
        queryPrefix = 'qeperf';
    } else if (tableName == 'StatTable.UveVirtualNetworkAgent.vn_stats') {
        queryPrefix = 'vna';
    } else if (tableName == 'StatTable.SandeshMessageStat.msg_info') {
        queryPrefix = 'smsg';
    } else if (tableName.indexOf('Object') != -1) {
        queryPrefix = 'ol';
    }
    return queryPrefix;
}

function deleteQueryCache4Queue(queueId) {
    if (!$('#btnDeleteQueryQueue').hasClass('disabled-link')) {
    	var gridCheckedRows = $("#" + queueId + "-results").data('contrailGrid').getCheckedRows();
    	createDeleteConfirmWindow(queueId,gridCheckedRows);
    }
};

function successDelQueryQueueCache(response, cbParams) {
    var queueId = cbParams.queueId;

    var dataIds = $.map(cbParams.checkedRows, function(val) {
    	  return (val.id);
    });
    $("#" + queueId + "-results").data('contrailGrid')._dataView.deleteDataByIds(dataIds);   		
    
    showOnlyQueryQueue(queueId);
};

function showOnlyQueryQueue(queueId) {
    if(queueId == 'lqq') {
        $("#sl-query-widget").addClass('hide');
        $("#sl-result-widget").addClass('hide');
        $("#ot-query-widget").addClass('hide');
        $("#ot-result-widget").addClass('hide');
    } else {
        $("#fs-query-widget").addClass('hide');
        $("#fs-result-widget").addClass('hide');
        $("#fr-query-widget").addClass('hide');
        $("#fr-result-widget").addClass('hide');
    }
}

function failureDeleteQueryCache(error) {
    showInfoWindow("Error in clearing query queue: " + error, "Error");
};

function deleteQueryCache4Id(gridId, rowIndex, queueId, queryId) {
	$.contrailBootstrapModal({
		id: queueId + '-del-confirmation',
		title: 'Remove Confirmation',
		body: '<h6>Are you sure you want to remove?</h6>',
		footer: [{
			title: 'Cancel',
			onclick: 'close'
		},
		{
			id: queueId + '-del-confirm',
			title: 'Confirm',
			onclick: function(){
				var url = '/api/admin/reports/query';
			    var postDataJSON = {queryQueue: queueId, queryIds: [queryId]};
			    doAjaxCall(url, "DELETE", JSON.stringify(postDataJSON), "successDeleteQueryCache", "failureDeleteQueryCache", null, {gridId: gridId, queueId: queueId, rowIndex:rowIndex});
		        $('#' + queueId + '-del-confirmation').modal('hide');
			},
			className: 'btn-primary'
		}]
   });
};

function successDeleteQueryCache(response, cbParams) {
    var gridId = cbParams.gridId, queueId = cbParams.queueId;
    $('#' + gridId).data('contrailGrid').deleteDataByRows([cbParams.rowIndex]);
    showOnlyQueryQueue(queueId);
};

function failureDeleteQueryCache(error) {
    showInfoWindow("Error in deleting query cache.", "Error");
};

function enableButton(elementId) {
    $("#" + elementId).removeAttr('disabled');
};

function disableButton(elementId) {
    $("#" + elementId).attr("disabled", "disabled");
};

function clearGrid(elementId) {
    $("#" + elementId).html('');
};

function openSelect(queryPrefix) {
    var query = queries[queryPrefix];

    if($('#' + queryPrefix + '-select-popup-container').length != 0){
        $('body').find('#' + queryPrefix + '-select-popup-container').remove();
    }
    $('body').append(query.selectTemplate);
    ko.cleanNode(document.getElementById(queryPrefix + '-select-popup-container'));
    ko.applyBindings(query.selectViewModel, document.getElementById(queryPrefix + '-select-popup-container'));
    query.selectWindow = $('#' + queryPrefix + '-select-popup-container');
    query.selectWindow.modal('show');
};

/* 
 * Where Clause Functions
 */
function openWhere(queryPrefix) {
    var query = queries[queryPrefix],
        whereClauseView = query.whereViewModel.whereClauseView(),
//        whereClauseEdit = query.whereViewModel.whereClauseSubmit(),
        selectedORClauseIndex = parseInt(query.whereViewModel.selectedORClauseIndex());

    $.contrailBootstrapModal({
    	id: queryPrefix + '-where-popup-container',
    	className: 'modal-700',
        title: 'Where',
        body: '<div id="' + queryPrefix + '-pane-container"><div id="' + queryPrefix + '-or-clauses" class="or-clauses"></div></div>',
        footer: [
                 {
                     id: 'cancelBtn',
                     title: 'Cancel',
                     onclick: 'close'
                 },
                {
                	 className: 'btn-primary',
                     title: 'Apply',
                     onclick: function(){
                    	 addWhere(queryPrefix);
                    	 $('#' + queryPrefix + '-where-popup-container').modal('hide');
                     }
                 }
        ],
        onEnter: function(){
	       	 addWhere(queryPrefix);
	    	 $('#' + queryPrefix + '-where-popup-container').modal('hide');
	     }
    });

    query.orClauseTemplate = contrail.getTemplate4Id(((queryPrefix == 'fs' || queryPrefix == 'fr') ? 'flow-' : '') + 'or-clause-template');
    query.newORClauseTemplate = contrail.getTemplate4Id('new-or-clause-template');

    ko.applyBindings(query.whereViewModel, document.getElementById(queryPrefix + '-or-clauses'));
    $('#' + queryPrefix + '-or-clauses').append(query.orClauseTemplate({
        queryPrefix: queryPrefix,
        whereClauseView: $.makeArray(whereClauseView)
    }));
    $.each(whereClauseView, function(orKey, orVal){
    	$.each(orVal.whereClauseEdit, function(andKey, andVal){
    		ko.applyBindings(query.whereViewModel, document.getElementById(queryPrefix + '-where-clause-' + orKey + '-' + andKey));
    		loadWhereOptions(queryPrefix + '-where-clause-' + orKey + '-' + andKey, queryPrefix, andVal['value'], (contrail.checkIfExist(andVal['value2']) ? andVal['value2'] : ''));
    	});
    });
    selectNewORClause(queryPrefix);
};

function selectNewORClause(queryPrefix) {
	var query = queries[queryPrefix],
        whereClauseEdit = [];
    	query.whereViewModel.whereClauseEdit([]);
    	query.whereViewModel.selectedORClauseIndex('-1');
    	collapseAllORClause();
		var newOrClause = $(query.newORClauseTemplate({queryPrefix: queryPrefix, whereClauseEdit: whereClauseEdit})).appendTo($('#' + queryPrefix + '-or-clause-items'));
		$('#' + queryPrefix + '-or-clause-items').append($('#' + queryPrefix + '-or-clause-item-new-term'));
        appendWhere(queryPrefix,newOrClause);
};

function cancelOR(dis){
	var edit = $(dis).parents('.or-clause-item-edit');
	edit.parent().find('.or-clause-item-condensed').show();
	edit.parents('.or-clause-item').find('.or-clause-item-action').show();
	edit.remove();
}

function appendWhere(queryPrefix,dis) {
	var disElement = '';
	if($(dis).hasClass('or-clause-item')){
		disElement = $(dis);
	}
	else{
		disElement = $(dis).parents('.or-clause-item');
	}
    var query = queries[queryPrefix],
        templateId = ((queryPrefix == 'fs' || queryPrefix == 'fr') ? 'flow-' : '') + 'append-and-clause-template',
        appendAndClauseTemplate = contrail.getTemplate4Id(templateId)({andIndex: query.whereCounter, queryPrefix: queryPrefix}),
        newId = "append-where-clause-" + query.whereCounter++,
        selectedORClauseIndex = parseInt(query.whereViewModel.selectedORClauseIndex());
    
    disElement.find('.' + queryPrefix + '-where-clause').append(appendAndClauseTemplate);
    $('#' + newId).find('.' + queryPrefix + '-delete-new-and-clause').attr("onclick", "deleteAppendedWhere('" + newId + "');");
    $('#' + newId).find('.' + queryPrefix + '-new-and-clause-field').attr("onchange", "updateWhereOptions('" + newId + "', '" + queryPrefix + "','','', true);");
    ko.applyBindings(query.whereViewModel, document.getElementById(newId));
    loadWhereOptions(newId, queryPrefix, '', '');
};

function deleteWhereORTerm(dis){
	$(dis).parents('.or-clause-item').prev('.or-text').remove();
	$(dis).parents('.or-clause-item').remove();
}

function setORClauseTerm(queryPrefix, orClauseItem){
	var orClauseStr = getOrClauseStr(queryPrefix,orClauseItem);
	orClauseItem.find('.or-clause-item-term').empty().append((orClauseStr != '') ? orClauseStr : '...');
}

function collapseAllORClause(){
	$('.or-clause-item').removeClass('open');
	$('.or-clause-icon-caret').addClass('icon-caret-right').removeClass('icon-caret-down');
	$('.or-clause-item-edit').hide();
}

function toggleORClause(queryPrefix,dis){
	var disElement = $(dis).parents('.or-clause-item');
	
	if(disElement.hasClass('open')){
		disElement.find('.or-clause-item-edit').hide();
		disElement.removeClass('open');
		disElement.find('.or-clause-icon-caret').removeClass('icon-caret-down').addClass('icon-caret-right');
	}
	else {
		collapseAllORClause();
		disElement.find('.or-clause-item-edit').show();
		disElement.addClass('open');
		disElement.find('.or-clause-icon-caret').addClass('icon-caret-down').removeClass('icon-caret-right');
		
	}
	if(disElement.find('.or-clause-item-term').is(':visible')){
		setORClauseTerm(queryPrefix, disElement);
	}
}

function updateWhere(queryPrefix, query) {
    var whereClause = query.whereViewModel.whereClauseView(),
        whereClauseStr = "", whereClauseLength;
    whereClauseLength = whereClause.length;
    for (var i = 0; i < whereClauseLength; i += 1) {
        whereClauseStr += (i != 0 ? " OR " : "") + whereClause[i].text;
    }
    $('#' + queryPrefix + '-where').val(whereClauseStr);
    $('#' + queryPrefix + '-where').height($('#' + queryPrefix + '-where')[0].scrollHeight-6);
};

function submitWhere(queryPrefix) {
    var query = queries[queryPrefix];
    var selectedORClauseIndex = query.whereViewModel.selectedORClauseIndex();
    if (selectedORClauseIndex == '-1') {
        addWhere(queryPrefix);
    }
    updateWhere(queryPrefix, query);
};

function getOrClauseStr(queryPrefix,dis) {
	var whereForm = '',
		fieldArray = [], opArray = [], valArray = [], val2Array = [],
		whereClauseViewStr = "", i, length, splitFlowFieldArray = [];
	
	if($(dis).hasClass('or-clause-item')){
		whereForm = $(dis);
	}
	else{
		whereForm = $(dis).parents('.or-clause-item');
	}
    
    whereForm.find("select[name='field[]']").each(function () {
        fieldArray.push($(this).val());
    });
    whereForm.find("select[name='operator[]']").each(function () {
        opArray.push($(this).val());
    });
    whereForm.find("input[name='value[]']").each(function () {
    	if(contrail.checkIfExist($(this).data('contrailCombobox'))){
        	valArray.push($(this).data('contrailCombobox').value());
    	}
    });
    if (queryPrefix == 'fs' || queryPrefix == 'fr') {
        whereForm.find("input[name='value2[]']").each(function () {
            val2Array.push($(this).val());
        });
    }
    length = fieldArray.length;
    for (i = 0; i < length; i += 1) {
    	if(contrail.checkIfExist(fieldArray[i])){
	        if (queryPrefix == 'fs' || queryPrefix == 'fr') {
	            splitFlowFieldArray = fieldArray[i].split('_');
	            whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[0] + " " + opArray[i] + " " + valArray[i]) : "";
	            whereClauseViewStr += (val2Array[i] != '') ? (((whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[1] + " " + opArray[i] + " " + val2Array[i]) : "";
	        } else {
	            whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + fieldArray[i] + " " + opArray[i] + " " + valArray[i]) : "";
	        }
    	}
    }
    return whereClauseViewStr;
};

function addWhere(queryPrefix) {
	var query = queries[queryPrefix];
	query.whereViewModel.whereClauseView([]);
	query.whereViewModel.whereClauseSubmit([]);
	
	var whereClauseArray =  query.whereViewModel.whereClauseView(),
		whereClauseSubmitArray = query.whereViewModel.whereClauseSubmit();
	
	$('#' + queryPrefix + '-or-clauses').find('.or-clause-item').each(function(){
    	if($(this).attr('id') != 'fs-or-clause-item-new-term'){
    		var	fieldArray = [], opArray = [], valArray = [], val2Array = [],
    			whereClauseViewStr = "", i, length, whereForm, splitFlowFieldArray = [],
    			whereClauseSubmit = [];
    	
    		whereForm = $(this);
		    whereForm.find("select[name='field[]']").each(function () {
		        fieldArray.push($(this).val());
		    });
		    whereForm.find("select[name='operator[]']").each(function () {
		        opArray.push($(this).val());
		    });
		    whereForm.find("input[name='value[]']").each(function () {
		        valArray.push($(this).data('contrailCombobox').value());
		    });
		    if (queryPrefix == 'fs' || queryPrefix == 'fr') {
		        whereForm.find("input[name='value2[]']").each(function () {
		            val2Array.push($(this).val());
		        });
		    }
		    length = fieldArray.length;
		    for (i = 0; i < length; i += 1) {
		        if (queryPrefix == 'fs' || queryPrefix == 'fr') {
		            splitFlowFieldArray = fieldArray[i].split('_');
		            whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[0] + " " + opArray[i] + " " + valArray[i]) : "";
		            whereClauseViewStr += (val2Array[i] != '') ? (((whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[1] + " " + opArray[i] + " " + val2Array[i]) : "";
		            whereClauseSubmit.push({field:fieldArray[i], operator:opArray[i], value:valArray[i], value2:val2Array[i] });
		        } else {
		            whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + fieldArray[i] + " " + opArray[i] + " " + valArray[i]) : "";
		            whereClauseSubmit.push({field:fieldArray[i], operator:opArray[i], value:valArray[i]});
		        }
		    }
		    if (whereClauseViewStr != "") {
		        whereClauseArray.push({text: "(" + whereClauseViewStr + ")", whereClauseEdit: whereClauseSubmit});
		        whereClauseSubmitArray.push(whereClauseSubmit);
		    }
    	}
    });
    updateWhere(queryPrefix, query);
};

function loadWhereOptions(element, queryPrefix, value, value2) {
    var fieldName = $('#' + element).find("select[name='field[]']").val();
    
    if (placeHolders[fieldName] != null) {
        $('#' + element).find("input[name='value2[]']").on('focusout', function(){
        	setORClauseTerm(queryPrefix,$('#' + element).parents('.or-clause-item'));
        });
    }
    updateWhereOptions(element, queryPrefix, value, value2);
};

function updateWhereOptions(element, queryPrefix, value, value2, onchangeFlag) {
	var query = queries[queryPrefix],
	    fieldName = $('#' + element).find("select[name='field[]']").val(),
	    valueNode = $('#' + element).find("input[name='value[]']"),
    	fieldData = query.whereViewModel[fieldName], value2Node;

    valueNode.contrailCombobox({
        placeholder:(placeHolders[fieldName] != null ? placeHolders[fieldName][0] : 'Select'),
        dataTextField:"name",
        dataValueField:"value",
        dataSource:{
        	type: 'local',
            data:fieldData != null ? fieldData() : []
        }, 
        change: function(e, ui){
        	setORClauseTerm(queryPrefix,$('#' + element).parents('.or-clause-item'));
        }
    });
    valueNode.data('contrailCombobox').value(value);
    
    if (placeHolders[fieldName] != null) {
        value2Node = $('#' + element).find("input[name='value2[]']");
        value2Node.val(value2);
        value2Node.attr('placeholder', placeHolders[fieldName][1]);
    }
    //if(onchangeFlag == true){
    	setORClauseTerm(queryPrefix,$('#' + element).parents('.or-clause-item'));
    //}
}

/*
 * End - Where Clause Functions
 *
 * Filter Clause Functions
 */

function openFilter(queryPrefix, className) {
    var query = queries[queryPrefix], count,
    	filterClauseSubmit = $.makeArray(query.filterViewModel.filterClauseSubmit()),
        fields = $.makeArray(query.filterViewModel.fields()),
        editFilterClauseTemplate = contrail.getTemplate4Id('edit-filter-clause-template');
        className = className == null ? 'modal-700' : className;
    $.contrailBootstrapModal({
    	id: queryPrefix + '-filter-popup-container',
    	className: className,
        title: 'Filter',
        body: '<div id="' + queryPrefix + '-new-filter"></div>',
        footer: [
                 {
                     id: 'cancelBtn',
                     title: 'Cancel',
                     onclick: 'close'
                 },
                {
                	 className: 'btn-primary',
                     title: 'Apply',
                     onclick: function(){
                    	 submitFilter(queryPrefix);
                    	 $('#' + queryPrefix + '-filter-popup-container').modal('hide');
                     }
                 }
        ],
        onEnter: function(){
        	submitFilter(queryPrefix);
	    	 $('#' + queryPrefix + '-filter-popup-container').modal('hide');
	     }
    });
    
    query.editFilterClauseTemplate = editFilterClauseTemplate;
    $('#' + queryPrefix + '-new-filter').append(editFilterClauseTemplate({queryPrefix: queryPrefix, filterClauseSubmit: filterClauseSubmit, fields: fields}));
    count = filterClauseSubmit.length;
    ko.applyBindings(query.filterViewModel, document.getElementById(queryPrefix + '-filter-popup-container'));
    if (count != 0) {
        for (var i = 0; i < count; i++) {
            loadFilterOptions(queryPrefix + '-filter-clause' + i, queryPrefix);
        }
    } else {
        loadFilterOptions(queryPrefix + '-first-filter-clause', queryPrefix, -1);
    }
    $('#' + queryPrefix + '-filter-accordion').accordion({
    	heightStyle: "content"
    });
};

function submitFilter(queryPrefix) {
    var query = queries[queryPrefix],
        fieldArray = [], opArray = [], valArray = [],
        orderByValue = "", checkedFilters = [],
        sortOrder = null, limit, fieldValue, selectedFields = [],
        filterClauseSubmit = [], filterClauseViewStr = "", i, length, filterForm,
        filterForm = $('#' + queryPrefix + '-filter-popup-form'),
        selectedFields = $('#' + queryPrefix + '-filter-popup-form').serializeArray();
    $.each(selectedFields, function (i, selectedFields) {
        if (selectedFields.name == 'sortBy') {
            fieldValue = selectedFields.value;
            checkedFilters.push(fieldValue);
            orderByValue += (orderByValue.length != 0 ? ", " : "sort_fields: [") + fieldValue;
        }
    });
    if (orderByValue != '') {
        orderByValue += "]";
        sortOrder = $("#" + queryPrefix + "-filter-popup-form select[name=sortOrder]").val();
        orderByValue += ", sort: " + sortOrder;
    }
    limit = $("#" + queryPrefix + "-filter-popup-form input[name=limit]").val();
    if (limit != null && limit.length > 0) {
        orderByValue += (orderByValue.trim() == '' ? '' : ', ') + "limit: " + limit;
    }

    filterForm.find("select[name='field[]']").each(function () {
        fieldArray.push($(this).val());
    });
    filterForm.find("select[name='operator[]']").each(function () {
        opArray.push($(this).val());
    });
    filterForm.find("input[name='value[]']").each(function () {
        valArray.push($(this).data('contrailCombobox').value());
    });
    length = fieldArray.length;
    for (i = 0; i < length; i += 1) {
        if (valArray[i] != '') {
            filterClauseViewStr += ((i != 0 && filterClauseViewStr != '') ? " AND " : "") + fieldArray[i] + " " + opArray[i] + " " + valArray[i];
            filterClauseSubmit.push({field:fieldArray[i], operator:opArray[i], value:valArray[i]});
        }
    }
    query.filterViewModel.checkedFilters(checkedFilters);
    query.filterViewModel.limit(limit);
    query.filterViewModel.sortOrder(sortOrder);
    query.filterViewModel.filterClauseSubmit(filterClauseSubmit);
    query.filterViewModel.filterClauseView(filterClauseViewStr);

    $('#' + queryPrefix + '-filter').val("filter: " + filterClauseViewStr + ', ' + orderByValue);
    $('#' + queryPrefix + '-filter').height($('#' + queryPrefix + '-filter')[0].scrollHeight-6);
};

function appendFilter(queryPrefix) {
    var query = queries[queryPrefix], selectedIndex = -1,
        appendFilterClauseTemplate = contrail.getTemplate4Id('append-filter-clause-template'),
        appendFilterClauseHTML = appendFilterClauseTemplate({queryPrefix: queryPrefix}),
        newId = "append-filter-clause-" + query.filterCounter++;

    $('#' + queryPrefix + '-filter-clause').append(appendFilterClauseHTML);
    $('#' + queryPrefix + '-filter-clause').append($('#' + queryPrefix + '-add-filter-clause'));
    $('#' + queryPrefix + '-appended-filter-clause').attr('id', newId);
    $('#' + newId).find('#' + queryPrefix + '-delete-new-filter-clause').attr("onclick", "deleteAppendedWhere('" + newId + "');");
    $('#' + newId).find('#' + queryPrefix + '-new-filter-clause-field').attr("onchange", "loadFilterOptions('" + newId + "', '" + queryPrefix + "');");
    ko.applyBindings(query.filterViewModel, document.getElementById(newId));
    loadFilterOptions(newId, queryPrefix, selectedIndex);
};

//TODO: Merge with load where options.
function loadFilterOptions(element, queryPrefix, selectedIndex) {
    var query = queries[queryPrefix],
        fieldName = $('#' + element).find("select[name='field[]']").val(),
        valueNode = $('#' + element).find("input[name='value[]']"),
        fieldData = query.filterViewModel[fieldName];
    valueNode.contrailCombobox({
        placeholder:(placeHolders[fieldName] != null ? placeHolders[fieldName][0] : 'Select'),
        dataTextField:"name",
        dataValueField:"value",
        dataSource:{
            type: 'local',
            data:fieldData != null ? fieldData() : []
        }
    });
    valueNode.data('contrailCombobox').value(valueNode.val());
    if (selectedIndex == -1) {
        valueNode.data('contrailCombobox').value('');
    }
};

/*
 * End - Filter Clause Functions
 */

function addSelect(queryPrefix) {
    var query = queries[queryPrefix];
    query.selectWindow.modal('hide');
    var selectedFields = $('#' + queryPrefix + '-select-popup-form').serializeArray(),
        selectValue = "", fieldValue, checkedFields = [];
    $.each(selectedFields, function (i, selectedFields) {
        fieldValue = selectedFields.value;
        checkedFields.push(fieldValue);
        selectValue += (i != 0 ? ", " : "") + fieldValue;
    });
    query.selectViewModel.checkedFields(checkedFields);
    $('#' + queryPrefix + '-select').val(selectValue);
};

function closePopupWindow(queryPrefix, windowName) {
    queries[queryPrefix][windowName].modal('hide');
    queries[queryPrefix][windowName].on('hidden', function(){
        $(this).remove();
    });
};

function setValidValues(url, viewModelKey, viewModels, responseField, addAny) {
    var any = [{"name":"Any", "value":""}];
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var count, validValues, validValueDS = [];
            var validValueObservable = ko.observableArray([]);
            responseField ? (validValues = response[responseField]) : (validValues = response);
            count = validValues ? validValues.length : 0;
            for (var i = 0; i < count; i += 1) {
                validValueDS.push({"name":validValues[i], "value":validValues[i]});
            }
            validValueDS.sort(objValueComparator);
            if(addAny) {
                validValueDS = any.concat(validValueDS);
            }
            validValueObservable(validValueDS);
            for (var j = 0; j < viewModels.length; j += 1) {
                viewModels[j][viewModelKey] =  validValueObservable;
            }
        }
    });
};

function initObjectTypes() {
    var url = "/api/admin/tables", tableType, tableName, tableDisplayName;
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var tables, objectTables = [];
            tables = response;
            for (var i = 0; i < tables.length; i += 1) {
                tableType = tables[i]['type'];
                if(tableType && tableType == 'OBJECT') {
                    tableDisplayName = tables[i]["display_name"];
                    tableName = tables[i]["name"];
                    if(tableDisplayName == null) {
                        tableDisplayName = tableName;
                    }
                    objectTables.push({"name": tableDisplayName, "value": tableName});
                }
            }
            queries.ot.queryViewModel.objectTypes(objectTables);
            if(objectTables.length > 0) {
                setOTValidValues(objectTables[0]['value']);
            }
        }
    });
};

function setValidLevelValues(url, viewModelKey, viewModel) {
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var validValues, validValueDS = [];
            validValues = response;
            for (var i = 0; i < validValues.length; i += 1) {
                for (key in validValues[i]) {
                    validValueDS.push({"name":validValues[i][key], "value":key});
                }
            }
            viewModel[viewModelKey](validValueDS);
            if(viewModel.selectedLevel && validValueDS.length > 0) {
                viewModel.selectedLevel(validValueDS[validValueDS.length - 1].value);
            }
        }
    });
};

function setColumnValues(url, viewModelKey, viewModels, responseField, ignoreValues, isIndexed, addValues) {
    var defaultIgnoreValues = ['Level', 'ObjectId', 'direction_ing'];
    ignoreValues = (ignoreValues != null) ? ignoreValues : defaultIgnoreValues;
    isIndexed = (isIndexed != null) ? isIndexed : true;
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var validValues, validValueDS = [];
            var validValueObservable = ko.observableArray([]);
            responseField ? (validValues = response[responseField]) : (validValues = response);
            for (var i = 0; i < validValues.length; i += 1) {
                if(isIndexed === "all" && ignoreValues.indexOf(validValues[i].name) == -1){
                    validValueDS.push({"name":validValues[i].name, "value":validValues[i].name});
                }
                else if (validValues[i].index == isIndexed && ignoreValues.indexOf(validValues[i].name) == -1) {
                    validValueDS.push({"name":validValues[i].name, "value":validValues[i].name});
                }
            }
            validValueDS = addValues != null ? validValueDS.concat(addValues) : validValueDS;
            validValueObservable(validValueDS);
            for (var j = 0; j < viewModels.length; j += 1) {
                viewModels[j][viewModelKey] =  validValueObservable;
            }
        }
    });
};

function setFromValues(url, viewModelKey, viewModel, queryPrefix) {
    var validValues, validValueDS = [];

    if(queryPrefix != 'acpu'){
        return;
    }
    $.ajax({
        url: url,
        dataType: "json",
        success: function(response) {
            validValues = response;
            for (var i = 0; i < validValues.length; i += 1) {
                if(validValues[i].name.indexOf("cpu_info")!=-1){
                    validValueDS.push({"name":validValues[i].display_name, "value":validValues[i].name});
                    viewModel.fromTables.push({name:validValues[i].display_name, value:validValues[i].name});
                }
            }
        }
    });
};

function setSelectValues(url, viewModelKey, viewModels, responseField, ignoreValues, callback) {
    var defaultIgnoreValues = [];
    ignoreValues = (ignoreValues != null) ? ignoreValues : defaultIgnoreValues;
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var validValues, validValueDS = [];
            var validValueObservable = ko.observableArray([]);
            responseField ? (validValues = response[responseField]) : (validValues = response);
            for (var i = 0; i < validValues.length; i += 1) {
                if (ignoreValues.indexOf(validValues[i].name) == -1) {
                    validValueDS.push({"name":validValues[i].name, "value":validValues[i].name});
                }
            }
            validValueObservable(validValueDS);
            for (var j = 0; j < viewModels.length; j += 1) {
                viewModels[j][viewModelKey] =  validValueObservable;
            }
            callback();
        }
    });
};

function onQueryRequestStart(btnId) {
    disableButton(btnId);
};

function onQueryResult(gridId, message, status, queueId) {
	if (status != null && status == 'queued') {
        message = 'Your query has been queued.';
        createConfirmWindow(queueId);
        $('#' + gridId).data('contrailGrid').showGridMessage(status);
        return false;
    } 
    return true;
};

function showMessagePopup(title, message) {
	$.contrailBootstrapModal({
		id: 'alert-modal',
		title: title,
		body: '<h6>' + message + '</h6>',
		footer: [{
			title: 'Close',
			onclick: 'close'
		}]
   });
};

function createConfirmWindow(queueId) {
	$.contrailBootstrapModal({
		id: queueId + '-confirmation',
		title: 'View Query Queue',
		body: '<h6>Your query has been queued.</h6>',
		footer: [{
			title: 'Cancel',
			onclick: 'close'
		},
		{
			id: queueId + '-confirm',
			title: 'View',
			onclick: function(){
				if(queueId == "lqq") {
		            loadFeature({p:'query_log_queue'});
		        } else if (queueId == "fqq") {
		        	loadFeature({p:'query_flow_queue'});
		        }  else if (queueId == "sqq") {
		        	loadFeature({p:'query_stat_queue'});
		        }
				$('#' + queueId + '-confirmation').modal('hide');
			},
			className: 'btn-primary'
		}]
   });
};

function createDeleteConfirmWindow(queueId,gridCheckedRows) {
	$.contrailBootstrapModal({
		id: queueId + '-del-confirmation',
		title: 'Remove Confirmation',
		body: '<h6>Are you sure you want to clear ' + featureTitle[queueId] + ' query queue?</h6>',
		footer: [{
			title: 'Cancel',
			onclick: 'close'
		},
		{
			id: queueId + '-del-confirm',
			title: 'Confirm',
			onclick: function(){
				var queryIds = [];
				$.each(gridCheckedRows, function(key, val){
					queryIds.push(val.queryId);
				});
				
				var url = '/api/admin/reports/query';
		        var postDataJSON = {queryQueue: queueId, queryIds: queryIds};
		        doAjaxCall(url, "DELETE", JSON.stringify(postDataJSON), "successDelQueryQueueCache", "failureDelQueryQueueCache", null, {gridId: queueId + "-results", queueId: queueId, checkedRows: gridCheckedRows});
		        $('#' + queueId + '-del-confirmation').modal('hide');
                $('#btnDeleteQueryQueue').addClass('disabled-link');
			},
			className: 'btn-primary'
		}]
   });
};

function loadSLResults(options, reqQueryObj, requestType) {
    var url, reqFields, btnId = options['btnId'],
        slColumns;
    url = "/api/admin/reports/query";

    if (options.reqFields != null) {
        reqFields = options.reqFields;
        slColumns = $.grep(slColumnsDisplay, function (obj, idx) {
            if ($.inArray(obj['field'], reqFields) > -1)
                return true;
            else
                return false;
        });
    } else {
        slColumns = slColumnsDisplay;
    }

    var customGridConfig = {
        header: {
            title:{
                text: 'Query Results',
                cssClass: 'blue',
                icon: 'icon-list',
                iconCssClass: 'blue'
            },
            defaultControls: {
				searchable: false
            }
        },
        columnHeader: {
            columns: slColumns
        },
        body: {
            options: {
                sortable: true,
                forceFitColumns: true
            },
            dataSource: {
                remote: {
                    ajaxConfig: {
                        url: url,
                        timeout: options.timeOut,
                        type: requestType,
                        data: reqQueryObj
                    },
                    serverSidePagination: true,
                    exportFunction: exportServersideQueryResults
                },
                events: {
                	onRequestStartCB: function() {
                        onQueryRequestStart(btnId);
                    },
                    onRequestErrorCB: function() {
                    	enableButton(btnId);
                    },
                    onRequestSuccessCB: function(response) {
                    	enableButton(btnId);
                    	return onQueryResult(options.elementId, "No System Logs found for the given duration.", response['status'], 'lqq');
                    	
                    }
                }
            },
            statusMessages: {
            	queued: {
            		type: 'status',
            		iconClasses: '',
            		text: 'Your query has been queued.'
            	}
            }
        },
        footer: {
            pager: {
                type: 'server',
                options: {
					pageSize:50
				}

            }
        }
    };
    $("#" + options.elementId).contrailGrid(customGridConfig);
};

function formatXML2JSON(xmlString) {
    if (xmlString && xmlString != '') {
        var xmlDoc = filterXML(xmlString, true);
        return convertXML2JSON(serializer.serializeToString(xmlDoc));
    } else {
        return '';
    }
};

function formatXML2JSONString(xmlString, prettify) {
    if (xmlString && xmlString != '') {
        var xmlDoc = filterXML(xmlString);
        return convertXML2JSONString(serializer.serializeToString(xmlDoc), prettify);
    } else {
        return '';
    }
};

function filterXML(xmlString, is4SystemLogs) {
    var xmlDoc = parseXML(xmlString);
    $(xmlDoc).find("[type='struct']").each(function () {
        formatStruct(this);
    });
    $(xmlDoc).find("[type='sandesh']").each(function () {
        formatSandesh(this, is4SystemLogs);
    });
    $(xmlDoc).find("[type]").each(function () {
        removeAttributes(this, ['type', 'size', 'identifier', 'aggtype', 'key']);
    });
    $(xmlDoc).find("data").each(function () {
        $(this).children().unwrap();
    });
    return xmlDoc;
}

function formatStruct(xmlNode) {
    $(xmlNode).find("list").each(function () {
        $(this).children().unwrap();
    });
    //$(xmlNode).children().unwrap();
};

function formatSandesh(xmlNode, is4SystemLogs) {
    var messageString = '', nodeCount, i;
    $(xmlNode).find("file").each(function () {
        $(this).remove();
    });
    $(xmlNode).find("line").each(function () {
        $(this).remove();
    });
    if(is4SystemLogs != null && is4SystemLogs) {
        nodeCount = $(xmlNode).find("[identifier]").length;
        for (i = 1; i < (nodeCount + 1); i++) {
            $(xmlNode).find("[identifier='" + i + "']").each(function () {
                messageString += $(this).text() + ' ';
                $(this).remove();
            });
        }
        if (messageString != '') {
            $(xmlNode).text(messageString);
        }
        removeAttributes(xmlNode, ['type']);
    }
};

function removeAttributes(xmlNode, attrArray) {
    for (var i = 0; i < attrArray.length; i++) {
        xmlNode.removeAttribute(attrArray[i]);
    }
};

function convertXML2JSON(xmlString) {
    return $.xml2json(xmlString);
};

function convertXML2JSONString(xmlString, prettify) {
    var jsonObj = convertXML2JSON(xmlString),
        jsonString;
    if(prettify == null || prettify) {
    	return "<pre>" + syntaxHighlight(jsonObj) + "</pre>";
    } else {
        jsonString = JSON.stringify(jsonObj, null, 1);
        return jsonString;
    }
};

function getOTJSON(columns, rows, reqQueryString, options, selectedFields) {
    var columnArray = [], btnId = options.btnId,
        count, xmlString, xmlDoc, filteredJSON, logName = null;
    loadOTGrid(options, [], loadingOTGridColumns);
    $("#" + options.elementId).data('contrailGrid').showGridMessage('loading');
    $.ajax({
        type:"GET",
        url:"/api/admin/reports/query?" + reqQueryString,
        timeout:options.timeOut,
        success:function (responseJSON) {
            var data = responseJSON['data'];
            count = data.length;
            for (var i = 0; i < count; i++) {
                rows[i] = {};
                rows[i]['MessageTS'] = data[i]['MessageTS'];
                rows[i]['ModuleId'] = data[i]['ModuleId'];
                rows[i]['Source'] = data[i]['Source'];
                for (var j = 0; j < selectedFields.length; j++) {
                    xmlString = data[i][selectedFields[j]];
                    if (xmlString && xmlString != '') {
                        xmlDoc = filterXML(xmlString);
                        filteredJSON = $.xml2json(serializer.serializeToString(xmlDoc));
                        if (selectedFields[j] == 'ObjectLog') {
                            for (logName in filteredJSON) {
                                if (filteredJSON.hasOwnProperty(logName) && typeof(logName) !== 'function') {
                                    createOTColumns(filteredJSON, rows[i], columnArray, columns, null, logName);
                                }
                            }
                        } else if(selectedFields[j] == 'SystemLog') {
                            rows[i]['SystemLog'] = xmlString;
                        }
                    }
                }
            }
            if (rows.length == 0) {
            	$("#" + options.elementId).data('contrailGrid').showGridMessage('No Object Logs found for the given duration');
            } else {
                loadOTGrid(options, rows, columns);
            }
            enableButton(btnId);
        },
        error:function (xhr) {
        	$("#" + options.elementId).data('contrailGrid').showGridMessage('error', xhr.statusText);
            enableButton(btnId);
        }
    });
};

function createOTColumns(json, row, columnArray, columns, columnPrefix, selectedFieldName) {
    var element = jsonPath(json, "$.*"),
        fieldName = null, newColumnName, elementValue, elementValueStr;
    for (fieldName in element[0]) {
        newColumnName = columnPrefix ? (columnPrefix + "_" + fieldName) : fieldName;
        elementValue = element[0][fieldName];
        if (typeof elementValue === 'object' && elementValue.text == undefined) {
        	elementValueStr = elementValue;
            push2OTColumns(columnArray, newColumnName, columns, selectedFieldName, false);
            row[newColumnName] = elementValueStr;
            /*
             if (fieldName.indexOf('list') == -1 && elementValueStr.indexOf('{') != -1) {
             createOTColumns(elementValue, row, columnArray, columns, newColumnName, selectedFieldName);
            } else {
                push2OTColumns(columnArray, newColumnName, columns, selectedFieldName, false);
                row[newColumnName] = elementValueStr;
            }
             */
        } else {
            push2OTColumns(columnArray, newColumnName, columns, selectedFieldName, true);
            row[newColumnName] = elementValue;
        }
    }
};

function push2OTColumns(columnArray, newColumnName, columns, selectedFieldName, groupable) {
    var fieldTitleTemplate = selectedFieldName + ' [' + newColumnName + ']';
    if (columnArray.indexOf(newColumnName) == -1) {
        columnArray.push(newColumnName);
        if (groupable) {
            columns.push({
            	id:newColumnName,
            	field:newColumnName,
            	name: fieldTitleTemplate,
            	width:300,
            	sortable: false
            });
        } else {
            columns.push({
            	id:newColumnName,
            	field:newColumnName,
            	name: fieldTitleTemplate,
            	width:300,
            	formatter: function(r, c, v, cd, dc) {
        			var returnString = '';
            		if(typeof dc[newColumnName] !== "undefined") {
            			returnString = contrail.formatJSON2HTML(dc[newColumnName],2); 
        			}
            		return returnString;
            	},
            	sortable: false,
            	events: {
        			onClick: function(e,dc){
        				var rowIndex = $(e.target).parents('.slick-row-master').data('id');
        				setTimeout(function(){
        					$('#ot-results').data('contrailGrid').adjustRowHeight(rowIndex);
        				},500);
        			}
            	}
            });
        }
    }
};

function loadOTResults(options, reqQueryString, selectedFields) {
    var rows = [],
        columns = [
            {
            	id: "MessageTS",
            	field: "MessageTS",
                name: "Time",
                width:210,
                formatter: function(r, c, v, cd, dc) {
                	return (dc.MessageTS && dc.MessageTS != '')  ? (formatMicroDate(dc.MessageTS)) : '';
                },
                filterable:false,
                groupable:false
            },
            {
            	id:"Source",
            	field:"Source",
                name:"Source",
                width:150,
                formatter: function(r, c, v, cd, dc) {
                	return handleNull4Grid(dc.Source);
                },
                searchable: true
            },
            {
            	id: "ModuleId",
            	field: "ModuleId",
                name: "Module Id",
                width: 150,
                formatter: function(r, c, v, cd, dc) {
                	return handleNull4Grid(dc.ModuleId);
                },
                searchable:true
            }
        ];
    if(selectedFields.indexOf("SystemLog") != -1) {
        columns.push({
        	id:"SystemLog", 
        	field:"SystemLog", 
        	name:"System Log", 
        	width:300,
        	formatter: function(r, c, v, cd, dc) {
        		return formatXML2JSON(dc.SystemLog);
        	}, 
        	searchable:true
        });
    }
    disableButton(options.btnId);
    getOTJSON(columns, rows, reqQueryString, options, selectedFields);
};

function toggleExpandCollapseAll(id,dis){
	var iconClass = 'expander',
		actualClass = $(dis).find('i').attr('class');
	
	if($(dis).find('i').hasClass('icon-collapse-alt')){
		iconClass = 'collapser';
	}
	
	$(dis).find('i').attr('class','icon-spin icon-spinner');
	$('#' + id).find('.pre-format-JSON2HTML').find('i.node-0').each(function(){
		if($(this).hasClass(iconClass)){
			$(this).click();
		}
	});
	$('#' + id).data('contrailGrid').adjustAllRowHeight();
	setTimeout(function(){
		$(dis).find('i').attr('class',actualClass);
		$(dis).find('i').toggleClass('icon-expand-alt').toggleClass('icon-collapse-alt');
		if($(dis).find('i').hasClass('icon-expand-alt')){
			$(dis).attr('title','Expand All');
		}
		else{
			$(dis).attr('title','Collapse All');
		}
	},500);
}

function loadOTGrid(options, rows, columns) {
	var otGridConfig= {
    	header: {
    		title:{
				text: 'Query Results',
				cssClass: 'blue',
				icon: 'icon-tasks',
				iconCssClass: 'blue'
			},
    		customControls: ['<a onclick=toggleExpandCollapseAll("' + options.elementId + '",this); title="Collapse all"><i class="icon-collapse-alt icon-large"></i></a>']
    	},
    	columnHeader: {
    		columns: columns
    	},
    	body: {
    		options: {
    			forceFitColumns: false
    		},
    		dataSource:{
    	        data: rows,
    	    },
            statusMessages: {
            	queued: {
            		type: 'status',
            		iconClasses: '',
            		text: 'Your query has been queued.'
            	}
            }
    	},
    	footer: {
			pager: {
				options: {
					pageSize: options.pageSize,
					pageSizeSelect: [10,50,100]
				}
			}
        }
	};
	
	$('#ot-results').find('.grid-widget-header').find('.icon-expand-alt').removeClass('icon-expand-alt').addClass('icon-collapse-alt').parent().attr('title','Expand All');

    if(options.gridHeight != null){
    	otGridConfig.body.options.gridHeight = options.gridHeight;
    	otGridConfig.body.options.autoHeight = false;
    }

    $("#" + options.elementId).show().contrailGrid(otGridConfig);
};

function loadXMLDoc(dname) {
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", dname, false);
    xhttp.send("");
    return xhttp.responseXML;
};

function parseXML(xmlString) {
    if (window.DOMParser) {
        xmlDoc = domParser.parseFromString(xmlString, "text/xml");
    } else { // Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString);
    }
    return xmlDoc;
};

function loadFlowResults(options, reqQueryObj, columnDisplay, fcGridDisplay) {
	var grid = $('#' + options.elementId).data('contrailGrid'),
		url = "/api/admin/reports/query",
		btnId = options.btnId;
	
	var gridConfig = {
		header: {
			title:{
				text: 'Query Results',
				cssClass: 'blue',
				icon: 'icon-tasks',
				iconCssClass: 'blue'
			},
            defaultControls: {
				searchable: false
            }
		},
		columnHeader : {
			columns : columnDisplay
		},
		body : {
			options: {
				sortable: true,
				forceFitColumns: true
			},
			dataSource : {
				remote: {
                    ajaxConfig: {
                        url: url,
                        timeout: options.timeOut,
                        type: "POST",
                        data: reqQueryObj
                    },
                    serverSidePagination: true,
                    exportFunction: exportServersideQueryResults
                },
				events : {
					onRequestStartCB : function() {
						onQueryRequestStart(btnId);
					},
					onRequestErrorCB : function() {
						enableButton(btnId);
	//					endChartLoading(false, 'fs');
					},
					onRequestSuccessCB : function(response) {
						var status = response['status'];
						if (status == 'queued') {
							options.showChartToggle = false;
						}
						enableButton(btnId);
						return onQueryResult(options.elementId,"No flows found for the given duration.",status, 'fqq');
						
					},
					onDataBoundCB : function() {
						if (options.refreshChart != null && options.refreshChart) {
							if (options.showChartToggle) {
								queries.fs.chartViewModel.options(options);
								plotFSChart(options,columnDisplay,fcGridDisplay);
								
							    var grid = $("#fs-flow-classes").data("contrailGrid");
							    if(grid != null){
							        grid.refreshView();
							    }
							} else if (options.showChartToggle != null) {
						//		endChartLoading(false, 'fs');
							}
							options.refreshChart = false;
						}
					}
				}
			},
			statusMessages: {
            	queued: {
            		type: 'status',
            		iconClasses: '',
            		text: 'Your query has been queued.'
            	}
            }
		},
		footer : {
			pager : {
				options : {
					pageSize : 50
				}
			}
		}
	};
	
	if(options.queryPrefix == 'fs'){
		if (grid) {
			$('#ts-chart').empty();
		}
		
		gridConfig.header.customControls = ['<a title="View Results as Grid" id="fs-results-link" class="margin-0-5 selected" onclick="toggleToGrid();"><i class="icon-table"></i></a> \
		                      <a title="View Results as Chart" id="fs-chart-link" class="margin-0-5 disabled-link" onclick="toggleToChart();"><i class="icon-bar-chart"></i></a>'];
	}
	else if(options.queryPrefix == 'fr'){
		gridConfig.body.options = {
			actionCell: [
				{
					title: 'Start Packet Capture',
					iconClass: 'icon-edit',
					onClick: function(rowIndex){
						startPacketCapture4Flow(options.elementId, rowIndex, 'parseAnalyzerRuleParams4FlowRecord');
					}
				}
			]
		};
	}
	
	$("#" + options.elementId).contrailGrid(gridConfig);
	
	$('#fs-results').find('a[data-action="collapse"]').on('click', function(){
		if($(this).find('i.collapse-icon').hasClass('icon-chevron-up')){
			if($('#fs-results-link').hasClass('selected')){
				toggleToGrid();
			}
			else if($('#fs-chart-link').hasClass('selected')){
				toggleToChart();
			}
		}
		else if($(this).find('i.collapse-icon').hasClass('icon-chevron-down')){
			$('#fs-chart').hide();
		}
	});
};

function loadStatResults(options, reqQueryObj, columnDisplay) {
	var url = '/api/admin/reports/query',
        btnId = options.btnId;
    
    $("#" + options.elementId).contrailGrid({
    	header: {
			title:{
				text: 'Query Results',
				cssClass: 'blue',
				icon: 'icon-tasks',
				iconCssClass: 'blue'
			},
            defaultControls: {
				searchable: false
            }
		},
		columnHeader: {
			columns: columnDisplay
		},
        body: {
        	options: {
        		sortable: true
        	},
            dataSource: {
                remote: {
                    ajaxConfig: {
                        url: url,
                        timeout: options.timeOut,
                        type: 'POST',
                        data: reqQueryObj
                    },
                    serverSidePagination: true,
                    exportFunction: exportServersideQueryResults
                },
                events: {
                	onRequestStartCB: function() {
                        onQueryRequestStart(btnId);
                    },
                    onRequestErrorCB: function() {
                    	enableButton(btnId);
                    },
                    onRequestSuccessCB: function(response) {
                    	enableButton(btnId);
                    	return onQueryResult(options.elementId, "No Stat Results found for the given duration.", response['status'], 'sqq');
                    }
                }
            },
            statusMessages: {
            	queued: {
            		type: 'status',
            		iconClasses: '',
            		text: 'Your query has been queued.'
            	}
            }
        },
        footer: {
            pager: {
                options: {
					pageSize:50
				}

            }
        }
    });
};

function loadQueryQueue(options) {
    var url = "/api/admin/reports/query/queue?queryQueue=" + options.queueType,
		gridTitle = {
			'fqq' : 'Flow',
			'lqq' : 'Log',
			'sqq' : 'Stats'
		};
	
	$("#" + options.elementId).contrailGrid({
    		header: {
    			title:{
    				text: gridTitle[options.queueType] + ' Query Queue',
    				cssClass: 'blue',
    				icon: 'icon-list',
    				iconCssClass: 'blue'
    			},
    			customControls: ['<a id="btnDeleteQueryQueue" onclick=deleteQueryCache4Queue("' + options.queueType + '"); title="Delete All Query Queue" class="disabled-link"><i class="icon-trash"></i></a>'],
    			defaultControls: {
    				refreshable: true
    			}
    		},
    		columnHeader: {
    			columns: getQueueColumnDisplay(options.elementId)
    		},
    		body: {
    			options: {
    				autoRefresh: 60,
    				forceFitColumns: true,
    				checkboxSelectable: {
    					onNothingChecked: function(e){
    						$('#btnDeleteQueryQueue').addClass('disabled-link');
    					},
    					onSomethingChecked: function(e){
    						$('#btnDeleteQueryQueue').removeClass('disabled-link');
    					}
    				},
    				actionCell: function(dc){
    					return getQueueActionColumn(options.elementId, dc);
    				},
                    detail: {
                        template: '<pre>{{{displayJson queryJSON}}}</pre>'
                    }
    			},
                dataSource: {
                    remote: {
                        ajaxConfig: {
                            url: url
                        },
                        serverSidePagination: false
                    }
    			}
    		},
    		footer: {
    			pager: {
    				options: {
    					pageSize:10,
    					pageSizeSelect: [10,50,100]
    				}
    			}
            }
    });
};

function getFSColumnDisplay4Grid(columnDisplay, selectArray) {
    var newColumnDisplay = [];
    
    $.each(columnDisplay, function(key, val){
    	if (selectArray.indexOf(val.select) != -1) {
    		newColumnDisplay.push(val.display);
    	}
    });

    return newColumnDisplay;
};

function getColumnDisplay4Grid(columnDisplay, selectArray, showActions) {
    var newColumnDisplay = [],
        displayLength = columnDisplay.length,
        displayArray = [], i, j = 0, k, actionsDisplay = null;
    for (i = 0; i < displayLength; i++) {
        displayArray.push(columnDisplay[i].select);
        if (selectArray.indexOf(columnDisplay[i].select) != -1) {
            newColumnDisplay[j++] = columnDisplay[i].display;
        } else if(columnDisplay[i].select == 'actions') {
            actionsDisplay = columnDisplay[i].display;
        }
    }

    for (k = 0; k < selectArray.length; k++) {
        if(displayArray.indexOf(selectArray[k]) == -1) {
            newColumnDisplay[j++] = {id:selectArray[k], name:'["' +  selectArray[k] + '"]', field:selectArray[k], width: 200, groupable:false};
        }
    }
    if(showActions != null && showActions && actionsDisplay != null) {
        newColumnDisplay[j++] = actionsDisplay;
    }
    return newColumnDisplay;
};

function getSchemaModel4Grid(schemaModel, selectArray) {
    var newSchemaModel = {},
        length = schemaModel.length,
        i;
    for (i = 0; i < length; i++) {
        if (selectArray.indexOf(schemaModel[i].select) != -1) {
            newSchemaModel[schemaModel[i].model.field] = {type:schemaModel[i].model.type};
        }
    }
    return newSchemaModel;
};

function parseStringToArray(parseString, delimiter) {
    var resultArray = parseString.split(delimiter),
        resultLength = resultArray.length,
        i;
    for (i = 0; i < resultLength; i++) {
        resultArray[i] = resultArray[i].trim();
    }
    return resultArray;
};

function addFieldName2Header(fieldName, headerLine, headerArray) {
    if (headerArray.indexOf(fieldName) == -1) {
        headerArray.push(fieldName);
        headerLine += '"' + fieldName + '",';
    }
    return headerLine;
}

function formatJSON4CSV(jsonString) {
    jsonString = jsonString.replace(/"/g, '');
    return jsonString;
};

function selectTimeRange(element, queryPrefix) {
    var idx = element.selectedIndex,
        val = element.options[idx].value;
    if (val == 0) {
        queries[queryPrefix].queryViewModel.isCustomTRVisible(true);
    } else {
        queries[queryPrefix].queryViewModel.isCustomTRVisible(false);
    }
    if (queryPrefix == 'fs' || queryPrefix == 'acpu' || queryPrefix == 'qeperf' || queryPrefix == 'vna') {
        resetTGValues(val == 0, queryPrefix);
    }
    if (queryPrefix == 'ot') {
        loadOTSources();
    }
};

function setUTCTime(queryPrefix, reqQueryString, options, timeRange) {
    timeRange = timeRange == null ? getTimeRange(queryPrefix): timeRange;
    if (options != null) {
        options.fromTime = timeRange.fromTimeUTC;
        options.toTime = timeRange.toTimeUTC;
    }
    reqQueryString += '&fromTimeUTC=' + timeRange.fromTime;
    reqQueryString += '&toTimeUTC=' + timeRange.toTime;
    reqQueryString += '&reRunTimeRange=' + timeRange.reRunTimeRange;
    return reqQueryString;
};

function setUTCTimeObj(queryPrefix, reqObject, options, timeRange) {
    timeRange = timeRange == null ? getTimeRange(queryPrefix): timeRange;
    if (options != null) {
        options.fromTime = timeRange.fromTimeUTC;
        options.toTime = timeRange.toTimeUTC;
    }
    reqObject['fromTimeUTC'] = timeRange.fromTime;
    reqObject['toTimeUTC'] = timeRange.toTime;
    reqObject['reRunTimeRange'] = timeRange.reRunTimeRange;
    return reqObject;
};

function getTimeRange(queryPrefix) {
    var selectId = '#' + queryPrefix + '-query-form',
        timeRange = $(selectId + " select[name='timeRange']").val(),
        fromDate, toDate, fromTimeUTC, toTimeUTC, fromTime, toTime, now;
    if (timeRange != 0) {
        now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        toTimeUTC = now.getTime();
        fromTimeUTC = toTimeUTC - (timeRange * 1000);
        if(queryPrefix !== 'fs') {
            toTime = "now";
            fromTime = "now-" + timeRange + "s";
        } else {
            toTime = toTimeUTC;
            fromTime = fromTimeUTC;
        }
    } else {
        fromDate = $(selectId + " input[name='fromTime']").val();
        fromTimeUTC = new Date(fromDate).getTime();
        fromTime = fromTimeUTC;
        toDate = $(selectId + " input[name='toTime']").val();
        toTimeUTC = new Date(toDate).getTime();
        toTime = toTimeUTC;
    }
    return {fromTime: fromTime, toTime: toTime, fromTimeUTC:fromTimeUTC, toTimeUTC:toTimeUTC, reRunTimeRange: timeRange};
};

function toggleToGrid() {
	$('#fs-results-link').find('i').addClass('icon-spin icon-spinner').removeClass('icon-table');
    
	$('#fs-chart-link').removeClass('selected');
    $('#fs-results-link').addClass('selected');
    
	$('#fs-chart').hide();
    $('#fs-results').find('.grid-body').show();
    $('#fs-results').find('.grid-footer').show();
    $('#fs-results').find('.grid-load-status').show();
    setTimeout(function(){
    	$('#fs-results-link').find('i').removeClass('icon-spin icon-spinner').addClass('icon-table');
    },500);
};

function toggleToChart() {
	if(!$('#fs-chart-link').hasClass('disabled-link')){
		$('#fs-chart-link').find('i').addClass('icon-spin icon-spinner').removeClass('icon-bar-chart');
		
		$('#fs-results-link').removeClass('selected');
	    $('#fs-chart-link').addClass('selected');
	    
		$('#fs-results').find('.grid-body').hide('fast');
	    $('#fs-results').find('.grid-footer').hide('fast');
	    $('#fs-results').find('.grid-load-status').hide('fast');
		
	    $('#fs-chart').show(function(){
	    	var grid = $("#fs-flow-classes").data("contrailGrid");
		    if(grid != null){
		    	$("#fs-flow-classes").show();
		        grid.refreshView();
		    }
	    	var isFCLoaded = queries.fs.chartViewModel.isFCLoaded();
		    if(!isFCLoaded) {
		    	createFSChart("#ts-chart", queries.fs.chart);
		    	queries.fs.chartViewModel.isFCLoaded(true);
	    	}
		    
		    $('#fs-chart-link').find('i').removeClass('icon-spin icon-spinner').addClass('icon-bar-chart');
		    $('#fs-chart').find('.chart-load-status').hide();
	    });
	}
};

function getPlotFields(columnDisplay) {
    var plotFields = [],
        statFields = ['sum_bytes', 'avg_bytes', 'sum_packets', 'avg_packets'];
    for (var j = 0; j < columnDisplay.length; j++) {
        if (statFields.indexOf(columnDisplay[j].field) != -1) {
            plotFields.push(columnDisplay[j].field);
        }
    }
    return plotFields;
};

//function initFSChartLoading() {
//    queries.fs.chartViewModel.isFCVisible(false);
//};
//
//function endChartLoading(isFCVisible, queryPrefix) {
//    queries[queryPrefix].chartViewModel.isFCVisible(isFCVisible);
//};

function initFSChart(columnDisplay, data, flowClassArray, fcGridDisplay) {
    var plotFields = getPlotFields(columnDisplay),
        validFCId = findFirstValidFCId(flowClassArray);
    queries.fs.chartViewModel.flowClasses(flowClassArray);
    queries.fs.chartViewModel.plotFields(plotFields);
    queries.fs.chartViewModel.selectedFlows([{flowClassId: validFCId, sumBytes: null, sumPackets: null}]);
    queries.fs.chart = null;
    $('#fs-chart-link').removeClass('disabled-link');
//    createFSChart("#ts-chart", queries.fs.chart);
    initFlowclassGrid("#fs-flow-classes", flowClassArray, fcGridDisplay);
};

function setGroupName(group, series) {
    return "";
};

function findFirstValidFCId(flowClassArray) {
    for(var i = 0; i < flowClassArray.length; i++) {
        if(flowClassArray[i]['sourcevn'] != "__UNKNOWN__" && flowClassArray[i]['destvn'] != "__UNKNOWN__") {
            return flowClassArray[i]['flow_class_id'];
        }
    }
    if(flowClassArray.length > 0) {
        return flowClassArray[0]['flow_class_id'];
    } else {
        return null;
    }
}

function initFlowclassGrid(elementId, flowClassArray, columnDisplay) {
    var display = [
            {
                id: 'fc-checkbox',
            	field:"", 
            	name:"", 
            	resizable: false,
                width:30, 
                minWidth: 30,
                formatter: function(r, c, v, cd, dc){ 
                	return '<input id="fc-checkbox-' + dc.flow_class_id +'" type="checkbox" onchange="loadSelectedFSChart(this)" value="' + dc.flow_class_id +'" class="ace-input"/><span class="ace-lbl"></span>';
                },
                sortable: false,
                searchable: false,
                exportConfig: {
                    allow: false
                }
            },
            {
            	id: 'fc-label',
                field:"", 
                name:"", 
                resizable: false,
                sortable: false,
                width: 90,
                minWidth: 90,
                searchable: false,
                exportConfig: {
                    allow: false
                },
                formatter: function(r, c, v, cd, dc){ 
                	return '<span id="label-sum-bytes-'+ dc.flow_class_id + '" class="hide">Sum Bytes</span> <span id="label-sum-packets-' + dc.flow_class_id + '" class="hide">Sum Packets</span>';
                }
            }
        ];
    
    columnDisplay = display.concat(columnDisplay);

    $(elementId).contrailGrid({
    	header: false,
    	columnHeader: {
			columns: columnDisplay
    	},
    	body: {
    		dataSource:{
                data: flowClassArray,
                events: {
                	onDataBoundCB: function() {
                		var selectedFlows = queries['fs']['chartViewModel'].selectedFlows(),
	                        count = selectedFlows.length, flowClassId;
	                    for (var i = 0; i < count; i++) {
	                        flowClassId = selectedFlows[i]['flowClassId'];
	                        $('#fc-checkbox-' + flowClassId).prop('checked', true);
	                        assignColors2FlowClass(selectedFlows[i]);
	                    }
                	}
                }
            }
    	},
    	footer: {
			pager: {
				options: {
					pageSize: 100,
					pageSizeSelect: [100,500,1000]
				}
			}
        }
    });
};

function assignColors2FlowClass(selectedFlow) {
    var flowClassId = selectedFlow['flowClassId'];
    if (selectedFlow["sumBytes"] != null) {
        $('#label-sum-bytes-' + flowClassId).show();
        $('#label-sum-bytes-' + flowClassId).removeAttr("class");
        $('#label-sum-bytes-' + flowClassId).addClass("badge " + selectedFlow["sumBytes"]);
    } else if (selectedFlow["sumPackets"] != null) {
        $('#label-sum-bytes-' + flowClassId).hide();
        $('#label-sum-packets-' + flowClassId).show();
        $('#label-sum-packets-' + flowClassId).removeAttr("class");
        $('#label-sum-packets-' + flowClassId).addClass("badge " + selectedFlow["sumPackets"]);
    } else {
        $('#label-sum-bytes-' + flowClassId).hide();
        $('#label-sum-packets-' + flowClassId).hide();
    }
};

function plotFSChart(options, columnDisplay, fcGridDisplay) {
    var query = queries[options.queryPrefix],
        queryId = options.queryId,
        chartUrl = '/api/admin/reports/query/chart-data?queryId=' + queryId,
        flowUrl = '/api/admin/reports/query/flow-classes?queryId=' + queryId,
        flowClasses = null, chartDataReq, flowClassesReq;
    chartDataReq = $.ajax({
        type:"GET",
        url:chartUrl,
        timeout:options.timeOut,
        dataType:"json",
        success:function (resultData) {
            query['chartData'] = resultData;
        },
        error:function (xhr) {
 //           endChartLoading(false, 'fs');
            $('#ts-chart').html($('#no-data').html());
        }
    });
    flowClassesReq = $.ajax({
        type:"GET",
        url:flowUrl,
        timeout:options.timeOut,
        dataType:"json",
        success:function (resultData) {
            flowClasses = resultData;
        },
        error:function (xhr) {
            //endChartLoading(false, 'fs');
            $('#ts-chart').html($('#no-data').html());
        }
    });
    $.when(chartDataReq, flowClassesReq).done(function () {
        initFSChart(columnDisplay, query['chartData'], flowClasses, fcGridDisplay);
    });
};

function createFSChart(selector, chart) {
    var seriesValues = queries.fs.chartViewModel.seriesValues(),
        plotFields = queries.fs.chartViewModel.plotFields(),
        options = queries.fs.chartViewModel.options(),
        selectedFlows = queries.fs.chartViewModel.selectedFlows(),
        fsChartData = queries['fs']['chartData'],
        plotData = null, selectedFlow, flowClassId, color;

    if (isEmptyObject(fsChartData) || fsChartData == null) {
 //       endChartLoading(false, 'fs');
        $('#ts-chart').html($('#no-data').html());
        return;
    }

    for (var i = 0; i < selectedFlows.length; i++) {
        selectedFlow = selectedFlows[i];
        flowClassId = selectedFlow['flowClassId'];
        color = d3_category5[i];
        if (plotFields.indexOf("sum_bytes") != -1) {
            selectedFlow["sumBytes"] = "badge-color-" + i;
        } else if (plotFields.indexOf("sum_packets") != -1) {
            selectedFlow["sumPackets"] = "badge-color-" + i;
        }
        assignColors2FlowClass(selectedFlow);
        if (i == 0) {
            plotData = addMissingPoints(fsChartData[flowClassId], options, plotFields, color, i + 1);
        } else {
            plotData = plotData.concat(addMissingPoints(fsChartData[flowClassId], options, plotFields, color, i + 1));
        }
    }
    options['height'] = 300;
    options['yAxisLabel'] = '';
    options['y2AxisLabel'] = '';
 //   endChartLoading(true, 'fs');
    if(plotFields.indexOf('sum_bytes') != -1) {
        initTrafficTSChart(selector, plotData, options, chart, "formatSumBytes", "formatSumBytes");
    } else {
        initTrafficTSChart(selector, plotData, options, chart, "formatSumPackets", "formatSumPackets");
    }
};

function addMissingPoints(tsData, options, plotFields, color, counter) {
    var fromTime = options.fromTime,
        toTime = options.toTime,
        interval = options.interval * 1000,
        plotData = [], addPoint, flowClassId = null,
        sumBytes = [], sumPackets = [];
    for (key in tsData) {
        if (tsData[key]['flow_class_id'] != null) {
            flowClassId = tsData[key]['flow_class_id'];
            break;
        }
    }
    for (var i = fromTime + interval; i <= toTime; i += interval) {
        for (var k = 0; k < plotFields.length; k++) {
            addPoint = {'x':i, 'flow_class_id':flowClassId};
            if (tsData[i.toString()] != null) {
                addPoint['y'] = tsData[i.toString()][plotFields[k]];
            } else {
                addPoint['y'] = 0;
            }
            if(plotFields[k] == 'sum_bytes') {
                sumBytes.push(addPoint);
            } else if (plotFields[k] == 'sum_packets') {
                sumPackets.push(addPoint);
            }
        }
    }
    if(sumBytes.length > 0) {
        plotData.push({'key': "#" + counter + ': Sum Bytes', color: color, values: sumBytes});
    } else if(sumPackets.length > 0) {
        plotData.push({'key': "#" + counter + ': Sum Packets', color: color, values: sumPackets});
    }
    return plotData;
};

function formatLegendLabel(text, series) {
    if (text == 'sum_bytes') {
        text = 'SUM(Bytes)';
    } else if (text == 'sum_packets') {
        text = 'SUM(Packets)';
    } else {
        text = text.replace('sum_bytes', 'SUM(Bytes)');
        text = text.replace('sum_packets', 'SUM(Packets)');
    }
    return text;
};

function getValueAxis(plotFields) {
    var valueAxes = [];
    if (plotFields.indexOf('sum_bytes') != -1 || plotFields.indexOf('avg_bytes') != -1 || plotFields.indexOf('bytes') != -1) {
        valueAxes.push({
            name:"bytes", labels:{template:"# return formatBytes4FSChart(value); #", step: 5 }, majorGridLines:{ visible:true }, line:{ visible:true }, title:{text:"Bytes"}
        });
    }
    if (plotFields.indexOf('sum_packets') != -1 || plotFields.indexOf('avg_packets') != -1 || plotFields.indexOf('packets') != -1) {
        valueAxes.push({
            name:"packets", labels:{format:"{0}", step: 2}, majorGridLines:{ visible:true }, line:{ visible:true }, title:{text:"Packets"}
        });
    }
    return valueAxes;
};

function formatMicroDate(microDateTime) {
    var microTime, resultString;
    if(microDateTime == null || microDateTime == 0 || microDateTime == '') {
        resultString = '';
    } else {
        microTime = microDateTime % 1000;
        resultString = moment(new Date(microDateTime / 1000)).format('YYYY-MM-DD HH:mm:ss:SSS');
        if (microTime > 0) {
            resultString += ':' + microTime;
        } else {
            resultString += ':0';
        }
    }
    return resultString;
};

function formatTeardownTime(tearDownTime) {
    if (tearDownTime == null || tearDownTime == '') {
        return 'active';
    } else {
        return formatMicroDate(tearDownTime);
    }
};

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};

function getLevelName4Value(value) {
    var levelsArray = queries.sl.queryViewModel.levels(),
        count = levelsArray.length;
    for (var i = 0; i < count; i++) {
        if (levelsArray[i].value == value) {
            return levelsArray[i].name;
        }
    }
    return value;
};

function handleNull4Grid(value, placeHolder) {
    if(value == 0) {
        return 0;
    } else if (value != null && value != '') {
        return value;
    } else if (placeHolder != null) {
        return placeHolder;
    } else {
        return '';
    }
};

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index != -1) {
        array.splice(index, 1);
    }
};

function randomUUID() {
    var s = [], itoh = '0123456789ABCDEF';
    for (var i = 0; i < 36; i++) {
        s[i] = Math.floor(Math.random() * 0x10);
    }
    s[14] = 4;
    s[19] = (s[19] & 0x3) | 0x8;
    for (var i = 0; i < 36; i++) {
        s[i] = itoh[s[i]];
    }
    s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
    s[s.length] = (new Date()).getTime();
    return s.join('');
};

function splitString2Array(strValue, delimiter) {
    var strArray = strValue.split(delimiter),
        count = strArray.length;
    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }
    return strArray;
};

function populateTimeRange(queryPrefix, startTime, endTime, reRunTimeRange) {
    var timeRange = $("#" + queryPrefix + "-time-range");
    if(reRunTimeRange == null || reRunTimeRange == '0') {
        timeRange.select2('val', 0);
        queries[queryPrefix].queryViewModel.isCustomTRVisible(true);
        setDateTime('#' + queryPrefix + '-to-time', endTime, startTime, null);
        setDateTime('#' + queryPrefix + '-from-time', startTime, null, endTime);
    } else {
        timeRange.select2('val', parseInt(reRunTimeRange));
        queries[queryPrefix].queryViewModel.isCustomTRVisible(false);
    }
};

function setDateTime(elementId, time, minValue, maxValue) {
    var dateTimePicker, dateTime;
    dateTimePicker = $(elementId).data("contrailDateTimePicker");

    if(minValue != null) {
        dateTimePicker.setMinDateTime(moment(new Date(minValue / 1000)).format('MMM DD, YYYY hh:mm:ss A'));
    }
    if(maxValue != null) {
        dateTimePicker.setMaxDateTime(moment(new Date(maxValue / 1000)).format('MMM DD, YYYY hh:mm:ss A'));
    }
    dateTime = moment(new Date(time / 1000)).format('MMM DD, YYYY hh:mm:ss A');
    $(elementId).val(dateTime);
};

function populateSelect(queryPrefix, selectArray, defaultColumns) {
    var selectString = '', select = [],
        query = queries[queryPrefix];
    for (var i = 0; i < selectArray.length; i++) {
        if (defaultColumns.indexOf(selectArray[i]) == -1) {
            select.push(selectArray[i]);
            selectString += (selectString.length == 0) ? selectArray[i] : (',' + selectArray[i]);
        }
    }
    $('#' + queryPrefix + '-select').val(selectString);
    query.selectViewModel.checkedFields(select);
};

function populateTimeGranularity(queryPrefix, selectFields, tg, tgUnit) {
    initTimeGranularity(selectFields, queries[queryPrefix], queryPrefix);
    if (tg != '' && tgUnit != '') {
        $('#' + queryPrefix + '-tg-value').data('contrailNumericTextbox').value(tg);
        $('#' + queryPrefix + '-tg-units').select2('val', tgUnit);
    }
};

function populateWhere(queryPrefix, where) {
    var whereClauseStr = '', whereClauseViewArray = [],
        whereORClauseArray, whereORClauseStr;
    for (var i = 0; i < where.length; i++) {
        whereORClauseArray = where[i];
        whereORClauseStr = '';
        for (var j = 0; j < whereORClauseArray.length; j++) {
            whereORClauseStr += (j == 0) ? '(' : ' AND ';
            if(whereORClauseArray[j].op == 3) {
                whereORClauseStr += whereORClauseArray[j].name + getOperatorFromCode(whereORClauseArray[j].op) + whereORClauseArray[j].value + "-" + whereORClauseArray[j].value2;
            } else {
                whereORClauseStr += whereORClauseArray[j].name + getOperatorFromCode(whereORClauseArray[j].op) + whereORClauseArray[j].value;
            }
            whereORClauseStr += (j == (whereORClauseArray.length - 1)) ? ')' : '';
        }
        whereClauseStr += (i == 0) ? '' : ' OR ';
        whereClauseStr += whereORClauseStr;
        whereClauseViewArray.push(whereORClauseStr);
    }
    $('#' + queryPrefix + '-where').val(whereClauseStr);
    // ToDo: Allow edit of where clause on populate.
};

function populateLogWhere(queryPrefix, where) {
    var whereClauseStr = '', whereClauseViewArray = [],
        whereORClauseArray, whereORClauseStr, whereORClauseSubmit, whereORClauseSubmitArray, whereClauseSubmitArray = [];
    for (var i = 0; i < where.length; i++) {
        whereORClauseArray = where[i];
        whereORClauseStr = '';
        whereORClauseSubmitArray = [];
        for (var j = 0; j < whereORClauseArray.length; j++) {
            whereORClauseStr += (j == 0) ? '(' : ' AND ';
            whereORClauseStr += whereORClauseArray[j].name + getOperatorFromCode(whereORClauseArray[j].op) + whereORClauseArray[j].value;
            whereORClauseStr += (j == (whereORClauseArray.length - 1)) ? ')' : '';
            whereORClauseSubmit = {field:whereORClauseArray[j].name, operator:whereORClauseArray[j].op, value:whereORClauseArray[j].value};
            whereORClauseSubmitArray.push(whereORClauseSubmit);
        }
        whereClauseStr += (i == 0) ? '' : ' OR ';
        whereClauseStr += whereORClauseStr;
        whereClauseViewArray.push(whereORClauseStr);
        whereClauseSubmitArray.push(whereORClauseSubmitArray);
    }
    $('#' + queryPrefix + '-where').val(whereClauseStr);
    queries[queryPrefix].whereViewModel.whereClauseView(whereClauseViewArray);
    queries[queryPrefix].whereViewModel.whereClauseSubmit(whereClauseSubmitArray);
};

function populateLogFilter(queryPrefix, filters) {
    var filterClauseStr = '', filterANDClauseStr, filterName,
        filterANDClauseSubmit, filterClauseSubmitArray = [];
    for (var i = 0; i < filters.length; i++) {
        filterName = filters[i].name;
        if(filterName == 'Type' || filterName == 'Level') {
            continue;
        }
        filterANDClauseStr = filterName + getOperatorFromCode(filters[i].op) + filters[i].value;
        filterANDClauseSubmit = {field:filters[i].name, operator:filters[i].op, value:filters[i].value};
        filterClauseStr += (filterClauseStr == '') ? '' : ' AND ';
        filterClauseStr += filterANDClauseStr;
        filterClauseSubmitArray.push(filterANDClauseSubmit);
    }
    $('#' + queryPrefix + '-filter').val(filterClauseStr);
    queries[queryPrefix].filterViewModel.filterClauseView(filterClauseStr);
    queries[queryPrefix].filterViewModel.filterClauseSubmit(filterClauseSubmitArray);
};

function populateLevel(queryPrefix, filter) {
    var level = null;
    for (var j = 0; j < filter.length; j++) {
        if (filter[j].name == 'Level') {
            level = filter[j].value;
            ;
            break;
        }
    }
    $('#' + queryPrefix + '-select-level').select2('val',level);
};

function getOperatorFromCode(opCode) {
    if (opCode == 1 || opCode == 3) {
        return " = ";
    } else if (opCode == 2) {
        return " != ";
    } else if (opCode == 8) {
        return " RegEx= ";
    } else {
        return " NA ";
    }
};

function populateFilter(queryPrefix, sortFields, sort, limit) {
    var filterStr = '', sortOrder = 'asc',
        query = queries[queryPrefix];
    resetFSCheckedFilters(query.selectViewModel.checkedFields);
    if (sortFields != null && sortFields.length != 0) {
        filterStr = 'sort_fields: ';
        for (var i = 0; i < sortFields.length; i++) {
            filterStr += ((i == 0) ? '[' : ',') + sortFields[i];
            filterStr += ((i == (sortFields.length - 1)) ? ']' : '');
        }
        if (sort == 1) {
            filterStr += ', sort: asc';
        } else if (sort == 2) {
            sortOrder = 'desc';
            filterStr += ', sort: desc';
        }
        query.filterViewModel.checkedOrderBy(sortFields[0]);
    }
    if (limit != null) {
        filterStr += ((filterStr.length != 0) ? ', limit: ' : 'limit: ') + limit;
    }
    $('#' + queryPrefix + '-filter').val(filterStr);
    query.filterViewModel.checkedFilters(sortFields);
    query.filterViewModel.sortOrder(sortOrder);
    query.filterViewModel.limit(limit);

};

function prepare4QueryResults(queryPrefix) {
    collapseWidget('#' + queryPrefix + '-query-widget');
    $('#' + queryPrefix + '-result-widget').removeClass("hide");
    openWidget('#' + queryPrefix + '-result-widget');
};

function objValueComparator(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
};

function resetTGValues(isCustom, queryPrefix) {
    var timeRange, secTimeInterval,
        tgUnits = [
            {name:"secs", value:"secs"},
            {name:"mins", value:"mins"},
            {name:"hrs", value:"hrs"},
            {name:"days", value:"days"}
        ];
    timeRange = getTimeRange(queryPrefix);
    secTimeInterval = (timeRange.toTime - timeRange.fromTime) / 1000;
    if (isCustom) {
        tgUnits = [
            {name:"secs", value:"secs"},
            {name:"mins", value:"mins"},
            {name:"hrs", value:"hrs"},
            {name:"days", value:"days"}
        ];
    } else if (secTimeInterval <= 60) {
        tgUnits = [
            {name:"secs", value:"secs"}
        ];
    } else if (secTimeInterval <= 3600) {
        tgUnits = [
            {name:"secs", value:"secs"},
            {name:"mins", value:"mins"}
        ];
    } else if (secTimeInterval <= 86400) {
        tgUnits = [
            {name:"secs", value:"secs"},
            {name:"mins", value:"mins"},
            {name:"hrs", value:"hrs"}
        ];
    }
    queries[queryPrefix].queryViewModel.tgUnits(tgUnits);
};

function getLabelStepUnit(tg, tgUnit) {
    var baseUnit = null, secInterval = 0;
    if (tgUnit == 'secs') {
        secInterval = tg;
        if (tg < 60) {
            tg = (-1 * tg);
        } else {
            tg = Math.floor(parseInt(tg / 60));
        }
        baseUnit = 'minutes';
    } else if (tgUnit == 'mins') {
        secInterval = tg * 60;
        baseUnit = 'minutes';
    } else if (tgUnit == 'hrs') {
        secInterval = tg * 3600;
        baseUnit = 'hours';
    } else if (tgUnit == 'days') {
        secInterval = tg * 86400;
        baseUnit = 'days';
    }
    return {labelStep:(1 * tg), baseUnit:baseUnit, secInterval:secInterval};
};

function initTimeGranularity(checkedFields, query, queryPrefix) {
    var tgValueId = '#' + queryPrefix + '-tg-value';

    if (checkedFields.indexOf('time-granularity') > -1 || checkedFields.indexOf('T=') > -1) {
        query.queryViewModel.isTGVisible(true);
        if ($(tgValueId).data("contrailNumericTextbox") == null) {
            $(tgValueId).contrailNumericTextbox({
                min:1,
                max:60,
                step:1,
                format:"#"
            });
            $(tgValueId).data('contrailNumericTextbox').value(60);
        }
        $(tgValueId).removeAttr('required');
        $(tgValueId).removeAttr('validationMessage');
        $(tgValueId).attr('required', 'required');
        $(tgValueId).attr('validationMessage', 'Time Granularity Required.');
    } else {
        query.queryViewModel.isTGVisible(false);
        $(tgValueId).removeAttr('required');
        $(tgValueId).removeAttr('validationMessage');
    }
};

function collapseOtherWidgets(queryPrefix, openWidgetId) {
    openWidgetId = (openWidgetId == null) ? (queryPrefix + '-result-widget') : openWidgetId;
    $(".widget-box").each(function() {
        var widgetId = $(this).attr('id');
        if(widgetId != openWidgetId) {
            collapseWidget('#' + widgetId);
        } else {
            openWidget('#' + widgetId);
        }
    });
};

function validateDate(queryPrefix){
    $.validator.addMethod("checkValidDate", function(value, element) {
    var start = $("#" + queryPrefix + "-from-time");
    var end = $("#" + queryPrefix + "-to-time");

    if (Date.parse(start.val()) >= Date.parse(end.val())) {
        return false;
    }
    return true;
}, '<i class="icon-warning-sign"></i> From Time should be less than To Time');
}

function selectAll(queryPrefix, dis) {
    var selectViewModel = queries[queryPrefix].selectViewModel,
        checkedFields = selectViewModel.checkedFields;
    if ($(dis).text() == 'Select All') {
        if (queryPrefix != 'ot') {
            queries[queryPrefix].selectViewModel.reset();
        } else {
            queries[queryPrefix].selectViewModel.empty();

        }
        $(dis).parents('form')
            .find('input[type="checkbox"]')
            .each(function() {
                if (!$(this).prop('disabled')) {
                    checkedFields.push($(this).attr('value'));
                    $(this).change();
                }
            });
        $(dis).text('Clear All');
    } else if ($(dis).text() == 'Clear All') {
        $(dis).parents('form')
            .find('input[type="checkbox"]')
            .each(function() {
                checkedFields.remove($(this).attr('value'));
                $(this).prop('disabled', false);
            });
        $(dis).text('Select All');

        if (queryPrefix != 'ot') {
            queries[queryPrefix].selectViewModel.reset();
        } else {
            queries[queryPrefix].selectViewModel.empty();

        }
    }
};

function QueryViewModel(queryPrefix, resetFunction, isTGActive) {
    this.defaultTRValue = ko.observable(1800);

    this.timeRange = ko.observableArray([
        {"name":"Last 10 Mins", "value":600},
        {"name":"Last 30 Mins", "value":1800},
        {"name":"Last 1 Hr", "value":3600},
        {"name":"Last 6 Hrs", "value":21600},
        {"name":"Last 12 Hrs", "value":43200},
        {"name":"Custom", "value":0}
    ]);

    this.isCustomTRVisible = ko.observable(false);

    this.reset = resetFunction;

    if(queryPrefix == 'fs' || queryPrefix == 'fr') {
        this.defaultDirectionValue = ko.observable(1);
        this.direction = ko.observableArray([
            { "name": "INGRESS", "value": 1 },
            { "name": "EGRESS", "value": 0 }
        ]);
    } else if(queryPrefix == 'sl') {
        this.levels = ko.observableArray([]);
        this.selectedLevel = ko.observableArray([]);
        this.categories = ko.observableArray([]);
    } else if(queryPrefix == 'ot') {
        this.objectTypes = ko.observableArray([]);
        this.objectIds =  ko.observableArray([]);
        this.levels = ko.observableArray([]);
        this.categories = ko.observableArray([]);
    } else if (queryPrefix == 'acpu') {
        this.fromTables = ko.observableArray([]);
    }

    if(isTGActive) {
        this.isTGVisible = ko.observable(false);
        this.tgUnits = ko.observableArray([
            { name: "secs", value: "secs" },
            { name: "mins", value: "mins" }
        ]);
    }
};

function WhereViewModel(queryPrefix, resetFunction) {
    this.opValues = ko.observableArray([{ name: "=", value: "=" }]);
    this.selectFields = ko.observableArray([]);
    this.whereClauseView = ko.observableArray([]);
    this.whereClauseSubmit = ko.observableArray([]);
    this.whereClauseEdit = ko.observableArray([]);
    this.selectedORClauseIndex = ko.observable('-1');
    this.reset = resetFunction;
    if(queryPrefix == 'sl') {
        this.ModuleId = ko.observableArray([]);
        this.Messagetype = ko.observableArray([]);
        this.Source = ko.observableArray([]);
    }
};

function SelectViewModel(queryPrefix, resetFunction) {
    this.reset = resetFunction;
    if(queryPrefix == 'fs') {
        this.isEnabled = {
            "bytes": ko.observable(true),
            "packets": ko.observable(true),
            "sum(bytes)": ko.observable(true),
            "sum(packets)": ko.observable(true)
        };
    } else if (['acpu', 'qeperf', 'vna', 'smsg'].indexOf(queryPrefix) != -1) {
        this.fields = ko.observableArray([]);
        this.isEnabled = {'T': ko.observable(true)};
    }

    if(queryPrefix == 'ot') {
        this.empty = function() {
            this.checkedFields([]);
            this.selectFields([]);
        };
        this.defaultSelectAllText = ko.observable("Clear All");
        this.checkedFields = ko.observableArray(getOTSelectFieldsOptions());
        this.selectFields = ko.observableArray(getOTSelectFieldsOptions());
    } else {
        this.defaultSelectAllText = ko.observable("Select All");
        this.checkedFields = ko.observableArray([]);
    }
};

function FilterViewModel(queryPrefix, resetFunction) {
    this.opValues = ko.observableArray([
        {name:"!=", value:"!="},
        {name:"RegEx=", value:"RegEx="}
    ]);
    this.fields = ko.observableArray([]);
    this.selectFields = ko.observableArray([]);
    this.filterClauseSubmit = ko.observableArray([]);
    this.filterClauseView = ko.observable("");
    this.ModuleId = ko.observableArray([]);
    this.Messagetype = ko.observableArray([]);
    this.Source = ko.observableArray([]);
    this.reset = resetFunction;
    this.orderTypes = [
        { name: "ASC", value: "asc" },
        { name: "DESC", value: "desc"}
    ];
    this.checkedOrderBy = ko.observableArray([]);
    this.checkedFilters = ko.observableArray([]);
    this.limit = ko.observable("150000");
    this.sortOrder = ko.observable("asc");
};

function exportServersideQueryResults(gridConfig, gridContainer) {
    var gridDataSource = gridConfig.body.dataSource,
        exportUrl = '/api/admin/reports/query/export?queryId=' + gridDataSource.remote.ajaxConfig.data['queryId'];

    $.ajax({
        url: exportUrl,
        type: "GET",
        error: function (xhr) {
            var errorMsg = contrail.parseErrorMsgFromXHR(xhr);
            gridContainer.data('contrailGrid').removeGridMessage();
            showMessagePopup('Error', 'Error in Export: ' + errorMsg);
            gridContainer.data('contrailGrid').showGridMessage('error','Export: ' + errorMsg);
        },
        success:function (results) {
            exportGridData2CSV(gridConfig, results['data']);
            setTimeout(function() {
                gridContainer.find('a[data-action="export"] i').addClass('icon-download-alt').removeClass('icon-spin icon-spinner');
                gridContainer.find('a[data-action="export"]').prop('title','Export as CSV').data('action','export').removeClass('blue');
            }, 500);
        }
    });
};

function getOTSelectFieldsOptions() {
    return ['ObjectLog', 'SystemLog'];
};

function getQueryModel(title) {
    return {
            title: title, fromTime:"", toTime:"", queryViewModel:"",
            selectTemplate:"", selectWindow:"", selectViewModel:"",
            whereTemplate:"", whereViewModel:"", whereCounter:1, orClauseTemplate:"", editORClauseTemplate:"",
            filterTemplate:"", filterWindow:"", filterViewModel:"", filterCounter:1,
            confirmWindow:""
        };
}
function getEngQueryStr(reqQueryObj){
	return JSON.stringify({
		select: reqQueryObj.select,
		from: reqQueryObj.table,
		where: reqQueryObj.where,
		fromTime: reqQueryObj.fromTime,
		toTime: reqQueryObj.toTime,
		filter: reqQueryObj.filters
	});
};

$.fn.serializeObject = function() {
    var newObj = {};
    var objArray = this.serializeArray();
    $.each(objArray, function() {
        if (newObj[this.name] !== undefined) {
            if (!newObj[this.name].push) {
                newObj[this.name] = [newObj[this.name]];
            }
            newObj[this.name].push(this.value || '');
        } else {
            newObj[this.name] = this.value || '';
        }
    });
    return newObj;
};
