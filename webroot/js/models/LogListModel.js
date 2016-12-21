/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    "contrail-list-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(ContrailListModel, qeUtils) {
    var LogListModel = function() {
        var filter = "(Type = 1 AND Level <= 4) OR (Type = 10 AND " +
            "Level <= 4)";
        var qObj = {"table": "MessageTable", "level": 4, "filter": filter,
            "limit": 10, "minsSince": 10};
        var postData = qeUtils.formatQEUIQuery(qObj);
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : cowc.URL_QE_QUERY,
                    type: "POST",
                    data: JSON.stringify(postData)
                },
                dataParser : function(result) {
                    return result.data;
                },
            },
            cacheConfig : {
                ucid : cowl.CACHE_DASHBORAD_LOGS
            }
        };
        return new ContrailListModel(listModelConfig);
    };
    return LogListModel;
});
