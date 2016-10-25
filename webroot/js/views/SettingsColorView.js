/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var SettingsColorView = ContrailView.extend({
        render: function(options) {
            var self = this;
            self.renderView4Config(self.$el, self.model,
                getColorViewConfig(),
                null, null, null, function() {
                Knockback.applyBindings(self.model,
                    document.getElementById(options.modalId));
                self.renderColorPalette(options.modalId);
            });
        },

        renderColorPalette: function(modalId) {
            var self = this;
            var colorTemplate =
                contrail.getTemplate4Id(cowc.TMPL_SETTINGS_COLOR_VIEW)();
            $("#" + modalId).find(".modal-body").append(colorTemplate);
            self.showSchemes(modalId);
        },

        showSchemes: function(modalId) {
            var self = this,
                model = self.model,
                schemeNames = model.schemeNames(),
                colors = model.colors();
            $("#palettes").empty();
            for (var i=0; i<schemeNames.length; i++){
                var schemeName = schemeNames[i];
                var palette = $("<div class='palette "+ schemeName + 
                    "' title='" + schemeName + "'></div>"),
                    svg = "<svg class='swatch'>";
                for ( var n = 0; n < 5; n++ ){
                    svg += "<rect height=15 width=15 fill="+
                    colors[schemeName][5][n]+
                    " y='"+n*15+"'/>";
                }
                svg += "</svg>";
                $("#palettes").append(palette.append(svg).click( function(){
                    if ( $(this).hasClass("selected") ) return;
                    self.setScheme( $(this).attr("class").split(" ")[1] );
                }));
            }

            if ( model.selectedScheme().trim() != "" &&
                $(".palette."+model.selectedScheme())[0] ){
                self.setScheme( model.selectedScheme() );
            }
            var paletteEl = $("#palettes")[0];
            if(paletteEl.scrollHeight > paletteEl.clientHeight ||
                paletteEl.scrollWidth > paletteEl.clientWidth) {
                var moreColorTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_SETTINGS_COLOR_MORE)();
                $("#" + modalId).find(".modal-body").append(moreColorTemplate);
                $("#more_btn").on("click", function(e) {
                    $('#palettes').toggleClass('more');
                    if($('#palettes').hasClass('more')) {
                        $(this).html('Less <span class=\'fa fa-caret-up\' />');
                        $('#palettes').css('overflow','auto');
                    } else {
                        $(this).html('More <span class=\'fa fa-caret-down\' />');
                        $('#palettes').scrollTop(0);
                        $('#palettes').css('overflow','hidden');
                    };
                    return false;
                });
            }
        },
        setScheme: function(s) {
            var self = this,
                model = self.model,
                numClasses = parseInt(model.numClasses()),
                colors = model.colors();

            $(".palette.selected").removeClass("selected");
            model.selectedScheme(s);
            $(".palette."+s).addClass("selected");
            model.modifyColorScheme(s);
            cowu.notifySettingsChange(this);
            var cssString = "";
            for ( var i = 0; i < numClasses; i ++ ){
                cssString += "."+s+" .q"+i+"-"+numClasses+"{fill:" + 
                    colors[s][numClasses][i] + "}";
                if ( i < numClasses - 1 ) cssString += " ";
            }
        }
    });

    function getColorViewConfig() {
        var csConfig = {
            elementId: "colorFilters",
            view: "SectionView",
            viewConfig: {
                rows: []
            }
        }
        return csConfig;
    }

    return SettingsColorView;
});
