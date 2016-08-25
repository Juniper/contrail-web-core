/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var AccordianView = ContrailView.extend({
        render: function () {
            var accordianTempl = contrail.getTemplate4Id(cowc.TMPL_ACCORDIAN_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                dataPath = this.attributes.dataPath,
                dataRootViewPath = this.attributes.dataRootViewPath,
                validation = this.attributes.validation,
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                errorObj = this.model.model().get(cowc.KEY_MODEL_ERRORS),
                childViewObj, childElId, childElIdArray;

            this.$el.html(accordianTempl({viewConfig: viewConfig, elementId: elId, dataPath: dataPath, dataRootViewPath: dataRootViewPath}));
            var isActive;
            for (var i = 0; i < viewConfig.length; i++) {
                childViewObj = viewConfig[i];
                childElId = childViewObj[cowc.KEY_ELEMENT_ID];
                isActive = childViewObj.active;
                this.model.showErrorAttr(childElId, getKOComputedError(viewConfig[i], this));

                this.renderView4Config(this.$el.find("#" + childElId), this.model, childViewObj, validation, lockEditingByDefault);
            }

             var accordianOptions = {
                   heightStyle: "content",
                    collapsible: true
                };
            if(isActive != null) {
                if (isActive === false) {
                    accordianOptions['active'] = false;
                } else {
                    accordianOptions['active'] = isActive;
                }
            }
            this.$el.find("#" + elId).accordion(accordianOptions);
        }
    });

    var getKOComputedError = function (childViewObj, that) {
        var childElIdArray = getElementIds4Section(childViewObj[cowc.KEY_VIEW_CONFIG]),
            koComputedFunc = ko.computed(function () {
                var value = false;
                for(var i = 0; i < childElIdArray.length; i ++) {
                    var item = childElIdArray[i],
                        errorName = item + cowc.ERROR_SUFFIX_ID;
                    if(item != null && this.model.errors()[errorName] != null) {
                        var idError = this.model.errors()[errorName]();

                        if (idError) {
                            value = true;
                        }
                    }
                };
                return value;
            }, that);

        return koComputedFunc;
    };

    var getElementIds4Section = function (sectionConfig) {
        var rows = sectionConfig[cowc.KEY_ROWS],
            columns, elementIds = [];
        for (var i = 0; i < rows.length; i++) {
            columns = rows[i][cowc.KEY_COLUMNS];
            for (var j = 0; j < columns.length; j++) {
                elementIds.push(columns[j][cowc.KEY_ELEMENT_ID]);
            }
        }
        return elementIds;
    };

    return AccordianView;
});
