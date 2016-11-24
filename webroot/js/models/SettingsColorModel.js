  /*
   * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
   */

  define(['underscore', 'backbone', 'contrail-model',
      'color-scheme', '../contrail_custom_colors'],
                 function(_, Backbone, ContrailModel, ColorScheme,
          CustomColors) {
      var SettingsColorModel = ContrailModel.extend({
          defaultConfig : {
              colors: ColorScheme(Number(cowc.NUM_OF_COLORS)),
              customColors: CustomColors,
              schemeNames: [],
              selectedScheme: "",
              numClasses: 6,
              fallbackColors: {
                  SINGLE_NODE_COLOR: cowc.SINGLE_NODE_COLOR,
                  THREE_NODE_COLOR: cowc.THREE_NODE_COLOR,
                  FIVE_NODE_COLOR: cowc.FIVE_NODE_COLOR
              }
          },

          modifyColorScheme: function(selectedScheme) {
              try {
                  var cookieSchemeData =
                      JSON.parse(contrail.getCookie(cowc.COOKIE_COLOR_SCHEME)),
                      cookieScheme = cookieSchemeData.name,
                      colorObj = {
                          SINGLE_NODE_COLOR : this.fallbackColors().SINGLE_NODE_COLOR,
                          THREE_NODE_COLOR  : this.fallbackColors().THREE_NODE_COLOR,
                          FIVE_NODE_COLOR   : this.fallbackColors().FIVE_NODE_COLOR
                      };
                  if(selectedScheme != undefined && selectedScheme != false &&
                      this.colors().hasOwnProperty(selectedScheme) &&
                      this.colors()[selectedScheme].hasOwnProperty(cowc.NUM_OF_COLORS)) {
                      var userColors = $.merge([],
                          this.colors()[selectedScheme][Number(cowc.NUM_OF_COLORS)]).reverse(),
                          colorObj = {
                              SINGLE_NODE_COLOR : userColors.slice(0,1),
                              THREE_NODE_COLOR  : userColors.slice(0,3),
                              FIVE_NODE_COLOR   : userColors
                          };
                  }
                  cowc.DEFAULT_COLOR = colorObj.SINGLE_NODE_COLOR;
                  cowc.SINGLE_NODE_COLOR = colorObj.SINGLE_NODE_COLOR;
                  cowc.THREE_NODE_COLOR  = colorObj.THREE_NODE_COLOR;
                  cowc.FIVE_NODE_COLOR  = colorObj.FIVE_NODE_COLOR;
              }
              catch(e){

              }
          },

          onSave: function(options, args) {
              var selectedScheme = this.selectedScheme();
             if(selectedScheme != undefined && selectedScheme != false &&
                      this.colors().hasOwnProperty(selectedScheme) &&
                      this.colors()[selectedScheme].hasOwnProperty(cowc.NUM_OF_COLORS)) {
                      var userColors = $.merge([],
                          this.colors()[selectedScheme][Number(cowc.NUM_OF_COLORS)]).reverse(),
                          colorObj = {
                              SINGLE_NODE_COLOR : userColors.slice(0,1),
                              THREE_NODE_COLOR  : userColors.slice(0,3),
                              FIVE_NODE_COLOR   : userColors
                          };
              }
              contrail.setCookie(cowc.COOKIE_COLOR_SCHEME, JSON.stringify({name: selectedScheme, color: colorObj}));
          },

          onCancel: function(options, args) {
              try{
                   var selectedScheme =
                       JSON.parse(contrail.getCookie(cowc.COOKIE_COLOR_SCHEME));
                   this.modifyColorScheme(selectedScheme.name);
                   cowu.notifySettingsChange();
              }
              catch(e){

              }
          },

          reorderSchemes: function(modelConfig) {
              var allSchemeNames = [];
              for(var color in modelConfig.colors) {
                  allSchemeNames.push(color);
              }
              var customSchemes = [],
              custColors = getValueByJsonPath(modelConfig,
                      "customColors;first", []),
              trendColors= getValueByJsonPath(modelConfig,
                      "customColors;last", []);
              for(var color in custColors) {
                  modelConfig.colors[color] = custColors[color];
                  customSchemes.push(color);
              }
              allSchemeNames = customSchemes.concat(allSchemeNames);
              for(var color in trendColors) {
                  modelConfig.colors[color] = trendColors[color];
                  allSchemeNames.push(color);
              }
              allSchemeNames = allSchemeNames.unique();
              modelConfig.schemeNames = allSchemeNames;
              return modelConfig;
          },

          formatModelConfig: function (modelConfig) {
              modelConfig = this.reorderSchemes(modelConfig);
              var selectedScheme =
                  JSON.parse(contrail.getCookie(cowc.COOKIE_COLOR_SCHEME));
              if(selectedScheme != undefined &&
                  selectedScheme != "") {
                  modelConfig["selectedScheme"] =
                      selectedScheme.name ? selectedScheme.name : "";
              }
              return modelConfig;
          }
      });
      return SettingsColorModel;
  });