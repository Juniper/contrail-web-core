/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var vCenterApi = require('../../../common/vcenter.api'),
    configApiServer = require('../../../common/configServer.api'),
    config = require('../../../../../config/config.global'),
    logutils = require('../../../utils/log.utils');
var commonUtils = require('../../../utils/common.utils');
var async = require('async');
var Promise = require('promise');
var deferred = require('deferred');
var dataCenterName = null;
var vSwitchName = null;
var dataCenterDef = deferred();
var vSwitchDef = deferred();

function queryIpPools(appData) {
    return new Promise(function(resolve,reject) {
        populatevCenterParams(appData).done(function(response) {
            vCenterApi.doCall({
                method    : 'QueryIpPools',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: 'IpPoolManager'
                        },
                        _value : 'IpPoolManager'
                    },
                    dc: {
                        _attributes: {
                            type:'Datacenter'
                        },
                        _value: dataCenterName
                    }
                }
            },appData,function(err,data,resHeaders) {
                resolve(data);
            });
        });
    });
}

function destroyIpPool(appData,poolId) {
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall({
            method    : 'DestroyIpPool',
            headers : {
                SOAPAction: "urn:vim25/5.1"
            },
            params : {
                _this : {
                    _attributes : {
                        type: 'IpPoolManager'
                    },
                    _value : 'IpPoolManager'
                },
                dc: {
                    _attributes: {
                        type:'Datacenter'
                    },
                    _value: dataCenterName
                },
                id: poolId, //Get it from QueryIpPools
                force: false
            }
        },appData,function(err,data,resHeaders) {
            resolve(data);
        });
    });
}

function destroyTask(appData,objType,name) {
    return new Promise(function(resolve,reject) {
        getIdByMobName(appData,objType,name).done(function(response) {
            vCenterApi.doCall({
                method    : 'Destroy_Task',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: objType
                        },
                        _value : response
                    },
                }
            },appData,function(err,data,resHeaders) {
                resolve(data);
            });
        });
    });
}

function createContainerView(appData,folderName,objType,name) {
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall({
                method    : 'CreateContainerView',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: 'ViewManager'
                        },
                        _value : 'ViewManager'
                    },
                    container : {
                        _attributes : {
                            type: 'Folder'
                        },
                        _value : folderName
                    },
                    type : objType,
                    recursive : true
                }
            },appData,function(err,data,resHeaders) {
                resolve(data);
            });
    });
}

function retrievePropertiesEx(appData,sessKey,objType,name) {
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall({
            method    : 'RetrievePropertiesEx',
            headers : {
                SOAPAction: "urn:vim25/5.1"
            },
            params : {
                _this : {
                    _attributes : {
                        type: 'PropertyCollector'
                    },
                    _value : 'propertyCollector'
                },
                specSet : {
                    propSet : {
                        type: 'ContainerView',
                        all: false,
                        pathSet : 'view'
                    },
                    objectSet : {
                        obj : {
                            _attributes: {
                                type: 'ContainerView'
                            },
                            _value: sessKey
                        },
                        skip: false
                    }
                },
                options: {
                    maxObjects : 1
                }

            }
        },appData,function(err,data,resHeaders) {
            resolve(data);
        });
    });
}

function retrievePropertiesExForObj(appData,objType,name) {
    var pathSet = 'name';
    if(objType == 'Task')
        pathSet = 'info';
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall({
            method    : 'RetrievePropertiesEx',
            headers : {
                SOAPAction: "urn:vim25/5.1"
            },
            params : {
                _this : {
                    _attributes : {
                        type: 'PropertyCollector'
                    },
                    _value : 'propertyCollector'
                },
                specSet : {
                    propSet : {
                        type: objType,
                        all: false,
                        pathSet : pathSet
                    },
                    objectSet : {
                        obj : {
                            _attributes: {
                                type: objType
                            },
                            _value: name
                        },
                        skip: false
                    }
                },
                options: {
                    maxObjects : 1
                }

            }
        },appData,function(err,data,resHeaders) {
            resolve(data);
        });
    });
}

