/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'backbone'
], function ($, Backbone) {
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
                viewAttributes = {viewConfig: viewConfig, elementId: elementId, validation: validation, lockEditingByDefault: lockEditingByDefault},
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
                    onAllViewsRenderCompleteCB: function() {
                        if(!self.isAnyViewRenderInProgress()) {
                            // Notify parent the one of child's rendering is complete.
                            self.onAllViewsRenderComplete.notify();

                            if(contrail.checkIfFunction(onAllViewsRenderComplete)) {
                                // Call any callback associated with onViewRenderComplete of child view.
                                onAllViewsRenderComplete(self);
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

            //Currently we're enabling this event only in test env.
            if(globalObj['test-env'] == globalObj['env'] + "-test") {
                renderConfig.onAllViewsRenderCompleteCB = function() {
                    viewsRenderCompleteEventNotifier(self, viewName, onAllViewsRenderComplete);
                }
            }

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

    function viewsRenderCompleteEventNotifier(self, viewName, onAllViewsRenderComplete) {
        var notifyTimer = contrail.checkIfExist(globalObj.notifyTimer) ? globalObj.notifyTimer : null,
            viewNotifyTimeout = 200,
            ajaxNotifyTimeout = 200;

        function waitAndNotify(timeout) {
            if (notifyTimer != null) clearTimeout(notifyTimer);

            notifyTimer = setTimeout(function () {
                if (!self.isAnyViewRenderInProgress() && ($.active == 0)) {
                    //clear timeout.
                    clearTimeout(notifyTimer);

                    //For debugging.
                    //console.log("Render Complete: " + viewName);

                    // Notify parent the one of child's rendering is complete.
                    self.onAllViewsRenderComplete.notify();

                    if (contrail.checkIfFunction(onAllViewsRenderComplete)) {
                        // Call any callback associated with onViewRenderComplete of child view.
                        onAllViewsRenderComplete(self);
                    }
                } else if ($.active > 0) {
                    waitAndNotify(ajaxNotifyTimeout);
                } else {
                    if (notifyTimer != null) clearInterval(notifyTimer);
                }
            }, timeout);

            globalObj.notifyTimer = notifyTimer;
        }

        /**
         * before we notify the event, wait sometime for render complete and no active ajax request exist.
         */
        if (!self.isAnyViewRenderInProgress() && ($.active == 0)) {
            waitAndNotify(viewNotifyTimeout);
        } else if ($.active > 0) {
            waitAndNotify(ajaxNotifyTimeout);
        } else {
            if (notifyTimer != null) clearInterval(notifyTimer);
        }
    }

    return ContrailView;
});