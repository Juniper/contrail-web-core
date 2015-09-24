/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var QueryWhereView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM),
                queryPrefix = self.model.query_prefix(),
                modalId = queryPrefix + cowl.QE_WHERE_MODAL_SUFFIX,
                whereTmplHtml = editTemplate({prefixId: queryPrefix});

            cowu.createModal({
                'modalId': modalId, 'className': 'modal-700', 'title': cowl.TITLE_QE_WHERE, 'body': whereTmplHtml, 'onSave': function () {
                    self.model.saveWhere({
                        init: function () {
                            self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            if (contrail.checkIfExist(renderConfig) && contrail.checkIfFunction(renderConfig['callback'])) {
                                renderConfig['callback']();
                            }
                            $("#" + modalId).modal('hide');
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, error.responseText);
                            });
                        }
                    }); // TODO: Release binding on successful configure
                }, 'onCancel': function () {
                    $("#" + modalId).modal('hide');
                }
            });

            self.renderView4Config($("#" + queryPrefix + "-form"), this.model, viewConfig, null, null, null, function() {
                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    return QueryWhereView;
});