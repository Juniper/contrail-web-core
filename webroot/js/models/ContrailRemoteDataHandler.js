/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ContrailRemoteDataHandler = function (remoteHandlerConfig) {

        var primaryRemoteConfig = remoteHandlerConfig['primaryRemoteConfig'],
            lazyRemoteList = remoteHandlerConfig['lazyRemoteConfig'],
            pInitHandler, pSuccessHandler, pRefreshHandler, pFailureHandler, fetchPrimaryData,
            pAjaxConfig, pUrl, pUrlParams, pDataParser, pInitCallback, pSuccessCallback,
            pRefreshSuccessCallback, pFailureCallback, pUpdateCacheCallback, setNextUrl,
            pRequestCompleteResponse = [], lRequestsInProgress = [], pRequestInProgress, lRequestInProgress,
            completeCallback, completeHandler, cleanAndFresh = false, self = this, updateActiveModel = false;

        pAjaxConfig = primaryRemoteConfig.ajaxConfig;
        pUrl = pAjaxConfig['url'];
        pUrlParams = $.deparamURLArgs(pUrl);

        pDataParser = primaryRemoteConfig.dataParser;
        pInitCallback = primaryRemoteConfig.initCallback;
        pSuccessCallback = primaryRemoteConfig.successCallback;
        pRefreshSuccessCallback = primaryRemoteConfig.refreshSuccessCallback;
        pFailureCallback = primaryRemoteConfig.failureCallback;
        pUpdateCacheCallback = primaryRemoteConfig.updateCacheCallback;
        completeCallback = remoteHandlerConfig.finalCallback;

        completeHandler = function() {
            if (contrail.checkIfFunction(completeCallback)) {
                completeCallback();
            }
        };

        pInitHandler = function () {
            pRequestInProgress = true;
            updateActiveModel = false;
            if (contrail.checkIfFunction(pInitCallback)) {
                pInitCallback();
            }
        };

        pSuccessHandler = function (response) {
            var resultJSON;
            if (contrail.checkIfFunction(pDataParser)) {
                resultJSON = pDataParser(response);
            } else {
                resultJSON = response;
            }

            pRequestCompleteResponse.push(response);

            if (contrail.checkIfFunction(pSuccessCallback)) {
                pSuccessCallback(resultJSON);
                var counter = lRequestsInProgress.length;
                lRequestsInProgress[counter] = [];
                for (var i = 0; i < lazyRemoteList.length; i++) {
                    var innerCounter = lRequestsInProgress[counter].length;
                    lRequestsInProgress[counter][innerCounter] = 1;
                    lRequestInProgress = computeLazyRequestStatus(lRequestsInProgress, completeHandler);
                    var lDataParser = lazyRemoteList[i].dataParser,
                        lSuccessCallback = lazyRemoteList[i].successCallback,
                        lSuccessHandler = function (lazyResponse) {
                            var lazyResultJSON;

                            if (contrail.checkIfFunction(lDataParser)) {
                                lazyResultJSON = lDataParser(lazyResponse);
                            } else {
                                lazyResultJSON = lazyResponse;
                            }

                            lSuccessCallback(lazyResultJSON, updateActiveModel);
                            lRequestsInProgress[counter][innerCounter] = 0;
                            lRequestInProgress = computeLazyRequestStatus(lRequestsInProgress, completeHandler);
                        },
                        lFailureHandler = function(xhr) {
                            lRequestsInProgress[counter][innerCounter] = 0;
                            lRequestInProgress = computeLazyRequestStatus(lRequestsInProgress, completeHandler);
                            lazyRemoteList[i].failureCallback(xhr)
                        };

                    contrail.ajaxHandler(lazyRemoteList[i].getAjaxConfig(resultJSON), lazyRemoteList[i].initCallback, lSuccessHandler, lFailureHandler);
                }
            }

            if (response['more'] != null && response['more']) {
                setNextUrl(response['lastKey']);
                fetchPrimaryData();
            } else {
                pRequestInProgress = false;
                delete pUrlParams['lastKey'];
                pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
                if(pUpdateCacheCallback != null) {
                    pUpdateCacheCallback(pRequestCompleteResponse);
                    updateActiveModel = true;
                }
            }
        };

        setNextUrl = function (lastKey) {
            pUrlParams['lastKey'] = lastKey;
            pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
        }

        pRefreshHandler = function (response) {
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

        pFailureHandler = function (response) {
            if (contrail.checkIfFunction(pFailureCallback)) {
                pFailureCallback(response);
            }
            pRequestInProgress = false;
        };

        fetchPrimaryData = function () {
            contrail.ajaxHandler(pAjaxConfig, pInitHandler, pSuccessHandler, pFailureHandler);
        };

        self.refreshData = function () {
            //TODO
            /*
             if (!pRequestInProgress) {
             cleanAndFresh = true;
             contrail.ajaxHandler(pAjaxConfig, pInitHandler, pRefreshHandler, pFailureHandler);
             }
             */
        };

        fetchPrimaryData();

        this.isPrimaryRequestInProgress = function() {
            return pRequestInProgress;
        }

        this.isLazyRequestInProgress = function() {
            return lRequestInProgress;
        }

        this.isRequestInProgress = function() {
            if(pRequestInProgress || lRequestInProgress) {
                return true;
            } else {
                return false;
            }
        };

        return self;
    }

    function computeLazyRequestStatus(lRequestsInProgress, completeHandler) {
        var flattenedArray = _.flatten(lRequestsInProgress);

        var inProgress = _.find(flattenedArray, function(status) {
            return status == 1;
        });

        var requestInProgress = (typeof inProgress != "undefined") ? true : false;

        if(!requestInProgress) {
            completeHandler();
        }

        return requestInProgress;
    }

    return ContrailRemoteDataHandler;
});