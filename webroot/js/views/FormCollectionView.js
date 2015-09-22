/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormCollectionView = ContrailView.extend({
        render: function () {

            var self = this,
                elementId = self.attributes.elementId,
                viewConfig = self.attributes.viewConfig,
                collectionTmpl = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_COLLECTION_VIEW),
                rows = viewConfig[cowc.KEY_ROWS],
                columns = null,
                path = viewConfig[cowc.KEY_PATH],
                accordionable = viewConfig['accordionable'],
                model = self.model,
                validation = (viewConfig['validation'] != null) ? viewConfig['validation'] : self.attributes.validation,
                childViewObj, childElId;

            self.$el.html(collectionTmpl({elementId: elementId, viewConfig: viewConfig}));

            for (var i = 0; i < rows.length; i++) {
                columns = rows[i].columns;
                for (var j = 0; j < columns.length; j++) {
                    childViewObj = columns[j];
                    childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                    self.renderView4Config(self.$el.find("#" + childElId), model, childViewObj, validation, false);
                }
            }

            if (accordionable) {
                self.$el.find('.collection').accordion({
                    heightStyle: "content",
                    collapsible: true,
                    active: -1
                });
            }
        }
    });

    return FormCollectionView;
});