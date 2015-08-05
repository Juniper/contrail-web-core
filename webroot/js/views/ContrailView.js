/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ContrailView = Backbone.View.extend({
        constructor: function () {
            var self = this;

            self.isMyRenderInProgress = false;
            self.childViewMap = {};

            Backbone.View.apply(self, arguments);

            //The top view may not have any argument.
            if(arguments.length > 0) {
                self.rootView = arguments[0].rootView;
            }

            return self;
        },

        isAnyRenderInProgress: function() {
            var isChildRenderInProgress = false;

            for(var key in this.childViewMap) {
                if(this.childViewMap[key].isAnyRenderInProgress()) {
                    isChildRenderInProgress = true;
                    break;
                }
            }

            return isChildRenderInProgress && this.isMyRenderInProgress && this.isModelRequestInProgress();
        },

        isModelRequestInProgress: function() {
            //TODO: We have to implement this function
            return false;
        },

        renderView4Config: function (parentElement, model, viewObj, validation, lockEditingByDefault, modelMap) {
            var viewName = viewObj['view'],
                elementId = viewObj[cowc.KEY_ELEMENT_ID],
                validation = (validation != null) ? validation : cowc.KEY_VALIDATION,
                visible = (viewObj['visible'] != null) ? viewObj['visible'] :  true,
                viewAttributes = {viewConfig: viewObj[cowc.KEY_VIEW_CONFIG], elementId: elementId, validation: validation, lockEditingByDefault: lockEditingByDefault, visible: visible},
                app = viewObj['app'], renderedView;

            var rootView = contrail.checkIfExist(this.rootView) ? this.rootView : this;
            renderedView = cowu.renderView(viewName, parentElement, model, viewAttributes, modelMap, app, rootView);

            // Adding child view to a map in rootView
            add2RootViewMap(elementId, renderedView, rootView);

            // Adding child view to a childViewMap in current view
            add2ChildViewMap(elementId, renderedView, this);

            return renderedView;
        },

        add2ChildViewMap: function(childElId, childRenderedView) {
            this.childViewMap[childElId] = childRenderedView;
        },

        getViewConfig: function() {
            return this.attributes.viewConfig;
        }
    });

    function add2RootViewMap(childElId, chRenderedView, rootView) {
        if(!contrail.checkIfExist(rootView.viewMap)) {
            rootView.viewMap = {};
        }
        rootView.viewMap[childElId] = chRenderedView;
    }

    function add2ChildViewMap (childElId, chRenderedView, self) {
        self.childViewMap[childElId] = chRenderedView;
    }

    return ContrailView;
});