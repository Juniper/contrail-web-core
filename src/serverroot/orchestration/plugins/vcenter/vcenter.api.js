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
var rootFolder = null;
var networkFolder = null;
var dataCenterDef = deferred();
var vSwitchDef = deferred();
var mobCache = {
    'DistributedVirtualPortgroup' : {}
}

function logout(appData) {
    return new Promise(function(resolve,reject) {
            vCenterApi.doCall({
                method    : 'Logout',
                headers : {
                    SOAPAction: "urn:vim25/5.1"
                },
                params : {
                    _this : {
                        _attributes : {
                            type: 'SessionManager'
                        },
                        _value : 'SessionManager'
                    }
                }
            },appData,function(err,data,resHeaders) {
                resolve(data);
            });
        });
}

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
                var ipPoolsList = [];
                if(data['QueryIpPoolsResponse'] instanceof Array)
                    ipPoolsList = data['QueryIpPoolsResponse'][0]['_value']['returnval'];
                else
                    ipPoolsList = data['QueryIpPoolsResponse']['returnval'];
                var ipPoolMap = {};
                //Create a map with ip-pool name as key and id as value
                for(var i=0;i<ipPoolsList.length;i++) {
                    ipPoolMap[ipPoolsList[i]['name']] = ipPoolsList[i]['id'];
                }
                resolve(ipPoolMap);
            });
        });
    });
}

function destroyIpPool(appData,poolId) {
    return new Promise(function(resolve,reject) {
        populatevCenterParams(appData).done(function(response) {
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
    });
}

function destroyTask(appData,objType,name) {
    return new Promise(function(resolve,reject) {
        getIdByMobName(appData,objType,name).done(function(response) {
            if(response == false) {
                resolve({Fault:{faultstring:objType + ' ' + name + " doesn't exist"}});
                return;
            }
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


function retrievePropertiesExForObj(appData,objType,name,path) {
    var pathSet = 'name';
    if(objType == 'Task')
        pathSet = 'info';
    if(path != null)
        pathSet = path;
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

function getRootFolder(appData,folderName) {
    return new Promise(function(resolve,reject) {
        if(folderName != null)
            resolve(folderName);
        if(rootFolder != null)
            resolve(rootFolder);
        else
            retrieveServiceContent(appData).done(function(response) {
                var folderName = response['RetrieveServiceContentResponse']['returnval']['rootFolder']['_value'];
                rootFolder = folderName;
                resolve(folderName);
            });
    });
}

function getNetworkFolderForDataCenter(appData,datacenterId) {
    return new Promise(function(resolve,reject) {
        if(networkFolder != null) {
            resolve(networkFolder);
        } else
            retrievePropertiesExForObj(appData,'Datacenter',datacenterId,'networkFolder').done(function(response) {
                var folderName = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val']['_value'];
                networkFolder = folderName;
                resolve(folderName);
            });
    });
}


function getIdByMobName(appData,objType,name,folderName) {
    return new Promise(function(resolve,reject) {
        getRootFolder(appData,folderName).done(function(folderName) {
            createContainerView(appData,folderName,objType,name).done(function(response) {
                if(response['Fault'] != null) 
                    resolve(response);
                else {
                    var sessKey = response['CreateContainerViewResponse']['returnval']['_value']; 
                    retrievePropertiesEx(appData,sessKey,objType,name).done(function(response) {
                        if(response['Fault'] != null) 
                            resolve(response);
                        else {
                            var objArr = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val'];
                            if(objArr instanceof Array)
                                objArr = objArr[0]['_value']['ManagedObjectReference'];
                            else
                                objArr = objArr['ManagedObjectReference'];
                            //If only one entity is present,wrap it in an array 
                            if(!(objArr instanceof Array)) 
                                objArr = [objArr];
                            function matchObjName(objId,callback) {
                                //If we are maintaining cache for the given mobType
                                if(objType in mobCache) {
                                    if(mobCache[objType][objId['_value']] != null) {
                                        if(mobCache[objType][objId['_value']] == name) {
                                            resolve(objId['_value']);
                                            callback({'found':true},true);
                                            return;
                                        } else {
                                            callback(null,false);
                                            return;
                                        }
                                    }
                                }
                                retrievePropertiesExForObj(appData,objType,objId['_value']).done(function(response) {
                                    if(response['Fault'] != null) {
                                        resolve(response);
                                    } else {
                                        var currName = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val']['_value'];
                                        var currid = response['RetrievePropertiesExResponse']['returnval']['objects']['obj']['_value'];
                                        logutils.logger.debug(currName,currid);
                                        //Populate mobCache
                                        if(objType in mobCache)
                                            mobCache[objType][currid] = currName;
                                        if(currName == name) {
                                            resolve(currid);
                                            callback({'found':true},true);
                                        } else
                                            callback(null,false);
                                    }
                                });
                            }
                            async.mapSeries(objArr,matchObjName,function(err,results) {
                                //If objId not found for the given name
                                if(results.indexOf(true) < 0)
                                    resolve(false);
                            });
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
                if(response == false) {
                    resolve(false);
                    return;
                } else
                    dataCenterName = response;
                getIdByMobName(appData,'DistributedVirtualSwitch',config.vcenter.dvsswitch).done(function(response) {
                    if(response == false) {
                        resolve(false);
                        return;
                    }
                    vSwitchName = response;
                    resolve();
                });
            });
        }
    });
}
//No of times to retry to check for a task status
var maxRetryCnt = 100;
function waitForTask(appData,taskId,currDef,retryCnt) {
    if(retryCnt == null)
        retryCnt = 0;
    if(retryCnt == maxRetryCnt) {
        currDef.resolve('');
        return;
    }
    retryCnt++;
    retrievePropertiesExForObj(appData,'Task',taskId).done(function(response) {
    var currState = response['RetrievePropertiesExResponse']['returnval']['objects']['propSet']['val'][0]['_value']['state'];
    if(currState == 'success')
        currDef.resolve('complete');
    else if(currState == 'error') {
        currDef.resolve('');
    } else 
        setTimeout(function() {
            waitForTask(appData,taskId,currDef);
        },200);
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
        if(response == false) {
            callback(null,{'Fault': {'faultstring': "Given Datacenter/switchname doesn't exist"}});
            return;
        }
        createPortGroup(userData,appData,callback).done(function(response) {
            var portGroupId = null;
            if(response['Fault'] != null) {
                callback(null,response);
                return;
            }
            getNetworkFolderForDataCenter(appData,dataCenterName).done(function(folderName) {
                getIdByMobName(appData,'DistributedVirtualPortgroup',userData['name'],folderName).done(function(response) {
                    portGroupId = response;
                    userData['portGroupId'] = portGroupId;
                    //Check if ip-pool already exists
                    queryIpPools(appData).done(function(response) {
                        if(response['ip-pool-for-' + userData['name']] != null) {
                            destroyIpPool(appData,response['ip-pool-for-' + userData['name']]).done(function(response) {
                                if(response['Fault'] != null) {
                                    callback(null,response);
                                    return;
                                }
                                createIpPool(userData,appData,callback).done(function(response) {
                                    callback(null,response);
                                });
                            });
                        } else {
                                createIpPool(userData,appData,callback).done(function(response) {
                                    callback(null,response);
                                });
                        }
                    });
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
                                        pvlanId : userData['pVlanId']
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
                resolve(data);
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
                            gateway:userData['subnet']['gateway'],
                            dhcpServerAvailable : false/*,
                            ipPoolEnabled : true    //Check - range is mandatory for setting this to true??
                            */
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
exports.logout = logout;
