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
                prefix = settingType = cowu.getValueByJsonPath(options,
                              "attributes;viewConfig;prefix", ''),
                eleSettings = "#"+prefix+"toolbar_settings",
                eleSettingItems = "#"+prefix+"toolbar_options",
                toolContainer = "."+prefix+"tool-container",
                eleSettingsParentStyle = "toolbar_settings_parent",
                template = contrail.getTemplate4Id("toolbar-settings"),
                toolBarContent = contrail.getTemplate4Id("toolbar-options-template"),
                settingType = cowu.getValueByJsonPath(options,
                              "attributes;viewConfig;settings_type", ''),
                menuIconClass = settingType == 'container' ?
                             cowc.CONTAINER_MENU_CLASS : cowc.CHART_MENU_CLASS;
            self.$el.html(template({
              icon : menuIconClass,
              id: prefix+"toolbar_settings"
            }));
            $(toolContainer).remove();
            $(self.$el).append(toolBarContent({
              id: prefix+"toolbar_options"
            }));

            self.settings = cowu.getValueByJsonPath(options,
                    "viewCfg;settings", []);
            if(!self.settings.length) {
              self.settings = cowu.getValueByJsonPath(options,
                    "attributes;viewConfig;settings", []);
            }
            _.each(self.settings, function(setting) {
                var iconHtml = '<a id="' + setting.id + '" href="#"><i class="fa ' +
                    self.getStyleClassForIcon(setting.id) + '"></i></a>';
                $(eleSettingItems).append(iconHtml);
            });

            self.toolbar = $(eleSettings).toolbar({
                content: eleSettingItems,
                position: "left",
                adjustment: 65,
                event: 'click',
                hideOnClick: true
            }).data('toolbar');
            if(settingType == 'container') {
              $(eleSettings).on('toolbarShown', function() {
                  $('.tool-container').addClass('invisible');
                  self.renderOnClick({
                    id: self.settings[0].id,
                    targetId: eleSettings,
                    settingType: settingType,
                    toolContainer: toolContainer
                  });
              });
            } else {
              $(eleSettings).on('toolbarShown', function() {
                   $('.tool-container').removeClass('invisible');
              });
            }
            $(eleSettings).on('toolbarHidden', function(){
                $(toolContainer).removeClass("show-tool-container");
                $("#" + cowc.SETTINGS_MODAL_ID).modal("hide");
                if(!isSaveClicked && cfgObj && cfgObj.model) {
                    cfgObj.model.onCancel();
                }
                self.removeSelectedClass()
            });

            function closeToolbar() {
                $(toolContainer).hide();
                $('#toolbar_settings').removeClass('pressed');
            }
            $(eleSettings).on('toolbarItemClick', function(event, item){
                if($(item).attr('id') == cowc.FULL_SCREEN) {
                    cowu.toggleFullScreen();
                    closeToolbar();
                } else if($(item).attr('id') == cowc.ADD_WIDGET) {
                    var gridStackView = $('.carousel-content').data('ContrailView');
                    gridStackView.add();
                    $('.fa-info-circle:last').click();
                    closeToolbar();
                } else {
                    self.renderOnClick({
                      id:$(item).attr('id'),
                      toolContainer: toolContainer
                    });
                }
            });
            $($("#toolbar_section").parent()).addClass(eleSettingsParentStyle);
        },

        removeSelectedClass: function() {
            var self = this;
            _.each(self.settings, function(setting) {
                $(".tool-items #" + setting.id).removeClass("selected");
            });
        },

        renderOnClick: function(clickObj) {
           var self = this,
           curSetting =  _.find(self.settings, function(setting) {
                                 return setting.id === clickObj.id;
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
           $(".tool-items #" + clickObj.id).addClass("selected");
           modalConfig = {
                       'modalId': modalId,
                       'body': modalLayout,
                       'className': 'modal-280',
                       'title': curSetting.title,
                       'targetId': clickObj.targetId ? clickObj.targetId :
                                  clickObj.toolContainer+" #" + curSetting.id,
                       'onCancel': function() {
                           if(cfgObj.model) {
                               isSaveClicked = false;
                               cfgObj.model.onCancel();
                           }
                           $("#" + modalId).modal('hide');
                       }
                   };
          if(clickObj.settingType != 'container') {
            modalConfig.onSave = function() {
                   if(cfgObj.model) {
                       isSaveClicked = true;
                       //Hide the toolbar
                       $(clickObj.toolContainer).hide();
                       $('#toolbar_settings').removeClass('pressed');
                       cfgObj.model.onSave();
                   }
                   $("#" + modalId).modal('hide');
               };
          }

           cowu.createPopoverModal(modalConfig);

           require([curSetting.model],
                   function(SettingsModel) {
                       var optionsList = {};
                       if(typeof curSetting.options == 'function') {
                        _.each(curSetting.options().rows, function(options) {
                          _.each(options.columns, function(option) {
                             var optionId =  option.elementId;
                             optionsList[optionId] = (typeof option.default !=  'undefined')
                                                       ? option.default : true;
                          });
                        });
                       }

                       var csModel = optionsList != {} ? new SettingsModel(optionsList)
                                        : new SettingsModel();
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
                               modalId: modalId,
                               optionsConfig: curSetting.options
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
                case cowc.FULL_SCREEN :
                    classStyle = cowc.FULLSCREEN_CLASS;
                    break;
                case cowc.ADD_WIDGET :
                    classStyle = cowc.ADD_WIDGET_CLASS;
                    break;
                case cowc.CHART_SETTINGS :
                    classStyle = cowc.CHART_SETTINGS_CLASS;
                    break;
                case cowc.CONTAINER_SETTINGS :
                    classStyle = cowc.CONTAINER_SETTINGS_CLASS;
                    break;
                default:
                    calssStyle = cowc.COLOR_PALETTE_CLASS;
            }
            return classStyle;
        }
    });
    return ToolbarView;
});

