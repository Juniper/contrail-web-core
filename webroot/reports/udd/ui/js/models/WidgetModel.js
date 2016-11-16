/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "backbone",
    "knockout",
    "core-constants",
    "contrail-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "text!core-basedir/reports/udd/config/default.config.json"
], function(_, Backbone, ko, cowc, ContrailModel, qeUtils, uddConstants, defaultConfig) {
    var oldConfigState = null, // a private property remembering the oldConfigState of this widget
        defaultConfigKeys = {
            VISUALIZATION_TYPES: "contentViews",
            DATA_SOURCE_TYPES: "dataSources",
            VIEW_LOADING_PATH: "viewPathPrefix",
            VIEW_NAME: "view",
            MODEL_LOADING_PATH: "modelPathPrefix",
            MODEL_NAME: "model"
        },
        cacheKeys = {
            DATA_SOURCE_TYPES: "dst",
            VISUALIZATION_TYPES: "vt",
            DEFAULT_SUBVIEW_CONFIGS: "dsc"
        },
        staticCache = {}; // a map that caches static asset

    defaultConfig = JSON.parse(defaultConfig);

    /**
     * compose a subview's JSON object to save on backend
     *
     * @param      {Object}  viewMeta   the view's basic meta info
     * @param      {Object}  modelMeta  the model's basic meta info
     * @param      {Object}  modelData  the model's actual state/data
     * @return     {Object}             an object that represents the composed JSON
     */
    function configSubViewToJSON(viewMeta, modelMeta, modelData) {
        return _.merge(
            _.pick(viewMeta, [defaultConfigKeys.VIEW_NAME, defaultConfigKeys.VIEW_LOADING_PATH]),
            _.pick(modelMeta, [defaultConfigKeys.MODEL_NAME, defaultConfigKeys.MODEL_LOADING_PATH]),
            _.zipObject([uddConstants.raw.SUBVIEW_MODEL_DATA], [modelData])
        );
    }

    /**
     * Take a snapshot of states fo the chosen config models.
     *
     * @return     {Object}  an object containing serialized config model states
     */
    function _snapshotState() {
        var modelToFreeze = _.pick(this.attributes, [
            uddConstants.modelIDs.DATA_SOURCE,
            uddConstants.modelIDs.VISUAL_META,
            uddConstants.modelIDs.VIEWS_MODEL_COLLECTION
        ]);
        
        // serialize state snapshot strings
        return _.mapValues(modelToFreeze, JSON.stringify);
    }

    /**
     * Restore the model's state
     *
     * @param      {Object}  stateSnapshot  The state snapshot for restoration
     */
    function _restoreState(stateSnapshot) {
        // deserialize state snapshot strings
        stateSnapshot = _.mapValues(stateSnapshot, JSON.parse);

        _.forEach(stateSnapshot, function(oldState, modelID) {
            _restore(this.attributes[modelID], oldState);
        }, this);
    }

    /**
     * A resolver that applies old attribute values to the Backbone model
     *
     * @param      {Object}  kbModel      A map of the Knockback model's attributes
     * @param      {Object}  oldStateObj  The old state object
     */
    function _restore(kbModel, oldStateObj) {
        _.forEach(oldStateObj, function(val, attrName) {
            var currAttr = kbModel[attrName];

            if (currAttr instanceof Backbone.Model) {
                currAttr.set(val);
            } else if (ko.isObservable(currAttr)) {
                currAttr(val);
            } else {
                kbModel[attrName] = val;
            }
        });
    }

    /**
     * A utility factory provides a handler to pass new view type (a string)
     *     to Data Config Model's receiver observable.
     *
     * @param      {String}  reciever  The reciever's attr name
     * @return     {Function}    The view change handler for data config model.
     */
    function getViewChangeHandlerForDataConfig(reciever) {
        return function(model, newViewType) {
            var dataConfigModel = this.get(uddConstants.modelIDs.DATA_SOURCE);

            dataConfigModel[reciever](newViewType);
            dataConfigModel.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION);
        };
    }

    return Backbone.Model.extend({
        initialize: function(_p) {
            var _widgetConfig = {};

            this.ready = false;

            if (!_p || !_p.id) {
                var p = _p || {},
                    uuid = qeUtils.generateQueryUUID().slice(0, 36);

                _widgetConfig = p[uddConstants.raw.WIDGET_META] || {
                    isReady: false
                };

                _.merge(_widgetConfig, {
                    title: _widgetConfig.title || uuid
                });

                this.set("id", uuid);
            } else {
                _widgetConfig = _p[uddConstants.raw.WIDGET_META];
            }

            this.set(uddConstants.raw.WIDGET_META, _widgetConfig);
            this.set(uddConstants.raw.SUBVIEWS_CONFIG,
                this.get(uddConstants.raw.SUBVIEWS_CONFIG) || this.getDefaultConfig());

            var _contentConfig = this.get(uddConstants.raw.SUBVIEWS_CONFIG),
                modelConfig = _.zipObject(
                    [
                        uddConstants.subviewIDs.DATA_SOURCE,
                        uddConstants.subviewIDs.VISUALIZATION,
                        "currentStep"
                    ],[
                        _.get(_contentConfig, [uddConstants.subviewIDs.DATA_SOURCE, defaultConfigKeys.VIEW_NAME]),
                        _.get(_contentConfig, [uddConstants.subviewIDs.VISUALIZATION, defaultConfigKeys.VIEW_NAME]),
                        _widgetConfig.step || ""
                    ]),
                _viewsModel = new ContrailModel(modelConfig),
                _configModel = new ContrailModel(this.get(uddConstants.raw.WIDGET_META));

            _.merge(_configModel, {
                steps: uddConstants.steps // for KO bindings
            });

            this.set(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION, _viewsModel);
            _viewsModel.model().on("change", this.changeConfigModel, this);

            _viewsModel.model().on("change:" + uddConstants.subviewIDs.VISUALIZATION,
                getViewChangeHandlerForDataConfig("visualType"), this);
            _viewsModel.model().on("change:" + uddConstants.subviewIDs.DATA_SOURCE,
                getViewChangeHandlerForDataConfig("dataSrcType"), this);

            this.set(uddConstants.modelIDs.WIDGET_META, _configModel);
            // autosave widget gui config
            _configModel.model().on("change:x change:y change:width change:height change:title",
                function() {
                    if (this.ready) { // this condition will fail, when GridStackView.onAdd
                                      // updates Pos meta of cloned widget. In this case,
                                      // try to save the change once the model is ready.
                        this.save();
                    } else {
                        this.once("ready", this.save, this);
                    }
                }, this);

            this.dataModelChangeHandler = _.noop; // a property holding visualization meta config model's
                                                  // handler for data config model change event
            require([
                this.getConfigModelObj(modelConfig[uddConstants.subviewIDs.DATA_SOURCE]).path,
                this.getConfigModelObj(modelConfig[uddConstants.subviewIDs.VISUALIZATION]).path
            ], this._onConfigModelsLoaded.bind(this));

            this._parseViewLabels();
        },

        parse: function(data) {
            var propPaths = [
                [
                    uddConstants.raw.SUBVIEWS_CONFIG,
                    uddConstants.subviewIDs.VISUAL_META,
                    uddConstants.raw.SUBVIEW_MODEL_DATA
                ], [
                    uddConstants.raw.SUBVIEWS_CONFIG,
                    uddConstants.subviewIDs.DATA_SOURCE,
                    uddConstants.raw.SUBVIEW_MODEL_DATA
                ]
            ];

            // on successful model save
            if (data.result) {
                return data;
            }

            if (data.error) {
                console.error(data.error);
                return [];
            }

            // objectify some model configuration strings of the JSON object
            _.forEach(propPaths, function(propPath) {
                _.set(data, propPath, JSON.parse(_.get(data, propPath)));
            });

            return data;
        },

        validate: function(attrs) {
            var validConfig = !!attrs[uddConstants.modelIDs.WIDGET_META].title(),
                validContentConfig = attrs[uddConstants.modelIDs.VISUAL_META] ?
                    attrs[uddConstants.modelIDs.VISUAL_META].model().isValid(true, "validation") : true,
                validDataConfig = attrs[uddConstants.modelIDs.DATA_SOURCE]
                    .model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION);

            return !(validConfig && validContentConfig && validDataConfig);
        },

        getDataSourceList: function() {
            if (!staticCache[cacheKeys.DATA_SOURCE_TYPES]) {
                staticCache[cacheKeys.DATA_SOURCE_TYPES] = _.keys(defaultConfig[defaultConfigKeys.DATA_SOURCE_TYPES]);
            }

            return staticCache[cacheKeys.DATA_SOURCE_TYPES];
        },

        getContentViewList: function() {
            if (!staticCache[cacheKeys.VISUALIZATION_TYPES]) {
                staticCache[cacheKeys.VISUALIZATION_TYPES] = _.keys(defaultConfig[defaultConfigKeys.VISUALIZATION_TYPES]);
            }

            return staticCache[cacheKeys.VISUALIZATION_TYPES];
        },

        getDefaultConfig: function() {
            if (!staticCache[cacheKeys.DEFAULT_SUBVIEW_CONFIGS]) {
                var defaultDSViewId = this.getDataSourceList()[0],
                    defaultDSViewConfig = _.get(defaultConfig, [
                        defaultConfigKeys.DATA_SOURCE_TYPES,
                        defaultDSViewId
                    ]),
                    defaultContentViewId = this.getContentViewList()[0],
                    defaultContentViewConfig = _.get(defaultConfig, [
                        defaultConfigKeys.VISUALIZATION_TYPES,
                        defaultContentViewId
                    ]);

                staticCache[cacheKeys.DEFAULT_SUBVIEW_CONFIGS] = _.merge(
                    _.zipObject([uddConstants.subviewIDs.DATA_SOURCE], [_.assign({}, defaultDSViewConfig)]),
                    _.pick(defaultContentViewConfig, [
                        uddConstants.subviewIDs.VISUAL_META,
                        uddConstants.subviewIDs.VISUALIZATION
                    ])
                );
            }

            return staticCache[cacheKeys.DEFAULT_SUBVIEW_CONFIGS];
        },

        /**
         * Load view meta data for the "viewType"
         * @param  {string} viewType [description]
         * @return {object}          an object describing how to load the view
         */
        getViewConfig: function(viewType) {
            var viewsModel = this.get(uddConstants.modelIDs.VIEWS_MODEL_COLLECTION).model(),
                viewId, viewPathPrefix, viewConfig = {};

            switch (viewType) {
                case uddConstants.subviewIDs.DATA_SOURCE:
                    viewId = viewsModel.get(viewType);
                    viewPathPrefix = _.get(defaultConfig, [
                        defaultConfigKeys.DATA_SOURCE_TYPES,
                        viewId,
                        defaultConfigKeys.VIEW_LOADING_PATH
                    ]);
                    break;
                case uddConstants.subviewIDs.VISUALIZATION:
                    viewId = viewsModel.get(viewType);
                    viewPathPrefix = _.get(defaultConfig, [
                        defaultConfigKeys.VISUALIZATION_TYPES,
                        viewId,
                        viewType,
                        defaultConfigKeys.VIEW_LOADING_PATH
                    ]);
                    viewConfig = this.get(uddConstants.modelIDs.VISUAL_META) ?
                        this.get(uddConstants.modelIDs.VISUAL_META).getContentViewOptions() : {};
                    break;
                case uddConstants.subviewIDs.VISUAL_META:
                    var contentView = viewsModel.get(uddConstants.subviewIDs.VISUALIZATION);
                    viewId = _.get(defaultConfig, [
                        defaultConfigKeys.VISUALIZATION_TYPES,
                        contentView,
                        viewType,
                        defaultConfigKeys.VIEW_NAME
                    ]);
                    viewPathPrefix = _.get(defaultConfig, [
                        defaultConfigKeys.VISUALIZATION_TYPES,
                        contentView,
                        viewType,
                        defaultConfigKeys.VIEW_LOADING_PATH
                    ]);
                    break;
                default:
            }

            return {
                view: viewId,
                viewPathPrefix: viewPathPrefix,
                viewConfig: viewConfig,
                elementId: this.get("id") + "-" + viewType,
            };
        },

        /**
         * Load data model meta data for 'viewId' from predefined "default.config.json"
         * @param  {string} viewId view identifier
         * @return {object}        an object describing how to load the view's data model
         */
        getConfigModelObj: function(viewId) {
            if (!viewId) {
                return {};
            }

            var modelId = "", pathPrefix = "",
                baseObjPath = _.has(defaultConfig[defaultConfigKeys.VISUALIZATION_TYPES], viewId) ? [
                    defaultConfigKeys.VISUALIZATION_TYPES,
                    viewId,
                    uddConstants.subviewIDs.VISUAL_META
                ] : [
                    defaultConfigKeys.DATA_SOURCE_TYPES,
                    viewId
                ];

            modelId = _.get(defaultConfig, baseObjPath.concat(defaultConfigKeys.MODEL_NAME));
            pathPrefix = _.get(defaultConfig, baseObjPath.concat(defaultConfigKeys.MODEL_LOADING_PATH));

            return {
                model: modelId,
                modelPathPrefix: pathPrefix,
                path: pathPrefix + modelId
            };
        },

        changeConfigModel: function(viewsModel) {
            var changed = viewsModel.changed,
                contentConfigModel = {},
                dataConfigModel = {};

            if (changed[uddConstants.modelIDs.DATA_SOURCE]) {
                dataConfigModel = this.getConfigModelObj(changed[uddConstants.modelIDs.DATA_SOURCE]);
                // What does this retrieve????
                var changeContentView = _.get(defaultConfig,
                    [
                        defaultConfigKeys.DATA_SOURCE_TYPES,
                        changed[uddConstants.modelIDs.DATA_SOURCE],
                        defaultConfigKeys.VISUALIZATION_TYPES
                    ])[0];
                contentConfigModel = this.getConfigModelObj(changeContentView);
            } else if (changed[uddConstants.subviewIDs.VISUALIZATION]) {
                contentConfigModel = this.getConfigModelObj(changed[uddConstants.subviewIDs.VISUALIZATION]);
            } else {
                return;
            }

            require([dataConfigModel.path, contentConfigModel.path], this._onConfigModelsLoaded.bind(this));
        },

        toJSON: function() {
            var attrs = this.attributes,
                widgetConfigModel = attrs[uddConstants.modelIDs.WIDGET_META].model().attributes,
                dataSrcView = _.get(attrs, [
                    uddConstants.modelIDs.VIEWS_MODEL_COLLECTION,
                    uddConstants.subviewIDs.DATA_SOURCE
                ]),
                visualizationView = _.get(attrs, [
                    uddConstants.modelIDs.VIEWS_MODEL_COLLECTION,
                    uddConstants.subviewIDs.VISUALIZATION
                ]),
                dataSrcModel = attrs[uddConstants.modelIDs.DATA_SOURCE],
                visualMetaModel = attrs[uddConstants.modelIDs.VISUAL_META];

            return _.merge(
                    _.pick(attrs, [
                        "dashboardId",
                        "tabId",
                        "tabName",
                        "tabCreationTime"
                    ]),
                    _.zipObject(
                        [
                            uddConstants.raw.WIDGET_META,
                            uddConstants.raw.SUBVIEWS_CONFIG
                        ], [
                            _.pick(widgetConfigModel, [
                                "title",
                                "x",
                                "y",
                                "width",
                                "height"
                            ]),
                            _.zipObject(
                                [
                                    uddConstants.subviewIDs.DATA_SOURCE,
                                    uddConstants.subviewIDs.VISUAL_META,
                                    uddConstants.subviewIDs.VISUALIZATION
                                ], [
                                    configSubViewToJSON(
                                        this.getViewConfig(uddConstants.subviewIDs.DATA_SOURCE),
                                        this.getConfigModelObj(dataSrcView()),
                                        JSON.stringify(dataSrcModel.toJSON())
                                    ),
                                    configSubViewToJSON(
                                        this.getViewConfig(uddConstants.subviewIDs.VISUAL_META),
                                        this.getConfigModelObj(visualizationView()),
                                        visualMetaModel ? JSON.stringify(visualMetaModel.toJSON()) : undefined
                                    ),
                                    _.pick(this.getViewConfig(uddConstants.subviewIDs.VISUALIZATION), [
                                        defaultConfigKeys.VIEW_NAME,
                                        defaultConfigKeys.VIEW_LOADING_PATH
                                    ])
                                ]
                            )
                        ]
                    )
                );
        },

        _onConfigModelsLoaded: function(DataConfigModel, ContentConfigModel) {
            var visualMetaConfigModel = this.get(uddConstants.modelIDs.VISUAL_META),
                dataConfigModel = this.get(uddConstants.modelIDs.DATA_SOURCE),
                attrs = this.attributes;

            if (dataConfigModel) {
                /**
                 * A new visualization meta config model is gonna take place,
                 * so unregister the current visualization meta config model's
                 * data model change event handler.
                 */
                dataConfigModel.model().off("change", this.dataModelChangeHandler);
            }

            if (DataConfigModel) {
                var currDataSrcConfig = _.get(attrs, [
                        uddConstants.raw.SUBVIEWS_CONFIG,
                        uddConstants.subviewIDs.DATA_SOURCE,
                        uddConstants.raw.SUBVIEW_MODEL_DATA
                    ]),
                    currVisualType = _.get(attrs, [
                        uddConstants.modelIDs.VIEWS_MODEL_COLLECTION,
                        uddConstants.subviewIDs.VISUALIZATION
                    ]),
                    currDataSrcType = _.get(attrs, [
                        uddConstants.modelIDs.VIEWS_MODEL_COLLECTION,
                        uddConstants.subviewIDs.DATA_SOURCE
                    ]),
                    newDataSrcConfigState = _.merge(
                        currDataSrcConfig,
                        {
                            visualType: currVisualType() || "",
                            dataSrcType: currDataSrcType() || "",
                        });

                dataConfigModel = new DataConfigModel(newDataSrcConfigState);
                this.set(uddConstants.modelIDs.DATA_SOURCE, dataConfigModel);
            }

            if (ContentConfigModel) {
                var currVisualMetaModel = _.get(attrs, [uddConstants.modelIDs.VISUAL_META]),
                    currVisualMetaConfig = currVisualMetaModel ? currVisualMetaModel.toJSON() : _.get(attrs, [
                            uddConstants.raw.SUBVIEWS_CONFIG,
                            uddConstants.subviewIDs.VISUAL_META,
                            uddConstants.raw.SUBVIEW_MODEL_DATA
                        ]);

                /**
                 * Instantiate the new visulization meta config model
                 * and connect it to other models
                 */
                visualMetaConfigModel = new ContentConfigModel(currVisualMetaConfig);

                this.dataModelChangeHandler = function(model) {
                    /**
                     * EXPLAINATION: "visualType" is an observable added to data source
                     *     config model on the fly. It provides necessary info for UDD-specific
                     *     form validation. Its value is synced with "Content View" dropdown.
                     *     Ideally, when the dropdown value is changed, the content/visual-meta
                     *     config model should be updated first. However, the event firing order
                     *     does otherwise. Thus, the new data source config model change conflicts
                     *     with the old content/visual-meta config model and, as a result, break
                     *     the app. To avoid this problem, skip handling visualType change of data
                     *     source config model.
                     */
                    if (!_.has(model.changed, "visualType")) {
                        visualMetaConfigModel.onDataModelChange(model);
                    }
                };

                // ALERT: Since the onDataModelChange event hanlder listens to Backbone's change event,
                //        we should pass in the underlying Backbone model rather than the KnockBack model.
                //        This will avoid an data update timing issue (the Backbone model is updated,
                //        but the Knockback observables are not updated till next CPU tick.)
                this.dataModelChangeHandler(dataConfigModel.model());
                dataConfigModel.model().on("change", this.dataModelChangeHandler);
            }

            // When widget is being initialized, this model will be empty
            this.set(uddConstants.modelIDs.VISUAL_META, visualMetaConfigModel);

            this.ready = true;
            this.trigger("ready");
        },

        _parseViewLabels: function() {
            var definedSubviewTypes = _.assign(
                    {},
                    defaultConfig[defaultConfigKeys.VISUALIZATION_TYPES],
                    defaultConfig[defaultConfigKeys.DATA_SOURCE_TYPES]
                );

            this.viewLabels = {};
            
            _.forEach(definedSubviewTypes, function(config, subviewType) {
                this.viewLabels[subviewType] = config.label;
            }, this);
        },

        snapshotConfigState: function() {
            if (_.isNull(oldConfigState)) {
                oldConfigState = _snapshotState.call(this);
            }
        },

        restoreConfigState: function() {
            _restoreState.call(this, oldConfigState);
        },

        dropOldConfigSnapshot: function() {
            oldConfigState = null;
        }
    });
});
