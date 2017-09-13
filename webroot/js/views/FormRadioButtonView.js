/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormRadioButtonView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                radioButtonTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_RADIO_BUTTON_VIEW),
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig['path'],
                type = (viewConfig['type'] != null) ? viewConfig['type'] : 'radio',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                label = viewConfig.label,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            if(this.model != null) {
                this.model.initLockAttr(path, lockEditingByDefault);
            }
            tmplParameters = {
                label: labelValue, id: elId, name: elId,
                dataBindValue: viewConfig['dataBindValue'],
                lockAttr: lockEditingByDefault,
                isChecked: viewConfig['dataBindValue'],
                path: path, validation: validation,
                elementConfig: elementConfig,
                disabled: viewConfig['disabled']
            };
            this.$el.html(radioButtonTemplate(tmplParameters));
            var self= this;
            setTimeout(function() {
                if(viewConfig.templateId == cowc.TMPL_OPTNS_WITH_ICONS_RADIO_BUTTON_VIEW) {
                    var elementId = self.attributes.elementId;
                    $('#'+elementId).find('.option').removeClass('selected');
                    $('#'+elementId).find('input:checked').prev('.option')
                                    .addClass('selected');
                    $('#'+elementId).find('.option').click(function() {
                        $(this).next().prop("checked", true).trigger("click");
                        $('#'+elementId).find('.option').removeClass('selected');
                        $(this).addClass('selected');
                        return false;
                    });
                }
            }, 10);
        }
    });

    return FormRadioButtonView;
});