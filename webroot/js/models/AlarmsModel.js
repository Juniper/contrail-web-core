/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel) {

    var alarmsModel = ContrailModel.extend({
        ackAlarms: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, alarmsList = [],
            getAjaxs = [], regionBasedRecord = {};
            var region = contrail.getCookie('region');
            if(region != 'All Regions'){
            	$.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                    alarmsList.push({"table":checkedRowsValue.table,
                        "name":checkedRowsValue.name,
                        "type":checkedRowsValue.type,
                        "token":checkedRowsValue.token});
                });

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(alarmsList);
                ajaxConfig.url = '/api/tenant/monitoring/ackalarms';
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                });
            }else{
            	for(var i = 0; i < checkedRows.length; i++){
            		var obj = {"table":checkedRows[i].table, "name":checkedRows[i].name,
            				   "type":checkedRows[i].type, "token":checkedRows[i].token,"reqRegion": checkedRows[i].regionName};
            		if(Object.keys(regionBasedRecord).length === 0){
            			regionBasedRecord[checkedRows[i].regionName] = [];
            			regionBasedRecord[checkedRows[i].regionName].push(obj);
            		}else{
        			    var keys = Object.keys(regionBasedRecord);
        				if(keys.indexOf(checkedRows[i].regionName) !== -1){
        					regionBasedRecord[checkedRows[i].regionName].push(obj);
        				}else{
        					regionBasedRecord[checkedRows[i].regionName] = [];
                			regionBasedRecord[checkedRows[i].regionName].push(obj);
        				}
            		}
            	}
            	var region = Object.keys(regionBasedRecord);
            	for(var j = 0; j < region.length; j++){
            		var data = regionBasedRecord[region[j]];
            		getAjaxs[j] = $.ajax({
                    	url: '/api/tenant/monitoring/ackalarms?reqRegion='+ region[j],
                        type:'POST',
                        contentType:'application/json; charset=utf-8',
                        data: JSON.stringify(data),
                        dataType:'json'
                     });
            	}
            	$.when.apply($, getAjaxs).then( function () {
            		if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
            	})
            }
        },
    });

    return alarmsModel;
});