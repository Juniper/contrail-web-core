/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'backbone', 'contrail-model', 
    'colorbrewer-scheme', 'cmyk',
    '../contrail_custom_colors'],
    function(_, Backbone, ContrailModel, ColorBrewerScheme, CMYK,
        CustomColors) {
    var SettingsColorModel = ContrailModel.extend({
        defaultConfig : {
            colorbrewer: ColorBrewerScheme.colorbrewer,
            cmyk: CMYK,
            customColors: CustomColors,
            schemeNames : ColorBrewerScheme.scheme,
            selectedScheme: "",
            colorSystem: "rgb",
            numClasses: 5,
            fallbackColors: {
                SINGLE_NODE_COLOR: cowc.SINGLE_NODE_COLOR,
                THREE_NODE_COLOR: cowc.THREE_NODE_COLOR,
                FIVE_NODE_COLOR: cowc.FIVE_NODE_COLOR
            }
        },
        modifyColorScheme: function(selectedScheme) {
            var cookieScheme =
                contrail.getCookie(cowc.COOKIE_COLOR_SCHEME),
                colorObj = {
                    SINGLE_NODE_COLOR : this.fallbackColors().SINGLE_NODE_COLOR,
                    THREE_NODE_COLOR  : this.fallbackColors().THREE_NODE_COLOR,
                    FIVE_NODE_COLOR   : this.fallbackColors().FIVE_NODE_COLOR
                };
            if(selectedScheme != undefined && selectedScheme != false &&
                this.colorbrewer().hasOwnProperty(selectedScheme) &&
                this.colorbrewer()[selectedScheme].hasOwnProperty("5")) {
                var userColors = $.merge([],
                    this.colorbrewer()[selectedScheme][5]).reverse(),
                    colorObj = {
                        SINGLE_NODE_COLOR : userColors.slice(0,1),
                        THREE_NODE_COLOR  : userColors.slice(0,3),
                        FIVE_NODE_COLOR   : userColors
                    };
            }
            cowc.SINGLE_NODE_COLOR = colorObj.SINGLE_NODE_COLOR;
            cowc.THREE_NODE_COLOR  = colorObj.THREE_NODE_COLOR;
            cowc.FIVE_NODE_COLOR  = colorObj.FIVE_NODE_COLOR;
        },
        onSave: function(options, args) {            
            contrail.setCookie(cowc.COOKIE_COLOR_SCHEME, this.selectedScheme());
            cowu.notifySettingsChange(this);
        },
        onCancel: function(options, args) {
            var selectedScheme =
                contrail.getCookie(cowc.COOKIE_COLOR_SCHEME);
            this.modifyColorScheme(selectedScheme);
            cowu.notifySettingsChange(this);
        },
        reorderSchemes: function(modelConfig) {
            var allSchemeNames = [];
            for(var color in modelConfig.customColors) {
                modelConfig.colorbrewer[color] =
                    modelConfig.customColors[color];
            }
            for(var sch in modelConfig.schemeNames) {
                allSchemeNames = allSchemeNames.concat(
                    modelConfig.schemeNames[sch]);
                delete modelConfig.schemeNames[sch];
            }
            var customSchemes = [];
            for(var color in modelConfig.customColors) {
                customSchemes.push(color);
            }
            allSchemeNames = customSchemes.concat(allSchemeNames);
            var selectedScheme =
                contrail.getCookie(cowc.COOKIE_COLOR_SCHEME);
            if(selectedScheme != undefined &&
                allSchemeNames.indexOf(selectedScheme) != -1) {
                    allSchemeNames.splice(
                        allSchemeNames.indexOf(selectedScheme), 1);
                allSchemeNames = 
                [selectedScheme].concat(allSchemeNames);
            }
            allSchemeNames = allSchemeNames.unique();
            modelConfig.schemeNames = allSchemeNames;
            return modelConfig;
        },
        formatModelConfig: function (modelConfig) {
            modelConfig = this.reorderSchemes(modelConfig);
            var selectedScheme =
                contrail.getCookie(cowc.COOKIE_COLOR_SCHEME);
            if(selectedScheme != undefined &&
                selectedScheme != "") {
                modelConfig["selectedScheme"] =
                    selectedScheme;
            }
            return modelConfig;
        }
    });
    return SettingsColorModel;
});