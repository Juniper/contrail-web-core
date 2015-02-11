define([
    'underscore'
], function (_) {
    var ContrailRemoteDataHandler = function (remoteHandlerConfig) {

        var primaryRemoteConfig = remoteHandlerConfig['primaryRemoteConfig'],
            lazyRemoteList = remoteHandlerConfig['lazyRemoteConfig'],
            pInitHandler, pSuccessHandler, pRefreshHandler, pFailureHandler, fetchPrimaryData,
            pAjaxConfig, pUrl, pUrlParams, pDataParser, pInitCallback, pSuccessCallback,
            pRefreshSuccessCallback, pFailureCallback, setNextUrl,
            pRequestInProgress = false, cleanAndFresh = false, self = this;

        var defaultConfig = {
            lazyLoading: {
                type: "horizontal",
                count: 50
            }
        };

        pAjaxConfig = primaryRemoteConfig.ajaxConfig;

        pUrl = pAjaxConfig['url'],
            pUrlParams = $.deparamURLArgs(pUrl);

        pDataParser = primaryRemoteConfig.dataParser;
        pInitCallback = primaryRemoteConfig.initCallback;
        pSuccessCallback = primaryRemoteConfig.successCallback;
        pRefreshSuccessCallback = primaryRemoteConfig.refreshSuccessCallback;
        pFailureCallback = primaryRemoteConfig.failureCallback;

        pInitHandler = function () {
            pRequestInProgress = true;
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
            if (contrail.checkIfFunction(pSuccessCallback)) {
                pSuccessCallback(resultJSON);
                for (var i = 0; i < lazyRemoteList.length; i++) {
                    var lDataParser = lazyRemoteList[i].dataParser,
                        lSuccessCallback = lazyRemoteList[i].successCallback,
                        lSuccessHandler = function (lazyResponse) {
                            var lazyResultJSON;

                            if (contrail.checkIfFunction(lDataParser)) {
                                lazyResultJSON = lDataParser(lazyResponse);
                            } else {
                                lazyResultJSON = lazyResponse;
                            }

                            lSuccessCallback(lazyResultJSON);
                        };

                    contrail.ajaxHandler(lazyRemoteList[i].getAjaxConfig(resultJSON), lazyRemoteList[i].initCallback, lSuccessHandler, lazyRemoteList[i].failureCallback);
                }
            }

            if (response['more'] != null && response['more']) {
                setNextUrl(response['lastKey']);
                fetchPrimaryData();
            } else {
                pRequestInProgress = false;
                delete pUrlParams['lastKey'];
                pAjaxConfig['url'] = pUrl.split('?')[0] + '?' + $.param(pUrlParams);
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

        return self;
    }

    return ContrailRemoteDataHandler;
});