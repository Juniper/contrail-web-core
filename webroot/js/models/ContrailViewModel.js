/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-remote-data-handler'
], function (_, Backbone, ContrailRemoteDataHandler) {
    var ContrailViewModel = Backbone.Model.extend({
        constructor: function (modelConfig) {
            var self = this, remoteHandlerConfig;

            Backbone.Model.apply(this, {});

            if (modelConfig['data'] != null) {
                setData2Model(self, modelConfig['data']);
            } else if (modelConfig['remote'] != null) {
                remoteHandlerConfig = getRemoteHandlerConfig(self, modelConfig);
                self.contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
            }

            self.onAllRequestsComplete = new Slick.Event();
            return self;
        },

        getValueByPath: function (jsonPath) {
            var attributes = this.model().attributes,
                value = jsonPath(attributes, jsonPath)

            return value;
        },

        isPrimaryRequestInProgress: function () {
            return (this.contrailDataHandler != null) ? this.contrailDataHandler.isPrimaryRequestInProgress() : false;
        },

        isVLRequestInProgress: function () {
            return (this.contrailDataHandler != null) ? this.contrailDataHandler.isVLRequestInProgress() : false;
        },

        isRequestInProgress: function () {
            return (this.contrailDataHandler != null) ? this.contrailDataHandler.isRequestInProgress() : false;
        },

        error: false,
        errorList: [],
        lastUpdateTime: null
    });

    function getRemoteHandlerConfig(contrailViewModel, viewModelConfig) {
        var remoteHandlerConfig = {},
            primaryRemote = viewModelConfig.remote,
            vlRemoteConfig = contrail.handleIfNull(viewModelConfig.vlRemoteConfig, {}),
            vlRemoteList = contrail.handleIfNull(vlRemoteConfig['vlRemoteList'], []),
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response) {
                    setData2Model(contrailViewModel, response);
                },
                failureCallback: function (xhr) {
                    contrailViewModel.error = true;
                    contrailViewModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailViewModel);
                    }
                },
                completeCallback: function (completeResponse) {
                    updateDataInCache(contrailViewModel, completeResponse);
                }
            },
            vlRemoteList;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['onAllRequestsCompleteCallback'] = function () {
            if (!contrailViewModel.isRequestInProgress()) {
                contrailViewModel.onAllRequestsComplete.notify();
            }
        };

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function (completeResponse) {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](contrailViewModel);
                }

                if (!contrailViewModel.isRequestInProgress()) {
                    updateDataInCache(contrailViewModel, completeResponse);
                }
            }
        };

        for (var i = 0; i < vlRemoteList.length; i++) {
            var vlSuccessCallback = vlRemoteList[i].successCallback,
                vlFailureCallback = vlRemoteList[i].failureCallback;

            vlRemoteList = {
                getAjaxConfig: vlRemoteList[i].getAjaxConfig,
                dataParser: vlRemoteList[i].dataParser,
                initCallback: vlRemoteList[i].initCallback,
                successCallback: function (response) {
                    if (contrail.checkIfFunction(vlSuccessCallback)) {
                        vlSuccessCallback(response, contrailViewModel);
                    }
                },
                failureCallback: function (xhr) {
                    contrailViewModel.error = true;
                    contrailViewModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, contrailViewModel);
                    }
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemoteList);
        }

        return remoteHandlerConfig;
    };

    function setData2Model(contrailViewModel, viewData) {
        contrailViewModel.set(viewData);
        contrailViewModel.lastUpdateTime = $.now();
    };

    function updateDataInCache(contrailViewModel) {
        if (contrailViewModel.ucid != null) {
            //TODO: Binding of cached gridModel (if any) with existing view should be destroyed.
            cowch.setData2Cache(contrailViewModel.ucid, {viewModel: contrailViewModel});
        }
    };

    return ContrailViewModel;
});