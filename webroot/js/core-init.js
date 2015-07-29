/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var initDepFiles = [
    'validation', 'handlebars-utils', 'contrail-common', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils', 'dashboard-utils',
    'joint.contrail', 'text', 'contrail-all-8', 'contrail-all-9', 'nvd3v181'
];

require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
    window.ko = Knockout;
    window.Bezier = Bezier;
    loadCommonTemplates();
    require(initDepFiles, function(validation) {
        require(['core-utils', 'core-constants', 'core-formatters', 
                 'core-cache', 'core-labels', 'core-messages', 'layout-handler',
                 'text!templates/core.common.tmpl', 
                 'js/views/BreadcrumbDropDownView'],
            function (CoreUtils, CoreConstants, CoreFormatters, Cache, 
                      CoreLabels, CoreMessages, LayoutHandler, 
                      CoreCommonTmpls, BreadcrumbDropDownView) {
                cowc = new CoreConstants();
                cowu = new CoreUtils();
                cowf = new CoreFormatters();
                cowl = new CoreLabels();
                cowm = new CoreMessages();
                cobdcb = new BreadcrumbDropDownView();
                kbValidation = validation;
                cowch = new Cache();
                initBackboneValidation();
                initCustomKOBindings(Knockout);
                initDomEvents();
                layoutHandler = new LayoutHandler();
                $("body").append(CoreCommonTmpls);
                require(['contrail-layout'], function(){});
            });
    });
});

function loadCommonTemplates() {
    //Set the base URI
    if (document.location.pathname.indexOf('/vcenter') == 0)
        $('head').append('<base href="/vcenter/" />');
    templateLoader = (function ($, host) {
        //Loads external templates from path and injects in to page DOM
        return {
            loadExtTemplate: function (path, deferredObj, containerName) {
                //Load the template only if it doesn't exists in DOM
                var tmplLoader = $.ajax({url: path})
                    .success(function (result) {
                        //Add templates to DOM
                        if (containerName != null) {
                            $('body').append('<div id="' + containerName + '"></div>');
                            $('#' + containerName).append(result);
                        } else
                            $("body").append(result);
                        if (deferredObj != null)
                            deferredObj.resolve();
                    })
                    .error(function (result) {
                        if (result['statusText'] != 'abort')
                            showInfoWindow("Error while loading page.", 'Error');
                    });

                tmplLoader.complete(function () {
                    $(host).trigger("TEMPLATE_LOADED", [path]);
                });
            }
        };
    })(jQuery, document);
};

