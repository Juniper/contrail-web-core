/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "query-form-view",
    "core-basedir/js/common/qe.utils"
], function(QueryFormView, queryEngineUtils) {
    var QueryTextView = QueryFormView.extend({
        render: function() {
            var self = this,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_TEXT),
                viewConfig = self.attributes.viewConfig,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes : {};

            self.$el.append(queryPageTmpl);

            self.$el.find(".queryText").append(queryEngineUtils.formatEngQuery(queryFormAttributes.engQueryStr));
        }
    });

    return QueryTextView;
});
