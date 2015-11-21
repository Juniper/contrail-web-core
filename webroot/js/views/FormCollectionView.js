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
                accordionConfig = contrail.checkIfExist(viewConfig.accordionable) ? viewConfig.accordionConfig : {},
                model = self.model,
                validation = (viewConfig['validation'] != null) ? viewConfig['validation'] : self.attributes.validation,
                defaultAccordionConfig  = {
                    heightStyle: "content",
                    header: ".header",
                    collapsible: true,
                    active: -1
                }, childViewObj, childElId;

            self.$el.html(collectionTmpl({elementId: elementId, viewConfig: viewConfig}));

            for (var i = 0; i < rows.length; i++) {
                columns = rows[i].columns;
                for (var j = 0; j < columns.length; j++) {
                    childViewObj = columns[j];
                    childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                    self.renderView4Config(self.$el.find("#" + childElId), self.model, childViewObj, validation, false);
                }
            }

            if (accordionable) {
                accordionConfig = $.extend(true, defaultAccordionConfig, accordionConfig);
                self.$el.find('.collection').accordion(accordionConfig);
            }
        }
    });

    return FormCollectionView;
});