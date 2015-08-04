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

            self.onAllRenderComplete = new Slick.Event();

            Backbone.View.apply(self, arguments);

            //The top view may not have any argument.
            if(arguments.length > 0) {
                self.rootView = arguments[0].rootView;
                var onAllRenderCompleteCB = arguments[0].onAllRenderCompleteCB;

                if (contrail.checkIfFunction(onAllRenderCompleteCB)) {
                    self.onAllRenderComplete.subscribe(function() {
                        onAllRenderCompleteCB();
                    });
                }
            }

            return self;
        },

        isViewRenderInProgress: function() {
            var isChildRenderInProgress = false;

            for(var key in this.childViewMap) {
                if(this.childViewMap[key] == null || this.childViewMap[key].isViewRenderInProgress()) {
                    isChildRenderInProgress = true;
                    break;
                }
            }

            return isChildRenderInProgress || this.isMyRenderInProgress;
        },

        isAnyRenderInProgress: function() {
            //TODO: We have to implement this function
            return this.isViewRenderInProgress() || this.isModelRequestInProgress();
        },

        isModelRequestInProgress: function() {
            //TODO: We have to implement this function
            return false;
        },

        renderView4Config: function (parentElement, model, viewObj, validation,
            lockEditingByDefault, modelMap, onRenderCompleteCallback) {
            var viewName = viewObj['view'],
                viewPathPrefix = viewObj['viewPathPrefix'],
                elementId = viewObj[cowc.KEY_ELEMENT_ID],
                visible = (viewObj['visible'] != null) ?
                    viewObj['visible'] : true,
                label = viewObj['label'],
                validation = (validation != null) ? validation : cowc.KEY_VALIDATION,
                viewAttributes = {viewConfig: viewObj[cowc.KEY_VIEW_CONFIG],
                    elementId: elementId, validation: validation,
                    lockEditingByDefault: lockEditingByDefault,
                    visible: visible,label: label},
                app = viewObj['app'], self = this;

            self.childViewMap[elementId] = null;

            var rootView = contrail.checkIfExist(this.rootView) ? this.rootView : this,
                renderConfig = {
                    parentElement: parentElement,
                    viewName: viewName,
                    viewPathPrefix: viewPathPrefix,
                    model: model,
                    viewAttributes: viewAttributes,
                    modelMap: modelMap,
                    app: app,
                    rootView: rootView,
                    onAllRenderCompleteCB: function() {
                        if(!self.isViewRenderInProgress()) {
                            self.onAllRenderComplete.notify();

                            if(contrail.checkIfFunction(onRenderCompleteCallback)) {
                                onRenderCompleteCallback();
                            }
                        }
                    }
                };

            cowu.renderView(renderConfig, function(renderedView) {
                // Adding child view to a map in rootView
                add2RootViewMap(elementId, renderedView, rootView);

                // Adding child view to a childViewMap in current view
                add2ChildViewMap(elementId, renderedView, self);
            });
        },
        setRootView: function(childElId, rootView) {
            add2RootViewMap(childElId, this, rootView)
        },

        setParentView: function(childElId, parentView) {
            add2ChildViewMap(childElId, this, parentView);
        },

        beginMyRendering: function() {
            this.isMyRenderInProgress = true;
        },

        endMyRendering: function() {
            this.isMyRenderInProgress = false;
            if(!this.isViewRenderInProgress()) {
                this.onAllRenderComplete.notify();
            }
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