/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget container
 */
define([
    "lodash",
    "knockback",
    "core-constants",
    "contrail-view"
], function(_, Knockback, cowc, ContrailView) {
    var WidgetView = ContrailView.extend({
        selectors: {
            heading: ".panel-heading",
            configTitle: ".config-title",
            title: ".panel-heading .title-group .title",
            titleInput: ".panel-heading .title-group .edit-title",
            steps: ".panel-body>.step",
            footer: ".panel-footer",
            configSelectors: ".panel-body>.config-selectors",
            dataConfigDropdown: "#dataConfigViewSelector",
            contentConfigDropdown: "#contentViewSelector",
            back: ".panel-footer .back",
            config: ".widget-control .config .fa",
            refresh: ".widget-control .refresh",
            confirmDeletionModal: "#confirm-to-delete",
            contentView: ".content-view"
        },

        events: {
            "click .widget-control .refresh": "refresh",
            "click .widget-control .config": "toggleConfig",
            "click .widget-control .remove": "remove",
            "click .title": "editTitle",
            "keydown .edit-title": "_onKeyInTitle",
            "blur .panel-heading .title-group .edit-title": "saveTitle",
            "click .panel-footer .submit": "submit",
            "click .panel-footer .reset": "reset",
            "click .panel-footer .back": "backStep",
        },

        steps: {
            DATA_CONFIG: ".data-config",
            CONTENT_CONFIG: ".content-config",
            CONTENT: ".content-view",
        },

        initialize: function() {
            var self = this;
            // rerender on contentView change
            self.listenTo(self.model, "change:dataConfigModel", self._renderDataConfigView.bind(self));
            self.listenTo(self.model, "change:contentConfigModel", self._renderContentConfigView.bind(self));
        },

        render: function() {
            var self = this;

            Knockback.applyBindings(self.model.get("configModel"), self.$el[0]);
            // show config by default for widget with no data source selected
            if (self.model.isValid()) {
                self.goStep(self.steps.CONTENT);
            } else {
                self.goStep(self.steps.DATA_CONFIG);
            }

            return self;
        },
        // render data source config (query) on the back
        _renderDataConfigView: function() {
            var self = this;
            var config = self.model.getViewConfig("dataConfigView");
            var element = self.$("#" + config.elementId);
            var model = self.model.get("dataConfigModel");
            var oldView = self.childViewMap[config.elementId];
            if (oldView) oldView.remove();
            self.renderView4Config(element, model, config);
        },
        // render widget content (chart) on the front
        _renderContentView: function() {
            var self = this;
            var parserOptions = self.model.get("contentConfigModel") ? self.model.get("contentConfigModel").getParserOptions() : {};
            var dataConfigModel = self.model.get("dataConfigModel");
            var model = dataConfigModel.getDataModel(parserOptions);
            var config = self.model.getViewConfig("contentView");
            var element = self.$("#" + config.elementId);
            if (!model) {
                element.html(ctwm.NO_COMPATIBLE_DATA_SOURCES);
            }
            self.renderView4Config(element, model, config);
        },
        // render content config view on the back
        _renderContentConfigView: function(p) {
            var self = this;
            p = p || {};
            var config = self.model.getViewConfig("contentConfigView");
            var oldView = self.childViewMap[config.elementId];
            if (oldView) oldView.remove();

            var element = self.$("#" + config.elementId);
            var model = self.model.get("contentConfigModel");
            self.renderView4Config(element, model, config);
        },

        _renderConfigSelectors: function() {
            var self = this;
            var config = self.getViewConfig();
            var element = self.$(self.selectors.configSelectors);
            var model = self.model.get("viewsModel");
            self.renderView4Config(element, model, config, null, null, null, function() {
                Knockback.applyBindings(model, element[0]);
            });
        },

        _renderFooter: function() {
            var self = this;
            var config = self.getFooterConfig();
            var element = self.$(self.selectors.footer);
            self.renderView4Config(element, null, config);
        },

        getViewConfig: function() {
            var self = this;
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "dataConfigViewSelector",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: ctwl.TITLE_UDD_DATA_SOURCE,
                                path: "dataConfigView",
                                dataBindValue: "dataConfigView",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: self._getViewOptionsList(self.model.getDataSourceList()),
                                },
                            },
                        }, {
                            elementId: "contentViewSelector",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: ctwl.TITLE_UDD_CONTENT_VIEW,
                                path: "contentView",
                                dataBindValue: "contentView",
                                class: "col-xs-6 hidden",
                                elementConfig: {
                                    data: self._getViewOptionsList(self.model.getContentViewList()),
                                },
                            },
                        } ],
                    } ],
                },
            };
        },

        getFooterConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "back",
                            view: "FormButtonView",
                            viewConfig: {
                                label: ctwl.UDD_WIDGET_BACK,
                                class: "back display-inline-block",
                            },
                        }, {
                            elementId: "submit",
                            view: "FormButtonView",
                            viewConfig: {
                                label: ctwl.UDD_WIDGET_NEXT,
                                class: "submit display-inline-block",
                                elementConfig: {
                                    btnClass: "btn-primary",
                                },
                            },
                        }, {
                            elementId: "reset-query",
                            view: "FormButtonView",
                            viewConfig: {
                                label: ctwl.UDD_WIDGET_RESET,
                                class: "reset display-inline-block",
                            },
                        } ],
                    } ],
                },
            };
        },

        _getViewOptionsList: function(views) {
            var self = this;
            return _.map(views, function(id) {
                return {
                    id: id,
                    text: self.model.viewLabels[id],
                };
            });
        },

        _onKeyInTitle: function(e) {
            var self = this;
            if (e.keyCode === 13) {
                self.saveTitle();
            }
        },

        remove: function() {
            var self = this,
                title = self.model.get("configModel").title(),
                widgetToDeleteClass = "widget-to-delete",
                $confirmationModal = $(this.selectors.confirmDeletionModal);

            cowu.createModal({
                modalId: self.selectors.confirmDeletionModal.substr(1),
                className: "modal-700",
                title: "Delete This Widget?",
                body: '<p>Are you sure to <strong>remove</strong> widget <span class="' + widgetToDeleteClass + '"></span> ?',
                btnName: "Remove",
                onCancel: function() {
                    $confirmationModal.modal("hide");
                },
                onSave: function() {
                    self._enableConfigFocusMode(false);
                    self.model.destroy();
                    $confirmationModal.modal("hide");
                }
            });

            $confirmationModal = $(self.selectors.confirmDeletionModal);

            $confirmationModal.find("." + widgetToDeleteClass).text(title);
        },

        editTitle: function() {
            var self = this;
            self.$(self.selectors.title).hide();
            var titleInput = self.$(self.selectors.titleInput);
            titleInput.show();
            titleInput.focus();
        },

        saveTitle: function() {
            var self = this;
            self.$(self.selectors.title).show();
            self.$(self.selectors.titleInput).hide();
        },

        resize: function() {
            var self = this;
            var viewId = self.model.getViewConfig("contentView").elementId;
            var widgetContentView = self.childViewMap[viewId];
            if (!widgetContentView || !_.isFunction(widgetContentView.resize)) {
                return;
            }
            widgetContentView.resize();
        },

        _enableConfigFocusMode: function(active) {
            var className = "focus-config",
                _focusConfigBackdropClassName = className + "-backdrop",
                $bgMask = $("." + _focusConfigBackdropClassName),
                containingGrid = this.$el.closest(".grid-stack").data("gridstack");

            containingGrid.movable(this.$el, !active);
            containingGrid.resizable(this.$el, !active);

            if (active) {
                // hide the handle shown by hovering
                this.$el.find(".ui-resizable-handle").css("display", "none");

                this.$el.addClass(className);
                if ($bgMask.length === 0) {
                    $('<div class="' + _focusConfigBackdropClassName + '"></div>').appendTo(document.body);
                } else {
                    $bgMask.show();
                }
            } else {
                this.$el.removeClass(className);
                $("." + _focusConfigBackdropClassName).hide();
            }
        },

        goStep: function(step) {
            console.log(this.model.get("configModel").isReady());
            var self = this;
            if (self.currentStep === step) return;

            self.$(self.selectors.steps).hide();
            self.$(step).show();
            if (self.currentStep === self.steps.CONTENT || step === self.steps.CONTENT) {
                self._enableConfigFocusMode(false);
                self.$(self.selectors.configSelectors).toggle();
                self.$(self.selectors.footer).toggle();
                self.$(self.selectors.config).toggleClass("fa-gear")
                    .toggleClass("fa-times");
                self.$(self.selectors.refresh).toggleClass("hidden");
            }

            // render views for the first time
            if (step === self.steps.CONTENT) {
                if (!self.$("#" + self.model.getViewConfig("contentView").elementId).html()) {
                    self._renderContentView();
                }
            } else {
                if (!self.$("#" + self.model.getViewConfig("dataConfigView").elementId).html()) {
                    self._renderDataConfigView();
                    self._renderContentConfigView();
                    self._renderConfigSelectors();
                    self._renderFooter();
                }
            }

            var configTitle = "";
            if (step === self.steps.DATA_CONFIG) {
                self._enableConfigFocusMode(true);
                configTitle = ctwl.TITLE_UDD_DATA_CONFIG;
                self.$(self.selectors.back).hide();
                self.$(self.selectors.contentConfigDropdown).hideElement();
                self.$(self.selectors.dataConfigDropdown).showElement();
                self.$(".submit button").html(ctwl.UDD_WIDGET_NEXT);
            }
            if (step === self.steps.CONTENT_CONFIG) {
                self._enableConfigFocusMode(true);
                configTitle = ctwl.TITLE_UDD_CONTENT_CONFIG;
                self.$(self.selectors.back).show();
                self.$(self.selectors.dataConfigDropdown).hideElement();
                self.$(self.selectors.contentConfigDropdown).showElement();
                self.$(".submit button").html(ctwl.UDD_WIDGET_SUBMIT);
            }

            if (self.currentStep === self.steps.DATA_CONFIG && self.$(self.selectors.contentView).find("svg").html() === "") {
                self.refresh();
            }

            self.$(self.selectors.configTitle).html(configTitle);

            self.currentStep = step;
        },
        /* trigger current step model validation
         * go to next wizard step
         * if last step - save model and update content view
         */
        submit: function() {
            var self = this;
            if (self.currentStep === self.steps.DATA_CONFIG) {
                if (!self.model.get("dataConfigModel").model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                    return;
                }
                self.goStep(self.steps.CONTENT_CONFIG);
            } else if (self.currentStep === self.steps.CONTENT_CONFIG) {
                if (!self.model.isValid()) {
                    return;
                }
                self.model.save();
                self.model.get("configModel").isReady(true);
                self.$("#" + self.model.getViewConfig("contentView").elementId).html("");
                self.goStep(self.steps.CONTENT);
            }
        },

        toggleConfig: function() {
            var self = this;
            if (self.currentStep === self.steps.DATA_CONFIG || self.currentStep === self.steps.CONTENT_CONFIG) {
                self.model.get("viewsModel").rollback();
                self.model.get("dataConfigModel").rollback();
                self.model.get("contentConfigModel").rollback();
                self.goStep(self.steps.CONTENT);
            } else {
                self.goStep(self.steps.DATA_CONFIG);
                self.model.get("dataConfigModel").onChangeTime();
            }
        },

        backStep: function() {
            var self = this;
            self.goStep(self.steps.DATA_CONFIG);
        },

        reset: function() {
            var self = this;
            if (self.currentStep === self.steps.DATA_CONFIG) {
                self.model.get("dataConfigModel").reset();
            }
            var contentConfigModel = self.model.get("contentConfigModel");
            if (contentConfigModel) {
                contentConfigModel.reset();
            }
        },

        refresh: function () {
            var self = this;
            var dataConfigModel = self.model.get("dataConfigModel");
            dataConfigModel.refresh();
            self._renderContentView();
        },
    });
    return WidgetView;
});
