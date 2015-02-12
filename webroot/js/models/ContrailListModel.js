/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler'
], function (_, ContrailRemoteDataHandler) {
    var ContrailDataModel = function (listModelConfig) {
        var dataView = new Slick.Data.DataView({inlineFilters: true}),
            contrailDataView = {}, contrailDataHandler = null;

        $.extend(true, contrailDataView, dataView, {
            _idOffset: 0,
            setData: function (data) {
                // Setting id for each data-item; Required to instantiate data-view.
                setId4Idx(data, this);
                this.beginUpdate();
                this.setItems(data);
                this.endUpdate();
            },
            setSearchFilter: function (searchColumns, searchFilter) {
                this.setFilterArgs({
                    searchString: '',
                    searchColumns: searchColumns
                });
                this.setFilter(searchFilter);
            },
            addData: function (data) {
                var dis = this;
                setId4Idx(data, this);
                this.beginUpdate();
                $.each(data, function (key, val) {
                    dis.addItem(val);
                });
                this.endUpdate();
            },
            updateData: function (data) {
                this.beginUpdate();
                var dis = this;
                $.each(data, function (key, val) {
                    dis.updateItem(val.cgrid, val);
                });
                this.endUpdate();
            },
            deleteDataByIds: function (ids) {
                this.beginUpdate();
                var dis = this;
                $.each(ids, function (key, val) {
                    dis.deleteItem(val);
                });
                this.endUpdate();
            },
            refreshData: function () {
                if (contrailDataHandler != null) {
                    contrailDataHandler.refreshData();
                }
            }
        });

        if (listModelConfig != null) {
            if (listModelConfig.data != null) {
                contrailDataView.setData(listModelConfig.data);
            } else if (listModelConfig.remote != null && listModelConfig.remote.ajaxConfig != null) {
                var remoteHandlerConfig = {},
                    primaryRemote = listModelConfig.remote,
                    lazyRemote = listModelConfig.lazyRemote,
                    primaryRemoteConfig = {
                        ajaxConfig: primaryRemote.ajaxConfig,
                        dataParser: primaryRemote.dataParser,
                        initCallback: primaryRemote.initCallback,
                        successCallback: function (response) {
                            contrailDataView.addData(response);
                            if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                                primaryRemote.successCallback(response, contrailDataView);
                            }
                        },
                        refreshSuccessCallback: function (response, cleanAndRefresh) {
                            if (cleanAndRefresh) {
                                contrailDataView.setData(response);
                            } else {
                                contrailDataView.addData(response);
                            }
                            if (contrail.checkIfFunction(primaryRemote.refreshSuccessCallback)) {
                                primaryRemote.refreshSuccessCallback(response, contrailDataView);
                            }
                        },
                        failureCallback: function (xhr, contrailDataView) {
                            if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                                primaryRemote.failureCallback(xhr, contrailDataView);
                            }
                        }
                    },
                    lazyRemoteConfig;

                remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;

                remoteHandlerConfig['lazyRemoteConfig'] = [];

                for (var i = 0; lazyRemote != null && i < lazyRemote.length; i++) {
                    var lSuccessCallback = lazyRemote[i].successCallback,
                        lFailureCallback = lazyRemote[i].failureCallback;

                    lazyRemoteConfig = {
                        getAjaxConfig: lazyRemote[i].getAjaxConfig,
                        dataParser: lazyRemote[i].dataParser,
                        initCallback: lazyRemote[i].initCallback,
                        successCallback: function (response) {
                            if (contrail.checkIfFunction(lSuccessCallback)) {
                                lSuccessCallback(response, contrailDataView);
                            }
                        },
                        failureCallback: function (xhr, contrailDataView) {
                            if (contrail.checkIfFunction(lFailureCallback)) {
                                lFailureCallback(xhr, contrailDataView);
                            }
                        }
                    }
                    remoteHandlerConfig['lazyRemoteConfig'].push(lazyRemoteConfig);
                }

                contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
            }
        }

        function setId4Idx(data, dis) {
            var offset = dis._idOffset;
            // Setting id for each data-item; Required to instantiate data-view.
            if (data.length > 0) {
                $.each(data, function (key, val) {
                    if (!contrail.checkIfExist(val.cgrid)) {
                        data[key].cgrid = 'id_' + (key + offset);
                    }
                });
                dis._idOffset += data.length;
            }
        }

        return contrailDataView;
    };

    return ContrailDataModel
});