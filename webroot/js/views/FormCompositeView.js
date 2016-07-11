/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormCompositeView = ContrailView.extend({
        render: function () {
            var self = this,
                buttonTemplate = contrail.getTemplate4Id(cowc.TMPL_COMPOSITE_VIEW),
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                elementConfig = viewConfig.elementConfig,
                label = viewConfig.label,
                path = viewConfig[cowc.KEY_PATH],
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                modelMap = self.modelMap,
                childView = viewConfig[cowc.KEY_CHILD_VIEW],
                tmplParameters, childViewObj, childViewElId;

            tmplParameters = { label: labelValue, id: elId, name: elId, class: "col-xs-3", elementConfig: elementConfig, childView: childView };

            self.$el.html(buttonTemplate(tmplParameters));

            for (var j = 0; j < childView.length; j++) {
                childViewObj = childView[j];
                childViewElId = childViewObj[cowc.KEY_ELEMENT_ID];

                self.renderView4Config(self.$el.find("#" + childViewElId), self.model, childViewObj, validation, lockEditingByDefault, modelMap);
            }
        }
    });

    return FormCompositeView;
});
