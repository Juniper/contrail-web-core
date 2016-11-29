/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view',
    'toolbar',
    'contrail-list-model'
], function (_, Backbone, ContrailView, toolbar, ContrailListModel) {
    var cfgObj, isSaveClicked = false;
    var ToolbarView = ContrailView.extend({
        initialize: function (options) {
            var self = this,
                eleSettings = "#toolbar_settings",
                eleSettingItems = "#toolbar_options",
                eleSettingsParentStyle = "toolbar_settings_parent"
                template = contrail.getTemplate4Id("toolbar-settings"),
                toolBarContent = contrail.getTemplate4Id("toolbar-options-template");
            self.$el.html(template());
            $(".tool-container").remove();
            $(self.$el).append(toolBarContent());
            self.settings = cowu.getValueByJsonPath(options,
                    "attributes;viewConfig;settings", []);
            _.each(self.settings, function(setting) {
                var iconHtml = '<a id="' + setting.id + '" href="#"><i class="fa ' +
                    self.getStyleClassForIcon(setting.id) + '"></i></a>';
                $(eleSettingItems).append(iconHtml);
            });
            self.toolbar = $(eleSettings).toolbar({
                content: eleSettingItems,
                position: "left",
                adjustment: 35,
                event: 'click',
                hideOnClick: true
            }).data('toolbar');
            $(eleSettings).on('toolbarHidden', function(){
                $(".tool-container").removeClass("show-tool-container");
                $("#" + cowc.SETTINGS_MODAL_ID).modal("hide");
                if(!isSaveClicked && cfgObj && cfgObj.model) {
                    cfgObj.model.onCancel();
                }
                self.removeSelectedClass()
            });
            $(eleSettings).on('toolbarItemClick', function(event, item){
                self.renderOnClick($(item).attr('id'));
            });
            $($("#toolbar_section").parent()).addClass(eleSettingsParentStyle);
        },

        removeSelectedClass: function() {
            var self = this;
            _.each(self.settings, function(setting) {
                $(".tool-items #" + setting.id).removeClass("selected");
            });
        },

        renderOnClick: function(id) {
           var self = this,
           curSetting =  _.find(self.settings, function(setting) {
                                 return setting.id === id;
                         });
           var modalId = cowc.SETTINGS_MODAL_ID,
           prefixId = cowc.SETTINGS_PREFIX_ID,
           formId = prefixId + '_modal',
           modalTemplate =
               contrail.getTemplate4Id('core-modal-template'),
           modalLayout = modalTemplate({
               prefixId: prefixId, modalId: modalId}), modalConfig;
           cfgObj = ifNull(cfgObj,{});
           isSaveClicked = false;
           self.removeSelectedClass();
           $(".tool-items #" + id).addClass("selected");
           modalConfig = {
                       'modalId': modalId,
                       'body': modalLayout,
                       'className': 'modal-280',
                       'title': curSetting.title,
                       'targetId': ".tool-container #" + curSetting.id,
                       'onSave': function() {
                           if(cfgObj.model) {
                               isSaveClicked = true;
                               cfgObj.model.onSave();
                           }
                           $("#" + modalId).modal('hide');
                       },
                       'onCancel': function() {
                           if(cfgObj.model) {
                               isSaveClicked = false;
                               cfgObj.model.onCancel();
                           }
                           $("#" + modalId).modal('hide');
                       }
                   };

           cowu.createPopoverModal(modalConfig);

           require([curSetting.model],
                   function(SettingsModel) {
                       var csModel = new SettingsModel();
                       if(cfgObj.model &&
                           !(cfgObj.model instanceof SettingsModel)){
                           cfgObj.model.onCancel();
                       }
                       cfgObj.model = csModel;
                       require([curSetting.view],
                           function(SettingsView) {
                           var settingsView = new SettingsView({
                               el:$("#" + modalId).find('#' + formId),
                               viewConfig:{}
                           });
                           settingsView.model = cfgObj.model;
                           settingsView.render({
                               modalId: modalId
                           });
                       });
                   });
        },

        getStyleClassForIcon: function (id) {
            var classStyle;
            switch(id){
                case cowc.COLOR_PALETTE :
                    classStyle = cowc.COLOR_PALETTE_CLASS;
                    break;
                case cowc.CHART_SETTINGS :
                    classStyle = cowc.CHART_SETTINGS_CLASS;
                    break;
                default:
                    calssStyle = cowc.COLOR_PALETTE_CLASS;
            }
            return classStyle;
        }
    });
    return ToolbarView;
});

