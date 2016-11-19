/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget container
 */

define([
    "lodash",
    "knockout",
    "knockback",
    "core-constants",
    "contrail-view",
    "core-basedir/reports/udd/ui/js/common/udd.constants"
], function(_, ko, kb, cowc, ContrailView, uddConstants) {
    var delimiter = ",",
        // extract visible column IDs from GridView's ColumnPicker
        columnIdExtractor = _.flow(_.map, _.partialRight(_.pluck, "value")),
        // debounced event handler which saves visible column changes back to server/DB
        persistVisibleColChange = _.debounce(function(view, event) {
            var $columnPickerTrigger = view.$el.find("#columnPicker"),
                $columnPickerPanel = $(event.originalEvent.delegateTarget),
                visualMetaVM = view.model.get(uddConstants.modelIDs.VISUAL_META),
                visualMetaRawModel = visualMetaVM.model(),
                checkedColumns = $columnPickerTrigger.data("contrailCheckedMultiselect").getChecked(),
                visibleCol = columnIdExtractor(checkedColumns, function(domElem) {
                    var colVal = $(domElem).val();
                    return JSON.parse(decodeURI(colVal));
                }),
                visibleColStr = visibleCol.join(delimiter),
                invalidMsg = visualMetaRawModel.preValidate("visibleColumns", visibleColStr);

            if (!invalidMsg) {
                $columnPickerPanel.tooltip("destroy");
                visualMetaVM.visibleColumns(visibleCol.join(delimiter));
                this.model.save();
            } else {
                $columnPickerPanel.data("toggle", "tooltip").tooltip({
                    title: invalidMsg + ". " + window.cowm.INVALID_DATA_NOT_SAVED
                }).tooltip("show");
            }
        }, 500);

    var WidgetView = ContrailView.extend({
        selectors: {
            configTitle: ".config-title",
            footer: ".panel-footer",
            configSelectors: ".panel-body>.config-selectors",
            confirmDeletionModal: "#confirm-to-delete",
            contentView: ".content-view"
        },

        events: {
            "click .widget-control .clone": "clone",
            "click .widget-control .refresh": "refresh",
            "click .widget-control .config": "toggleConfig",
            "click .widget-control .remove": "remove",
            "click .title": "editTitle",
            "blur .panel-heading .title-group .edit-title": "saveTitle",
            "keydown .edit-title": "_onKeyInTitle",
            "click .panel-footer .submit": "submit",
            "click .panel-footer .reset": "reset",
            "click .panel-footer .back": "backStep",
        },

        steps: uddConstants.steps,

        initialize: function() {
            // rerender on contentView change
            this.listenTo(this.model, "change:" + uddConstants.modelIDs.DATA_SOURCE,
                this._renderDataConfigView.bind(this));
            this.listenTo(this.model, "change:" + uddConstants.modelIDs.VISUAL_META,
                this._renderContentConfigView.bind(this));
            /** original solution for https://app.asana.com/0/162139934853695/206515470400258,
                disabled due to solution impact investigation

            this.listenTo(this.model.get(uddConstants.modelIDs.DATA_SOURCE).model(),
                "validated", this._validatedFormHandler.bind(this, this.steps.DATA_CONFIG));
            this.listenTo(this.model.get(uddConstants.modelIDs.VISUAL_META).model(),
               "validated", this._validatedFormHandler.bind(this, this.steps.VISUAL_META_CONFIG));
            */
            kb.applyBindings(this.model.get(uddConstants.modelIDs.WIDGET_META), this.$el[0]);
        },

        render: function() {
            // show config by default for widget with no data source selected
            if (this.model.isValid()) {
                this.goStep(this.steps.SHOW_VISUALIZATION);
            } else {
                this.goStep(this.steps.DATA_CONFIG);
            }

            return this;
        },

        /** original solution for https://app.asana.com/0/162139934853695/206515470400258,
                disabled due to solution impact investigation
        */
        // _validatedFormHandler: function(validatedStep, isValid) {
        //     var currentStep = this.model.get(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION).currentStep();

               /**
                * Have to filter out validation info of those attrs which are not part of current step form.
                * The current design runs validate on all forms somehow. --- need investigation when have time.
                */
        //     if (validatedStep === currentStep) {
        //         this.model.get(uddConstants.modelIDs.WIDGET_META).canProceed(isValid);
        //     }
        // },

        // render data source config (query) on the back
        _renderDataConfigView: function() {
            var config = this.model.getViewConfig(uddConstants.subviewIDs.DATA_SOURCE),
                element = this.$("#" + config.elementId),
                model = this.model.get(uddConstants.modelIDs.DATA_SOURCE),
                oldView = this.childViewMap[config.elementId];

            if (oldView) {
                oldView.remove();
            }

            this.renderView4Config(element, model, config);
        },
        // render widget content (chart) on the front
        _renderContentView: function() {
            var self = this,
                _contentConfigModel = this.model.get(uddConstants.modelIDs.VISUAL_META),
                _dataConfigModel = this.model.get(uddConstants.modelIDs.DATA_SOURCE),
                parserOptions = _contentConfigModel ? _contentConfigModel.getParserOptions() : {},
                model = _dataConfigModel.getDataModel(parserOptions),
                config = this.model.getViewConfig(uddConstants.subviewIDs.VISUALIZATION),
                element = this.$("#" + config.elementId);

            if (!model) {
                element.html(window.cowm.NO_COMPATIBLE_DATA_SOURCES);
            }

            self.renderView4Config(element, model, config, null, null, null, function(view) {
                var subviewModelCollection = view.model.get(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION);
                
                if (subviewModelCollection.contentView() === "GridView") {
                    // for GridView, add a event listener to persist visible columns change on backend.
                    element.off(".persistColChange")
                        .on("multiselectclick.persistColChange multiselectoptgrouptoggle.persistColChange",
                            persistVisibleColChange.bind(self, view));
                }
            });
        },
        // render content config view on the back
        _renderContentConfigView: function(p) {
            p = p || {};

            var config = this.model.getViewConfig(uddConstants.subviewIDs.VISUAL_META),
                oldView = this.childViewMap[config.elementId];

            if (oldView) {
                oldView.remove();
            }

            var element = this.$("#" + config.elementId),
                model = this.model.get(uddConstants.modelIDs.VISUAL_META);

            this.renderView4Config(element, model, config);
        },

        _renderConfigSelectors: function() {
            var config = this.getViewConfig(),
                element = this.$(this.selectors.configSelectors),
                model = this.model.get(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION);

            this.renderView4Config(element, model, config, null, null, null, function() {
                ko.cleanNode(element[0]);
                kb.applyBindings(model, element[0]);
            });
        },

        _renderFooter: function() {
            var config = this.getFooterConfig(),
                element = this.$(this.selectors.footer),
                model = this.model.get(uddConstants.modelIDs.WIDGET_META);

            this.renderView4Config(element, model, config, null, null, null, function() {
                ko.cleanNode(element[0]);
                kb.applyBindings(model, element[0]);
            });
        },

        getViewConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "dataConfigViewSelector",
                            view: "FormDropdownView",
                            viewConfig: {
                                visible: "currentStep() === '' || currentStep() === '" + this.steps.DATA_CONFIG + "'",
                                label: window.cowl.TITLE_UDD_DATA_SOURCE,
                                path: uddConstants.subviewIDs.DATA_SOURCE,
                                dataBindValue: uddConstants.subviewIDs.DATA_SOURCE,
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: this._getViewOptionsList(this.model.getDataSourceList()),
                                },
                            },
                        }, {
                            elementId: "contentViewSelector",
                            view: "FormDropdownView",
                            viewConfig: {
                                disabled: "currentStep() === '" + this.steps.VISUAL_META_CONFIG + "'",
                                visible: "currentStep() === '" + this.steps.VISUAL_META_CONFIG
                                        + "' || currentStep() === '" + this.steps.DATA_CONFIG + "'",
                                label: window.cowl.TITLE_UDD_VISUAL_META_VIEW,
                                path: uddConstants.subviewIDs.VISUALIZATION,
                                dataBindValue: uddConstants.subviewIDs.VISUALIZATION,
                                class: "col-xs-6",
                                elementConfig: {
                                    data: this._getViewOptionsList(this.model.getContentViewList()),
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
                                visible: "step() === '" + this.steps.VISUAL_META_CONFIG + "'",
                                label: window.cowl.UDD_WIDGET_BACK,
                                class: "back display-inline-block"
                            },
                        }, {
                            elementId: "submit",
                            view: "FormButtonView",
                            viewConfig: {
                                /** original solution for https://app.asana.com/0/162139934853695/206515470400258,
                                    disabled due to solution impact investigation
                                
                                disabled: "!canProceed()",
                                */
                                label: window.cowl.UDD_WIDGET_NEXT,
                                class: "submit display-inline-block",
                                elementConfig: {
                                    btnClass: "btn-primary"
                                },
                            },
                        }, {
                            elementId: "reset-query",
                            view: "FormButtonView",
                            viewConfig: {
                                label: window.cowl.UDD_WIDGET_RESET,
                                class: "reset display-inline-block",
                            },
                        } ],
                    } ],
                },
            };
        },

        _getViewOptionsList: function(views) {
            return _.map(views, function(id) {
                return {
                    id: id,
                    text: this.model.viewLabels[id],
                };
            }, this);
        },

        _onKeyInTitle: function(e) {
            if (e.keyCode === 13) {
                this.saveTitle();
            }
        },

        editTitle: function() {
            this.model.get(uddConstants.modelIDs.WIDGET_META).editingTitle(true);
        },

        saveTitle: function() {
            this.model.get(uddConstants.modelIDs.WIDGET_META).editingTitle(false);
        },

        clone: function() {
            var posMeta = ["x", "y", "width", "height"],
                vmParams = ["editingTitle", "isReady", "step"
                    /** original solution for https://app.asana.com/0/162139934853695/206515470400258,
                     *  disabled due to solution impact investigation
                     
                     , "canProceed"
                     */],
                widgetTileMeta = this.model.get(uddConstants.modelIDs.WIDGET_META).model().attributes, // positioning, title and other UI state flags
                clonedWidgetConfig = this.model.toJSON(), // overall widget component config
                tabId = clonedWidgetConfig.tabId,
                collection = this.rootView.model.tabModels[tabId]; // the collection holding this widget

            // parse the raw initial state of a widget
            this.model.parse(clonedWidgetConfig);

            // mark position meta invalid to let UDDGridStackView.onAdd recalculate them.
            clonedWidgetConfig.config = _.transform(clonedWidgetConfig.config, function(result, value, key) {
                if (_.includes(posMeta, key)) {
                    result[key] = -1;
                } else if (key === "title") {
                    result[key] = value + " - COPY";
                } else {
                    result[key] = value;
                }
            });

            // add some ViewModel-generated props which are not saved on backend.
            // these props are used by KO bindings to handle UI logic
            _.merge(clonedWidgetConfig.config, _.pick(widgetTileMeta, vmParams));

            collection.add(clonedWidgetConfig);
        },

        refresh: function () {
            var dataConfigModel = this.model.get(uddConstants.modelIDs.DATA_SOURCE);

            dataConfigModel.refresh();
            this._renderContentView();
        },

        remove: function() {
            var title = this.model.get(uddConstants.modelIDs.WIDGET_META).title(),
                widgetToDeleteClass = "widget-to-delete",
                mainMsg = '<p>Are you sure to <strong>remove</strong> widget <span class="'
                    + widgetToDeleteClass + '"></span> ?',
                $confirmationModal = $(this.selectors.confirmDeletionModal);

            cowu.createModal({
                modalId: this.selectors.confirmDeletionModal.substr(1),
                className: "modal-700",
                title: "Delete This Widget?",
                body: mainMsg,
                btnName: "Remove",
                onCancel: function() {
                    $confirmationModal.modal("hide");
                },
                onSave: function() {
                    this._enableConfigFocusMode(false);
                    this.model.destroy();
                    $confirmationModal.modal("hide");
                }.bind(this)
            });

            $confirmationModal = $(this.selectors.confirmDeletionModal);

            $confirmationModal.find("." + widgetToDeleteClass).text(title);
        },

        toggleConfig: function() {
            if (this.currentStep === this.steps.DATA_CONFIG
                || this.currentStep === this.steps.VISUAL_META_CONFIG) {
                this.model.restoreConfigState();
                this.goStep(this.steps.SHOW_VISUALIZATION);
                
                // Fix corrupted Chart if it's rendered behind the scene,
                // while a configuration step is open
                this.$el.find("svg").trigger("refresh");
            } else {
                this.goStep(this.steps.DATA_CONFIG);
                this.model.get(uddConstants.modelIDs.DATA_SOURCE).onChangeTime();
            }
        },

        resize: function() {
            var viewId = this.model.getViewConfig(uddConstants.subviewIDs.VISUALIZATION).elementId,
                widgetContentView = this.childViewMap[viewId];

            if (!widgetContentView || !_.isFunction(widgetContentView.resize)) {
                return;
            }

            widgetContentView.resize();
        },

        _enableConfigFocusMode: function(active) {
            var htmlClassNames = {
                    hide: "hidden",
                    focusConfig: "focus-config",
                    _focusConfigBackdropClassName: "focus-config-backdrop"
                },
                $bgMask = $("." + htmlClassNames._focusConfigBackdropClassName),
                containingGrid = this.$el.closest(".grid-stack").data("gridstack");

            containingGrid.movable(this.$el, !active);
            containingGrid.resizable(this.$el, !active);

            if (active) {
                // hide the handle shown by hovering
                this.$el.find(".ui-resizable-handle").css("display", "none");

                this.$el.addClass(htmlClassNames.focusConfig);
                if ($bgMask.length === 0) {
                    $('<div class="' + htmlClassNames._focusConfigBackdropClassName + '"></div>')
                        .appendTo(document.body);
                } else {
                    $bgMask.removeClass(htmlClassNames.hide);
                }
            } else {
                this.$el.removeClass(htmlClassNames.focusConfig);
                $bgMask.addClass(htmlClassNames.hide);
            }
        },

        goStep: function(step) {
            if (this.currentStep === step) {
                return;
            }

            if (this.currentStep === this.steps.SHOW_VISUALIZATION
                || step === this.steps.SHOW_VISUALIZATION) {
                this._enableConfigFocusMode(false);
            }

            // render views for the first time
            var containerID = "";
            if (step === this.steps.SHOW_VISUALIZATION) {
                containerID = this.model.getViewConfig(uddConstants.subviewIDs.VISUALIZATION).elementId;
                if (!this.$("#" + containerID).html()) {
                    this._renderContentView();
                }
            } else {
                // take a snapshot of the model's state in case rollbacks are needed later.
                this.model.snapshotConfigState();
                
                containerID = this.model.getViewConfig(uddConstants.subviewIDs.DATA_SOURCE).elementId;
                if (!this.$("#" + containerID).html()) {
                    this._renderDataConfigView();
                    this._renderContentConfigView();
                    this._renderConfigSelectors();
                    this._renderFooter();
                }
            }

            var configTitle = "";
            if (step === this.steps.DATA_CONFIG) {
                this._enableConfigFocusMode(true);
                configTitle = window.cowl.TITLE_UDD_DATA_CONFIG;
                this.$(".submit button").html(window.cowl.UDD_WIDGET_NEXT);
            }
            if (step === this.steps.VISUAL_META_CONFIG) {
                this._enableConfigFocusMode(true);
                configTitle = window.cowl.TITLE_UDD_VISUAL_META_CONFIG;
                this.$(".submit button").html(window.cowl.UDD_WIDGET_SUBMIT);
            }

            if (this.currentStep === this.steps.DATA_CONFIG
                && this.$(this.selectors.contentView).find("svg").html() === "") {
                this.refresh();
            }

            this.$(this.selectors.configTitle).html(configTitle);

            this.currentStep = step;
            this.model.get(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION).currentStep(step);
            this.model.get(uddConstants.modelIDs.WIDGET_META).step(step);
        },

        backStep: function() {
            this.goStep(this.steps.DATA_CONFIG);
        },
        /* trigger current step model validation
         * go to next wizard step
         * if last step - save model and update content view
         */
        submit: function() {
            if (this.currentStep === this.steps.DATA_CONFIG) {
                if (!this.model.get(uddConstants.modelIDs.DATA_SOURCE).model()
                    .isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                    return;
                }

                this.goStep(this.steps.VISUAL_META_CONFIG);
            } else if (this.currentStep === this.steps.VISUAL_META_CONFIG) {
                if (!this.model.isValid()) {
                    return;
                }

                this.model.save();
                this.model.dropOldConfigSnapshot();
                this.model.get(uddConstants.modelIDs.WIDGET_META).isReady(true);
                this.$("#" + this.model.getViewConfig(uddConstants.subviewIDs.VISUALIZATION).elementId).html("");
                this.goStep(this.steps.SHOW_VISUALIZATION);
            }
        },

        reset: function() {
            var contentConfigModel = this.model.get(uddConstants.modelIDs.VISUAL_META);

            if (this.currentStep === this.steps.DATA_CONFIG) {
                this.model.get(uddConstants.modelIDs.DATA_SOURCE).reset();
            }
            if (contentConfigModel) {
                contentConfigModel.reset();
            }
        }
    });
    return WidgetView;
});
