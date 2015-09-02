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

            self.isMyViewRenderInProgress = false;
            self.childViewMap = {};
            self.error = false;

            self.onAllViewsRenderComplete = new Slick.Event();
            self.onAllRenderComplete = new Slick.Event();

            Backbone.View.apply(self, arguments);

            //The top view may not have any argument.
            if(arguments.length > 0) {
                self.rootView = arguments[0].rootView;
                var onAllViewsRenderCompleteCB = arguments[0].onAllViewsRenderCompleteCB,
                    onAllRenderCompleteCB = arguments[0].onAllRenderCompleteCB;

                if (contrail.checkIfFunction(onAllViewsRenderCompleteCB)) {
                    self.onAllViewsRenderComplete.subscribe(function() {
                        onAllViewsRenderCompleteCB();
                    });
                } else if (contrail.checkIfFunction(onAllRenderCompleteCB)) {
                    self.onAllRenderComplete.subscribe(function() {
                        onAllRenderCompleteCB();
                    });
                }
            }

            return self;
        },

        isAnyViewRenderInProgress: function() {
            var isChildRenderInProgress = false;

            for(var key in this.childViewMap) {
                if(this.childViewMap[key] == null || this.childViewMap[key].isAnyViewRenderInProgress()) {
                    isChildRenderInProgress = true;
                    break;
                }
            }

            return isChildRenderInProgress || this.isMyViewRenderInProgress;
        },

        isAnyRenderInProgress: function() {
            return this.isAnyViewRenderInProgress() || this.isModelRequestInProgress();
        },

        isModelRequestInProgress: function() {
            if(this.model != null && contrail.checkIfFunction(this.model.isRequestInProgress)) {
                return this.model.isRequestInProgress();
            } else {
                return false;
            }
        },

        renderView4Config: function (parentElement, model, viewObj, validation, lockEditingByDefault, modelMap, onAllViewsRenderComplete, onAllRenderComplete) {
            var viewName = viewObj['view'],
                viewPathPrefix = viewObj['viewPathPrefix'],
                elementId = viewObj[cowc.KEY_ELEMENT_ID],
                validation = (validation != null) ? validation : cowc.KEY_VALIDATION,
                viewConfig = viewObj[cowc.KEY_VIEW_CONFIG],
                app = viewObj['app'], self = this;

            viewConfig['visible'] = contrail.checkIfExist(viewConfig['visible']) ? viewConfig['visible'] : true;

            var viewAttributes = {viewConfig: viewConfig, elementId: elementId, validation: validation, lockEditingByDefault: lockEditingByDefault};

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
                    onAllViewsRenderCompleteCB: function() {
                        if(!self.isAnyViewRenderInProgress()) {
                            // Notify parent the one of child's rendering is complete.
                            self.onAllViewsRenderComplete.notify();

                            if(contrail.checkIfFunction(onAllViewsRenderComplete)) {
                                // Call any callback associated with onViewRenderComplete of child view.
                                onAllViewsRenderComplete();
                            }
                        }
                    }
                    /*
                    onAllRenderCompleteCB: function() {
                        if(!self.isAnyViewRenderInProgress()) {
                            // Notify parent the one of child's rendering is complete.
                            self.onAllRenderComplete.notify();

                            if(contrail.checkIfFunction(onAllRenderComplete)) {
                                // Call any callback associated with onViewRenderComplete of child view.
                                onAllRenderComplete();
                            }
                        }
                    }*/
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

        beginMyViewRendering: function() {
            this.isMyViewRenderInProgress = true;
            this.error = false;
        },

        endMyViewRendering: function() {
            this.isMyViewRenderInProgress = false;
            if(!this.isAnyViewRenderInProgress()) {
                this.onAllViewsRenderComplete.notify();
            }

            if(!this.isAnyRenderInProgress()) {
                this.onAllRenderComplete.notify();
            }
        },

        endMyModelRendering: function() {
            if(!this.isAnyRenderInProgress()) {
                this.onAllRenderComplete.notify();
            }
        },

        endMyRendering: function() {
            this.endMyViewRendering();
            this.endMyModelRendering();
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