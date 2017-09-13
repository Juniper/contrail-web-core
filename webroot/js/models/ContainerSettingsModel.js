/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'backbone', 'contrail-model'],
    function(_, Backbone, ContrailModel) {
    var containerSettingsModel = ContrailModel.extend({
        defaultConfig : {},
        saveSettings: function() {
            var newAttributes = $.extend({}, this.model().attributes);
            localStorage.setItem(
                'container_' + layoutHandler.getURLHashObj().p + '_settings',
                JSON.stringify(ctwu.deleteCGridData(newAttributes)));
        },
        onSave: function() {},
        onCancel: function(options, args) {},
        formatModelConfig: function (modelConfig) {
            var curSettings = localStorage.getItem(
                'container_' + layoutHandler.getURLHashObj().p + '_settings');
            if(curSettings) {
                curSettings = JSON.parse(curSettings);
                for(var key in curSettings) {
                    modelConfig[key] = curSettings[key];
                }
            }
            return modelConfig;
        }
    });
    return containerSettingsModel;
});