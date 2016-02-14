/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function() {
    /*
    * Methods to set and update the cross filters which are linked to the single datasource
    */

    var CFDataSource = function() {
        var self = this;
        var cf = null,recordCnt = 0,
            dimensions={},
            filters={},
            filterValues = {};
            callBacks=$.Callbacks("unique"),
            callBackFns={}

        self.updateData = function(data) {
            if(cf == null) {
                cf = crossfilter(data);
            } else {
                for (var currDim in filters) {
                    dimensions[currDim].filter(null);
                }
                cf.remove();
                //Re-apply the filters
                for (var currDim in filters) {
                    dimensions[currDim].filter(filters[currDim]);
                }
                cf.add(data);
            }
            recordCnt = data.length;
        }

        self.getRecordCnt = function() {
            return recordCnt;
        }

        self.getFilteredRecordCnt = function() {
            return self.getFilteredData().length;
        }

        this.addDimension =  function(dimensionName,dimFn) {
            var dimension;
            //Add dimension only if it doesn't exist
            if(cf != null) {
                if(self.getDimension(dimensionName) == null) {
                    if(dimFn == null) {
                        dimFn = function(d) {
                            return d[dimensionName];
                        }
                    }
                    dimension = cf.dimension(dimFn);
                    dimensions[dimensionName] = dimension;
                }
                filters[dimensionName] = null;
            }
            return dimension;
        }

        this.getDimension = function(dimensionName){
            return dimensions[dimensionName];
        }

        this.getFilter = function(dimensionName) {
            return filters[dimensionName];
        }

        this.getFilterValues = function(dimensionName) {
            return filterValues[dimensionName];
        }

        this.applyFilter = function(dimensionName,criteria,filterRange) {
            if(dimensions[dimensionName] != null) {
                var dimension = dimensions[dimensionName];
                if(criteria == null) {
                    this.removeFilter(dimensionName);
                } else {
                    dimension.filter(criteria);
                    filters[dimensionName] = criteria;
                    filterValues[dimensionName] = filterRange;
                }
                var filteredData = dimension.top(Infinity);
                return filteredData;
            }
        }

        this.removeFilter = function(dimensionName) {
            if(dimensions[dimensionName] != null) {
                var dimension = dimensions[dimensionName];
                dimension.filterAll();
                var currFilter = filters[dimensionName];
                filters[dimensionName] = null;
                filterValues[dimensionName] = null;
                return currFilter;
            }
        }

        this.getFilteredData = function() {
            if(cf != null ) {
                var thirdDimension = cf.dimension(function(d) { return d['x']; });
                var t = thirdDimension.top(Infinity);
                thirdDimension.remove();
                //cfObj.callBacks.fire(t);
                return t;
            }
            return [];
        }

        this.addCallBack = function(callBackName,callBackFn) {
            //Remove existing callback for the same name
            callBacks.remove(callBackFns[callBackName]);
            callBacks.add(callBackFn);
            callBackFns[callBackName] = callBackFn;
        }

        this.removeCallBack = function(cfName,callBackName){
            var callBackFn = this.getCallBackFn(cfName,callBackName);
            var callBacks = this.getCallBacks(cfName);

            callBacks.remove(callBackFns['callBackName']);
            delete callBackFns[callBackName];
        }

        this.fireCallBacks = function(options) {
            var ret = {};
            if(callBacks != null) {
                var data = this.getFilteredData();
                ret['data'] = data;
                ret['cfg'] = {};
                if(options != null && options.source != null){
                    ret['cfg']['source'] = options.source;
                }
                callBacks.fire(ret);
            }
        }
    }
    return CFDataSource;
});
