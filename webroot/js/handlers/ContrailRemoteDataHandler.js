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

        var autoFetchData = remoteHandlerConfig['autoFetchData'];

        var pAjaxConfig, pUrl, pUrlParams, pDataParser, pInitCallback, pSuccessCallback,
            pRefreshSuccessCallback, pFailureCallback, pCompleteCallback,
            pRequestCompleteResponse = [], pRequestInProgress = false;

        var vlRequestsInProgress = [], vlRequestInProgress = false, vlCompleteCallback,
            resetDataFlag = false, self = this;
        var vlRequestsConfig = [];

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

        self.refreshData = function () {
            if (!self.isRequestInProgress()) {
                resetDataHandler4Refresh();
                contrail.ajaxHandler(pAjaxConfig, pInitHandler, pRefreshHandler, pFailureHandler);
            }
        };

        if(autoFetchData == null || autoFetchData) {
            fetchPrimaryData();
        }

        return self;

        function vlCompleteHandler() {
            if (contrail.checkIfFunction(vlCompleteCallback)) {
                vlCompleteCallback();
            }
        };

        function pInitHandler() {
            pRequestInProgress = true;
            if(vlRemoteList != null && vlRemoteList.length > 0) {
                vlRequestInProgress = true;
            }
            if (contrail.checkIfFunction(pInitCallback)) {
                pInitCallback();
            }
        };

        function pSuccessHandler(response) {
            var resultJSON = {};
            if (contrail.checkIfFunction(pDataParser)) {
                try {
                    resultJSON = pDataParser(response);
                } catch (error) {
                    console.log(error.stack);
                }
            } else {
                if(response != null) {
                    resultJSON = response;
                }
            }

            pRequestCompleteResponse.push(response);

            if (contrail.checkIfFunction(pSuccessCallback)) {
                pSuccessCallback(resultJSON, resetDataFlag, response);
                resetDataFlag = false;
                initVLRequests(resultJSON);
            }

            if (response != null && response['more'] != null && response['more']) {
                setNextUrl(response['lastKey']);
                fetchPrimaryData();
            } else if (response != null && response['total'] != null && response['chunk'] != null && ((response['chunk'] * response['chunkSize']) < response['total']) ) {
                var postData = JSON.parse(pAjaxConfig['data']),
                    chunk = postData['chunk'] + 1;
                postData['chunk'] = chunk;
                pAjaxConfig['data'] = JSON.stringify(postData);
                fetchPrimaryData();
            } else {
                pRequestInProgress = false;
                delete pUrlParams['lastKey'];
                if(response['total'] != null) {
                    var postData = JSON.parse(pAjaxConfig['data']);
                    postData['chunk'] = 1;
                    pAjaxConfig['data'] = JSON.stringify(postData);
                }
                pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
                if (pCompleteCallback != null) {
                    pCompleteCallback(pRequestCompleteResponse);
                    check4AllRequestComplete();
                }
            }
        };

        function setNextUrl(lastKey) {
            pUrlParams['lastKey'] = lastKey;
            pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
        }

        function pRefreshHandler(response) {
            pSuccessHandler(response);
            if (contrail.checkIfFunction(pRefreshSuccessCallback)) {
                pRefreshSuccessCallback();
            }
        };

        function pFailureHandler(xhr) {
            if (contrail.checkIfFunction(pFailureCallback)) {
                xhr['ajaxConfig'] = pAjaxConfig;
                pFailureCallback(xhr);
            }
            pRequestInProgress = false;
            updateVLRequestStatus();
            if (pCompleteCallback != null) {
                pCompleteCallback(pRequestCompleteResponse);
                check4AllRequestComplete();
            }
        };

        function fetchPrimaryData() {
            contrail.ajaxHandler(pAjaxConfig, pInitHandler, pSuccessHandler, pFailureHandler);
        };

        function initVLRequests(resultJSON) {
            var vlCounter = vlRequestsInProgress.length;
            vlRequestsInProgress[vlCounter] = [];
            vlRequestsConfig[vlCounter] = [];
            if (vlRemoteList != null) {
                for (var i = 0; i < vlRemoteList.length; i++) {
                    var vlRemote = vlRemoteList[i],
                        innerCounter = vlRequestsInProgress[vlCounter].length;
                    vlRequestsInProgress[vlCounter][innerCounter] = 1;
                    vlRequestsConfig[vlCounter][innerCounter] =
                        vlRemoteList[i].getAjaxConfig(resultJSON);
                    updateVLRequestStatus();
                    var vlDataParser = vlRemote.dataParser,
                        vlSuccessCallback = vlRemote.successCallback,
                        vlFailureCallback = vlRemote.failureCallback;

                    var vlSuccessHandler = getVLSuccessHandlerFn(vlDataParser, vlSuccessCallback, vlCounter, innerCounter);

                    var vlFailureHandler =
                        getVLFailureHandlerFn(vlFailureCallback, vlCounter,
                                              innerCounter, vlRequestsConfig);

                    contrail.ajaxHandler(vlRemoteList[i].getAjaxConfig(resultJSON), vlRemoteList[i].initCallback, vlSuccessHandler, vlFailureHandler);
                }
            }
        };

        function getVLSuccessHandlerFn(vlDataParser, vlSuccessCallback, vlCounter, innerCounter) {
            return function (vlResponse) {
                var vlResultJSON;

                if (contrail.checkIfFunction(vlDataParser)) {
                    vlResultJSON = vlDataParser(vlResponse);
                } else {
                    vlResultJSON = vlResponse;
                }

                vlSuccessCallback(vlResultJSON);
                vlRequestsInProgress[vlCounter][innerCounter] = 0;
                updateVLRequestStatus();
            }
        };

        function getVLFailureHandlerFn(vlFailureCallback, vlCounter,
                                       innerCounter, vlRequestsConfig) {
            return function (xhr) {
                var ajaxConfig = null;
                if ((null != vlRequestsConfig[vlCounter]) &&
                    (null != vlRequestsConfig[vlCounter][innerCounter])) {
                    ajaxConfig =
                        JSON.parse(JSON.stringify(vlRequestsConfig[vlCounter][innerCounter]));
                }
                vlRequestsInProgress[vlCounter][innerCounter] = 0;
                xhr['ajaxConfig'] = ajaxConfig;
                vlFailureCallback(xhr);
                vlRequestsConfig[vlCounter][innerCounter] = null;
                updateVLRequestStatus();
            };
        };

        function updateVLRequestStatus() {
            var flattenedArray = _.flatten(vlRequestsInProgress);

            var inProgress = _.find(flattenedArray, function (status) {
                return status == 1;
            });

            vlRequestInProgress = (typeof inProgress != "undefined") ? true : false;

            if (!vlRequestInProgress) {
                vlCompleteHandler();
                check4AllRequestComplete();
            }
        };

        function check4AllRequestComplete() {
            if(!self.isRequestInProgress() && remoteHandlerConfig['onAllRequestsCompleteCallback'] != null) {
                remoteHandlerConfig.onAllRequestsCompleteCallback();
            }
        };

        function resetDataHandler4Refresh() {
            resetDataFlag = true;
            pRequestCompleteResponse = [];
            pRequestInProgress = false;
            vlRequestsInProgress = [];
            vlRequestInProgress = false;
        };
    };

    return ContrailRemoteDataHandler;
});
