/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + cowl.ALARMS_GRID_ID;
    var prefixId = cowl.ALARM_PREFIX_ID;
    var modalId = 'modal-ack-' + prefixId ;

    var alarmsEditView = ContrailView.extend({

        renderAckAlarms: function(options) {
            var ackTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-ack-alarm-form-template');
            var self = this;

            var ackLayout = ackTemplate({prefixId: prefixId});
            /* the below line is required to solve Maximum
            call stack size exceeded issue  */
            $.fn.modal.Constructor.prototype.enforceFocus = function() {};
            cowu.createModal({'modalId': modalId, 'className': 'modal-480 max-z-index',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': ackLayout,
               'onSave': function () {
                self.model.ackAlarms(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });
    return alarmsEditView;
});
