/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormNumericTextboxView = ContrailView.extend({
        render: function () {
            var self = this,
                numericTextboxTemplate = contrail.getTemplate4Id(cowc.TMPL_NUMERICTEXTBOX_VIEW),
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                label = viewConfig.label,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_numerictextbox', name: elId, dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault, class: "col-xs-12", elementConfig: elementConfig
            };

            self.$el.html(numericTextboxTemplate(tmplParameters));

            var currentElementConfigMap = this.model.model().get('elementConfigMap');
            if(!contrail.checkIfExist(currentElementConfigMap)){
                currentElementConfigMap = {};
                this.model.model().set('elementConfigMap', currentElementConfigMap);
            }

            currentElementConfigMap[elId] = elementConfig;
        }
    });

    return FormNumericTextboxView;
});