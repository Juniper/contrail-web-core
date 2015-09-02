/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormTextAreaView = ContrailView.extend({
        render: function () {
            var textAreaTemplate = contrail.getTemplate4Id(cowc.TMPL_TEXTAREA_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                placeHolder = contrail.checkIfExist(viewConfig['placeHolder']) ? viewConfig['placeHolder'] : null,
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                label = viewConfig.label,
                visible =  viewConfig.visible,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                showEditIcon = contrail.checkIfExist(viewConfig['editPopupConfig']) ? true : false,
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, placeHolder: placeHolder, disabled: viewConfig['disabled'],
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE], lockAttr: lockEditingByDefault, type: type, visible: visible,
                class: "span12", path: path, validation: validation, showEditIcon: showEditIcon
            };

            this.$el.html(textAreaTemplate(tmplParameters));

            if(showEditIcon) {
                this.$el.find(".add-on").on("click", viewConfig['editPopupConfig'].renderEditFn);
            }
        }
    });

    return FormTextAreaView;
});
