/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormMultiselectView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                msTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_MULTISELECT_VIEW),
                label = viewConfig.label,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                validation = self.attributes.validation,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                labelValue = (label != null)? label :((elId != null) ? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            self.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_dropdown', name: elId, class: "span12",
                viewConfig: viewConfig, lockAttr: lockEditingByDefault, validation: validation
            };

            /* Save the elementConfig for the dropdown in elementConfigMap in the model
             'key' is the name of the element and 'value is the actual element config' */

            // get the current elementConfigMap
            var currentElementConfigMap = self.model.model().get('elementConfigMap');
            if(!contrail.checkIfExist(currentElementConfigMap)){
                currentElementConfigMap = {};
                self.model.model().set('elementConfigMap', currentElementConfigMap);
            }
            // Update the existing elementConfigMap by adding the the new element elementConfig
            // will get updated in the model also
            currentElementConfigMap[elId] = elementConfig;
            self.$el.html(msTemplate(tmplParameters));
            if (contrail.checkIfFunction(elementConfig.onInit)) {
                elementConfig.onInit(self.model.model());
            }

        }
    });

    return FormMultiselectView;
});