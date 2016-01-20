/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormEditableGridView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                editableGridTmpl = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_EDITABLE_GRID_VIEW),
                columns = viewConfig.columns,
                path = viewConfig[cowc.KEY_PATH],
                model = this.model,
                validation = (viewConfig['validation'] != null) ? viewConfig['validation'] : this.attributes.validation,
                childViewObj, childElId;

            model.initLockAttr(path, false);

            this.$el.html(editableGridTmpl(viewConfig));

            for (var j = 0; j < columns.length; j++) {
                childViewObj = columns[j];
                childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                this.renderView4Config(this.$el.find("#" + childElId), this.model, childViewObj, validation, false);
            }
        }
    });

    return FormEditableGridView;
});