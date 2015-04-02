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
        this.init = function () {
            initProjectCache();
        };

        this.cleanCache = function(key) {
            this.set(key, {});
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
        }

        this.getAllDomains = function() {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_ALL_DOMAINS
                    },
                    dataParser: function(response) {
                        return  $.map(response.domains, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[0],
                                value: n.uuid
                            };
                        });
                    },
                    errorCallback: function() {
                        //TODO
                    }
                },
                cacheConfig : {
                    ucid: ctwc.UCID_BC_ALL_DOMAINS,
                    loadOnTimeout: false
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
        };

        this.getProjects4Domain = function(domain) {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: networkPopulateFns.getProjectsURL(domain)
                    },
                    dataParser: function(response) {
                        return  $.map(response.projects, function (n, i) {
                            return {
                                fq_name: n.fq_name.join(':'),
                                name: n.fq_name[1],
                                value: n.uuid
                            };
                        });
                    },
                    errorCallback: function() {
                        //TODO
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS, domain),
                    loadOnTimeout: false
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
        };

        this.getNetworks4Project = function(projectFQN) {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_PROJECT_ALL_NETWORKS, projectFQN)
                    },
                    dataParser: ctwp.parseNetwork4Breadcrumb,
                    errorCallback: function() {
                        //TODO
                    }
                },
                cacheConfig : {
                    ucid: ctwc.get(ctwc.UCID_BC_PROJECT_ALL_NETWORKS, projectFQN),
                    loadOnTimeout: false
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);

            return contrailListModel;
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

    function initProjectCache() {
        var listModelConfig = {
            remote: {
                ajaxConfig: {
                    url: networkPopulateFns.getProjectsURL(ctwc.DEFAULT_DOMAIN),
                    type: 'GET'
                },
                hlRemoteConfig: ctwgc.getProjectDetailsHLazyRemoteConfig(),
                dataParser: ctwp.projectDataParser
            },
            cacheConfig: {
                ucid: ctwc.UCID_DEFAULT_DOMAIN_PROJECT_LIST //TODO: Handle multi-tenancy
            }
        };

        //var contrailListModel = new ContrailListModel(listModelConfig);
    }

    return Cache;
});