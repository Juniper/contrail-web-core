/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-list-model'
], function (_, ContrailListModel) {
    var coCache = {
        'breadcrumb': {},
        'server-manager': {},
        'monitor-networking': {
            graphs: {},
            charts: {},
            lists: {}
        }
    };

    var Cache = function () {
        this.init = function () {};

        this.cleanCache = function(key) {
            this.set(key, {});
        };

        this.reset = function() {
            coCache = {
                'breadcrumb': {},
                'server-manager': {},
                'monitor-networking': {
                    graphs: {},
                    charts: {},
                    lists: {}
                }
            };
        };

        this.get = function (key) {
            var keyList = key.split(':'),
                cache = coCache;

            for (var i = 0; i < keyList.length; i++) {
                cache = cache[keyList[i]];
                if (cache == null) {
                    return cache;
                }
            }

            return cache;
        };

        this.set = function (key, value) {
            var keyList = key.split(':'),
                cache = coCache;

            for (var i = 0; i < keyList.length; i++) {
                if (cache[keyList[i]] == null && i != (keyList.length - 1)) {
                    cache[keyList[i]] = {};
                    cache = cache[keyList[i]];
                } else if (i == (keyList.length - 1)) {
                    cache[keyList[i]] = value;
                } else if (cache[keyList[i]] != null) {
                    cache = cache[keyList[i]];
                }
            }
        };

        this.getDataFromCache = function (ucid) {
            return this.get(ucid);
        };

        this.setData2Cache = function (ucid, dataObject) {
            this.set(ucid, {lastUpdateTime: $.now(), dataObject: dataObject});
        };

        this.isCacheValid = function(cacheConfig, cachedData, modelType) {
            var useCache = true;

            //TODO: isRequestInProgress check should not be required
            if (cacheConfig.cacheTimeout == 0 || cachedData == null || cachedData['dataObject'][modelType].error || cachedData['dataObject'][modelType].isRequestInProgress()) {
                useCache = false;
            } else if (cachedData != null && (cacheConfig.cacheTimeout < ($.now() - cachedData['lastUpdateTime'])) && cacheConfig.loadOnTimeout == false) {
                useCache = false;
            }

            return useCache;
        };
    };

    return Cache;
});