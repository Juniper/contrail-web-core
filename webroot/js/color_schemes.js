  /*
   * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
   */
  define(['palette'], function (Palette) {
         function getColor(numberOfColors) {
             var NUMBER_OF_COLORS = 6;
                 schemeNames = [
                       'tol', 'tol-dv', 'tol-sq', 'tol-rainbow',
                       'cb-sequential', 'cb-diverging', 'cb-qualitative',
                       'sol-base', 'sol-accent'
                 ],
                 colorPalettes = {};
             try {
                    if(numberOfColors && typeof numberOfColors == "number" &&
                           parseInt(numberOfColors) <= Number(cowc.NUM_OF_COLORS) + 1) {
                           numberOfColors = parseInt(numberOfColors);
                    } else {
                           numberOfColors = NUMBER_OF_COLORS;
                    }
             } catch(e) {
                    numberOfColors = NUMBER_OF_COLORS;
             }

             for(var i = 0; undefined != schemeNames[i]; i++) {
                    var schemes = palette.listSchemes(schemeNames[i]),
                           schemesLen = schemes.length;

                    for(var j = 0; j < schemesLen; j++) {
                           var scheme_name = schemes[j]["scheme_name"];
                           colorPalettes[scheme_name] = {};
                           var colorCode =
                           palette.listSchemes(scheme_name)[0](numberOfColors);
                           //remove very lite color
                           colorCode.splice(0, 1);
                           var hexCodes = colorCode.map(function(x){
                                  return "#"+x;
                           })
                           colorPalettes[scheme_name][numberOfColors] = hexCodes;
                    }
             }
             return colorPalettes;
         };
         return getColor;
  });