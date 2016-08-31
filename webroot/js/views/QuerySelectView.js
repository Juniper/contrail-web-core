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
                viewConfig = self.attributes.viewConfig,
                selectTemplate = contrail.getTemplate4Id(ctwc.TMPL_QUERY_SELECT),
                selectDataObject = self.model.select_data_object(),
                selectFields = $.makeArray(selectDataObject.select_fields()),
                queryPrefix = self.model.query_prefix(),
                aggregateTypes = ["Time Range"], selectTmplData, selectTmplHtml,
                queryPrefix = self.model.query_prefix(),
                modalId = queryPrefix + cowl.QE_SELECT_MODAL_SUFFIX,
                className = viewConfig['className'],
                specialQueryPrefix = false;

            _.each(selectFields, function(selectFieldValue, selectFieldKey) {
                aggregateTypes.push(selectFieldValue['aggregate_type']);
            });

            if(queryPrefix == cowc.FS_QUERY_PREFIX || queryPrefix == cowc.STAT_QUERY_PREFIX){
                specialQueryPrefix = true;
            }

            selectTmplData = {
                queryPrefix: queryPrefix,
                fields: selectFields,
                aggregateTypes: _.intersection(cowc.SELECT_FIELDS_GROUPS, aggregateTypes),
                specialQueryPrefix:specialQueryPrefix
            };

            selectTmplHtml = selectTemplate(selectTmplData);

            cowu.createModal({
                'modalId': modalId, 'className': className, 'title': cowl.TITLE_QE_SELECT, 'body': selectTmplHtml, 'onSave': function () {
                    self.model.saveSelect({
                        init: function () {
                            self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            if (contrail.checkIfExist(renderConfig) && contrail.checkIfFunction(renderConfig['callback'])) {
                                renderConfig['callback']();
                            }

                            //TODO - Quick Fix to adjust the height of where textarea; Can be done in cleaner way
                            $(self.$el).find('[name="select"]')
                                .height(0)
                                .height($(self.$el).find('[name="select"]').get(0).scrollHeight - 5);

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