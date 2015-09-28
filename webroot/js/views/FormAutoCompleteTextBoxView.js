/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormAutoCompleteTextBoxView = ContrailView.extend({
        render: function () {
            var self = this,
                autocompleteTextboxTemplate = contrail.getTemplate4Id(cowc.
                        TMPL_AUTOCOMPLETETEXTBOX_VIEW),
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                label = viewConfig.label,
                labelValue = (label != null)? label :((elId != null)?
                        cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) &&
                    lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_autocompletetextbox',
                    name: elId, dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault, class: "span12",
                    elementConfig: elementConfig
            };

            self.$el.html(autocompleteTextboxTemplate(tmplParameters));

            var currentElementConfigMap = this.model.model().
                get('elementConfigMap');
            if(!contrail.checkIfExist(currentElementConfigMap)){
                currentElementConfigMap = {};
                this.model.model().set('elementConfigMap',
                        currentElementConfigMap);
            }

            currentElementConfigMap[elId] = elementConfig;
        }
    });

    return FormAutoCompleteTextBoxView;
});