/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormDateTimePickerView = ContrailView.extend({
        render: function () {
            var self = this,
                dateTimePickerTemplate = contrail.getTemplate4Id(cowc.TMPL_DATETIMEPICKER_VIEW),
                viewConfig = self.attributes.viewConfig,
                label = self.attributes.label,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                visible =  self.attributes.visible,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                labelValue = (label != null)? label :((elId != null) ?
                    cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_datetimepicker', name: elId,
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                visible: visible,
                lockAttr: lockEditingByDefault,
                class: "span12", elementConfig: elementConfig
            };

            self.$el.html(dateTimePickerTemplate(tmplParameters));

            var currentElementConfigMap = this.model.model().get('elementConfigMap');
            if(!contrail.checkIfExist(currentElementConfigMap)){
                currentElementConfigMap = {};
                this.model.model().set('elementConfigMap', currentElementConfigMap);
            }

            currentElementConfigMap[elId] = elementConfig;
        }
    });

    return FormDateTimePickerView;
});