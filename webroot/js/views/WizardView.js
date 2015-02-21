/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var WizardView = Backbone.View.extend({
        render: function () {
            var wizardTempl = contrail.getTemplate4Id(cowc.TMPL_WIZARD_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                validation = this.attributes.validation,
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                self = this,
                childViewObj, childElId, steps;

            this.$el.html(wizardTempl({viewConfig: viewConfig, elementId: elId}));
            steps = viewConfig['steps'];

            $.each(steps, function(stepKey, stepValue){

                self.model.showErrorAttr(stepValue.elementId, false);
                if(stepValue.onInitRender == true) {
                    stepValue.onInitWizard = function(params) {
                        cowu.renderView4Config($("#" + stepValue.elementId), self.model, stepValue, validation, lockEditingByDefault);
                    }
                }
                else {
                    stepValue.onInitFromNext = function (params) {
                        cowu.renderView4Config($("#" + stepValue.elementId), self.model, stepValue, validation, lockEditingByDefault);
                    }
                }
            });

            this.$el.find("#" + elId).contrailWizard({
                headerTag: "h2",
                bodyTag: "section",
                transitionEffect: "slideLeft",
                titleTemplate: '<span class="number">#index#</span><span class="title"> #title#</span>',
                steps: steps,
                params: {
                    model: this.model
                }
            });

            this.$el.parents('.modal-body').css({'padding': '0'});
        }
    });

    return WizardView;
});