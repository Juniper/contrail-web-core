/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "contrail-view"
], function(_, cowc, ContrailView) {
    var LogListView = ContrailView.extend({
        initialize: function() {
            var self = this;
            
            self.model.onDataUpdate.subscribe(function() {
                setTimeout(function() { // timer is needed due to irregular event execution sequence.
                                        // Without timer, render() will read the old value of
                                        // model.isRequestInProgress()
                    self.render();
                });
            });

            self.template = window.contrail.getTemplate4Id(cowc.TMPL_LOG_LIST);
        },
        render: function() {
            var data,
                list = this.model.getItems();

            if (this.model.isRequestInProgress()) {
                data = window.cowm.DATA_FETCHING;
            } else {
                data = cowu.logsParser(list.slice(0, _.get(this, ["attributes", "viewConfig", "totalRecords"], 3)));
                if (_.isEmpty(data)) {
                    if (!_.isEmpty(list)) {
                        data = window.cowm.DATA_COMPATIBILITY_ERROR;
                    } else {
                        data = window.cowm.DATA_SUCCESS_EMPTY;
                    }
                }
            }
            this.$el.html(this.template(data));
        }
    });
    return LogListView;
});