function retrieveServiceContent(appData) {
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall({
                'method'    : 'RetrieveServiceContent',
                params : {
                    '_this' : {
                        _attributes : {
                            type: 'ServiceInstance'
                        },
                        _value : 'ServiceInstance'
                    }
                }
            },appData,function(err,data,resHeaders) {
                    resolve(data);
            });
    });
}

function getIdByMobName(appData,objType,name) {
    return new Promise(function(resolve,reject) {
        //Hack
        // if(objType == 'Datacenter' && name == 'kiran_dc')
        //     resolve('datacenter-5218');
        // if(objType == 'DistributedVirtualSwitch' && name == 'kiran_dvswitch')
        //     resolve('dvs-5613'); 
        // if(objType == 'DistributedVirtualPortgroup' && name == 'vn2')
        //     resolve('dvportgroup-5685');
        retrieveServiceContent(appData).done(function(response) {
            logutils.logger.debug(response);
            if(response['Fault'] != null) {
                resolve(response);
                return;
            }
            var folderName = response['RetrieveServiceContentResponse']['returnval']['rootFolder']['_value'];
            createContainerView(appData,folderName,objType,name).done(function(response) {
                if(response['Fault'] != null) 
                    resolve(response);
                else {
                    var sessKey = response['CreateContainerViewResponse']['returnval']['_value']; 
                    retrievePropertiesEx(appData,sessKey,objType,name).done(function(response) {
                        if(response['Fault'] != null) 
                            resolve(response);
                        else {
                            var objArr = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val'][0]['_value']['ManagedObjectReference'];
                            var isFound = false;
                            for(var i =0;i<objArr.length;i++) {
                                if(isFound == false) {
                                    retrievePropertiesExForObj(appData,objType,objArr[i]['_value']).done(function(response) {
                                        if(response['Fault'] != null) {
                                            resolve(response);
                                        } else {
                                            var currName = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val']['_value'];
                                            var currid = response['RetrievePropertiesExResponse']['returnval']['objects']['obj']['_value'];
                                            logutils.logger.debug(currName,currid);
                                            if(currName == name) {
                                                isFound = true;
                                                resolve(currid);
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });
    });
}

function populatevCenterParams(appData) {
    return new Promise(function(resolve,reject) {
        if(dataCenterName != null && vSwitchName != null)
            resolve();
        else {
            getIdByMobName(appData,'Datacenter',config.vcenter.datacenter).done(function(response) {
                dataCenterName = response;
                getIdByMobName(appData,'DistributedVirtualSwitch',config.vcenter.dvsswitch).done(function(response) {
                    vSwitchName = response;
                    resolve();
                });
            });
        }
    });
}

function waitForTask(appData,taskId,currDef) {
    retrievePropertiesExForObj(appData,'Task',taskId).done(function(response) {
    var currState = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val'][0]['_value']['state'];
    if(currState == 'success')
        currDef.resolve('complete');
    else
        setTimeout(function() {
            waitForTask(appData,taskInfo,currDef);
        },3000);
    });
}

function getProjectList (req, appData, callback)
{
    var projectURL = '/projects';
    var projectList = {'projects' : []};
    configApiServer.apiGet(projectURL,appData,function(err,data) {
        var projUUIDs = [],reqUrl = '';
        data = data['projects'];
        var projURLsArr = [];
        for(var i=0;i<data.length;i++) {
            projUUIDs.push(data[i]['uuid']);
            reqUrl = '/project/' + data[i]['uuid'];
            commonUtils.createReqObj(projURLsArr, reqUrl,global.HTTP_REQUEST_GET,
                null,null,null,appData);
        }
        async.map(projURLsArr,commonUtils.getAPIServerResponse(configApiServer.apiGet, true),function(error,results) {
            for(var i=0;i<results.length;i++) {
                var currProject= results[i]['project'];
                if(currProject['id_perms']['creator'] == 'vcenter-plugin')
                    projectList['projects'].push({
                        uuid: currProject['uuid'],
                        fq_name : currProject['fq_name']
                    });
            }
            callback(null, projectList);
        });
    });
}

function createNetwork(userData,appData,callback) {
    //waitFor dataCenterName & vSwitchName to be fetched
    populatevCenterParams(appData).done(function(response) {
        createPortGroup(userData,appData,callback).done(function(response) {
            var portGroupId = null;
            getIdByMobName(appData,'DistributedVirtualPortgroup',userData['name']).done(function(response) {
                portGroupId = response;
                userData['portGroupId'] = portGroupId;
                createIpPool(userData,appData,callback).done(function(response) {
                    callback(null,response);
                });
            });
        });
    });
}

function createPortGroup(userData,appData,callback) {
    var portGroupData = {
                method    : 'AddDVPortgroup_Task',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: 'VmwareDistributedVirtualSwitch'
                        },
                        _value : vSwitchName
                    },
                    spec : {
                        name: userData['name'], 
                        numPorts : 16,
                        defaultPortConfig : {
                            _attributes : {
                                "xsi:type" : 'VMwareDVSPortSetting'
                            },
                            _value : {
                                vlan : {
                                    _attributes : {
                                        'xsi:type' : 'VmwareDistributedVirtualSwitchPvlanSpec'
                                    },
                                    _value : {
                                        inherited : false,
                                        pvlanId : 401
                                    }
                                },
                                securityPolicy : {
                                    inherited : false,
                                    allowPromiscuous: {
                                        inherited : false,
                                        value : true
                                    },
                                    macChanges : {
                                        inherited: false,
                                        value: true
                                    },
                                    forgedTransmits : {
                                        inherited : false,
                                        value: true
                                    }
                                }
                            }
                        },
                        type: 'earlyBinding'
                    }
                }
            };
    return new Promise(function(resolve,reject)  {
        vCenterApi.doCall(portGroupData,appData,function(err,data,resHeaders) {
            //Once portGroup is created,create ipPool and associate
            if(null == err) {
                var taskId = data['AddDVPortgroup_TaskResponse']['returnval']['_value'];
                var currDef = new deferred();
                waitForTask(appData,taskId,currDef);
                currDef.promise.done(function(response) {
                    resolve(response);
                });
                return;
            } else {
                logutils.logger.debug(err);
            }
        })
    });
}

function createIpPool(userData,appData,callback) {
    var ipPoolData = {
                method    : 'CreateIpPool',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: 'IpPoolManager'
                        },
                        _value : 'IpPoolManager'
                    },
                    dc: {
                        _attributes: {
                            type:'Datacenter'
                        },
                        _value: dataCenterName
                    },
                    pool: {
                        name:'ip-pool-for-' + userData['name'],
                        ipv4Config: {
                            subnetAddress: userData['subnet']['address'],
                            netmask: userData['subnet']['netmask'],
                            gateway:userData['subnet']['gateway']
                        },
                        networkAssociation: {
                            network: {
                                _attributes: {
                                    type: 'Network'
                                },
                                _value: userData['portGroupId']
                            },
                            networkName: userData['portGroupId']
                        }
                    },
                }
            };
    return new Promise(function(resolve,reject) {
        vCenterApi.doCall(ipPoolData,appData,function(err,data,resHeaders) {
            resolve(data);
            // callback(err,data);
        });
    });
}

function destroyNetwork() {

}

exports.createNetwork = createNetwork;
exports.destroyNetwork = destroyNetwork;
exports.getProjectList = getProjectList;
exports.destroyTask = destroyTask;
exports.destroyIpPool = destroyIpPool;
exports.queryIpPools = queryIpPools;
