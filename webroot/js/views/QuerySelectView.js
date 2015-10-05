/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var QuerySelectView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                selectTemplate = contrail.getTemplate4Id(ctwc.TMPL_QUERY_SELECT),
                queryPrefix = self.model.query_prefix(),
                modalId = queryPrefix + cowl.QE_SELECT_MODAL_SUFFIX;

            var selectDataObject = self.model.select_data_object(),
                selectTmplData = {queryPrefix: self.model.query_prefix(), fields: $.makeArray(selectDataObject.select_fields)},
                selectTmplHtml = selectTemplate(selectTmplData);

            cowu.createModal({
                'modalId': modalId, 'className': 'modal-980', 'title': cowl.TITLE_QE_SELECT, 'body': selectTmplHtml, 'onSave': function () {
                    self.model.saveSelect({
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

            Knockback.applyBindings(self.model, document.getElementById(modalId));
        }
    });

    return QuerySelectView;
});