/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "query-form-view",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(QueryFormView, qeUtils) {
    var QueryTextView = QueryFormView.extend({
        render: function() {
            var queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_TEXT),
                viewConfig = this.attributes.viewConfig,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes : {};

            this.$el.append(queryPageTmpl);

            this.$el.find(".queryText").append(qeUtils.formatEngQuery(queryFormAttributes.engQueryStr));
        }
    });

    return QueryTextView;
});
