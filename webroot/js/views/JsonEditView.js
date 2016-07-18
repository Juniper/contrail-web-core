/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var JSONEditView = ContrailView.extend({

        renderEditor: function (options) {
            var prefixId = options['type'],
                modalId = 'configure-' + prefixId,
                editJSONTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_JSON),
                jsonEditViewConfig = { elementId: prefixId, view: "JsonEditorView", viewConfig: [] };

            var editLayout = editJSONTemplate({prefixId: prefixId}),
                disableId, modelAttr, self = this;
            self.model.model().attributes = options['checkedRows'][0];
            cowu.createModal({
                modalId: modalId,
                className: 'modal-980',
                title: options['title'],
                body: editLayout,
                onSave: function () {
                    var callbackObj = {
                        init: function () {
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            options['callback']();
                            $("#" + modalId).modal('hide');
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                showError(error.responseText);
                            });
                        }
                    };
                    self.model.configure(options['checkedRows'], callbackObj, options['type']);
                },
                onCancel: function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                }
            });

            modelAttr = this.model.model().get('id');
            disableId = (modelAttr == null || modelAttr == '') ? false : true;

            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"), this.model, jsonEditViewConfig, smwc.KEY_CONFIGURE_VALIDATION, null, null, function() {
                Knockback.applyBindings(self.model, document.getElementById(modalId));
            });
        }
    });

    var showError = function(message){
        $(".edit-json-error").remove();
        $(".modal-body").prepend("<div class='alert alert-error edit-json-error'><strong>Error: </strong><span>" + message + "</span></div>");
    }

    return JSONEditView;
});