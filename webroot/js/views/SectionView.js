/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SectionView = ContrailView.extend({

        render: function () {
            var sectionTempl = contrail.getTemplate4Id(cowc.TMPL_SECTION_VIEW),
                viewConfig = this.attributes.viewConfig,
                validation = this.attributes.validation,
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                modelMap = this.modelMap,
                childElId, childViewObj, childView;

            this.$el.html(sectionTempl({viewConfig : viewConfig}));

            var rows = viewConfig[cowc.KEY_ROWS],
                columns;

            for (var i = 0; i < rows.length; i++) {
                columns = rows[i].columns;
                for (var j = 0; j < columns.length; j++) {
                    childViewObj = columns[j];
                    childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                    childView = this.renderView4Config(this.$el.find("#" + childElId), this.model, childViewObj, validation, lockEditingByDefault, modelMap);
                }
            }
        }
    });

    return SectionView;
});