/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormTextAreaView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                textAreaTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_TEXTAREA_VIEW),
                elId = self.attributes.elementId,
                app = self.attributes.app,
                validation = self.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                placeHolder = contrail.checkIfExist(viewConfig['placeHolder']) ? viewConfig['placeHolder'] : null,
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                label = viewConfig.label,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                showEditIcon = contrail.checkIfExist(viewConfig['editPopupConfig']) ? true : false,
                helpUrl = viewConfig['help'],
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            self.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, placeHolder: placeHolder, viewConfig: viewConfig,
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE], lockAttr: lockEditingByDefault, type: type,
                path: path, validation: validation, showEditIcon: showEditIcon,
                help: helpUrl
            };

            self.$el.html(textAreaTemplate(tmplParameters));

            if(showEditIcon) {
                self.$el.find(".input-group-addon").on("click", function(event) {
                    if (!$(this).hasClass('disabled')) {
                        viewConfig['editPopupConfig'].renderEditFn(event)
                    }
                });
            }

            self.$el.find('textarea')
                .off('input')
                .on('input', function() {
                    var scrollHeight = $(this).get(0).scrollHeight;
                    $(this).outerHeight((scrollHeight < 26) ? 26 : (scrollHeight));
                });
        }
    });

    return FormTextAreaView;
});
