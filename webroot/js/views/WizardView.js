/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var WizardView = ContrailView.extend({
        render: function () {
            var self = this,
                wizardTempl = contrail.getTemplate4Id(cowc.TMPL_WIZARD_VIEW),
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                validation = self.attributes.validation,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                steps;

            self.$el.html(wizardTempl({viewConfig: viewConfig, elementId: elId}));
            steps = viewConfig['steps'];

            $.each(steps, function(stepKey, stepValue){
                var stepElementId = stepValue.elementId;
                self.model.showErrorAttr(stepElementId, false);
                if(stepValue.onInitRender == true) {
                    stepValue.onInitWizard = function(params, onInitCompleteCB) {
                        self.renderView4Config($("#" + stepElementId), self.model, stepValue, validation, lockEditingByDefault, null, function(){
                            if(contrail.checkIfFunction(onInitCompleteCB)) {
                                onInitCompleteCB(params);
                            }
                        });
                    };
                } else {
                    stepValue.onInitFromNext = function (params, onInitCompleteCB) {
                        self.onAllViewsRenderComplete.unsubscribe();
                        self.renderView4Config($("#" + stepElementId), self.model, stepValue, validation, lockEditingByDefault, null, function(){
                            if(contrail.checkIfFunction(onInitCompleteCB)) {
                                onInitCompleteCB(params);
                            }
                        });
                    };
                }
            });

            self.$el.find("#" + elId).contrailWizard({
                headerTag: "h2",
                bodyTag: "section",
                transitionEffect: "slideLeft",
                titleTemplate: '<span class="number">#index#</span><span class="title"> #title#</span>',
                steps: steps,
                params: {
                    model: self.model
                }
            });

            self.$el.parents('.modal-body').css({'padding': '0'});
        }
    });

    return WizardView;
});