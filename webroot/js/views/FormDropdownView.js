/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormDropdownView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                dropdownTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_DROPDOWN_VIEW),
                elId = this.attributes.elementId,
                app = this.attributes.app,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
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
                id: elId + '_dropdown', class: "span12", name: elId, label: labelValue,
                viewConfig: viewConfig, lockAttr: lockEditingByDefault
            };

            /* Save the elementConfig for the dropdown in elementConfigMap in the model
             'key' is the name of the element and 'value is the actual element config' */

            // get the current elementConfigMap
            if(this.model != null) {
                var currentElementConfigMap = this.model.model().get('elementConfigMap');
                if(!contrail.checkIfExist(currentElementConfigMap)){
                    currentElementConfigMap = {};
                    this.model.model().set('elementConfigMap', currentElementConfigMap);
                }
                // Update the existing elementConfigMap by adding the the new element elementConfig
                // will get updated in the model also
                currentElementConfigMap[elId] = elementConfig;
            }
            this.$el.html(dropdownTemplate(tmplParameters));
            if (contrail.checkIfFunction(elementConfig.onInit) && this.model != null) {
                elementConfig.onInit(this.model.model());
            }
        }
    });

    return FormDropdownView;
});