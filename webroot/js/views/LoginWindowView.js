/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var prefixId = 'loginWindow';
    var modalId = 'loginWindowModal';
    var formId = '#' + modalId + '-form';

    var LoginWindowView = ContrailView.extend({
        renderLoginWindow: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-420',
                             'title': 'Login', 'body': editLayout,
                             'onSave': function () {
                self.model.doLogin(options['data'],{
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function (response) {
                        options['callback'](response);
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                    this.model,
                    getLoginWindowViewConfig(),
                    "loginValidations",
                    null,
                    null,
                    function() {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                false);
                        Knockback.applyBindings(self.model, document.
                                getElementById(modalId));
                        kbValidation.bind(self);
                    }
            );
        },
    });

    function getLoginWindowViewConfig () {
//        var prefixId = ctwl.LINK_LOCAL_SERVICES_PREFIX_ID;
        var loginViewConfig = {
            elementId: cowu.formatElementId([prefixId, 'Login']),
            title: 'Login',
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'user_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'user_name',
                                    class: 'span12',
                                    icon:'icon-cog',
                                    dataBindValue: 'user_name'
                                }
                            }
                        ]
                    },
                    {
                        columns :[
                            {
                                elementId: 'password',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'password',
                                    type: 'password',
                                    class: 'span12',
                                    icon: 'icon-cog',
                                    dataBindValue: 'password',
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return loginViewConfig;
    }

    return LoginWindowView;
});

