/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreLabels = function () {
        this.get = function (key, app) {

            var label = null,
                featurePackages = globalObj.webServerInfo.featurePkg;

            if(contrail.checkIfExist(app)) {
                if (app == cowc.APP_CONTRAIL_CONTROLLER) {
                    label = ctwl.get(key)
                } else if (app == cowc.APP_CONTRAIL_SM) {
                    label = smwl.get(key);
                } else if (app == cowc.APP_CONTRAIL_STORAGE) {
                    label = swl.get(key);
                }
            } else {
                label = this.getCoreLabel(key);

                if (!contrail.checkIfExist(label) && featurePackages.webController && typeof ctwl !== 'undefined' && ctwl.isExistKey(key)) {
                    label = ctwl.get(key);
                }

                if (!contrail.checkIfExist(label) && featurePackages.serverManager && typeof smwl !== 'undefined' && smwl.isExistKey(key)) {
                    label = smwl.get(key);
                }

                if (!contrail.checkIfExist(label) && featurePackages.webStorage && typeof swl !== 'undefined' && swl.isExistKey(key)) {
                    label = swl.get(key);
                }

                if (!contrail.checkIfExist(label)) {
                    var keyArray = key.split('.'),
                        newKey = keyArray[keyArray.length - 1];

                    label = capitalizeSentence(cowu.replaceAll("_", " ", newKey));
                }
            }

            return label;
        };

        this.getCoreLabel = function(key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return labelMap[key];
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return labelMap[newKey];
                }
            }

            return null;
        };

        this.getInLowerCase = function (key) {
            var label = this.get(key);
            return label.toLowerCase();
        };

        this.getInUpperCase = function (key) {
            var label = this.get(key);
            return label.toUpperCase();
        };

        this.getFirstCharUpperCase = function (key) {
            var label = this.get(key);

            label = label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            return label;
        };

        var labelMap = {};

        this.TITLE_DETAILS = "Details";
        this.TITLE_OVERVIEW = "Overview";
        this.TITLE_QE_SELECT = "Select";
        this.TITLE_CHART = "Chart";
        this.TITLE_QE_WHERE = "Where";

        this.BREADCRUMB_ID = "breadcrumb";

        this.QE_SELECT_MODAL_SUFFIX = '-select-modal';
        this.QE_CHART_ID = 'qe-chart';
        this.QE_CHART_GRID_ID = 'qe-chart-grid';
        this.QE_CHART_PAGE_ID = 'qe-chart-page';
        this.QE_CHART_ID = 'qe-chart';
        this.QE_WHERE_MODAL_SUFFIX = '-where-modal';
    };

    function capitalizeSentence(sentence) {
        var word = sentence.split(" ");
        for ( var i = 0; i < word.length; i++ ) {
            word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
        }
        return word.join(" ");
    };

    return CoreLabels;
});