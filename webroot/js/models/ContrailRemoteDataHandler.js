/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ContrailRemoteDataHandler = function (remoteHandlerConfig) {

        var primaryRemoteConfig = remoteHandlerConfig['primaryRemoteConfig'],
            vlRemoteConfig = remoteHandlerConfig['vlRemoteConfig'],
            vlRemoteList = (vlRemoteConfig != null) ? vlRemoteConfig['vlRemoteList'] : null,
            hlRemoteConfig = remoteHandlerConfig['hlRemoteConfig'],
            hlRemoteList = (hlRemoteConfig != null) ? hlRemoteConfig['hlRemoteList'] : null;

        var pAjaxConfig, pUrl, pUrlParams, pDataParser, pInitCallback, pSuccessCallback,
            pRefreshSuccessCallback, pFailureCallback, pCompleteCallback,
            pRequestCompleteResponse = [], pRequestInProgress;

        var vlRequestsInProgress = [], vlRequestInProgress, vlCompleteCallback,
            cleanAndFresh = false, self = this, updateActiveModel = false;

        pAjaxConfig = primaryRemoteConfig.ajaxConfig;
        pUrl = pAjaxConfig['url'];
        pUrlParams = $.deparamURLArgs(pUrl);

        pDataParser = primaryRemoteConfig.dataParser;
        pCompleteCallback = primaryRemoteConfig.completeCallback;

        vlCompleteCallback = vlRemoteConfig.completeCallback;

        pInitCallback = primaryRemoteConfig.initCallback;
        pSuccessCallback = primaryRemoteConfig.successCallback;
        pRefreshSuccessCallback = primaryRemoteConfig.refreshSuccessCallback;
        pFailureCallback = primaryRemoteConfig.failureCallback;

        self.refreshData = function () {
            //TODO
            /*
             if (!pRequestInProgress) {
             cleanAndFresh = true;
             contrail.ajaxHandler(pAjaxConfig, pInitHandler, pRefreshHandler, pFailureHandler);
             }
             */
        };

        self.isPrimaryRequestInProgress = function () {
            return pRequestInProgress;
        }

        self.isVLRequestInProgress = function () {
            return vlRequestInProgress;
        }

        self.isRequestInProgress = function () {
            if (pRequestInProgress || vlRequestInProgress) {
                return true;
            } else {
                return false;
            }
        };

        fetchPrimaryData();

        return self;

        function vlCompleteHandler() {
            if (contrail.checkIfFunction(vlCompleteCallback)) {
                vlCompleteCallback();
            }
        };

        function pInitHandler() {
            pRequestInProgress = true;
            updateActiveModel = false;
            if (contrail.checkIfFunction(pInitCallback)) {
                pInitCallback();
            }
        };

        function pSuccessHandler(response) {
            var resultJSON;
            if (contrail.checkIfFunction(pDataParser)) {
                resultJSON = pDataParser(response);
            } else {
                resultJSON = response;
            }

            pRequestCompleteResponse.push(response);

            if (contrail.checkIfFunction(pSuccessCallback)) {
                pSuccessCallback(resultJSON);
                initVLRequests(resultJSON);
            }

            if (response['more'] != null && response['more']) {
                setNextUrl(response['lastKey']);
                fetchPrimaryData();
            } else {
                pRequestInProgress = false;
                delete pUrlParams['lastKey'];
                pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
                if (pCompleteCallback != null) {
                    pCompleteCallback(pRequestCompleteResponse);
                    updateActiveModel = true;
                }
            }
        };

        function setNextUrl(lastKey) {
            pUrlParams['lastKey'] = lastKey;
            pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
        }

        function pRefreshHandler(response) {
            var resultJSON;
            if (contrail.checkIfFunction(pDataParser)) {
                resultJSON = pDataParser(response);
            } else {
                resultJSON = response;
            }
            if (contrail.checkIfFunction(pSuccessCallback)) {
                pRefreshSuccessCallback(resultJSON, cleanAndFresh);
                if (cleanAndFresh) {
                    cleanAndFresh = false;
                }
            }
            pRequestInProgress = false;
        };

        function pFailureHandler(response) {
            if (contrail.checkIfFunction(pFailureCallback)) {
                pFailureCallback(response);
            }
            pRequestInProgress = false;
        };

        function fetchPrimaryData() {
            contrail.ajaxHandler(pAjaxConfig, pInitHandler, pSuccessHandler, pFailureHandler);
        };

        function initVLRequests(resultJSON) {
            var vlCounter = vlRequestsInProgress.length;
            vlRequestsInProgress[vlCounter] = [];
            for (var i = 0; vlRemoteList!=null && i < vlRemoteList.length; i++) {
                var innerCounter = vlRequestsInProgress[vlCounter].length;
                vlRequestsInProgress[vlCounter][innerCounter] = 1;
                vlRequestInProgress = updateVLRequestStatus();
                var vlDataParser = vlRemoteList[i].dataParser,
                    vlSuccessCallback = vlRemoteList[i].successCallback,
                    vlSuccessHandler = function (vlResponse) {
                        var vlResultJSON;

                        if (contrail.checkIfFunction(vlDataParser)) {
                            vlResultJSON = vlDataParser(vlResponse);
                        } else {
                            vlResultJSON = vlResponse;
                        }

                        vlSuccessCallback(vlResultJSON, updateActiveModel);
                        vlRequestsInProgress[vlCounter][innerCounter] = 0;
                        vlRequestInProgress = updateVLRequestStatus();
                    },
                    vlFailureHandler = function (xhr) {
                        vlRequestsInProgress[vlCounter][innerCounter] = 0;
                        vlRequestInProgress = updateVLRequestStatus();
                        vlRemoteList[i].failureCallback(xhr)
                    };

                contrail.ajaxHandler(vlRemoteList[i].getAjaxConfig(resultJSON), vlRemoteList[i].initCallback, vlSuccessHandler, vlFailureHandler);
            }
        };

        function updateVLRequestStatus() {
            var flattenedArray = _.flatten(vlRequestsInProgress);

            var inProgress = _.find(flattenedArray, function (status) {
                return status == 1;
            });

            vlRequestInProgress = (typeof inProgress != "undefined") ? true : false;

            if (!vlRequestInProgress) {
                vlCompleteHandler();
            }
        };
    }

    return ContrailRemoteDataHandler;
});