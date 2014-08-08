/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var configSummWGenData = 
[
    {
        "value": [
            {
                "name": "nodeg3", 
                "value": {
                    "ModuleCpuState": {
                        "api_server_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406953563743}": 0, 
                                    "{\"ts\":1391407013665373}": 0, 
                                    "{\"ts\":1391407073767711}": 0, 
                                    "{\"ts\":1391407133869796}": 0, 
                                    "{\"ts\":1391407193971740}": 0, 
                                    "{\"ts\":1391407254073611}": 2.5, 
                                    "{\"ts\":1391407314175818}": 0, 
                                    "{\"ts\":1391407374278545}": 0, 
                                    "{\"ts\":1391407434380324}": 0, 
                                    "{\"ts\":1391407494481525}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:54.73": 2.5, 
                                    "2014 Feb 03 06:01:54.175": 0, 
                                    "2014 Feb 03 06:02:54.278": 0, 
                                    "2014 Feb 03 06:03:54.380": 0, 
                                    "2014 Feb 03 06:04:54.481": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "4", 
                                    "b3": "1", 
                                    "sum": "2.5"
                                }
                            }
                        ], 
                        "api_server_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406953563743}": 306974, 
                                    "{\"ts\":1391407013665373}": 306974, 
                                    "{\"ts\":1391407073767711}": 306974, 
                                    "{\"ts\":1391407133869796}": 306974, 
                                    "{\"ts\":1391407193971740}": 306974, 
                                    "{\"ts\":1391407254073611}": 306974, 
                                    "{\"ts\":1391407314175818}": 306974, 
                                    "{\"ts\":1391407374278545}": 306974, 
                                    "{\"ts\":1391407434380324}": 306974, 
                                    "{\"ts\":1391407494481525}": 306974
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:54.73": 306974, 
                                    "2014 Feb 03 06:01:54.175": 306974, 
                                    "2014 Feb 03 06:02:54.278": 306974, 
                                    "2014 Feb 03 06:03:54.380": 306974, 
                                    "2014 Feb 03 06:04:54.481": 306974
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "5", 
                                    "sum": "1534870"
                                }
                            }
                        ], 
                        "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                        "module_cpu_info": [
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "cpuload": {
                                        "fifteen_min_avg": 0, 
                                        "five_min_avg": 0, 
                                        "one_min_avg": 0
                                    }, 
                                    "meminfo": {
                                        "peakvirt": 306974, 
                                        "res": 51195, 
                                        "virt": 306974
                                    }, 
                                    "num_cpu": 4, 
                                    "sys_mem_info": {
                                        "buffers": 50544, 
                                        "free": 31369465, 
                                        "total": 33639731, 
                                        "used": 2270265
                                    }
                                }, 
                                "instance_id": "0", 
                                "module_id": "ApiServer"
                            }
                        ], 
                        "process_state_list": [
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403659037743", 
                                "last_stop_time": null, 
                                "process_name": "contrail-api:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403651020907", 
                                "last_stop_time": null, 
                                "process_name": "redis-config", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403649018179", 
                                "last_stop_time": null, 
                                "process_name": "contrail-config-nodemgr", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403655031113", 
                                "last_stop_time": null, 
                                "process_name": "contrail-discovery:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403663046971", 
                                "last_stop_time": null, 
                                "process_name": "contrail-svc-monitor", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403657033255", 
                                "last_stop_time": null, 
                                "process_name": "ifmap", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403661041870", 
                                "last_stop_time": null, 
                                "process_name": "contrail-schema", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403653025988", 
                                "last_stop_time": null, 
                                "process_name": "contrail-zookeeper", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }
                        ]
                    }
                }
            }, 
            {
                "name": "nodeg2", 
                "value": {
                    "ModuleCpuState": {
                        "api_server_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406952941501}": 0, 
                                    "{\"ts\":1391407013043674}": 0, 
                                    "{\"ts\":1391407073145573}": 0, 
                                    "{\"ts\":1391407133248227}": 0, 
                                    "{\"ts\":1391407193350352}": 0, 
                                    "{\"ts\":1391407253451654}": 0, 
                                    "{\"ts\":1391407313553920}": 0, 
                                    "{\"ts\":1391407373655570}": 0, 
                                    "{\"ts\":1391407433757146}": 0, 
                                    "{\"ts\":1391407493859057}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:53.451": 0, 
                                    "2014 Feb 03 06:01:53.553": 0, 
                                    "2014 Feb 03 06:02:53.655": 0, 
                                    "2014 Feb 03 06:03:53.757": 0, 
                                    "2014 Feb 03 06:04:53.859": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "5", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "api_server_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406952941501}": 307011, 
                                    "{\"ts\":1391407013043674}": 307011, 
                                    "{\"ts\":1391407073145573}": 307011, 
                                    "{\"ts\":1391407133248227}": 307011, 
                                    "{\"ts\":1391407193350352}": 307011, 
                                    "{\"ts\":1391407253451654}": 307011, 
                                    "{\"ts\":1391407313553920}": 307011, 
                                    "{\"ts\":1391407373655570}": 307011, 
                                    "{\"ts\":1391407433757146}": 307011, 
                                    "{\"ts\":1391407493859057}": 307011
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:53.451": 307011, 
                                    "2014 Feb 03 06:01:53.553": 307011, 
                                    "2014 Feb 03 06:02:53.655": 307011, 
                                    "2014 Feb 03 06:03:53.757": 307011, 
                                    "2014 Feb 03 06:04:53.859": 307011
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "5", 
                                    "sum": "1535055"
                                }
                            }
                        ], 
                        "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                        "module_cpu_info": [
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "meminfo": {
                                        "peakvirt": 286511, 
                                        "res": 37400, 
                                        "virt": 286511
                                    }, 
                                    "num_cpu": 4
                                }, 
                                "instance_id": "0", 
                                "module_id": "ServiceMonitor"
                            }, 
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "meminfo": {
                                        "peakvirt": 301395, 
                                        "res": 41693, 
                                        "virt": 301395
                                    }, 
                                    "num_cpu": 4
                                }, 
                                "instance_id": "0", 
                                "module_id": "Schema"
                            }, 
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "cpuload": {
                                        "fifteen_min_avg": 0, 
                                        "five_min_avg": 0.02, 
                                        "one_min_avg": 0.01
                                    }, 
                                    "meminfo": {
                                        "peakvirt": 307011, 
                                        "res": 51589, 
                                        "virt": 307011
                                    }, 
                                    "num_cpu": 4, 
                                    "sys_mem_info": {
                                        "buffers": 117301, 
                                        "free": 28529352, 
                                        "total": 33639731, 
                                        "used": 5110378
                                    }
                                }, 
                                "instance_id": "0", 
                                "module_id": "ApiServer"
                            }
                        ], 
                        "process_state_list": [
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403665557719", 
                                "last_stop_time": null, 
                                "process_name": "contrail-api:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403657541884", 
                                "last_stop_time": null, 
                                "process_name": "redis-config", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403655537501", 
                                "last_stop_time": null, 
                                "process_name": "contrail-config-nodemgr", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403661550733", 
                                "last_stop_time": null, 
                                "process_name": "contrail-discovery:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403669567686", 
                                "last_stop_time": null, 
                                "process_name": "contrail-svc-monitor", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403663552638", 
                                "last_stop_time": null, 
                                "process_name": "ifmap", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403667562627", 
                                "last_stop_time": null, 
                                "process_name": "contrail-schema", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403659546955", 
                                "last_stop_time": null, 
                                "process_name": "contrail-zookeeper", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }
                        ], 
                        "schema_xmer_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406958794357}": 2.5, 
                                    "{\"ts\":1391407018898131}": 0, 
                                    "{\"ts\":1391407079000517}": 0, 
                                    "{\"ts\":1391407139101453}": 2.5, 
                                    "{\"ts\":1391407199203261}": 0, 
                                    "{\"ts\":1391407259305400}": 0, 
                                    "{\"ts\":1391407319407971}": 0, 
                                    "{\"ts\":1391407379511074}": 0, 
                                    "{\"ts\":1391407439613611}": 0, 
                                    "{\"ts\":1391407499715922}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:59.305": 0, 
                                    "2014 Feb 03 06:01:59.407": 0, 
                                    "2014 Feb 03 06:02:59.511": 0, 
                                    "2014 Feb 03 06:03:59.613": 0, 
                                    "2014 Feb 03 06:04:59.715": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "5", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "schema_xmer_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406958794357}": 301395, 
                                    "{\"ts\":1391407018898131}": 301395, 
                                    "{\"ts\":1391407079000517}": 301395, 
                                    "{\"ts\":1391407139101453}": 301395, 
                                    "{\"ts\":1391407199203261}": 301395, 
                                    "{\"ts\":1391407259305400}": 301395, 
                                    "{\"ts\":1391407319407971}": 301395, 
                                    "{\"ts\":1391407379511074}": 301395, 
                                    "{\"ts\":1391407439613611}": 301395, 
                                    "{\"ts\":1391407499715922}": 301395
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:59.305": 301395, 
                                    "2014 Feb 03 06:01:59.407": 301395, 
                                    "2014 Feb 03 06:02:59.511": 301395, 
                                    "2014 Feb 03 06:03:59.613": 301395, 
                                    "2014 Feb 03 06:04:59.715": 301395
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "5", 
                                    "sum": "1506975"
                                }
                            }
                        ], 
                        "service_monitor_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406958806974}": 2.5, 
                                    "{\"ts\":1391407018909374}": 0, 
                                    "{\"ts\":1391407079011153}": 0, 
                                    "{\"ts\":1391407139112767}": 0, 
                                    "{\"ts\":1391407199214363}": 0, 
                                    "{\"ts\":1391407259316174}": 0, 
                                    "{\"ts\":1391407319419589}": 0, 
                                    "{\"ts\":1391407379521089}": 0, 
                                    "{\"ts\":1391407439621947}": 0, 
                                    "{\"ts\":1391407499722782}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:59.316": 0, 
                                    "2014 Feb 03 06:01:59.419": 0, 
                                    "2014 Feb 03 06:02:59.521": 0, 
                                    "2014 Feb 03 06:03:59.621": 0, 
                                    "2014 Feb 03 06:04:59.722": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "5", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "service_monitor_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391406958806974}": 286511, 
                                    "{\"ts\":1391407018909374}": 286511, 
                                    "{\"ts\":1391407079011153}": 286511, 
                                    "{\"ts\":1391407139112767}": 286511, 
                                    "{\"ts\":1391407199214363}": 286511, 
                                    "{\"ts\":1391407259316174}": 286511, 
                                    "{\"ts\":1391407319419589}": 286511, 
                                    "{\"ts\":1391407379521089}": 286511, 
                                    "{\"ts\":1391407439621947}": 286511, 
                                    "{\"ts\":1391407499722782}": 286511
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:59.316": 286511, 
                                    "2014 Feb 03 06:01:59.419": 286511, 
                                    "2014 Feb 03 06:02:59.521": 286511, 
                                    "2014 Feb 03 06:03:59.621": 286511, 
                                    "2014 Feb 03 06:04:59.722": 286511
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b300000": "5", 
                                    "sum": "1432555"
                                }
                            }
                        ]
                    }
                }
            }
        ]
    }, 
    {
        "value": [
            {
                "name": "nodeg2:Config:ApiServer:0", 
                "value": {
                    "ModuleClientState": {
                        "client_info": {
                            "collector_name": "nodeg3", 
                            "http_port": 8084, 
                            "pid": 3924, 
                            "primary": "10.204.217.43:8086", 
                            "secondary": "10.204.217.42:8086", 
                            "start_time": 1391403642078081, 
                            "status": "Established", 
                            "successful_connections": 1
                        }
                    }, 
                    "ModuleServerState": {
                        "generator_info": [
                            {
                                "gen_attr": {
                                    "connect_time": 1391403642086352, 
                                    "connects": 1, 
                                    "in_clear": false, 
                                    "reset_time": 0, 
                                    "resets": 0
                                }, 
                                "hostname": "nodeg3"
                            }
                        ]
                    }
                }
            }, 
            {
                "name": "nodeg3:Config:ApiServer:0", 
                "value": {
                    "ModuleClientState": {
                        "client_info": {
                            "collector_name": "nodeg3", 
                            "http_port": 8084, 
                            "pid": 3541, 
                            "primary": "10.204.217.43:8086", 
                            "secondary": "10.204.217.42:8086", 
                            "start_time": 1391403643613841, 
                            "status": "Established", 
                            "successful_connections": 1
                        }
                    }, 
                    "ModuleServerState": {
                        "generator_info": [
                            {
                                "gen_attr": {
                                    "connect_time": 1391403643618085, 
                                    "connects": 1, 
                                    "in_clear": false, 
                                    "reset_time": 0, 
                                    "resets": 0
                                }, 
                                "hostname": "nodeg3"
                            }
                        ]
                    }
                }
            }
        ]
    }
];

var configSummWGenData_OP =
[
    {
        "name": "nodeg3", 
        "value": {
            "Config:ApiServer:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8084, 
                        "pid": 3541, 
                        "primary": "10.204.217.43:8086", 
                        "secondary": "10.204.217.42:8086", 
                        "start_time": 1391403643613841, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403643618085, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }, 
            "configNode": {
                "ModuleCpuState": {
                    "api_server_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391406953563743}": 0, 
                                "{\"ts\":1391407013665373}": 0, 
                                "{\"ts\":1391407073767711}": 0, 
                                "{\"ts\":1391407133869796}": 0, 
                                "{\"ts\":1391407193971740}": 0, 
                                "{\"ts\":1391407254073611}": 2.5, 
                                "{\"ts\":1391407314175818}": 0, 
                                "{\"ts\":1391407374278545}": 0, 
                                "{\"ts\":1391407434380324}": 0, 
                                "{\"ts\":1391407494481525}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:54.73": 2.5, 
                                "2014 Feb 03 06:01:54.175": 0, 
                                "2014 Feb 03 06:02:54.278": 0, 
                                "2014 Feb 03 06:03:54.380": 0, 
                                "2014 Feb 03 06:04:54.481": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "4", 
                                "b3": "1", 
                                "sum": "2.5"
                            }
                        }
                    ], 
                    "api_server_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391406953563743}": 306974, 
                                "{\"ts\":1391407013665373}": 306974, 
                                "{\"ts\":1391407073767711}": 306974, 
                                "{\"ts\":1391407133869796}": 306974, 
                                "{\"ts\":1391407193971740}": 306974, 
                                "{\"ts\":1391407254073611}": 306974, 
                                "{\"ts\":1391407314175818}": 306974, 
                                "{\"ts\":1391407374278545}": 306974, 
                                "{\"ts\":1391407434380324}": 306974, 
                                "{\"ts\":1391407494481525}": 306974
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:54.73": 306974, 
                                "2014 Feb 03 06:01:54.175": 306974, 
                                "2014 Feb 03 06:02:54.278": 306974, 
                                "2014 Feb 03 06:03:54.380": 306974, 
                                "2014 Feb 03 06:04:54.481": 306974
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "5", 
                                "sum": "1534870"
                            }
                        }
                    ], 
                    "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "cpuload": {
                                    "fifteen_min_avg": 0, 
                                    "five_min_avg": 0, 
                                    "one_min_avg": 0
                                }, 
                                "meminfo": {
                                    "peakvirt": 306974, 
                                    "res": 51195, 
                                    "virt": 306974
                                }, 
                                "num_cpu": 4, 
                                "sys_mem_info": {
                                    "buffers": 50544, 
                                    "free": 31369465, 
                                    "total": 33639731, 
                                    "used": 2270265
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "ApiServer"
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403659037743", 
                            "last_stop_time": null, 
                            "process_name": "contrail-api:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403651020907", 
                            "last_stop_time": null, 
                            "process_name": "redis-config", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403649018179", 
                            "last_stop_time": null, 
                            "process_name": "contrail-config-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403655031113", 
                            "last_stop_time": null, 
                            "process_name": "contrail-discovery:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403663046971", 
                            "last_stop_time": null, 
                            "process_name": "contrail-svc-monitor", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403657033255", 
                            "last_stop_time": null, 
                            "process_name": "ifmap", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403661041870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-schema", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403653025988", 
                            "last_stop_time": null, 
                            "process_name": "contrail-zookeeper", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ]
                }
            }
        }
    }, 
    {
        "name": "nodeg2", 
        "value": {
            "Config:ApiServer:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8084, 
                        "pid": 3924, 
                        "primary": "10.204.217.43:8086", 
                        "secondary": "10.204.217.42:8086", 
                        "start_time": 1391403642078081, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403642086352, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }, 
            "configNode": {
                "ModuleCpuState": {
                    "api_server_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391406952941501}": 0, 
                                "{\"ts\":1391407013043674}": 0, 
                                "{\"ts\":1391407073145573}": 0, 
                                "{\"ts\":1391407133248227}": 0, 
                                "{\"ts\":1391407193350352}": 0, 
                                "{\"ts\":1391407253451654}": 0, 
                                "{\"ts\":1391407313553920}": 0, 
                                "{\"ts\":1391407373655570}": 0, 
                                "{\"ts\":1391407433757146}": 0, 
                                "{\"ts\":1391407493859057}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:53.451": 0, 
                                "2014 Feb 03 06:01:53.553": 0, 
                                "2014 Feb 03 06:02:53.655": 0, 
                                "2014 Feb 03 06:03:53.757": 0, 
                                "2014 Feb 03 06:04:53.859": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "5", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "api_server_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391406952941501}": 307011, 
                                "{\"ts\":1391407013043674}": 307011, 
                                "{\"ts\":1391407073145573}": 307011, 
                                "{\"ts\":1391407133248227}": 307011, 
                                "{\"ts\":1391407193350352}": 307011, 
                                "{\"ts\":1391407253451654}": 307011, 
                                "{\"ts\":1391407313553920}": 307011, 
                                "{\"ts\":1391407373655570}": 307011, 
                                "{\"ts\":1391407433757146}": 307011, 
                                "{\"ts\":1391407493859057}": 307011
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:53.451": 307011, 
                                "2014 Feb 03 06:01:53.553": 307011, 
                                "2014 Feb 03 06:02:53.655": 307011, 
                                "2014 Feb 03 06:03:53.757": 307011, 
                                "2014 Feb 03 06:04:53.859": 307011
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "5", 
                                "sum": "1535055"
                            }
                        }
                    ], 
                    "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 286511, 
                                    "res": 37400, 
                                    "virt": 286511
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "ServiceMonitor"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 301395, 
                                    "res": 41693, 
                                    "virt": 301395
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Schema"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "cpuload": {
                                    "fifteen_min_avg": 0, 
                                    "five_min_avg": 0.02, 
                                    "one_min_avg": 0.01
                                }, 
                                "meminfo": {
                                    "peakvirt": 307011, 
                                    "res": 51589, 
                                    "virt": 307011
                                }, 
                                "num_cpu": 4, 
                                "sys_mem_info": {
                                    "buffers": 117301, 
                                    "free": 28529352, 
                                    "total": 33639731, 
                                    "used": 5110378
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "ApiServer"
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403665557719", 
                            "last_stop_time": null, 
                            "process_name": "contrail-api:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403657541884", 
                            "last_stop_time": null, 
                            "process_name": "redis-config", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403655537501", 
                            "last_stop_time": null, 
                            "process_name": "contrail-config-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403661550733", 
                            "last_stop_time": null, 
                            "process_name": "contrail-discovery:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403669567686", 
                            "last_stop_time": null, 
                            "process_name": "contrail-svc-monitor", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403663552638", 
                            "last_stop_time": null, 
                            "process_name": "ifmap", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403667562627", 
                            "last_stop_time": null, 
                            "process_name": "contrail-schema", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403659546955", 
                            "last_stop_time": null, 
                            "process_name": "contrail-zookeeper", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "schema_xmer_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391406958794357}": 2.5, 
                                "{\"ts\":1391407018898131}": 0, 
                                "{\"ts\":1391407079000517}": 0, 
                                "{\"ts\":1391407139101453}": 2.5, 
                                "{\"ts\":1391407199203261}": 0, 
                                "{\"ts\":1391407259305400}": 0, 
                                "{\"ts\":1391407319407971}": 0, 
                                "{\"ts\":1391407379511074}": 0, 
                                "{\"ts\":1391407439613611}": 0, 
                                "{\"ts\":1391407499715922}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:59.305": 0, 
                                "2014 Feb 03 06:01:59.407": 0, 
                                "2014 Feb 03 06:02:59.511": 0, 
                                "2014 Feb 03 06:03:59.613": 0, 
                                "2014 Feb 03 06:04:59.715": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "5", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "schema_xmer_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391406958794357}": 301395, 
                                "{\"ts\":1391407018898131}": 301395, 
                                "{\"ts\":1391407079000517}": 301395, 
                                "{\"ts\":1391407139101453}": 301395, 
                                "{\"ts\":1391407199203261}": 301395, 
                                "{\"ts\":1391407259305400}": 301395, 
                                "{\"ts\":1391407319407971}": 301395, 
                                "{\"ts\":1391407379511074}": 301395, 
                                "{\"ts\":1391407439613611}": 301395, 
                                "{\"ts\":1391407499715922}": 301395
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:59.305": 301395, 
                                "2014 Feb 03 06:01:59.407": 301395, 
                                "2014 Feb 03 06:02:59.511": 301395, 
                                "2014 Feb 03 06:03:59.613": 301395, 
                                "2014 Feb 03 06:04:59.715": 301395
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "5", 
                                "sum": "1506975"
                            }
                        }
                    ], 
                    "service_monitor_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391406958806974}": 2.5, 
                                "{\"ts\":1391407018909374}": 0, 
                                "{\"ts\":1391407079011153}": 0, 
                                "{\"ts\":1391407139112767}": 0, 
                                "{\"ts\":1391407199214363}": 0, 
                                "{\"ts\":1391407259316174}": 0, 
                                "{\"ts\":1391407319419589}": 0, 
                                "{\"ts\":1391407379521089}": 0, 
                                "{\"ts\":1391407439621947}": 0, 
                                "{\"ts\":1391407499722782}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:59.316": 0, 
                                "2014 Feb 03 06:01:59.419": 0, 
                                "2014 Feb 03 06:02:59.521": 0, 
                                "2014 Feb 03 06:03:59.621": 0, 
                                "2014 Feb 03 06:04:59.722": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "5", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "service_monitor_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391406958806974}": 286511, 
                                "{\"ts\":1391407018909374}": 286511, 
                                "{\"ts\":1391407079011153}": 286511, 
                                "{\"ts\":1391407139112767}": 286511, 
                                "{\"ts\":1391407199214363}": 286511, 
                                "{\"ts\":1391407259316174}": 286511, 
                                "{\"ts\":1391407319419589}": 286511, 
                                "{\"ts\":1391407379521089}": 286511, 
                                "{\"ts\":1391407439621947}": 286511, 
                                "{\"ts\":1391407499722782}": 286511
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:59.316": 286511, 
                                "2014 Feb 03 06:01:59.419": 286511, 
                                "2014 Feb 03 06:02:59.521": 286511, 
                                "2014 Feb 03 06:03:59.621": 286511, 
                                "2014 Feb 03 06:04:59.722": 286511
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "5", 
                                "sum": "1432555"
                            }
                        }
                    ]
                }
            }
        }
    }
];

var configSummWOGenData =
[
    {
        "value": [
            {
                "name": "nodeg3", 
                "value": {
                    "ModuleCpuState": {
                        "api_server_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407193971740}": 0, 
                                    "{\"ts\":1391407254073611}": 2.5, 
                                    "{\"ts\":1391407314175818}": 0, 
                                    "{\"ts\":1391407374278545}": 0, 
                                    "{\"ts\":1391407434380324}": 0, 
                                    "{\"ts\":1391407494481525}": 0, 
                                    "{\"ts\":1391407554583125}": 0, 
                                    "{\"ts\":1391407614685279}": 0, 
                                    "{\"ts\":1391407674787615}": 0, 
                                    "{\"ts\":1391407734889097}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:00:54.73": 2.5, 
                                    "2014 Feb 03 06:05:54.583": 0, 
                                    "2014 Feb 03 06:06:54.685": 0, 
                                    "2014 Feb 03 06:07:54.787": 0, 
                                    "2014 Feb 03 06:08:54.889": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "8", 
                                    "b3": "1", 
                                    "sum": "2.5"
                                }
                            }
                        ], 
                        "api_server_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407193971740}": 306974, 
                                    "{\"ts\":1391407254073611}": 306974, 
                                    "{\"ts\":1391407314175818}": 306974, 
                                    "{\"ts\":1391407374278545}": 306974, 
                                    "{\"ts\":1391407434380324}": 306974, 
                                    "{\"ts\":1391407494481525}": 306974, 
                                    "{\"ts\":1391407554583125}": 306974, 
                                    "{\"ts\":1391407614685279}": 306974, 
                                    "{\"ts\":1391407674787615}": 306974, 
                                    "{\"ts\":1391407734889097}": 306974
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:54.481": 306974, 
                                    "2014 Feb 03 06:05:54.583": 306974, 
                                    "2014 Feb 03 06:06:54.685": 306974, 
                                    "2014 Feb 03 06:07:54.787": 306974, 
                                    "2014 Feb 03 06:08:54.889": 306974
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "9", 
                                    "sum": "2762766"
                                }
                            }
                        ], 
                        "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                        "module_cpu_info": [
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "cpuload": {
                                        "fifteen_min_avg": 0, 
                                        "five_min_avg": 0, 
                                        "one_min_avg": 0
                                    }, 
                                    "meminfo": {
                                        "peakvirt": 306974, 
                                        "res": 51195, 
                                        "virt": 306974
                                    }, 
                                    "num_cpu": 4, 
                                    "sys_mem_info": {
                                        "buffers": 50941, 
                                        "free": 31363076, 
                                        "total": 33639731, 
                                        "used": 2276655
                                    }
                                }, 
                                "instance_id": "0", 
                                "module_id": "ApiServer"
                            }
                        ], 
                        "process_state_list": [
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403659037743", 
                                "last_stop_time": null, 
                                "process_name": "contrail-api:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403651020907", 
                                "last_stop_time": null, 
                                "process_name": "redis-config", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403649018179", 
                                "last_stop_time": null, 
                                "process_name": "contrail-config-nodemgr", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403655031113", 
                                "last_stop_time": null, 
                                "process_name": "contrail-discovery:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403663046971", 
                                "last_stop_time": null, 
                                "process_name": "contrail-svc-monitor", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403657033255", 
                                "last_stop_time": null, 
                                "process_name": "ifmap", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403661041870", 
                                "last_stop_time": null, 
                                "process_name": "contrail-schema", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403653025988", 
                                "last_stop_time": null, 
                                "process_name": "contrail-zookeeper", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }
                        ]
                    }
                }
            }, 
            {
                "name": "nodeg2", 
                "value": {
                    "ModuleCpuState": {
                        "api_server_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407193350352}": 0, 
                                    "{\"ts\":1391407253451654}": 0, 
                                    "{\"ts\":1391407313553920}": 0, 
                                    "{\"ts\":1391407373655570}": 0, 
                                    "{\"ts\":1391407433757146}": 0, 
                                    "{\"ts\":1391407493859057}": 0, 
                                    "{\"ts\":1391407553961069}": 0, 
                                    "{\"ts\":1391407614063134}": 0, 
                                    "{\"ts\":1391407674164741}": 0, 
                                    "{\"ts\":1391407734267180}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:53.859": 0, 
                                    "2014 Feb 03 06:05:53.961": 0, 
                                    "2014 Feb 03 06:06:54.63": 0, 
                                    "2014 Feb 03 06:07:54.164": 0, 
                                    "2014 Feb 03 06:08:54.267": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "9", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "api_server_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407193350352}": 307011, 
                                    "{\"ts\":1391407253451654}": 307011, 
                                    "{\"ts\":1391407313553920}": 307011, 
                                    "{\"ts\":1391407373655570}": 307011, 
                                    "{\"ts\":1391407433757146}": 307011, 
                                    "{\"ts\":1391407493859057}": 307011, 
                                    "{\"ts\":1391407553961069}": 307011, 
                                    "{\"ts\":1391407614063134}": 307011, 
                                    "{\"ts\":1391407674164741}": 307011, 
                                    "{\"ts\":1391407734267180}": 307011
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:53.859": 307011, 
                                    "2014 Feb 03 06:05:53.961": 307011, 
                                    "2014 Feb 03 06:06:54.63": 307011, 
                                    "2014 Feb 03 06:07:54.164": 307011, 
                                    "2014 Feb 03 06:08:54.267": 307011
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "9", 
                                    "sum": "2763099"
                                }
                            }
                        ], 
                        "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                        "module_cpu_info": [
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "meminfo": {
                                        "peakvirt": 286511, 
                                        "res": 37408, 
                                        "virt": 286511
                                    }, 
                                    "num_cpu": 4
                                }, 
                                "instance_id": "0", 
                                "module_id": "ServiceMonitor"
                            }, 
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "meminfo": {
                                        "peakvirt": 301395, 
                                        "res": 41701, 
                                        "virt": 301395
                                    }, 
                                    "num_cpu": 4
                                }, 
                                "instance_id": "0", 
                                "module_id": "Schema"
                            }, 
                            {
                                "cpu_info": {
                                    "cpu_share": 0, 
                                    "cpuload": {
                                        "fifteen_min_avg": 0, 
                                        "five_min_avg": 0, 
                                        "one_min_avg": 0
                                    }, 
                                    "meminfo": {
                                        "peakvirt": 307011, 
                                        "res": 51589, 
                                        "virt": 307011
                                    }, 
                                    "num_cpu": 4, 
                                    "sys_mem_info": {
                                        "buffers": 121372, 
                                        "free": 28508901, 
                                        "total": 33639731, 
                                        "used": 5130829
                                    }
                                }, 
                                "instance_id": "0", 
                                "module_id": "ApiServer"
                            }
                        ], 
                        "process_state_list": [
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403665557719", 
                                "last_stop_time": null, 
                                "process_name": "contrail-api:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403657541884", 
                                "last_stop_time": null, 
                                "process_name": "redis-config", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403655537501", 
                                "last_stop_time": null, 
                                "process_name": "contrail-config-nodemgr", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403661550733", 
                                "last_stop_time": null, 
                                "process_name": "contrail-discovery:0", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403669567686", 
                                "last_stop_time": null, 
                                "process_name": "contrail-svc-monitor", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403663552638", 
                                "last_stop_time": null, 
                                "process_name": "ifmap", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403667562627", 
                                "last_stop_time": null, 
                                "process_name": "contrail-schema", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }, 
                            {
                                "core_file_list": [], 
                                "exit_count": 0, 
                                "last_exit_time": null, 
                                "last_start_time": "1391403659546955", 
                                "last_stop_time": null, 
                                "process_name": "contrail-zookeeper", 
                                "process_state": "PROCESS_STATE_RUNNING", 
                                "start_count": 1, 
                                "stop_count": 0
                            }
                        ], 
                        "schema_xmer_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407199203261}": 0, 
                                    "{\"ts\":1391407259305400}": 0, 
                                    "{\"ts\":1391407319407971}": 0, 
                                    "{\"ts\":1391407379511074}": 0, 
                                    "{\"ts\":1391407439613611}": 0, 
                                    "{\"ts\":1391407499715922}": 0, 
                                    "{\"ts\":1391407559817000}": 0, 
                                    "{\"ts\":1391407619918054}": 0, 
                                    "{\"ts\":1391407680019612}": 0, 
                                    "{\"ts\":1391407740121034}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:59.715": 0, 
                                    "2014 Feb 03 06:05:59.817": 0, 
                                    "2014 Feb 03 06:06:59.918": 0, 
                                    "2014 Feb 03 06:08:00.19": 0, 
                                    "2014 Feb 03 06:09:00.121": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "9", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "schema_xmer_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407199203261}": 301395, 
                                    "{\"ts\":1391407259305400}": 301395, 
                                    "{\"ts\":1391407319407971}": 301395, 
                                    "{\"ts\":1391407379511074}": 301395, 
                                    "{\"ts\":1391407439613611}": 301395, 
                                    "{\"ts\":1391407499715922}": 301395, 
                                    "{\"ts\":1391407559817000}": 301395, 
                                    "{\"ts\":1391407619918054}": 301395, 
                                    "{\"ts\":1391407680019612}": 301395, 
                                    "{\"ts\":1391407740121034}": 301395
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:59.715": 301395, 
                                    "2014 Feb 03 06:05:59.817": 301395, 
                                    "2014 Feb 03 06:06:59.918": 301395, 
                                    "2014 Feb 03 06:08:00.19": 301395, 
                                    "2014 Feb 03 06:09:00.121": 301395
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b400000": "9", 
                                    "sum": "2712555"
                                }
                            }
                        ], 
                        "service_monitor_cpu_share": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407199214363}": 0, 
                                    "{\"ts\":1391407259316174}": 0, 
                                    "{\"ts\":1391407319419589}": 0, 
                                    "{\"ts\":1391407379521089}": 0, 
                                    "{\"ts\":1391407439621947}": 0, 
                                    "{\"ts\":1391407499722782}": 0, 
                                    "{\"ts\":1391407559824027}": 0, 
                                    "{\"ts\":1391407619925679}": 0, 
                                    "{\"ts\":1391407680027078}": 0, 
                                    "{\"ts\":1391407740128859}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:59.722": 0, 
                                    "2014 Feb 03 06:05:59.824": 0, 
                                    "2014 Feb 03 06:06:59.925": 0, 
                                    "2014 Feb 03 06:08:00.27": 0, 
                                    "2014 Feb 03 06:09:00.128": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b1": "9", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "service_monitor_mem_virt": [
                            {
                                "history-10": {
                                    "{\"ts\":1391407199214363}": 286511, 
                                    "{\"ts\":1391407259316174}": 286511, 
                                    "{\"ts\":1391407319419589}": 286511, 
                                    "{\"ts\":1391407379521089}": 286511, 
                                    "{\"ts\":1391407439621947}": 286511, 
                                    "{\"ts\":1391407499722782}": 286511, 
                                    "{\"ts\":1391407559824027}": 286511, 
                                    "{\"ts\":1391407619925679}": 286511, 
                                    "{\"ts\":1391407680027078}": 286511, 
                                    "{\"ts\":1391407740128859}": 286511
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:04:59.722": 286511, 
                                    "2014 Feb 03 06:05:59.824": 286511, 
                                    "2014 Feb 03 06:06:59.925": 286511, 
                                    "2014 Feb 03 06:08:00.27": 286511, 
                                    "2014 Feb 03 06:09:00.128": 286511
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b300000": "9", 
                                    "sum": "2578599"
                                }
                            }
                        ]
                    }
                }
            }
        ]
    }
];

var configSummWOGenData_OP = 
[
    {
        "name": "nodeg3", 
        "value": {
            "configNode": {
                "ModuleCpuState": {
                    "api_server_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391407193971740}": 0, 
                                "{\"ts\":1391407254073611}": 2.5, 
                                "{\"ts\":1391407314175818}": 0, 
                                "{\"ts\":1391407374278545}": 0, 
                                "{\"ts\":1391407434380324}": 0, 
                                "{\"ts\":1391407494481525}": 0, 
                                "{\"ts\":1391407554583125}": 0, 
                                "{\"ts\":1391407614685279}": 0, 
                                "{\"ts\":1391407674787615}": 0, 
                                "{\"ts\":1391407734889097}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:00:54.73": 2.5, 
                                "2014 Feb 03 06:05:54.583": 0, 
                                "2014 Feb 03 06:06:54.685": 0, 
                                "2014 Feb 03 06:07:54.787": 0, 
                                "2014 Feb 03 06:08:54.889": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "8", 
                                "b3": "1", 
                                "sum": "2.5"
                            }
                        }
                    ], 
                    "api_server_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391407193971740}": 306974, 
                                "{\"ts\":1391407254073611}": 306974, 
                                "{\"ts\":1391407314175818}": 306974, 
                                "{\"ts\":1391407374278545}": 306974, 
                                "{\"ts\":1391407434380324}": 306974, 
                                "{\"ts\":1391407494481525}": 306974, 
                                "{\"ts\":1391407554583125}": 306974, 
                                "{\"ts\":1391407614685279}": 306974, 
                                "{\"ts\":1391407674787615}": 306974, 
                                "{\"ts\":1391407734889097}": 306974
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:54.481": 306974, 
                                "2014 Feb 03 06:05:54.583": 306974, 
                                "2014 Feb 03 06:06:54.685": 306974, 
                                "2014 Feb 03 06:07:54.787": 306974, 
                                "2014 Feb 03 06:08:54.889": 306974
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "9", 
                                "sum": "2762766"
                            }
                        }
                    ], 
                    "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "cpuload": {
                                    "fifteen_min_avg": 0, 
                                    "five_min_avg": 0, 
                                    "one_min_avg": 0
                                }, 
                                "meminfo": {
                                    "peakvirt": 306974, 
                                    "res": 51195, 
                                    "virt": 306974
                                }, 
                                "num_cpu": 4, 
                                "sys_mem_info": {
                                    "buffers": 50941, 
                                    "free": 31363076, 
                                    "total": 33639731, 
                                    "used": 2276655
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "ApiServer"
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403659037743", 
                            "last_stop_time": null, 
                            "process_name": "contrail-api:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403651020907", 
                            "last_stop_time": null, 
                            "process_name": "redis-config", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403649018179", 
                            "last_stop_time": null, 
                            "process_name": "contrail-config-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403655031113", 
                            "last_stop_time": null, 
                            "process_name": "contrail-discovery:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403663046971", 
                            "last_stop_time": null, 
                            "process_name": "contrail-svc-monitor", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403657033255", 
                            "last_stop_time": null, 
                            "process_name": "ifmap", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403661041870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-schema", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403653025988", 
                            "last_stop_time": null, 
                            "process_name": "contrail-zookeeper", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ]
                }
            }
        }
    }, 
    {
        "name": "nodeg2", 
        "value": {
            "configNode": {
                "ModuleCpuState": {
                    "api_server_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391407193350352}": 0, 
                                "{\"ts\":1391407253451654}": 0, 
                                "{\"ts\":1391407313553920}": 0, 
                                "{\"ts\":1391407373655570}": 0, 
                                "{\"ts\":1391407433757146}": 0, 
                                "{\"ts\":1391407493859057}": 0, 
                                "{\"ts\":1391407553961069}": 0, 
                                "{\"ts\":1391407614063134}": 0, 
                                "{\"ts\":1391407674164741}": 0, 
                                "{\"ts\":1391407734267180}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:53.859": 0, 
                                "2014 Feb 03 06:05:53.961": 0, 
                                "2014 Feb 03 06:06:54.63": 0, 
                                "2014 Feb 03 06:07:54.164": 0, 
                                "2014 Feb 03 06:08:54.267": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "9", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "api_server_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391407193350352}": 307011, 
                                "{\"ts\":1391407253451654}": 307011, 
                                "{\"ts\":1391407313553920}": 307011, 
                                "{\"ts\":1391407373655570}": 307011, 
                                "{\"ts\":1391407433757146}": 307011, 
                                "{\"ts\":1391407493859057}": 307011, 
                                "{\"ts\":1391407553961069}": 307011, 
                                "{\"ts\":1391407614063134}": 307011, 
                                "{\"ts\":1391407674164741}": 307011, 
                                "{\"ts\":1391407734267180}": 307011
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:53.859": 307011, 
                                "2014 Feb 03 06:05:53.961": 307011, 
                                "2014 Feb 03 06:06:54.63": 307011, 
                                "2014 Feb 03 06:07:54.164": 307011, 
                                "2014 Feb 03 06:08:54.267": 307011
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "9", 
                                "sum": "2763099"
                            }
                        }
                    ], 
                    "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 286511, 
                                    "res": 37408, 
                                    "virt": 286511
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "ServiceMonitor"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 301395, 
                                    "res": 41701, 
                                    "virt": 301395
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Schema"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "cpuload": {
                                    "fifteen_min_avg": 0, 
                                    "five_min_avg": 0, 
                                    "one_min_avg": 0
                                }, 
                                "meminfo": {
                                    "peakvirt": 307011, 
                                    "res": 51589, 
                                    "virt": 307011
                                }, 
                                "num_cpu": 4, 
                                "sys_mem_info": {
                                    "buffers": 121372, 
                                    "free": 28508901, 
                                    "total": 33639731, 
                                    "used": 5130829
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "ApiServer"
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403665557719", 
                            "last_stop_time": null, 
                            "process_name": "contrail-api:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403657541884", 
                            "last_stop_time": null, 
                            "process_name": "redis-config", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403655537501", 
                            "last_stop_time": null, 
                            "process_name": "contrail-config-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403661550733", 
                            "last_stop_time": null, 
                            "process_name": "contrail-discovery:0", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403669567686", 
                            "last_stop_time": null, 
                            "process_name": "contrail-svc-monitor", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403663552638", 
                            "last_stop_time": null, 
                            "process_name": "ifmap", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403667562627", 
                            "last_stop_time": null, 
                            "process_name": "contrail-schema", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403659546955", 
                            "last_stop_time": null, 
                            "process_name": "contrail-zookeeper", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "schema_xmer_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391407199203261}": 0, 
                                "{\"ts\":1391407259305400}": 0, 
                                "{\"ts\":1391407319407971}": 0, 
                                "{\"ts\":1391407379511074}": 0, 
                                "{\"ts\":1391407439613611}": 0, 
                                "{\"ts\":1391407499715922}": 0, 
                                "{\"ts\":1391407559817000}": 0, 
                                "{\"ts\":1391407619918054}": 0, 
                                "{\"ts\":1391407680019612}": 0, 
                                "{\"ts\":1391407740121034}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:59.715": 0, 
                                "2014 Feb 03 06:05:59.817": 0, 
                                "2014 Feb 03 06:06:59.918": 0, 
                                "2014 Feb 03 06:08:00.19": 0, 
                                "2014 Feb 03 06:09:00.121": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "9", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "schema_xmer_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391407199203261}": 301395, 
                                "{\"ts\":1391407259305400}": 301395, 
                                "{\"ts\":1391407319407971}": 301395, 
                                "{\"ts\":1391407379511074}": 301395, 
                                "{\"ts\":1391407439613611}": 301395, 
                                "{\"ts\":1391407499715922}": 301395, 
                                "{\"ts\":1391407559817000}": 301395, 
                                "{\"ts\":1391407619918054}": 301395, 
                                "{\"ts\":1391407680019612}": 301395, 
                                "{\"ts\":1391407740121034}": 301395
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:59.715": 301395, 
                                "2014 Feb 03 06:05:59.817": 301395, 
                                "2014 Feb 03 06:06:59.918": 301395, 
                                "2014 Feb 03 06:08:00.19": 301395, 
                                "2014 Feb 03 06:09:00.121": 301395
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "9", 
                                "sum": "2712555"
                            }
                        }
                    ], 
                    "service_monitor_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391407199214363}": 0, 
                                "{\"ts\":1391407259316174}": 0, 
                                "{\"ts\":1391407319419589}": 0, 
                                "{\"ts\":1391407379521089}": 0, 
                                "{\"ts\":1391407439621947}": 0, 
                                "{\"ts\":1391407499722782}": 0, 
                                "{\"ts\":1391407559824027}": 0, 
                                "{\"ts\":1391407619925679}": 0, 
                                "{\"ts\":1391407680027078}": 0, 
                                "{\"ts\":1391407740128859}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:59.722": 0, 
                                "2014 Feb 03 06:05:59.824": 0, 
                                "2014 Feb 03 06:06:59.925": 0, 
                                "2014 Feb 03 06:08:00.27": 0, 
                                "2014 Feb 03 06:09:00.128": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b1": "9", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "service_monitor_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391407199214363}": 286511, 
                                "{\"ts\":1391407259316174}": 286511, 
                                "{\"ts\":1391407319419589}": 286511, 
                                "{\"ts\":1391407379521089}": 286511, 
                                "{\"ts\":1391407439621947}": 286511, 
                                "{\"ts\":1391407499722782}": 286511, 
                                "{\"ts\":1391407559824027}": 286511, 
                                "{\"ts\":1391407619925679}": 286511, 
                                "{\"ts\":1391407680027078}": 286511, 
                                "{\"ts\":1391407740128859}": 286511
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 06:04:59.722": 286511, 
                                "2014 Feb 03 06:05:59.824": 286511, 
                                "2014 Feb 03 06:06:59.925": 286511, 
                                "2014 Feb 03 06:08:00.27": 286511, 
                                "2014 Feb 03 06:09:00.128": 286511
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "9", 
                                "sum": "2578599"
                            }
                        }
                    ]
                }
            }
        }
    }
];

var configDetailsData = 
[
    {
        "ModuleCpuState": {
            "api_server_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408034778917}": 0, 
                        "{\"ts\":1391408094881073}": 0, 
                        "{\"ts\":1391408154982662}": 0, 
                        "{\"ts\":1391408215085500}": 2.5, 
                        "{\"ts\":1391408275187830}": 0, 
                        "{\"ts\":1391408335289701}": 0, 
                        "{\"ts\":1391408395391601}": 0, 
                        "{\"ts\":1391408455494477}": 0, 
                        "{\"ts\":1391408515597639}": 0, 
                        "{\"ts\":1391408575699078}": 2.45
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:16:55.85": 2.5, 
                        "2014 Feb 03 06:19:55.391": 0, 
                        "2014 Feb 03 06:20:55.494": 0, 
                        "2014 Feb 03 06:21:55.597": 0, 
                        "2014 Feb 03 06:22:55.699": 2.45
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "21", 
                        "b3": "2", 
                        "sum": "4.95"
                    }
                }
            ], 
            "api_server_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408034778917}": 307011, 
                        "{\"ts\":1391408094881073}": 307011, 
                        "{\"ts\":1391408154982662}": 307011, 
                        "{\"ts\":1391408215085500}": 307011, 
                        "{\"ts\":1391408275187830}": 307011, 
                        "{\"ts\":1391408335289701}": 307011, 
                        "{\"ts\":1391408395391601}": 307011, 
                        "{\"ts\":1391408455494477}": 307011, 
                        "{\"ts\":1391408515597639}": 307011, 
                        "{\"ts\":1391408575699078}": 307011
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:18:55.289": 307011, 
                        "2014 Feb 03 06:19:55.391": 307011, 
                        "2014 Feb 03 06:20:55.494": 307011, 
                        "2014 Feb 03 06:21:55.597": 307011, 
                        "2014 Feb 03 06:22:55.699": 307011
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b400000": "23", 
                        "sum": "7061253"
                    }
                }
            ], 
            "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
            "module_cpu_info": [
                {
                    "cpu_info": {
                        "cpu_share": 0, 
                        "meminfo": {
                            "peakvirt": 286511, 
                            "res": 37421, 
                            "virt": 286511
                        }, 
                        "num_cpu": 4
                    }, 
                    "instance_id": "0", 
                    "module_id": "ServiceMonitor"
                }, 
                {
                    "cpu_info": {
                        "cpu_share": 0, 
                        "meminfo": {
                            "peakvirt": 301395, 
                            "res": 41709, 
                            "virt": 301395
                        }, 
                        "num_cpu": 4
                    }, 
                    "instance_id": "0", 
                    "module_id": "Schema"
                }, 
                {
                    "cpu_info": {
                        "cpu_share": 2.45, 
                        "cpuload": {
                            "fifteen_min_avg": 0, 
                            "five_min_avg": 0, 
                            "one_min_avg": 0
                        }, 
                        "meminfo": {
                            "peakvirt": 307011, 
                            "res": 51589, 
                            "virt": 307011
                        }, 
                        "num_cpu": 4, 
                        "sys_mem_info": {
                            "buffers": 173465, 
                            "free": 27840524, 
                            "total": 33639731, 
                            "used": 5799206
                        }
                    }, 
                    "instance_id": "0", 
                    "module_id": "ApiServer"
                }
            ], 
            "process_state_list": [
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403665557719", 
                    "last_stop_time": null, 
                    "process_name": "contrail-api:0", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403657541884", 
                    "last_stop_time": null, 
                    "process_name": "redis-config", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403655537501", 
                    "last_stop_time": null, 
                    "process_name": "contrail-config-nodemgr", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403661550733", 
                    "last_stop_time": null, 
                    "process_name": "contrail-discovery:0", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403669567686", 
                    "last_stop_time": null, 
                    "process_name": "contrail-svc-monitor", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403663552638", 
                    "last_stop_time": null, 
                    "process_name": "ifmap", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403667562627", 
                    "last_stop_time": null, 
                    "process_name": "contrail-schema", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403659546955", 
                    "last_stop_time": null, 
                    "process_name": "contrail-zookeeper", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }
            ], 
            "schema_xmer_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408040628413}": 0, 
                        "{\"ts\":1391408100729973}": 0, 
                        "{\"ts\":1391408160832338}": 0, 
                        "{\"ts\":1391408220934808}": 0, 
                        "{\"ts\":1391408281036430}": 0, 
                        "{\"ts\":1391408341138073}": 0, 
                        "{\"ts\":1391408401240570}": 0, 
                        "{\"ts\":1391408461342875}": 0, 
                        "{\"ts\":1391408521444585}": 0, 
                        "{\"ts\":1391408581546184}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.138": 0, 
                        "2014 Feb 03 06:20:01.240": 0, 
                        "2014 Feb 03 06:21:01.342": 0, 
                        "2014 Feb 03 06:22:01.444": 0, 
                        "2014 Feb 03 06:23:01.546": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "23", 
                        "sum": "0"
                    }
                }
            ], 
            "schema_xmer_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408040628413}": 301395, 
                        "{\"ts\":1391408100729973}": 301395, 
                        "{\"ts\":1391408160832338}": 301395, 
                        "{\"ts\":1391408220934808}": 301395, 
                        "{\"ts\":1391408281036430}": 301395, 
                        "{\"ts\":1391408341138073}": 301395, 
                        "{\"ts\":1391408401240570}": 301395, 
                        "{\"ts\":1391408461342875}": 301395, 
                        "{\"ts\":1391408521444585}": 301395, 
                        "{\"ts\":1391408581546184}": 301395
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.138": 301395, 
                        "2014 Feb 03 06:20:01.240": 301395, 
                        "2014 Feb 03 06:21:01.342": 301395, 
                        "2014 Feb 03 06:22:01.444": 301395, 
                        "2014 Feb 03 06:23:01.546": 301395
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b400000": "23", 
                        "sum": "6932085"
                    }
                }
            ], 
            "service_monitor_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408040637852}": 0, 
                        "{\"ts\":1391408100740174}": 0, 
                        "{\"ts\":1391408160841731}": 0, 
                        "{\"ts\":1391408220944010}": 0, 
                        "{\"ts\":1391408281045752}": 0, 
                        "{\"ts\":1391408341147215}": 2.5, 
                        "{\"ts\":1391408401249969}": 0, 
                        "{\"ts\":1391408461351880}": 0, 
                        "{\"ts\":1391408521453710}": 0, 
                        "{\"ts\":1391408581556094}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.147": 2.5, 
                        "2014 Feb 03 06:20:01.249": 0, 
                        "2014 Feb 03 06:21:01.351": 0, 
                        "2014 Feb 03 06:22:01.453": 0, 
                        "2014 Feb 03 06:23:01.556": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "22", 
                        "b3": "1", 
                        "sum": "2.5"
                    }
                }
            ], 
            "service_monitor_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408040637852}": 286511, 
                        "{\"ts\":1391408100740174}": 286511, 
                        "{\"ts\":1391408160841731}": 286511, 
                        "{\"ts\":1391408220944010}": 286511, 
                        "{\"ts\":1391408281045752}": 286511, 
                        "{\"ts\":1391408341147215}": 286511, 
                        "{\"ts\":1391408401249969}": 286511, 
                        "{\"ts\":1391408461351880}": 286511, 
                        "{\"ts\":1391408521453710}": 286511, 
                        "{\"ts\":1391408581556094}": 286511
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.147": 286511, 
                        "2014 Feb 03 06:20:01.249": 286511, 
                        "2014 Feb 03 06:21:01.351": 286511, 
                        "2014 Feb 03 06:22:01.453": 286511, 
                        "2014 Feb 03 06:23:01.556": 286511
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b300000": "23", 
                        "sum": "6589753"
                    }
                }
            ]
        }
    }, 
    {
        "value": [
            {
                "name": "nodeg2:Config:ApiServer:0", 
                "value": {
                    "ModuleClientState": {
                        "client_info": {
                            "collector_name": "nodeg3", 
                            "http_port": 8084, 
                            "pid": 3924, 
                            "primary": "10.204.217.43:8086", 
                            "secondary": "10.204.217.42:8086", 
                            "start_time": 1391403642078081, 
                            "status": "Established", 
                            "successful_connections": 1
                        }
                    }, 
                    "ModuleServerState": {
                        "db_drop_level": "INVALID", 
                        "db_enqueues": 2322, 
                        "db_msg_dropped": 0, 
                        "db_queue_count": [
                            {
                                "history-10": {
                                    "{\"ts\":1391408017332133}": 0, 
                                    "{\"ts\":1391408077334608}": 0, 
                                    "{\"ts\":1391408137337518}": 0, 
                                    "{\"ts\":1391408197340287}": 0, 
                                    "{\"ts\":1391408257342885}": 0, 
                                    "{\"ts\":1391408317345585}": 0, 
                                    "{\"ts\":1391408377348358}": 0, 
                                    "{\"ts\":1391408437350795}": 0, 
                                    "{\"ts\":1391408497353409}": 0, 
                                    "{\"ts\":1391408557356158}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:18:37.345": 0, 
                                    "2014 Feb 03 06:19:37.348": 0, 
                                    "2014 Feb 03 06:20:37.350": 0, 
                                    "2014 Feb 03 06:21:37.353": 0, 
                                    "2014 Feb 03 06:22:37.356": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b50": "23", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "generator_info": [
                            {
                                "gen_attr": {
                                    "connect_time": 1391403642086352, 
                                    "connects": 1, 
                                    "in_clear": false, 
                                    "reset_time": 0, 
                                    "resets": 0
                                }, 
                                "hostname": "nodeg3"
                            }
                        ], 
                        "msg_stats": [
                            {
                                "hostname": "nodeg3", 
                                "log_level_stats": [], 
                                "msgtype_stats": [
                                    {
                                        "bytes": 45675, 
                                        "last_msg_timestamp": 1391408515597776, 
                                        "message_type": "ConfigCpuStateTrace", 
                                        "messages": 82
                                    }, 
                                    {
                                        "bytes": 130636, 
                                        "last_msg_timestamp": 1391408515597639, 
                                        "message_type": "ModuleCpuStateTrace", 
                                        "messages": 82
                                    }, 
                                    {
                                        "bytes": 2436, 
                                        "last_msg_timestamp": 1391403642096681, 
                                        "message_type": "SandeshModuleClientTrace", 
                                        "messages": 3
                                    }, 
                                    {
                                        "bytes": 9649, 
                                        "last_msg_timestamp": 1391403653556165, 
                                        "message_type": "VncApiConfigLog", 
                                        "messages": 6
                                    }
                                ]
                            }
                        ], 
                        "session_rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1823, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 320867, 
                            "calls": 176
                        }, 
                        "session_stats": {
                            "num_recv_fail": 0, 
                            "num_recv_msg": 174, 
                            "num_recv_msg_fail": 0, 
                            "num_send_buffer_fail": 0, 
                            "num_send_msg": 1, 
                            "num_send_msg_fail": 0, 
                            "num_wait_msgq_dequeue": 0, 
                            "num_wait_msgq_enqueue": 0, 
                            "num_write_ready_cb_error": 0
                        }, 
                        "session_tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "sm_msg_stats": {
                            "aggregate_stats": {
                                "bytes_received": 314081, 
                                "bytes_sent": 0, 
                                "messages_received": 174, 
                                "messages_received_dropped": 0, 
                                "messages_sent": 0, 
                                "messages_sent_dropped": 0
                            }, 
                            "send_queue_stats": {
                                "count": 0, 
                                "enqueues": 0
                            }, 
                            "type_stats": [
                                {
                                    "message_type": "ConfigCpuStateTrace", 
                                    "stats": {
                                        "bytes_received": 104542, 
                                        "bytes_sent": 0, 
                                        "messages_received": 82, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "ModuleCpuStateTrace", 
                                    "stats": {
                                        "bytes_received": 189339, 
                                        "bytes_sent": 0, 
                                        "messages_received": 82, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "SandeshCtrlClientToServer", 
                                    "stats": {
                                        "bytes_received": 1662, 
                                        "bytes_sent": 0, 
                                        "messages_received": 1, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "SandeshModuleClientTrace", 
                                    "stats": {
                                        "bytes_received": 4581, 
                                        "bytes_sent": 0, 
                                        "messages_received": 3, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "VncApiConfigLog", 
                                    "stats": {
                                        "bytes_received": 13957, 
                                        "bytes_sent": 0, 
                                        "messages_received": 6, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }
                            ]
                        }, 
                        "sm_queue_count": [
                            {
                                "history-10": {
                                    "{\"ts\":1391408017332133}": 0, 
                                    "{\"ts\":1391408077334608}": 0, 
                                    "{\"ts\":1391408137337518}": 0, 
                                    "{\"ts\":1391408197340287}": 0, 
                                    "{\"ts\":1391408257342885}": 0, 
                                    "{\"ts\":1391408317345585}": 0, 
                                    "{\"ts\":1391408377348358}": 0, 
                                    "{\"ts\":1391408437350795}": 0, 
                                    "{\"ts\":1391408497353409}": 0, 
                                    "{\"ts\":1391408557356158}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:18:37.345": 0, 
                                    "2014 Feb 03 06:19:37.348": 0, 
                                    "2014 Feb 03 06:20:37.350": 0, 
                                    "2014 Feb 03 06:21:37.353": 0, 
                                    "2014 Feb 03 06:22:37.356": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b50": "23", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "sm_stats": {
                            "ev_stats": [
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvSandeshCtrlMessageRecv"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 173, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 173, 
                                    "event": "ssm::EvSandeshMessageRecv"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvStart"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvTcpPassiveOpen"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 176, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 176, 
                                    "event": null
                                }
                            ], 
                            "last_event": "ssm::EvSandeshMessageRecv", 
                            "last_event_at": 1391408515594850, 
                            "last_state": "Established", 
                            "state": "Established", 
                            "state_since": 1391403642098145
                        }
                    }
                }
            }, 
            {
                "name": "nodeg3:Config:ApiServer:0", 
                "value": {
                    "ModuleClientState": {
                        "client_info": {
                            "collector_name": "nodeg3", 
                            "http_port": 8084, 
                            "pid": 3541, 
                            "primary": "10.204.217.43:8086", 
                            "secondary": "10.204.217.42:8086", 
                            "start_time": 1391403643613841, 
                            "status": "Established", 
                            "successful_connections": 1
                        }
                    }, 
                    "ModuleServerState": {
                        "db_drop_level": "INVALID", 
                        "db_enqueues": 2310, 
                        "db_msg_dropped": 0, 
                        "db_queue_count": [
                            {
                                "history-10": {
                                    "{\"ts\":1391408017332259}": 0, 
                                    "{\"ts\":1391408077334724}": 0, 
                                    "{\"ts\":1391408137337650}": 0, 
                                    "{\"ts\":1391408197340401}": 0, 
                                    "{\"ts\":1391408257342998}": 0, 
                                    "{\"ts\":1391408317345716}": 0, 
                                    "{\"ts\":1391408377348496}": 0, 
                                    "{\"ts\":1391408437350905}": 0, 
                                    "{\"ts\":1391408497353524}": 0, 
                                    "{\"ts\":1391408557356309}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:18:37.345": 0, 
                                    "2014 Feb 03 06:19:37.348": 0, 
                                    "2014 Feb 03 06:20:37.350": 0, 
                                    "2014 Feb 03 06:21:37.353": 0, 
                                    "2014 Feb 03 06:22:37.356": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b50": "23", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "generator_info": [
                            {
                                "gen_attr": {
                                    "connect_time": 1391403643618085, 
                                    "connects": 1, 
                                    "in_clear": false, 
                                    "reset_time": 0, 
                                    "resets": 0
                                }, 
                                "hostname": "nodeg3"
                            }
                        ], 
                        "msg_stats": [
                            {
                                "hostname": "nodeg3", 
                                "log_level_stats": [], 
                                "msgtype_stats": [
                                    {
                                        "bytes": 45677, 
                                        "last_msg_timestamp": 1391408516217613, 
                                        "message_type": "ConfigCpuStateTrace", 
                                        "messages": 82
                                    }, 
                                    {
                                        "bytes": 130478, 
                                        "last_msg_timestamp": 1391408516217473, 
                                        "message_type": "ModuleCpuStateTrace", 
                                        "messages": 82
                                    }, 
                                    {
                                        "bytes": 2436, 
                                        "last_msg_timestamp": 1391403643633746, 
                                        "message_type": "SandeshModuleClientTrace", 
                                        "messages": 3
                                    }, 
                                    {
                                        "bytes": 7380, 
                                        "last_msg_timestamp": 1391403653522913, 
                                        "message_type": "VncApiConfigLog", 
                                        "messages": 5
                                    }
                                ]
                            }
                        ], 
                        "session_rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 3610, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 317685, 
                            "calls": 88
                        }, 
                        "session_stats": {
                            "num_recv_fail": 0, 
                            "num_recv_msg": 173, 
                            "num_recv_msg_fail": 0, 
                            "num_send_buffer_fail": 0, 
                            "num_send_msg": 1, 
                            "num_send_msg_fail": 0, 
                            "num_wait_msgq_dequeue": 0, 
                            "num_wait_msgq_enqueue": 0, 
                            "num_write_ready_cb_error": 0
                        }, 
                        "session_tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1061, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 1061, 
                            "calls": 1
                        }, 
                        "sm_msg_stats": {
                            "aggregate_stats": {
                                "bytes_received": 310938, 
                                "bytes_sent": 0, 
                                "messages_received": 173, 
                                "messages_received_dropped": 0, 
                                "messages_sent": 0, 
                                "messages_sent_dropped": 0
                            }, 
                            "send_queue_stats": {
                                "count": 0, 
                                "enqueues": 0
                            }, 
                            "type_stats": [
                                {
                                    "message_type": "ConfigCpuStateTrace", 
                                    "stats": {
                                        "bytes_received": 104544, 
                                        "bytes_sent": 0, 
                                        "messages_received": 82, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "ModuleCpuStateTrace", 
                                    "stats": {
                                        "bytes_received": 189181, 
                                        "bytes_sent": 0, 
                                        "messages_received": 82, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "SandeshCtrlClientToServer", 
                                    "stats": {
                                        "bytes_received": 1662, 
                                        "bytes_sent": 0, 
                                        "messages_received": 1, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "SandeshModuleClientTrace", 
                                    "stats": {
                                        "bytes_received": 4581, 
                                        "bytes_sent": 0, 
                                        "messages_received": 3, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }, 
                                {
                                    "message_type": "VncApiConfigLog", 
                                    "stats": {
                                        "bytes_received": 10970, 
                                        "bytes_sent": 0, 
                                        "messages_received": 5, 
                                        "messages_received_dropped": 0, 
                                        "messages_sent": 0, 
                                        "messages_sent_dropped": 0
                                    }
                                }
                            ]
                        }, 
                        "sm_queue_count": [
                            {
                                "history-10": {
                                    "{\"ts\":1391408017332259}": 0, 
                                    "{\"ts\":1391408077334724}": 0, 
                                    "{\"ts\":1391408137337650}": 0, 
                                    "{\"ts\":1391408197340401}": 0, 
                                    "{\"ts\":1391408257342998}": 0, 
                                    "{\"ts\":1391408317345716}": 0, 
                                    "{\"ts\":1391408377348496}": 0, 
                                    "{\"ts\":1391408437350905}": 0, 
                                    "{\"ts\":1391408497353524}": 0, 
                                    "{\"ts\":1391408557356309}": 0
                                }
                            }, 
                            {
                                "s-3600-topvals": {
                                    "2014 Feb 03 06:18:37.345": 0, 
                                    "2014 Feb 03 06:19:37.348": 0, 
                                    "2014 Feb 03 06:20:37.350": 0, 
                                    "2014 Feb 03 06:21:37.353": 0, 
                                    "2014 Feb 03 06:22:37.356": 0
                                }
                            }, 
                            {
                                "s-3600-summary": {
                                    "b50": "23", 
                                    "sum": "0"
                                }
                            }
                        ], 
                        "sm_stats": {
                            "ev_stats": [
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvSandeshCtrlMessageRecv"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 172, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 172, 
                                    "event": "ssm::EvSandeshMessageRecv"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvStart"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 1, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 1, 
                                    "event": "ssm::EvTcpPassiveOpen"
                                }, 
                                {
                                    "dequeue_fails": 0, 
                                    "dequeues": 175, 
                                    "enqueue_fails": 0, 
                                    "enqueues": 175, 
                                    "event": null
                                }
                            ], 
                            "last_event": "ssm::EvSandeshMessageRecv", 
                            "last_event_at": 1391408516220376, 
                            "last_state": "Established", 
                            "state": "Established", 
                            "state_since": 1391403643630372
                        }
                    }
                }
            }
        ]
    }
];

var configDetailsData_OP =
{
    "Config:ApiServer:0": {
        "ModuleClientState": {
            "client_info": {
                "collector_name": "nodeg3", 
                "http_port": 8084, 
                "pid": 3924, 
                "primary": "10.204.217.43:8086", 
                "secondary": "10.204.217.42:8086", 
                "start_time": 1391403642078081, 
                "status": "Established", 
                "successful_connections": 1
            }
        }, 
        "ModuleServerState": {
            "db_drop_level": "INVALID", 
            "db_enqueues": 2322, 
            "db_msg_dropped": 0, 
            "db_queue_count": [
                {
                    "history-10": {
                        "{\"ts\":1391408017332133}": 0, 
                        "{\"ts\":1391408077334608}": 0, 
                        "{\"ts\":1391408137337518}": 0, 
                        "{\"ts\":1391408197340287}": 0, 
                        "{\"ts\":1391408257342885}": 0, 
                        "{\"ts\":1391408317345585}": 0, 
                        "{\"ts\":1391408377348358}": 0, 
                        "{\"ts\":1391408437350795}": 0, 
                        "{\"ts\":1391408497353409}": 0, 
                        "{\"ts\":1391408557356158}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:18:37.345": 0, 
                        "2014 Feb 03 06:19:37.348": 0, 
                        "2014 Feb 03 06:20:37.350": 0, 
                        "2014 Feb 03 06:21:37.353": 0, 
                        "2014 Feb 03 06:22:37.356": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b50": "23", 
                        "sum": "0"
                    }
                }
            ], 
            "generator_info": [
                {
                    "gen_attr": {
                        "connect_time": 1391403642086352, 
                        "connects": 1, 
                        "in_clear": false, 
                        "reset_time": 0, 
                        "resets": 0
                    }, 
                    "hostname": "nodeg3"
                }
            ], 
            "msg_stats": [
                {
                    "hostname": "nodeg3", 
                    "log_level_stats": [], 
                    "msgtype_stats": [
                        {
                            "bytes": 45675, 
                            "last_msg_timestamp": 1391408515597776, 
                            "message_type": "ConfigCpuStateTrace", 
                            "messages": 82
                        }, 
                        {
                            "bytes": 130636, 
                            "last_msg_timestamp": 1391408515597639, 
                            "message_type": "ModuleCpuStateTrace", 
                            "messages": 82
                        }, 
                        {
                            "bytes": 2436, 
                            "last_msg_timestamp": 1391403642096681, 
                            "message_type": "SandeshModuleClientTrace", 
                            "messages": 3
                        }, 
                        {
                            "bytes": 9649, 
                            "last_msg_timestamp": 1391403653556165, 
                            "message_type": "VncApiConfigLog", 
                            "messages": 6
                        }
                    ]
                }
            ], 
            "session_rx_socket_stats": {
                "average_blocked_duration": null, 
                "average_bytes": 1823, 
                "blocked_count": 0, 
                "blocked_duration": null, 
                "bytes": 320867, 
                "calls": 176
            }, 
            "session_stats": {
                "num_recv_fail": 0, 
                "num_recv_msg": 174, 
                "num_recv_msg_fail": 0, 
                "num_send_buffer_fail": 0, 
                "num_send_msg": 1, 
                "num_send_msg_fail": 0, 
                "num_wait_msgq_dequeue": 0, 
                "num_wait_msgq_enqueue": 0, 
                "num_write_ready_cb_error": 0
            }, 
            "session_tx_socket_stats": {
                "average_blocked_duration": null, 
                "average_bytes": 1060, 
                "blocked_count": 0, 
                "blocked_duration": "00:00:00", 
                "bytes": 1060, 
                "calls": 1
            }, 
            "sm_msg_stats": {
                "aggregate_stats": {
                    "bytes_received": 314081, 
                    "bytes_sent": 0, 
                    "messages_received": 174, 
                    "messages_received_dropped": 0, 
                    "messages_sent": 0, 
                    "messages_sent_dropped": 0
                }, 
                "send_queue_stats": {
                    "count": 0, 
                    "enqueues": 0
                }, 
                "type_stats": [
                    {
                        "message_type": "ConfigCpuStateTrace", 
                        "stats": {
                            "bytes_received": 104542, 
                            "bytes_sent": 0, 
                            "messages_received": 82, 
                            "messages_received_dropped": 0, 
                            "messages_sent": 0, 
                            "messages_sent_dropped": 0
                        }
                    }, 
                    {
                        "message_type": "ModuleCpuStateTrace", 
                        "stats": {
                            "bytes_received": 189339, 
                            "bytes_sent": 0, 
                            "messages_received": 82, 
                            "messages_received_dropped": 0, 
                            "messages_sent": 0, 
                            "messages_sent_dropped": 0
                        }
                    }, 
                    {
                        "message_type": "SandeshCtrlClientToServer", 
                        "stats": {
                            "bytes_received": 1662, 
                            "bytes_sent": 0, 
                            "messages_received": 1, 
                            "messages_received_dropped": 0, 
                            "messages_sent": 0, 
                            "messages_sent_dropped": 0
                        }
                    }, 
                    {
                        "message_type": "SandeshModuleClientTrace", 
                        "stats": {
                            "bytes_received": 4581, 
                            "bytes_sent": 0, 
                            "messages_received": 3, 
                            "messages_received_dropped": 0, 
                            "messages_sent": 0, 
                            "messages_sent_dropped": 0
                        }
                    }, 
                    {
                        "message_type": "VncApiConfigLog", 
                        "stats": {
                            "bytes_received": 13957, 
                            "bytes_sent": 0, 
                            "messages_received": 6, 
                            "messages_received_dropped": 0, 
                            "messages_sent": 0, 
                            "messages_sent_dropped": 0
                        }
                    }
                ]
            }, 
            "sm_queue_count": [
                {
                    "history-10": {
                        "{\"ts\":1391408017332133}": 0, 
                        "{\"ts\":1391408077334608}": 0, 
                        "{\"ts\":1391408137337518}": 0, 
                        "{\"ts\":1391408197340287}": 0, 
                        "{\"ts\":1391408257342885}": 0, 
                        "{\"ts\":1391408317345585}": 0, 
                        "{\"ts\":1391408377348358}": 0, 
                        "{\"ts\":1391408437350795}": 0, 
                        "{\"ts\":1391408497353409}": 0, 
                        "{\"ts\":1391408557356158}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:18:37.345": 0, 
                        "2014 Feb 03 06:19:37.348": 0, 
                        "2014 Feb 03 06:20:37.350": 0, 
                        "2014 Feb 03 06:21:37.353": 0, 
                        "2014 Feb 03 06:22:37.356": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b50": "23", 
                        "sum": "0"
                    }
                }
            ], 
            "sm_stats": {
                "ev_stats": [
                    {
                        "dequeue_fails": 0, 
                        "dequeues": 1, 
                        "enqueue_fails": 0, 
                        "enqueues": 1, 
                        "event": "ssm::EvSandeshCtrlMessageRecv"
                    }, 
                    {
                        "dequeue_fails": 0, 
                        "dequeues": 173, 
                        "enqueue_fails": 0, 
                        "enqueues": 173, 
                        "event": "ssm::EvSandeshMessageRecv"
                    }, 
                    {
                        "dequeue_fails": 0, 
                        "dequeues": 1, 
                        "enqueue_fails": 0, 
                        "enqueues": 1, 
                        "event": "ssm::EvStart"
                    }, 
                    {
                        "dequeue_fails": 0, 
                        "dequeues": 1, 
                        "enqueue_fails": 0, 
                        "enqueues": 1, 
                        "event": "ssm::EvTcpPassiveOpen"
                    }, 
                    {
                        "dequeue_fails": 0, 
                        "dequeues": 176, 
                        "enqueue_fails": 0, 
                        "enqueues": 176, 
                        "event": null
                    }
                ], 
                "last_event": "ssm::EvSandeshMessageRecv", 
                "last_event_at": 1391408515594850, 
                "last_state": "Established", 
                "state": "Established", 
                "state_since": 1391403642098145
            }
        }
    }, 
    "configNode": {
        "ModuleCpuState": {
            "api_server_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408034778917}": 0, 
                        "{\"ts\":1391408094881073}": 0, 
                        "{\"ts\":1391408154982662}": 0, 
                        "{\"ts\":1391408215085500}": 2.5, 
                        "{\"ts\":1391408275187830}": 0, 
                        "{\"ts\":1391408335289701}": 0, 
                        "{\"ts\":1391408395391601}": 0, 
                        "{\"ts\":1391408455494477}": 0, 
                        "{\"ts\":1391408515597639}": 0, 
                        "{\"ts\":1391408575699078}": 2.45
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:16:55.85": 2.5, 
                        "2014 Feb 03 06:19:55.391": 0, 
                        "2014 Feb 03 06:20:55.494": 0, 
                        "2014 Feb 03 06:21:55.597": 0, 
                        "2014 Feb 03 06:22:55.699": 2.45
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "21", 
                        "b3": "2", 
                        "sum": "4.95"
                    }
                }
            ], 
            "api_server_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408034778917}": 307011, 
                        "{\"ts\":1391408094881073}": 307011, 
                        "{\"ts\":1391408154982662}": 307011, 
                        "{\"ts\":1391408215085500}": 307011, 
                        "{\"ts\":1391408275187830}": 307011, 
                        "{\"ts\":1391408335289701}": 307011, 
                        "{\"ts\":1391408395391601}": 307011, 
                        "{\"ts\":1391408455494477}": 307011, 
                        "{\"ts\":1391408515597639}": 307011, 
                        "{\"ts\":1391408575699078}": 307011
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:18:55.289": 307011, 
                        "2014 Feb 03 06:19:55.391": 307011, 
                        "2014 Feb 03 06:20:55.494": 307011, 
                        "2014 Feb 03 06:21:55.597": 307011, 
                        "2014 Feb 03 06:22:55.699": 307011
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b400000": "23", 
                        "sum": "7061253"
                    }
                }
            ], 
            "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-02 11:41:24.257877\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1104.el6\n\", \"build-number\" : \"1104\n\"}]}", 
            "module_cpu_info": [
                {
                    "cpu_info": {
                        "cpu_share": 0, 
                        "meminfo": {
                            "peakvirt": 286511, 
                            "res": 37421, 
                            "virt": 286511
                        }, 
                        "num_cpu": 4
                    }, 
                    "instance_id": "0", 
                    "module_id": "ServiceMonitor"
                }, 
                {
                    "cpu_info": {
                        "cpu_share": 0, 
                        "meminfo": {
                            "peakvirt": 301395, 
                            "res": 41709, 
                            "virt": 301395
                        }, 
                        "num_cpu": 4
                    }, 
                    "instance_id": "0", 
                    "module_id": "Schema"
                }, 
                {
                    "cpu_info": {
                        "cpu_share": 2.45, 
                        "cpuload": {
                            "fifteen_min_avg": 0, 
                            "five_min_avg": 0, 
                            "one_min_avg": 0
                        }, 
                        "meminfo": {
                            "peakvirt": 307011, 
                            "res": 51589, 
                            "virt": 307011
                        }, 
                        "num_cpu": 4, 
                        "sys_mem_info": {
                            "buffers": 173465, 
                            "free": 27840524, 
                            "total": 33639731, 
                            "used": 5799206
                        }
                    }, 
                    "instance_id": "0", 
                    "module_id": "ApiServer"
                }
            ], 
            "process_state_list": [
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403665557719", 
                    "last_stop_time": null, 
                    "process_name": "contrail-api:0", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403657541884", 
                    "last_stop_time": null, 
                    "process_name": "redis-config", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403655537501", 
                    "last_stop_time": null, 
                    "process_name": "contrail-config-nodemgr", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403661550733", 
                    "last_stop_time": null, 
                    "process_name": "contrail-discovery:0", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403669567686", 
                    "last_stop_time": null, 
                    "process_name": "contrail-svc-monitor", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403663552638", 
                    "last_stop_time": null, 
                    "process_name": "ifmap", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403667562627", 
                    "last_stop_time": null, 
                    "process_name": "contrail-schema", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }, 
                {
                    "core_file_list": [], 
                    "exit_count": 0, 
                    "last_exit_time": null, 
                    "last_start_time": "1391403659546955", 
                    "last_stop_time": null, 
                    "process_name": "contrail-zookeeper", 
                    "process_state": "PROCESS_STATE_RUNNING", 
                    "start_count": 1, 
                    "stop_count": 0
                }
            ], 
            "schema_xmer_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408040628413}": 0, 
                        "{\"ts\":1391408100729973}": 0, 
                        "{\"ts\":1391408160832338}": 0, 
                        "{\"ts\":1391408220934808}": 0, 
                        "{\"ts\":1391408281036430}": 0, 
                        "{\"ts\":1391408341138073}": 0, 
                        "{\"ts\":1391408401240570}": 0, 
                        "{\"ts\":1391408461342875}": 0, 
                        "{\"ts\":1391408521444585}": 0, 
                        "{\"ts\":1391408581546184}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.138": 0, 
                        "2014 Feb 03 06:20:01.240": 0, 
                        "2014 Feb 03 06:21:01.342": 0, 
                        "2014 Feb 03 06:22:01.444": 0, 
                        "2014 Feb 03 06:23:01.546": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "23", 
                        "sum": "0"
                    }
                }
            ], 
            "schema_xmer_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408040628413}": 301395, 
                        "{\"ts\":1391408100729973}": 301395, 
                        "{\"ts\":1391408160832338}": 301395, 
                        "{\"ts\":1391408220934808}": 301395, 
                        "{\"ts\":1391408281036430}": 301395, 
                        "{\"ts\":1391408341138073}": 301395, 
                        "{\"ts\":1391408401240570}": 301395, 
                        "{\"ts\":1391408461342875}": 301395, 
                        "{\"ts\":1391408521444585}": 301395, 
                        "{\"ts\":1391408581546184}": 301395
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.138": 301395, 
                        "2014 Feb 03 06:20:01.240": 301395, 
                        "2014 Feb 03 06:21:01.342": 301395, 
                        "2014 Feb 03 06:22:01.444": 301395, 
                        "2014 Feb 03 06:23:01.546": 301395
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b400000": "23", 
                        "sum": "6932085"
                    }
                }
            ], 
            "service_monitor_cpu_share": [
                {
                    "history-10": {
                        "{\"ts\":1391408040637852}": 0, 
                        "{\"ts\":1391408100740174}": 0, 
                        "{\"ts\":1391408160841731}": 0, 
                        "{\"ts\":1391408220944010}": 0, 
                        "{\"ts\":1391408281045752}": 0, 
                        "{\"ts\":1391408341147215}": 2.5, 
                        "{\"ts\":1391408401249969}": 0, 
                        "{\"ts\":1391408461351880}": 0, 
                        "{\"ts\":1391408521453710}": 0, 
                        "{\"ts\":1391408581556094}": 0
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.147": 2.5, 
                        "2014 Feb 03 06:20:01.249": 0, 
                        "2014 Feb 03 06:21:01.351": 0, 
                        "2014 Feb 03 06:22:01.453": 0, 
                        "2014 Feb 03 06:23:01.556": 0
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b1": "22", 
                        "b3": "1", 
                        "sum": "2.5"
                    }
                }
            ], 
            "service_monitor_mem_virt": [
                {
                    "history-10": {
                        "{\"ts\":1391408040637852}": 286511, 
                        "{\"ts\":1391408100740174}": 286511, 
                        "{\"ts\":1391408160841731}": 286511, 
                        "{\"ts\":1391408220944010}": 286511, 
                        "{\"ts\":1391408281045752}": 286511, 
                        "{\"ts\":1391408341147215}": 286511, 
                        "{\"ts\":1391408401249969}": 286511, 
                        "{\"ts\":1391408461351880}": 286511, 
                        "{\"ts\":1391408521453710}": 286511, 
                        "{\"ts\":1391408581556094}": 286511
                    }
                }, 
                {
                    "s-3600-topvals": {
                        "2014 Feb 03 06:19:01.147": 286511, 
                        "2014 Feb 03 06:20:01.249": 286511, 
                        "2014 Feb 03 06:21:01.351": 286511, 
                        "2014 Feb 03 06:22:01.453": 286511, 
                        "2014 Feb 03 06:23:01.556": 286511
                    }
                }, 
                {
                    "s-3600-summary": {
                        "b300000": "23", 
                        "sum": "6589753"
                    }
                }
            ]
        }
    }
};
var analyticsSummWOGenData = 
{
    "value": [
        {
            "name": "nodeg3", 
            "value": {
                "CollectorState": {
                    "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                    "generator_infos": [
                        {
                            "instance_id": "0", 
                            "module_id": "ApiServer", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Config-Nodemgr", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ControlNode", 
                            "node_type": "Control", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DnsAgent", 
                            "node_type": "Control", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ApiServer", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Collector", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Analytics-Nodemgr", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Config-Nodemgr", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DiscoveryService", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DnsAgent", 
                            "node_type": "Control", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "OpServer", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "QueryEngine", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }
                    ], 
                    "rx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 5547, 
                        "blocked_count": 0, 
                        "blocked_duration": null, 
                        "bytes": 79800360, 
                        "calls": 14385
                    }, 
                    "self_ip_list": [
                        "10.204.217.43"
                    ], 
                    "tx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 1060, 
                        "blocked_count": 0, 
                        "blocked_duration": "00:00:00", 
                        "bytes": 12724, 
                        "calls": 12
                    }
                }, 
                "ModuleCpuState": {
                    "collector_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417917759545}": 0.0791799, 
                                "{\"ts\":1391417977762009}": 0.0708451, 
                                "{\"ts\":1391418037764912}": 0.0708333, 
                                "{\"ts\":1391418097767914}": 0.0708451, 
                                "{\"ts\":1391418157770791}": 0.0666667, 
                                "{\"ts\":1391418217773702}": 0.0750125, 
                                "{\"ts\":1391418277776206}": 0.0833472, 
                                "{\"ts\":1391418337778752}": 0.075, 
                                "{\"ts\":1391418397781257}": 0.0750125, 
                                "{\"ts\":1391418457784104}": 0.0708451
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:37.773": 0.0750125, 
                                "2014 Feb 03 09:04:37.776": 0.0833472, 
                                "2014 Feb 03 09:05:37.778": 0.075, 
                                "2014 Feb 03 09:06:37.781": 0.0750125, 
                                "2014 Feb 03 09:07:37.784": 0.0708451
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "8", 
                                "sum": "0.5875624"
                            }
                        }
                    ], 
                    "collector_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417917759545}": 352180, 
                                "{\"ts\":1391417977762009}": 352180, 
                                "{\"ts\":1391418037764912}": 352180, 
                                "{\"ts\":1391418097767914}": 352180, 
                                "{\"ts\":1391418157770791}": 352180, 
                                "{\"ts\":1391418217773702}": 352180, 
                                "{\"ts\":1391418277776206}": 352180, 
                                "{\"ts\":1391418337778752}": 352180, 
                                "{\"ts\":1391418397781257}": 352180, 
                                "{\"ts\":1391418457784104}": 352180
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:37.773": 352180, 
                                "2014 Feb 03 09:04:37.776": 352180, 
                                "2014 Feb 03 09:05:37.778": 352180, 
                                "2014 Feb 03 09:06:37.781": 352180, 
                                "2014 Feb 03 09:07:37.784": 352180
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "8", 
                                "sum": "2817440"
                            }
                        }
                    ], 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 240924, 
                                    "res": 23684, 
                                    "virt": 240924
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "OpServer"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.00416736, 
                                "meminfo": {
                                    "peakvirt": 412612, 
                                    "res": 13044, 
                                    "virt": 347440
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "QueryEngine"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.0708451, 
                                "meminfo": {
                                    "peakvirt": 417432, 
                                    "res": 27356, 
                                    "virt": 352180
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Collector"
                        }
                    ], 
                    "opserver_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417935322267}": 0, 
                                "{\"ts\":1391417995425982}": 0, 
                                "{\"ts\":1391418055529794}": 2.5, 
                                "{\"ts\":1391418115633837}": 0, 
                                "{\"ts\":1391418175737524}": 0, 
                                "{\"ts\":1391418235841554}": 0, 
                                "{\"ts\":1391418295946044}": 0, 
                                "{\"ts\":1391418356050531}": 0, 
                                "{\"ts\":1391418416154679}": 0, 
                                "{\"ts\":1391418476259251}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:00:55.529": 2.5, 
                                "2014 Feb 03 09:04:55.946": 0, 
                                "2014 Feb 03 09:05:56.50": 0, 
                                "2014 Feb 03 09:06:56.154": 0, 
                                "2014 Feb 03 09:07:56.259": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "7", 
                                "bmax": "1", 
                                "sum": "2.5"
                            }
                        }
                    ], 
                    "opserver_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417935322267}": 240924, 
                                "{\"ts\":1391417995425982}": 240924, 
                                "{\"ts\":1391418055529794}": 240924, 
                                "{\"ts\":1391418115633837}": 240924, 
                                "{\"ts\":1391418175737524}": 240924, 
                                "{\"ts\":1391418235841554}": 240924, 
                                "{\"ts\":1391418295946044}": 240924, 
                                "{\"ts\":1391418356050531}": 240924, 
                                "{\"ts\":1391418416154679}": 240924, 
                                "{\"ts\":1391418476259251}": 240924
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:55.841": 240924, 
                                "2014 Feb 03 09:04:55.946": 240924, 
                                "2014 Feb 03 09:05:56.50": 240924, 
                                "2014 Feb 03 09:06:56.154": 240924, 
                                "2014 Feb 03 09:07:56.259": 240924
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "8", 
                                "sum": "1927392"
                            }
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403650567604", 
                            "last_stop_time": null, 
                            "process_name": "redis-query", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403656580041", 
                            "last_stop_time": null, 
                            "process_name": "contrail-query-engine", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403654576076", 
                            "last_stop_time": null, 
                            "process_name": "contrail-collector", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403646558870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403652572100", 
                            "last_stop_time": null, 
                            "process_name": "redis-uve", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403658584898", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-api", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403648562764", 
                            "last_stop_time": null, 
                            "process_name": "redis-sentinel", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "queryengine_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417925681989}": 0.00416736, 
                                "{\"ts\":1391417985682289}": 0, 
                                "{\"ts\":1391418045682581}": 0.00416736, 
                                "{\"ts\":1391418105682900}": 0.00833333, 
                                "{\"ts\":1391418165683201}": 0, 
                                "{\"ts\":1391418225683492}": 0.00416736, 
                                "{\"ts\":1391418285683776}": 0.00416736, 
                                "{\"ts\":1391418345684061}": 0, 
                                "{\"ts\":1391418405684349}": 0.00416736, 
                                "{\"ts\":1391418465684652}": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:01:45.682": 0.00833333, 
                                "2014 Feb 03 09:03:45.683": 0.00416736, 
                                "2014 Feb 03 09:04:45.683": 0.00416736, 
                                "2014 Feb 03 09:06:45.684": 0.00416736, 
                                "2014 Feb 03 09:07:45.684": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "8", 
                                "sum": "0.02917013"
                            }
                        }
                    ], 
                    "queryengine_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417925681989}": 347440, 
                                "{\"ts\":1391417985682289}": 347440, 
                                "{\"ts\":1391418045682581}": 347440, 
                                "{\"ts\":1391418105682900}": 347440, 
                                "{\"ts\":1391418165683201}": 347440, 
                                "{\"ts\":1391418225683492}": 347440, 
                                "{\"ts\":1391418285683776}": 347440, 
                                "{\"ts\":1391418345684061}": 347440, 
                                "{\"ts\":1391418405684349}": 347440, 
                                "{\"ts\":1391418465684652}": 347440
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:45.683": 347440, 
                                "2014 Feb 03 09:04:45.683": 347440, 
                                "2014 Feb 03 09:05:45.684": 347440, 
                                "2014 Feb 03 09:06:45.684": 347440, 
                                "2014 Feb 03 09:07:45.684": 347440
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "8", 
                                "sum": "2779520"
                            }
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg2", 
            "value": {
                "CollectorState": {
                    "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                    "generator_infos": [
                        {
                            "instance_id": "0", 
                            "module_id": "Collector", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Analytics-Nodemgr", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DiscoveryService", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "OpServer", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "QueryEngine", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Schema", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ServiceMonitor", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ControlNode", 
                            "node_type": "Control", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg4", 
                            "state": "Established"
                        }
                    ], 
                    "rx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 4800, 
                        "blocked_count": 0, 
                        "blocked_duration": null, 
                        "bytes": 82714259, 
                        "calls": 17230
                    }, 
                    "self_ip_list": [
                        "10.204.217.42"
                    ], 
                    "tx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 1060, 
                        "blocked_count": 0, 
                        "blocked_duration": "00:00:00", 
                        "bytes": 11663, 
                        "calls": 11
                    }
                }, 
                "ModuleCpuState": {
                    "collector_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417923427105}": 0.0958493, 
                                "{\"ts\":1391417983429284}": 0.0833333, 
                                "{\"ts\":1391418043431470}": 0.0875146, 
                                "{\"ts\":1391418103435122}": 0.0875, 
                                "{\"ts\":1391418163437392}": 0.0875146, 
                                "{\"ts\":1391418223439640}": 0.0916819, 
                                "{\"ts\":1391418283442209}": 0.0875146, 
                                "{\"ts\":1391418343444623}": 0.0833333, 
                                "{\"ts\":1391418403446860}": 0.0916819, 
                                "{\"ts\":1391418463449452}": 0.0833333
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:00:43.431": 0.0875146, 
                                "2014 Feb 03 09:02:43.437": 0.0875146, 
                                "2014 Feb 03 09:03:43.439": 0.0916819, 
                                "2014 Feb 03 09:04:43.442": 0.0875146, 
                                "2014 Feb 03 09:06:43.446": 0.0916819
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "8", 
                                "sum": "0.7000742"
                            }
                        }
                    ], 
                    "collector_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417923427105}": 352176, 
                                "{\"ts\":1391417983429284}": 352176, 
                                "{\"ts\":1391418043431470}": 352176, 
                                "{\"ts\":1391418103435122}": 352176, 
                                "{\"ts\":1391418163437392}": 352176, 
                                "{\"ts\":1391418223439640}": 352176, 
                                "{\"ts\":1391418283442209}": 352176, 
                                "{\"ts\":1391418343444623}": 352176, 
                                "{\"ts\":1391418403446860}": 352176, 
                                "{\"ts\":1391418463449452}": 352176
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:43.439": 352176, 
                                "2014 Feb 03 09:04:43.442": 352176, 
                                "2014 Feb 03 09:05:43.444": 352176, 
                                "2014 Feb 03 09:06:43.446": 352176, 
                                "2014 Feb 03 09:07:43.449": 352176
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "8", 
                                "sum": "2817408"
                            }
                        }
                    ], 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 241612, 
                                    "res": 24592, 
                                    "virt": 241612
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "OpServer"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.0833333, 
                                "meminfo": {
                                    "peakvirt": 417420, 
                                    "res": 24980, 
                                    "virt": 352176
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Collector"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 412612, 
                                    "res": 47052, 
                                    "virt": 347632
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "QueryEngine"
                        }
                    ], 
                    "opserver_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417941713721}": 0, 
                                "{\"ts\":1391418001817300}": 0, 
                                "{\"ts\":1391418061918789}": 0, 
                                "{\"ts\":1391418122022180}": 0, 
                                "{\"ts\":1391418182125824}": 0, 
                                "{\"ts\":1391418242229575}": 0, 
                                "{\"ts\":1391418302333847}": 0, 
                                "{\"ts\":1391418362437959}": 0, 
                                "{\"ts\":1391418422539765}": 0, 
                                "{\"ts\":1391418482644301}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:04:02.229": 0, 
                                "2014 Feb 03 09:05:02.333": 0, 
                                "2014 Feb 03 09:06:02.437": 0, 
                                "2014 Feb 03 09:07:02.539": 0, 
                                "2014 Feb 03 09:08:02.644": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "9", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "opserver_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417941713721}": 241612, 
                                "{\"ts\":1391418001817300}": 241612, 
                                "{\"ts\":1391418061918789}": 241612, 
                                "{\"ts\":1391418122022180}": 241612, 
                                "{\"ts\":1391418182125824}": 241612, 
                                "{\"ts\":1391418242229575}": 241612, 
                                "{\"ts\":1391418302333847}": 241612, 
                                "{\"ts\":1391418362437959}": 241612, 
                                "{\"ts\":1391418422539765}": 241612, 
                                "{\"ts\":1391418482644301}": 241612
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:04:02.229": 241612, 
                                "2014 Feb 03 09:05:02.333": 241612, 
                                "2014 Feb 03 09:06:02.437": 241612, 
                                "2014 Feb 03 09:07:02.539": 241612, 
                                "2014 Feb 03 09:08:02.644": 241612
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "9", 
                                "sum": "2174508"
                            }
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403656967110", 
                            "last_stop_time": null, 
                            "process_name": "redis-query", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403662980923", 
                            "last_stop_time": null, 
                            "process_name": "contrail-query-engine", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403660976870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-collector", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403652958413", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403658972007", 
                            "last_stop_time": null, 
                            "process_name": "redis-uve", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403664984650", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-api", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403654963138", 
                            "last_stop_time": null, 
                            "process_name": "redis-sentinel", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "queryengine_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391417930753372}": 0.00416736, 
                                "{\"ts\":1391417990753687}": 0, 
                                "{\"ts\":1391418050753980}": 0.00416736, 
                                "{\"ts\":1391418110754279}": 0.00416736, 
                                "{\"ts\":1391418170754580}": 0.00416667, 
                                "{\"ts\":1391418230754884}": 0.00416736, 
                                "{\"ts\":1391418290755194}": 0.00416736, 
                                "{\"ts\":1391418350755495}": 0, 
                                "{\"ts\":1391418410755800}": 0.00416736, 
                                "{\"ts\":1391418470756083}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:00:50.753": 0.00416736, 
                                "2014 Feb 03 09:01:50.754": 0.00416736, 
                                "2014 Feb 03 09:03:50.754": 0.00416736, 
                                "2014 Feb 03 09:04:50.755": 0.00416736, 
                                "2014 Feb 03 09:06:50.755": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "8", 
                                "sum": "0.02500347"
                            }
                        }
                    ], 
                    "queryengine_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391417930753372}": 347632, 
                                "{\"ts\":1391417990753687}": 347632, 
                                "{\"ts\":1391418050753980}": 347632, 
                                "{\"ts\":1391418110754279}": 347632, 
                                "{\"ts\":1391418170754580}": 347632, 
                                "{\"ts\":1391418230754884}": 347632, 
                                "{\"ts\":1391418290755194}": 347632, 
                                "{\"ts\":1391418350755495}": 347632, 
                                "{\"ts\":1391418410755800}": 347632, 
                                "{\"ts\":1391418470756083}": 347632
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 09:03:50.754": 347632, 
                                "2014 Feb 03 09:04:50.755": 347632, 
                                "2014 Feb 03 09:05:50.755": 347632, 
                                "2014 Feb 03 09:06:50.755": 347632, 
                                "2014 Feb 03 09:07:50.756": 347632
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "8", 
                                "sum": "2781056"
                            }
                        }
                    ]
                }
            }
        }
    ]
};

var analyticsSummWGenData =
{
    "value": [
        {
            "name": "nodeg3", 
            "value": {
                "CollectorState": {
                    "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                    "generator_infos": [
                        {
                            "instance_id": "0", 
                            "module_id": "ApiServer", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Config-Nodemgr", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ControlNode", 
                            "node_type": "Control", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DnsAgent", 
                            "node_type": "Control", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ApiServer", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Collector", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Analytics-Nodemgr", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Config-Nodemgr", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DiscoveryService", 
                            "node_type": "Config", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DnsAgent", 
                            "node_type": "Control", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "OpServer", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "QueryEngine", 
                            "node_type": "Analytics", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }
                    ], 
                    "rx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 5552, 
                        "blocked_count": 0, 
                        "blocked_duration": null, 
                        "bytes": 71495787, 
                        "calls": 12877
                    }, 
                    "self_ip_list": [
                        "10.204.217.43"
                    ], 
                    "tx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 1060, 
                        "blocked_count": 0, 
                        "blocked_duration": "00:00:00", 
                        "bytes": 12724, 
                        "calls": 12
                    }
                }, 
                "ModuleCpuState": {
                    "collector_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416297686010}": 0.0791799, 
                                "{\"ts\":1391416357689386}": 0.0708333, 
                                "{\"ts\":1391416417692112}": 0.0750125, 
                                "{\"ts\":1391416477694969}": 0.0750125, 
                                "{\"ts\":1391416537697490}": 0.075, 
                                "{\"ts\":1391416597700395}": 0.0708451, 
                                "{\"ts\":1391416657703145}": 0.0791667, 
                                "{\"ts\":1391416717705843}": 0.0875146, 
                                "{\"ts\":1391416777708379}": 0.0750125, 
                                "{\"ts\":1391416837710907}": 0.0666667
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:16:37.645": 0.0791799, 
                                "2014 Feb 03 08:22:37.661": 0.0791799, 
                                "2014 Feb 03 08:30:37.683": 0.0833472, 
                                "2014 Feb 03 08:31:37.686": 0.0791799, 
                                "2014 Feb 03 08:38:37.705": 0.0875146
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "41", 
                                "sum": "3.0628264"
                            }
                        }
                    ], 
                    "collector_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416297686010}": 352180, 
                                "{\"ts\":1391416357689386}": 352180, 
                                "{\"ts\":1391416417692112}": 352180, 
                                "{\"ts\":1391416477694969}": 352180, 
                                "{\"ts\":1391416537697490}": 352180, 
                                "{\"ts\":1391416597700395}": 352180, 
                                "{\"ts\":1391416657703145}": 352180, 
                                "{\"ts\":1391416717705843}": 352180, 
                                "{\"ts\":1391416777708379}": 352180, 
                                "{\"ts\":1391416837710907}": 352180
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:37.700": 352180, 
                                "2014 Feb 03 08:37:37.703": 352180, 
                                "2014 Feb 03 08:38:37.705": 352180, 
                                "2014 Feb 03 08:39:37.708": 352180, 
                                "2014 Feb 03 08:40:37.710": 352180
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "41", 
                                "sum": "14439380"
                            }
                        }
                    ], 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 240924, 
                                    "res": 23588, 
                                    "virt": 240924
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "OpServer"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 412612, 
                                    "res": 13044, 
                                    "virt": 347440
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "QueryEngine"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.0666667, 
                                "meminfo": {
                                    "peakvirt": 417432, 
                                    "res": 27216, 
                                    "virt": 352180
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Collector"
                        }
                    ], 
                    "opserver_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416312536370}": 0, 
                                "{\"ts\":1391416372639337}": 0, 
                                "{\"ts\":1391416432741694}": 0, 
                                "{\"ts\":1391416492844228}": 0, 
                                "{\"ts\":1391416552946859}": 0, 
                                "{\"ts\":1391416613049351}": 0, 
                                "{\"ts\":1391416673152811}": 2.5, 
                                "{\"ts\":1391416733255948}": 2.5, 
                                "{\"ts\":1391416793358964}": 0, 
                                "{\"ts\":1391416853462232}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:53.49": 0, 
                                "2014 Feb 03 08:37:53.152": 2.5, 
                                "2014 Feb 03 08:38:53.255": 2.5, 
                                "2014 Feb 03 08:39:53.358": 0, 
                                "2014 Feb 03 08:40:53.462": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "39", 
                                "bmax": "2", 
                                "sum": "5"
                            }
                        }
                    ], 
                    "opserver_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416312536370}": 240924, 
                                "{\"ts\":1391416372639337}": 240924, 
                                "{\"ts\":1391416432741694}": 240924, 
                                "{\"ts\":1391416492844228}": 240924, 
                                "{\"ts\":1391416552946859}": 240924, 
                                "{\"ts\":1391416613049351}": 240924, 
                                "{\"ts\":1391416673152811}": 240924, 
                                "{\"ts\":1391416733255948}": 240924, 
                                "{\"ts\":1391416793358964}": 240924, 
                                "{\"ts\":1391416853462232}": 240924
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:53.49": 240924, 
                                "2014 Feb 03 08:37:53.152": 240924, 
                                "2014 Feb 03 08:38:53.255": 240924, 
                                "2014 Feb 03 08:39:53.358": 240924, 
                                "2014 Feb 03 08:40:53.462": 240924
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "41", 
                                "sum": "9872684"
                            }
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403650567604", 
                            "last_stop_time": null, 
                            "process_name": "redis-query", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403656580041", 
                            "last_stop_time": null, 
                            "process_name": "contrail-query-engine", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403654576076", 
                            "last_stop_time": null, 
                            "process_name": "contrail-collector", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403646558870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403652572100", 
                            "last_stop_time": null, 
                            "process_name": "redis-uve", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403658584898", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-api", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403648562764", 
                            "last_stop_time": null, 
                            "process_name": "redis-sentinel", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "queryengine_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416305674080}": 0.00416736, 
                                "{\"ts\":1391416365674374}": 0.00833472, 
                                "{\"ts\":1391416425674696}": 0.00416736, 
                                "{\"ts\":1391416485674992}": 0, 
                                "{\"ts\":1391416545675287}": 0.00416736, 
                                "{\"ts\":1391416605675577}": 0.00416667, 
                                "{\"ts\":1391416665675783}": 0, 
                                "{\"ts\":1391416725676096}": 0.00416736, 
                                "{\"ts\":1391416785676388}": 0.00416736, 
                                "{\"ts\":1391416845676676}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:04:45.666": 0.00833472, 
                                "2014 Feb 03 08:25:45.672": 0.00833472, 
                                "2014 Feb 03 08:32:45.674": 0.00833472, 
                                "2014 Feb 03 08:38:45.676": 0.00416736, 
                                "2014 Feb 03 08:39:45.676": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "41", 
                                "sum": "0.14168748"
                            }
                        }
                    ], 
                    "queryengine_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416305674080}": 347440, 
                                "{\"ts\":1391416365674374}": 347440, 
                                "{\"ts\":1391416425674696}": 347440, 
                                "{\"ts\":1391416485674992}": 347440, 
                                "{\"ts\":1391416545675287}": 347440, 
                                "{\"ts\":1391416605675577}": 347440, 
                                "{\"ts\":1391416665675783}": 347440, 
                                "{\"ts\":1391416725676096}": 347440, 
                                "{\"ts\":1391416785676388}": 347440, 
                                "{\"ts\":1391416845676676}": 347440
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:45.675": 347440, 
                                "2014 Feb 03 08:37:45.675": 347440, 
                                "2014 Feb 03 08:38:45.676": 347440, 
                                "2014 Feb 03 08:39:45.676": 347440, 
                                "2014 Feb 03 08:40:45.676": 347440
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "41", 
                                "sum": "14245040"
                            }
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg2", 
            "value": {
                "CollectorState": {
                    "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                    "generator_infos": [
                        {
                            "instance_id": "0", 
                            "module_id": "Collector", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Contrail-Analytics-Nodemgr", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "DiscoveryService", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "OpServer", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "QueryEngine", 
                            "node_type": "Analytics", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "Schema", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ServiceMonitor", 
                            "node_type": "Config", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg2", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "ControlNode", 
                            "node_type": "Control", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg3", 
                            "state": "Established"
                        }, 
                        {
                            "instance_id": "0", 
                            "module_id": "VRouterAgent", 
                            "node_type": "Compute", 
                            "source": "nodeg4", 
                            "state": "Established"
                        }
                    ], 
                    "rx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 4794, 
                        "blocked_count": 0, 
                        "blocked_duration": null, 
                        "bytes": 73834401, 
                        "calls": 15399
                    }, 
                    "self_ip_list": [
                        "10.204.217.42"
                    ], 
                    "tx_socket_stats": {
                        "average_blocked_duration": null, 
                        "average_bytes": 1060, 
                        "blocked_count": 0, 
                        "blocked_duration": "00:00:00", 
                        "bytes": 11663, 
                        "calls": 11
                    }
                }, 
                "ModuleCpuState": {
                    "collector_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416303366696}": 0.0875146, 
                                "{\"ts\":1391416363368941}": 0.0958493, 
                                "{\"ts\":1391416423371611}": 0.0875, 
                                "{\"ts\":1391416483374533}": 0.0875146, 
                                "{\"ts\":1391416543376781}": 0.0958493, 
                                "{\"ts\":1391416603378982}": 0.0958333, 
                                "{\"ts\":1391416663380497}": 0.0916819, 
                                "{\"ts\":1391416723382957}": 0.0833472, 
                                "{\"ts\":1391416783385283}": 0.1, 
                                "{\"ts\":1391416843387456}": 0.0875146
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:15:43.326": 0.104167, 
                                "2014 Feb 03 08:25:43.352": 0.0958493, 
                                "2014 Feb 03 08:32:43.368": 0.0958493, 
                                "2014 Feb 03 08:35:43.376": 0.0958493, 
                                "2014 Feb 03 08:39:43.385": 0.1
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "40", 
                                "b0.2": "1", 
                                "sum": "3.733741"
                            }
                        }
                    ], 
                    "collector_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416303366696}": 352176, 
                                "{\"ts\":1391416363368941}": 352176, 
                                "{\"ts\":1391416423371611}": 352176, 
                                "{\"ts\":1391416483374533}": 352176, 
                                "{\"ts\":1391416543376781}": 352176, 
                                "{\"ts\":1391416603378982}": 352176, 
                                "{\"ts\":1391416663380497}": 352176, 
                                "{\"ts\":1391416723382957}": 352176, 
                                "{\"ts\":1391416783385283}": 352176, 
                                "{\"ts\":1391416843387456}": 352176
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:43.378": 352176, 
                                "2014 Feb 03 08:37:43.380": 352176, 
                                "2014 Feb 03 08:38:43.382": 352176, 
                                "2014 Feb 03 08:39:43.385": 352176, 
                                "2014 Feb 03 08:40:43.387": 352176
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "41", 
                                "sum": "14439216"
                            }
                        }
                    ], 
                    "module_cpu_info": [
                        {
                            "cpu_info": {
                                "cpu_share": 0, 
                                "meminfo": {
                                    "peakvirt": 241248, 
                                    "res": 24428, 
                                    "virt": 241248
                                }
                            }, 
                            "instance_id": "0", 
                            "module_id": "OpServer"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.0875146, 
                                "meminfo": {
                                    "peakvirt": 417420, 
                                    "res": 24956, 
                                    "virt": 352176
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "Collector"
                        }, 
                        {
                            "cpu_info": {
                                "cpu_share": 0.00416736, 
                                "meminfo": {
                                    "peakvirt": 412612, 
                                    "res": 47052, 
                                    "virt": 347632
                                }, 
                                "num_cpu": 4
                            }, 
                            "instance_id": "0", 
                            "module_id": "QueryEngine"
                        }
                    ], 
                    "opserver_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416318941005}": 0, 
                                "{\"ts\":1391416379043031}": 0, 
                                "{\"ts\":1391416439145590}": 0, 
                                "{\"ts\":1391416499247054}": 0, 
                                "{\"ts\":1391416559348934}": 0, 
                                "{\"ts\":1391416619451230}": 0, 
                                "{\"ts\":1391416679553057}": 0, 
                                "{\"ts\":1391416739655431}": 0, 
                                "{\"ts\":1391416799757815}": 0, 
                                "{\"ts\":1391416859860604}": 0
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:59.451": 0, 
                                "2014 Feb 03 08:37:59.553": 0, 
                                "2014 Feb 03 08:38:59.655": 0, 
                                "2014 Feb 03 08:39:59.757": 0, 
                                "2014 Feb 03 08:40:59.860": 0
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "41", 
                                "sum": "0"
                            }
                        }
                    ], 
                    "opserver_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416318941005}": 240964, 
                                "{\"ts\":1391416379043031}": 240964, 
                                "{\"ts\":1391416439145590}": 240964, 
                                "{\"ts\":1391416499247054}": 240964, 
                                "{\"ts\":1391416559348934}": 240964, 
                                "{\"ts\":1391416619451230}": 240964, 
                                "{\"ts\":1391416679553057}": 240964, 
                                "{\"ts\":1391416739655431}": 240964, 
                                "{\"ts\":1391416799757815}": 240964, 
                                "{\"ts\":1391416859860604}": 241248
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:59.451": 240964, 
                                "2014 Feb 03 08:37:59.553": 240964, 
                                "2014 Feb 03 08:38:59.655": 240964, 
                                "2014 Feb 03 08:39:59.757": 240964, 
                                "2014 Feb 03 08:40:59.860": 241248
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b300000": "41", 
                                "sum": "9879808"
                            }
                        }
                    ], 
                    "process_state_list": [
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403656967110", 
                            "last_stop_time": null, 
                            "process_name": "redis-query", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403662980923", 
                            "last_stop_time": null, 
                            "process_name": "contrail-query-engine", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403660976870", 
                            "last_stop_time": null, 
                            "process_name": "contrail-collector", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403652958413", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-nodemgr", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403658972007", 
                            "last_stop_time": null, 
                            "process_name": "redis-uve", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403664984650", 
                            "last_stop_time": null, 
                            "process_name": "contrail-analytics-api", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }, 
                        {
                            "core_file_list": [], 
                            "exit_count": 0, 
                            "last_exit_time": null, 
                            "last_start_time": "1391403654963138", 
                            "last_stop_time": null, 
                            "process_name": "redis-sentinel", 
                            "process_state": "PROCESS_STATE_RUNNING", 
                            "start_count": 1, 
                            "stop_count": 0
                        }
                    ], 
                    "queryengine_cpu_share": [
                        {
                            "history-10": {
                                "{\"ts\":1391416310745474}": 0.00416736, 
                                "{\"ts\":1391416370745766}": 0.00416736, 
                                "{\"ts\":1391416430746062}": 0.00416736, 
                                "{\"ts\":1391416490746346}": 0, 
                                "{\"ts\":1391416550746643}": 0.00416736, 
                                "{\"ts\":1391416610746942}": 0.00416736, 
                                "{\"ts\":1391416670747241}": 0, 
                                "{\"ts\":1391416730747545}": 0.00416736, 
                                "{\"ts\":1391416790747822}": 0.00416736, 
                                "{\"ts\":1391416850748065}": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:07:50.738": 0.00833472, 
                                "2014 Feb 03 08:22:50.742": 0.00833472, 
                                "2014 Feb 03 08:38:50.747": 0.00416736, 
                                "2014 Feb 03 08:39:50.747": 0.00416736, 
                                "2014 Feb 03 08:40:50.748": 0.00416736
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b0.1": "41", 
                                "sum": "0.13335345"
                            }
                        }
                    ], 
                    "queryengine_mem_virt": [
                        {
                            "history-10": {
                                "{\"ts\":1391416310745474}": 347632, 
                                "{\"ts\":1391416370745766}": 347632, 
                                "{\"ts\":1391416430746062}": 347632, 
                                "{\"ts\":1391416490746346}": 347632, 
                                "{\"ts\":1391416550746643}": 347632, 
                                "{\"ts\":1391416610746942}": 347632, 
                                "{\"ts\":1391416670747241}": 347632, 
                                "{\"ts\":1391416730747545}": 347632, 
                                "{\"ts\":1391416790747822}": 347632, 
                                "{\"ts\":1391416850748065}": 347632
                            }
                        }, 
                        {
                            "s-3600-topvals": {
                                "2014 Feb 03 08:36:50.746": 347632, 
                                "2014 Feb 03 08:37:50.747": 347632, 
                                "2014 Feb 03 08:38:50.747": 347632, 
                                "2014 Feb 03 08:39:50.747": 347632, 
                                "2014 Feb 03 08:40:50.748": 347632
                            }
                        }, 
                        {
                            "s-3600-summary": {
                                "b400000": "41", 
                                "sum": "14252912"
                            }
                        }
                    ]
                }
            }
        }
    ]
};

var analyticsSummWOGenData_OP =
[
    {
        "name": "nodeg3", 
        "value": {
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 5666, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 33615609, 
                    "calls": 5932
                }, 
                "self_ip_list": [
                    "10.204.217.43"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 12724, 
                    "calls": 12
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408917370502}": 0.0666778, 
                            "{\"ts\":1391408977372976}": 0.0791799, 
                            "{\"ts\":1391409037375418}": 0.075, 
                            "{\"ts\":1391409097378781}": 0.0708451, 
                            "{\"ts\":1391409157381223}": 0.0750125, 
                            "{\"ts\":1391409217383860}": 0.075, 
                            "{\"ts\":1391409277386827}": 0.0708451, 
                            "{\"ts\":1391409337389504}": 0.075, 
                            "{\"ts\":1391409397392287}": 0.0750125, 
                            "{\"ts\":1391409457394794}": 0.0708451
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:00:37.293": 0.0833333, 
                            "2014 Feb 03 06:13:37.329": 0.0833333, 
                            "2014 Feb 03 06:15:37.335": 0.0833472, 
                            "2014 Feb 03 06:23:37.356": 0.0916819, 
                            "2014 Feb 03 06:29:37.372": 0.0791799
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "38", 
                            "sum": "2.8586323"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408917370502}": 352180, 
                            "{\"ts\":1391408977372976}": 352180, 
                            "{\"ts\":1391409037375418}": 352180, 
                            "{\"ts\":1391409097378781}": 352180, 
                            "{\"ts\":1391409157381223}": 352180, 
                            "{\"ts\":1391409217383860}": 352180, 
                            "{\"ts\":1391409277386827}": 352180, 
                            "{\"ts\":1391409337389504}": 352180, 
                            "{\"ts\":1391409397392287}": 352180, 
                            "{\"ts\":1391409457394794}": 352180
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:37.383": 352180, 
                            "2014 Feb 03 06:34:37.386": 352180, 
                            "2014 Feb 03 06:35:37.389": 352180, 
                            "2014 Feb 03 06:36:37.392": 352180, 
                            "2014 Feb 03 06:37:37.394": 352180
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "38", 
                            "sum": "13382840"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 240444, 
                                "res": 23216, 
                                "virt": 240444
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 12960, 
                                "virt": 347440
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0708451, 
                            "meminfo": {
                                "peakvirt": 417432, 
                                "res": 25128, 
                                "virt": 352180
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408919861316}": 0, 
                            "{\"ts\":1391408979964455}": 0, 
                            "{\"ts\":1391409040068097}": 0, 
                            "{\"ts\":1391409100171367}": 0, 
                            "{\"ts\":1391409160274541}": 0, 
                            "{\"ts\":1391409220377894}": 0, 
                            "{\"ts\":1391409280481731}": 0, 
                            "{\"ts\":1391409340584915}": 0, 
                            "{\"ts\":1391409400688149}": 0, 
                            "{\"ts\":1391409460791402}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:12:38.215": 2.45, 
                            "2014 Feb 03 06:15:38.522": 2.5, 
                            "2014 Feb 03 06:22:39.244": 7.325, 
                            "2014 Feb 03 06:36:40.688": 0, 
                            "2014 Feb 03 06:37:40.791": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "35", 
                            "bmax": "3", 
                            "sum": "12.275"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408919861316}": 240444, 
                            "{\"ts\":1391408979964455}": 240444, 
                            "{\"ts\":1391409040068097}": 240444, 
                            "{\"ts\":1391409100171367}": 240444, 
                            "{\"ts\":1391409160274541}": 240444, 
                            "{\"ts\":1391409220377894}": 240444, 
                            "{\"ts\":1391409280481731}": 240444, 
                            "{\"ts\":1391409340584915}": 240444, 
                            "{\"ts\":1391409400688149}": 240444, 
                            "{\"ts\":1391409460791402}": 240444
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:40.377": 240444, 
                            "2014 Feb 03 06:34:40.481": 240444, 
                            "2014 Feb 03 06:35:40.584": 240444, 
                            "2014 Feb 03 06:36:40.688": 240444, 
                            "2014 Feb 03 06:37:40.791": 240444
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "38", 
                            "sum": "9133652"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403650567604", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656580041", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654576076", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403646558870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652572100", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658584898", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403648562764", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408925638574}": 0.00416667, 
                            "{\"ts\":1391408985638863}": 0.00416736, 
                            "{\"ts\":1391409045639158}": 0, 
                            "{\"ts\":1391409105639431}": 0.00416736, 
                            "{\"ts\":1391409165639740}": 0.00416736, 
                            "{\"ts\":1391409225640029}": 0.00416736, 
                            "{\"ts\":1391409285640316}": 0.00416736, 
                            "{\"ts\":1391409345640605}": 0, 
                            "{\"ts\":1391409405640885}": 0.00416667, 
                            "{\"ts\":1391409465641134}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:08:45.632": 0.00833472, 
                            "2014 Feb 03 06:13:45.634": 0.00833472, 
                            "2014 Feb 03 06:23:45.637": 0.0375063, 
                            "2014 Feb 03 06:33:45.640": 0.00416736, 
                            "2014 Feb 03 06:34:45.640": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "38", 
                            "sum": "0.15835698"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408925638574}": 347440, 
                            "{\"ts\":1391408985638863}": 347440, 
                            "{\"ts\":1391409045639158}": 347440, 
                            "{\"ts\":1391409105639431}": 347440, 
                            "{\"ts\":1391409165639740}": 347440, 
                            "{\"ts\":1391409225640029}": 347440, 
                            "{\"ts\":1391409285640316}": 347440, 
                            "{\"ts\":1391409345640605}": 347440, 
                            "{\"ts\":1391409405640885}": 347440, 
                            "{\"ts\":1391409465641134}": 347440
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:45.640": 347440, 
                            "2014 Feb 03 06:34:45.640": 347440, 
                            "2014 Feb 03 06:35:45.640": 347440, 
                            "2014 Feb 03 06:36:45.640": 347440, 
                            "2014 Feb 03 06:37:45.641": 347440
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "38", 
                            "sum": "13197568"
                        }
                    }
                ]
            }
        }
    }, 
    {
        "name": "nodeg2", 
        "value": {
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Schema", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ServiceMonitor", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg4", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 4792, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 33283865, 
                    "calls": 6945
                }, 
                "self_ip_list": [
                    "10.204.217.42"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 11663, 
                    "calls": 11
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408923065343}": 0.0875146, 
                            "{\"ts\":1391408983067878}": 0.0875146, 
                            "{\"ts\":1391409043070157}": 0.0916667, 
                            "{\"ts\":1391409103072377}": 0.0791799, 
                            "{\"ts\":1391409163074633}": 0.0916819, 
                            "{\"ts\":1391409223076892}": 0.0958333, 
                            "{\"ts\":1391409283079104}": 0.0916819, 
                            "{\"ts\":1391409343081656}": 0.0833472, 
                            "{\"ts\":1391409403083496}": 0.0916667, 
                            "{\"ts\":1391409463085726}": 0.0875146
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:10:43.20": 0.112519, 
                            "2014 Feb 03 06:15:43.33": 0.1, 
                            "2014 Feb 03 06:17:43.38": 0.0958493, 
                            "2014 Feb 03 06:23:43.53": 0.141667, 
                            "2014 Feb 03 06:24:43.56": 0.100017
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "35", 
                            "b0.2": "3", 
                            "sum": "3.5170561"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408923065343}": 352176, 
                            "{\"ts\":1391408983067878}": 352176, 
                            "{\"ts\":1391409043070157}": 352176, 
                            "{\"ts\":1391409103072377}": 352176, 
                            "{\"ts\":1391409163074633}": 352176, 
                            "{\"ts\":1391409223076892}": 352176, 
                            "{\"ts\":1391409283079104}": 352176, 
                            "{\"ts\":1391409343081656}": 352176, 
                            "{\"ts\":1391409403083496}": 352176, 
                            "{\"ts\":1391409463085726}": 352176
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:43.76": 352176, 
                            "2014 Feb 03 06:34:43.79": 352176, 
                            "2014 Feb 03 06:35:43.81": 352176, 
                            "2014 Feb 03 06:36:43.83": 352176, 
                            "2014 Feb 03 06:37:43.85": 352176
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "38", 
                            "sum": "13382688"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 240496, 
                                "res": 23596, 
                                "virt": 240496
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0875146, 
                            "meminfo": {
                                "peakvirt": 417420, 
                                "res": 23008, 
                                "virt": 352176
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.00416736, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 43216, 
                                "virt": 347632
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408926276320}": 0, 
                            "{\"ts\":1391408986379258}": 0, 
                            "{\"ts\":1391409046482032}": 0, 
                            "{\"ts\":1391409106588446}": 0, 
                            "{\"ts\":1391409166692069}": 0, 
                            "{\"ts\":1391409226795210}": 0, 
                            "{\"ts\":1391409286901270}": 0, 
                            "{\"ts\":1391409347002280}": 0, 
                            "{\"ts\":1391409407104001}": 0, 
                            "{\"ts\":1391409467205234}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:09:44.306": 2.5, 
                            "2014 Feb 03 06:10:44.409": 2.5, 
                            "2014 Feb 03 06:14:44.825": 2.5, 
                            "2014 Feb 03 06:22:45.654": 2.45, 
                            "2014 Feb 03 06:37:47.205": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "34", 
                            "bmax": "4", 
                            "sum": "9.95"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408926276320}": 240496, 
                            "{\"ts\":1391408986379258}": 240496, 
                            "{\"ts\":1391409046482032}": 240496, 
                            "{\"ts\":1391409106588446}": 240496, 
                            "{\"ts\":1391409166692069}": 240496, 
                            "{\"ts\":1391409226795210}": 240496, 
                            "{\"ts\":1391409286901270}": 240496, 
                            "{\"ts\":1391409347002280}": 240496, 
                            "{\"ts\":1391409407104001}": 240496, 
                            "{\"ts\":1391409467205234}": 240496
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:46.795": 240496, 
                            "2014 Feb 03 06:34:46.901": 240496, 
                            "2014 Feb 03 06:35:47.2": 240496, 
                            "2014 Feb 03 06:36:47.104": 240496, 
                            "2014 Feb 03 06:37:47.205": 240496
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "38", 
                            "sum": "9135720"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656967110", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403662980923", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403660976870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652958413", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658972007", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403664984650", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654963138", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391408930708270}": 0.00416736, 
                            "{\"ts\":1391408990708575}": 0.00416736, 
                            "{\"ts\":1391409050708871}": 0, 
                            "{\"ts\":1391409110709166}": 0.00833472, 
                            "{\"ts\":1391409170709443}": 0.00416736, 
                            "{\"ts\":1391409230709735}": 0.00416736, 
                            "{\"ts\":1391409290710032}": 0.00416736, 
                            "{\"ts\":1391409350710342}": 0, 
                            "{\"ts\":1391409410710641}": 0.00416736, 
                            "{\"ts\":1391409470710945}": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:09:50.702": 0.0791799, 
                            "2014 Feb 03 06:20:50.705": 0.00833472, 
                            "2014 Feb 03 06:23:50.706": 0.0791799, 
                            "2014 Feb 03 06:31:50.709": 0.00833472, 
                            "2014 Feb 03 06:37:50.710": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "38", 
                            "sum": "0.27921117"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391408930708270}": 347632, 
                            "{\"ts\":1391408990708575}": 347632, 
                            "{\"ts\":1391409050708871}": 347632, 
                            "{\"ts\":1391409110709166}": 347632, 
                            "{\"ts\":1391409170709443}": 347632, 
                            "{\"ts\":1391409230709735}": 347632, 
                            "{\"ts\":1391409290710032}": 347632, 
                            "{\"ts\":1391409350710342}": 347632, 
                            "{\"ts\":1391409410710641}": 347632, 
                            "{\"ts\":1391409470710945}": 347632
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 06:33:50.709": 347632, 
                            "2014 Feb 03 06:34:50.710": 347632, 
                            "2014 Feb 03 06:35:50.710": 347632, 
                            "2014 Feb 03 06:36:50.710": 347632, 
                            "2014 Feb 03 06:37:50.710": 347632
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "38", 
                            "sum": "13210016"
                        }
                    }
                ]
            }
        }
    }
];

var analyticsGenData =
{
    "value": [
        {
            "name": "nodeg3:Analytics:Collector:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8089, 
                        "pid": 3473, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403631046101, 
                        "status": "Established", 
                        "successful_connections": 2, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 11763, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 46770413, 
                            "calls": 3976
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403636053329, 
                                "connects": 2, 
                                "in_clear": false, 
                                "reset_time": 1391403631050238, 
                                "resets": 1
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg2:Analytics:OpServer:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8090, 
                        "pid": 3718, 
                        "primary": "127.0.0.1:8086", 
                        "secondary": null, 
                        "start_time": 1391403642108552, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403642111177, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg3:Analytics:QueryEngine:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8091, 
                        "pid": 3475, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403640530959, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 3863, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 4350669, 
                            "calls": 1126
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403640615454, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg2:Analytics:QueryEngine:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8091, 
                        "pid": 3717, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403645657135, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 3851, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 4918109, 
                            "calls": 1277
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403645681187, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg3:Analytics:OpServer:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8090, 
                        "pid": 3477, 
                        "primary": "127.0.0.1:8086", 
                        "secondary": null, 
                        "start_time": 1391403635298278, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403635300888, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }
        }, 
        {
            "name": "nodeg2:Analytics:Collector:0", 
            "value": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8089, 
                        "pid": 3716, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403636164570, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 10945, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 41112703, 
                            "calls": 3756
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403636216961, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }
        }
    ]
};

var analyticsSummWOGenData_OP = 
[
    {
        "name": "nodeg3", 
        "value": {
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 5547, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 79800360, 
                    "calls": 14385
                }, 
                "self_ip_list": [
                    "10.204.217.43"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 12724, 
                    "calls": 12
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417917759545}": 0.0791799, 
                            "{\"ts\":1391417977762009}": 0.0708451, 
                            "{\"ts\":1391418037764912}": 0.0708333, 
                            "{\"ts\":1391418097767914}": 0.0708451, 
                            "{\"ts\":1391418157770791}": 0.0666667, 
                            "{\"ts\":1391418217773702}": 0.0750125, 
                            "{\"ts\":1391418277776206}": 0.0833472, 
                            "{\"ts\":1391418337778752}": 0.075, 
                            "{\"ts\":1391418397781257}": 0.0750125, 
                            "{\"ts\":1391418457784104}": 0.0708451
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:37.773": 0.0750125, 
                            "2014 Feb 03 09:04:37.776": 0.0833472, 
                            "2014 Feb 03 09:05:37.778": 0.075, 
                            "2014 Feb 03 09:06:37.781": 0.0750125, 
                            "2014 Feb 03 09:07:37.784": 0.0708451
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "8", 
                            "sum": "0.5875624"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417917759545}": 352180, 
                            "{\"ts\":1391417977762009}": 352180, 
                            "{\"ts\":1391418037764912}": 352180, 
                            "{\"ts\":1391418097767914}": 352180, 
                            "{\"ts\":1391418157770791}": 352180, 
                            "{\"ts\":1391418217773702}": 352180, 
                            "{\"ts\":1391418277776206}": 352180, 
                            "{\"ts\":1391418337778752}": 352180, 
                            "{\"ts\":1391418397781257}": 352180, 
                            "{\"ts\":1391418457784104}": 352180
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:37.773": 352180, 
                            "2014 Feb 03 09:04:37.776": 352180, 
                            "2014 Feb 03 09:05:37.778": 352180, 
                            "2014 Feb 03 09:06:37.781": 352180, 
                            "2014 Feb 03 09:07:37.784": 352180
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "8", 
                            "sum": "2817440"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 240924, 
                                "res": 23684, 
                                "virt": 240924
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.00416736, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 13044, 
                                "virt": 347440
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0708451, 
                            "meminfo": {
                                "peakvirt": 417432, 
                                "res": 27356, 
                                "virt": 352180
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417935322267}": 0, 
                            "{\"ts\":1391417995425982}": 0, 
                            "{\"ts\":1391418055529794}": 2.5, 
                            "{\"ts\":1391418115633837}": 0, 
                            "{\"ts\":1391418175737524}": 0, 
                            "{\"ts\":1391418235841554}": 0, 
                            "{\"ts\":1391418295946044}": 0, 
                            "{\"ts\":1391418356050531}": 0, 
                            "{\"ts\":1391418416154679}": 0, 
                            "{\"ts\":1391418476259251}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:00:55.529": 2.5, 
                            "2014 Feb 03 09:04:55.946": 0, 
                            "2014 Feb 03 09:05:56.50": 0, 
                            "2014 Feb 03 09:06:56.154": 0, 
                            "2014 Feb 03 09:07:56.259": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "7", 
                            "bmax": "1", 
                            "sum": "2.5"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417935322267}": 240924, 
                            "{\"ts\":1391417995425982}": 240924, 
                            "{\"ts\":1391418055529794}": 240924, 
                            "{\"ts\":1391418115633837}": 240924, 
                            "{\"ts\":1391418175737524}": 240924, 
                            "{\"ts\":1391418235841554}": 240924, 
                            "{\"ts\":1391418295946044}": 240924, 
                            "{\"ts\":1391418356050531}": 240924, 
                            "{\"ts\":1391418416154679}": 240924, 
                            "{\"ts\":1391418476259251}": 240924
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:55.841": 240924, 
                            "2014 Feb 03 09:04:55.946": 240924, 
                            "2014 Feb 03 09:05:56.50": 240924, 
                            "2014 Feb 03 09:06:56.154": 240924, 
                            "2014 Feb 03 09:07:56.259": 240924
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "8", 
                            "sum": "1927392"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403650567604", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656580041", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654576076", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403646558870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652572100", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658584898", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403648562764", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417925681989}": 0.00416736, 
                            "{\"ts\":1391417985682289}": 0, 
                            "{\"ts\":1391418045682581}": 0.00416736, 
                            "{\"ts\":1391418105682900}": 0.00833333, 
                            "{\"ts\":1391418165683201}": 0, 
                            "{\"ts\":1391418225683492}": 0.00416736, 
                            "{\"ts\":1391418285683776}": 0.00416736, 
                            "{\"ts\":1391418345684061}": 0, 
                            "{\"ts\":1391418405684349}": 0.00416736, 
                            "{\"ts\":1391418465684652}": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:01:45.682": 0.00833333, 
                            "2014 Feb 03 09:03:45.683": 0.00416736, 
                            "2014 Feb 03 09:04:45.683": 0.00416736, 
                            "2014 Feb 03 09:06:45.684": 0.00416736, 
                            "2014 Feb 03 09:07:45.684": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "8", 
                            "sum": "0.02917013"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417925681989}": 347440, 
                            "{\"ts\":1391417985682289}": 347440, 
                            "{\"ts\":1391418045682581}": 347440, 
                            "{\"ts\":1391418105682900}": 347440, 
                            "{\"ts\":1391418165683201}": 347440, 
                            "{\"ts\":1391418225683492}": 347440, 
                            "{\"ts\":1391418285683776}": 347440, 
                            "{\"ts\":1391418345684061}": 347440, 
                            "{\"ts\":1391418405684349}": 347440, 
                            "{\"ts\":1391418465684652}": 347440
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:45.683": 347440, 
                            "2014 Feb 03 09:04:45.683": 347440, 
                            "2014 Feb 03 09:05:45.684": 347440, 
                            "2014 Feb 03 09:06:45.684": 347440, 
                            "2014 Feb 03 09:07:45.684": 347440
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "8", 
                            "sum": "2779520"
                        }
                    }
                ]
            }
        }
    }, 
    {
        "name": "nodeg2", 
        "value": {
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Schema", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ServiceMonitor", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg4", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 4800, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 82714259, 
                    "calls": 17230
                }, 
                "self_ip_list": [
                    "10.204.217.42"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 11663, 
                    "calls": 11
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417923427105}": 0.0958493, 
                            "{\"ts\":1391417983429284}": 0.0833333, 
                            "{\"ts\":1391418043431470}": 0.0875146, 
                            "{\"ts\":1391418103435122}": 0.0875, 
                            "{\"ts\":1391418163437392}": 0.0875146, 
                            "{\"ts\":1391418223439640}": 0.0916819, 
                            "{\"ts\":1391418283442209}": 0.0875146, 
                            "{\"ts\":1391418343444623}": 0.0833333, 
                            "{\"ts\":1391418403446860}": 0.0916819, 
                            "{\"ts\":1391418463449452}": 0.0833333
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:00:43.431": 0.0875146, 
                            "2014 Feb 03 09:02:43.437": 0.0875146, 
                            "2014 Feb 03 09:03:43.439": 0.0916819, 
                            "2014 Feb 03 09:04:43.442": 0.0875146, 
                            "2014 Feb 03 09:06:43.446": 0.0916819
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "8", 
                            "sum": "0.7000742"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417923427105}": 352176, 
                            "{\"ts\":1391417983429284}": 352176, 
                            "{\"ts\":1391418043431470}": 352176, 
                            "{\"ts\":1391418103435122}": 352176, 
                            "{\"ts\":1391418163437392}": 352176, 
                            "{\"ts\":1391418223439640}": 352176, 
                            "{\"ts\":1391418283442209}": 352176, 
                            "{\"ts\":1391418343444623}": 352176, 
                            "{\"ts\":1391418403446860}": 352176, 
                            "{\"ts\":1391418463449452}": 352176
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:43.439": 352176, 
                            "2014 Feb 03 09:04:43.442": 352176, 
                            "2014 Feb 03 09:05:43.444": 352176, 
                            "2014 Feb 03 09:06:43.446": 352176, 
                            "2014 Feb 03 09:07:43.449": 352176
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "8", 
                            "sum": "2817408"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 241612, 
                                "res": 24592, 
                                "virt": 241612
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0833333, 
                            "meminfo": {
                                "peakvirt": 417420, 
                                "res": 24980, 
                                "virt": 352176
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 47052, 
                                "virt": 347632
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417941713721}": 0, 
                            "{\"ts\":1391418001817300}": 0, 
                            "{\"ts\":1391418061918789}": 0, 
                            "{\"ts\":1391418122022180}": 0, 
                            "{\"ts\":1391418182125824}": 0, 
                            "{\"ts\":1391418242229575}": 0, 
                            "{\"ts\":1391418302333847}": 0, 
                            "{\"ts\":1391418362437959}": 0, 
                            "{\"ts\":1391418422539765}": 0, 
                            "{\"ts\":1391418482644301}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:04:02.229": 0, 
                            "2014 Feb 03 09:05:02.333": 0, 
                            "2014 Feb 03 09:06:02.437": 0, 
                            "2014 Feb 03 09:07:02.539": 0, 
                            "2014 Feb 03 09:08:02.644": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "9", 
                            "sum": "0"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417941713721}": 241612, 
                            "{\"ts\":1391418001817300}": 241612, 
                            "{\"ts\":1391418061918789}": 241612, 
                            "{\"ts\":1391418122022180}": 241612, 
                            "{\"ts\":1391418182125824}": 241612, 
                            "{\"ts\":1391418242229575}": 241612, 
                            "{\"ts\":1391418302333847}": 241612, 
                            "{\"ts\":1391418362437959}": 241612, 
                            "{\"ts\":1391418422539765}": 241612, 
                            "{\"ts\":1391418482644301}": 241612
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:04:02.229": 241612, 
                            "2014 Feb 03 09:05:02.333": 241612, 
                            "2014 Feb 03 09:06:02.437": 241612, 
                            "2014 Feb 03 09:07:02.539": 241612, 
                            "2014 Feb 03 09:08:02.644": 241612
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "9", 
                            "sum": "2174508"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656967110", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403662980923", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403660976870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652958413", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658972007", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403664984650", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654963138", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391417930753372}": 0.00416736, 
                            "{\"ts\":1391417990753687}": 0, 
                            "{\"ts\":1391418050753980}": 0.00416736, 
                            "{\"ts\":1391418110754279}": 0.00416736, 
                            "{\"ts\":1391418170754580}": 0.00416667, 
                            "{\"ts\":1391418230754884}": 0.00416736, 
                            "{\"ts\":1391418290755194}": 0.00416736, 
                            "{\"ts\":1391418350755495}": 0, 
                            "{\"ts\":1391418410755800}": 0.00416736, 
                            "{\"ts\":1391418470756083}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:00:50.753": 0.00416736, 
                            "2014 Feb 03 09:01:50.754": 0.00416736, 
                            "2014 Feb 03 09:03:50.754": 0.00416736, 
                            "2014 Feb 03 09:04:50.755": 0.00416736, 
                            "2014 Feb 03 09:06:50.755": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "8", 
                            "sum": "0.02500347"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391417930753372}": 347632, 
                            "{\"ts\":1391417990753687}": 347632, 
                            "{\"ts\":1391418050753980}": 347632, 
                            "{\"ts\":1391418110754279}": 347632, 
                            "{\"ts\":1391418170754580}": 347632, 
                            "{\"ts\":1391418230754884}": 347632, 
                            "{\"ts\":1391418290755194}": 347632, 
                            "{\"ts\":1391418350755495}": 347632, 
                            "{\"ts\":1391418410755800}": 347632, 
                            "{\"ts\":1391418470756083}": 347632
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 09:03:50.754": 347632, 
                            "2014 Feb 03 09:04:50.755": 347632, 
                            "2014 Feb 03 09:05:50.755": 347632, 
                            "2014 Feb 03 09:06:50.755": 347632, 
                            "2014 Feb 03 09:07:50.756": 347632
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "8", 
                            "sum": "2781056"
                        }
                    }
                ]
            }
        }
    }
];

var analyticsSummWGenData_OP =
[
    {
        "name": "nodeg3", 
        "value": {
            "Analytics:Collector:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8089, 
                        "pid": 3473, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403631046101, 
                        "status": "Established", 
                        "successful_connections": 2, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 11763, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 46770413, 
                            "calls": 3976
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403636053329, 
                                "connects": 2, 
                                "in_clear": false, 
                                "reset_time": 1391403631050238, 
                                "resets": 1
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }, 
            "Analytics:OpServer:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8090, 
                        "pid": 3477, 
                        "primary": "127.0.0.1:8086", 
                        "secondary": null, 
                        "start_time": 1391403635298278, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403635300888, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }, 
            "Analytics:QueryEngine:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg3", 
                        "http_port": 8091, 
                        "pid": 3475, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403640530959, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 3863, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 4350669, 
                            "calls": 1126
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403640615454, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg3"
                        }
                    ]
                }
            }, 
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ApiServer", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Config-Nodemgr", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DnsAgent", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 5552, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 71495787, 
                    "calls": 12877
                }, 
                "self_ip_list": [
                    "10.204.217.43"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 12724, 
                    "calls": 12
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416297686010}": 0.0791799, 
                            "{\"ts\":1391416357689386}": 0.0708333, 
                            "{\"ts\":1391416417692112}": 0.0750125, 
                            "{\"ts\":1391416477694969}": 0.0750125, 
                            "{\"ts\":1391416537697490}": 0.075, 
                            "{\"ts\":1391416597700395}": 0.0708451, 
                            "{\"ts\":1391416657703145}": 0.0791667, 
                            "{\"ts\":1391416717705843}": 0.0875146, 
                            "{\"ts\":1391416777708379}": 0.0750125, 
                            "{\"ts\":1391416837710907}": 0.0666667
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:16:37.645": 0.0791799, 
                            "2014 Feb 03 08:22:37.661": 0.0791799, 
                            "2014 Feb 03 08:30:37.683": 0.0833472, 
                            "2014 Feb 03 08:31:37.686": 0.0791799, 
                            "2014 Feb 03 08:38:37.705": 0.0875146
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "41", 
                            "sum": "3.0628264"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416297686010}": 352180, 
                            "{\"ts\":1391416357689386}": 352180, 
                            "{\"ts\":1391416417692112}": 352180, 
                            "{\"ts\":1391416477694969}": 352180, 
                            "{\"ts\":1391416537697490}": 352180, 
                            "{\"ts\":1391416597700395}": 352180, 
                            "{\"ts\":1391416657703145}": 352180, 
                            "{\"ts\":1391416717705843}": 352180, 
                            "{\"ts\":1391416777708379}": 352180, 
                            "{\"ts\":1391416837710907}": 352180
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:37.700": 352180, 
                            "2014 Feb 03 08:37:37.703": 352180, 
                            "2014 Feb 03 08:38:37.705": 352180, 
                            "2014 Feb 03 08:39:37.708": 352180, 
                            "2014 Feb 03 08:40:37.710": 352180
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "41", 
                            "sum": "14439380"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 240924, 
                                "res": 23588, 
                                "virt": 240924
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 13044, 
                                "virt": 347440
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0666667, 
                            "meminfo": {
                                "peakvirt": 417432, 
                                "res": 27216, 
                                "virt": 352180
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416312536370}": 0, 
                            "{\"ts\":1391416372639337}": 0, 
                            "{\"ts\":1391416432741694}": 0, 
                            "{\"ts\":1391416492844228}": 0, 
                            "{\"ts\":1391416552946859}": 0, 
                            "{\"ts\":1391416613049351}": 0, 
                            "{\"ts\":1391416673152811}": 2.5, 
                            "{\"ts\":1391416733255948}": 2.5, 
                            "{\"ts\":1391416793358964}": 0, 
                            "{\"ts\":1391416853462232}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:53.49": 0, 
                            "2014 Feb 03 08:37:53.152": 2.5, 
                            "2014 Feb 03 08:38:53.255": 2.5, 
                            "2014 Feb 03 08:39:53.358": 0, 
                            "2014 Feb 03 08:40:53.462": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "39", 
                            "bmax": "2", 
                            "sum": "5"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416312536370}": 240924, 
                            "{\"ts\":1391416372639337}": 240924, 
                            "{\"ts\":1391416432741694}": 240924, 
                            "{\"ts\":1391416492844228}": 240924, 
                            "{\"ts\":1391416552946859}": 240924, 
                            "{\"ts\":1391416613049351}": 240924, 
                            "{\"ts\":1391416673152811}": 240924, 
                            "{\"ts\":1391416733255948}": 240924, 
                            "{\"ts\":1391416793358964}": 240924, 
                            "{\"ts\":1391416853462232}": 240924
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:53.49": 240924, 
                            "2014 Feb 03 08:37:53.152": 240924, 
                            "2014 Feb 03 08:38:53.255": 240924, 
                            "2014 Feb 03 08:39:53.358": 240924, 
                            "2014 Feb 03 08:40:53.462": 240924
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "41", 
                            "sum": "9872684"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403650567604", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656580041", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654576076", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403646558870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652572100", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658584898", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403648562764", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416305674080}": 0.00416736, 
                            "{\"ts\":1391416365674374}": 0.00833472, 
                            "{\"ts\":1391416425674696}": 0.00416736, 
                            "{\"ts\":1391416485674992}": 0, 
                            "{\"ts\":1391416545675287}": 0.00416736, 
                            "{\"ts\":1391416605675577}": 0.00416667, 
                            "{\"ts\":1391416665675783}": 0, 
                            "{\"ts\":1391416725676096}": 0.00416736, 
                            "{\"ts\":1391416785676388}": 0.00416736, 
                            "{\"ts\":1391416845676676}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:04:45.666": 0.00833472, 
                            "2014 Feb 03 08:25:45.672": 0.00833472, 
                            "2014 Feb 03 08:32:45.674": 0.00833472, 
                            "2014 Feb 03 08:38:45.676": 0.00416736, 
                            "2014 Feb 03 08:39:45.676": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "41", 
                            "sum": "0.14168748"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416305674080}": 347440, 
                            "{\"ts\":1391416365674374}": 347440, 
                            "{\"ts\":1391416425674696}": 347440, 
                            "{\"ts\":1391416485674992}": 347440, 
                            "{\"ts\":1391416545675287}": 347440, 
                            "{\"ts\":1391416605675577}": 347440, 
                            "{\"ts\":1391416665675783}": 347440, 
                            "{\"ts\":1391416725676096}": 347440, 
                            "{\"ts\":1391416785676388}": 347440, 
                            "{\"ts\":1391416845676676}": 347440
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:45.675": 347440, 
                            "2014 Feb 03 08:37:45.675": 347440, 
                            "2014 Feb 03 08:38:45.676": 347440, 
                            "2014 Feb 03 08:39:45.676": 347440, 
                            "2014 Feb 03 08:40:45.676": 347440
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "41", 
                            "sum": "14245040"
                        }
                    }
                ]
            }
        }
    }, 
    {
        "name": "nodeg2", 
        "value": {
            "Analytics:Collector:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8089, 
                        "pid": 3716, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403636164570, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 10945, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 41112703, 
                            "calls": 3756
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403636216961, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }, 
            "Analytics:OpServer:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8090, 
                        "pid": 3718, 
                        "primary": "127.0.0.1:8086", 
                        "secondary": null, 
                        "start_time": 1391403642108552, 
                        "status": "Established", 
                        "successful_connections": 1
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403642111177, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }, 
            "Analytics:QueryEngine:0": {
                "ModuleClientState": {
                    "client_info": {
                        "collector_name": "nodeg2", 
                        "http_port": 8091, 
                        "pid": 3717, 
                        "primary": "127.0.0.1:8086", 
                        "rx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 1060, 
                            "blocked_count": 0, 
                            "blocked_duration": null, 
                            "bytes": 1060, 
                            "calls": 1
                        }, 
                        "secondary": "0.0.0.0:0", 
                        "start_time": 1391403645657135, 
                        "status": "Established", 
                        "successful_connections": 1, 
                        "tx_socket_stats": {
                            "average_blocked_duration": null, 
                            "average_bytes": 3851, 
                            "blocked_count": 0, 
                            "blocked_duration": "00:00:00", 
                            "bytes": 4918109, 
                            "calls": 1277
                        }
                    }
                }, 
                "ModuleServerState": {
                    "generator_info": [
                        {
                            "gen_attr": {
                                "connect_time": 1391403645681187, 
                                "connects": 1, 
                                "in_clear": false, 
                                "reset_time": 0, 
                                "resets": 0
                            }, 
                            "hostname": "nodeg2"
                        }
                    ]
                }
            }, 
            "CollectorState": {
                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-02 09:31:30.296039\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1104.el6\",\"build-number\":\"1104\"}]}", 
                "generator_infos": [
                    {
                        "instance_id": "0", 
                        "module_id": "Collector", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Contrail-Analytics-Nodemgr", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "DiscoveryService", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "OpServer", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "QueryEngine", 
                        "node_type": "Analytics", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "Schema", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ServiceMonitor", 
                        "node_type": "Config", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg2", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "ControlNode", 
                        "node_type": "Control", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg3", 
                        "state": "Established"
                    }, 
                    {
                        "instance_id": "0", 
                        "module_id": "VRouterAgent", 
                        "node_type": "Compute", 
                        "source": "nodeg4", 
                        "state": "Established"
                    }
                ], 
                "rx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 4794, 
                    "blocked_count": 0, 
                    "blocked_duration": null, 
                    "bytes": 73834401, 
                    "calls": 15399
                }, 
                "self_ip_list": [
                    "10.204.217.42"
                ], 
                "tx_socket_stats": {
                    "average_blocked_duration": null, 
                    "average_bytes": 1060, 
                    "blocked_count": 0, 
                    "blocked_duration": "00:00:00", 
                    "bytes": 11663, 
                    "calls": 11
                }
            }, 
            "ModuleCpuState": {
                "collector_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416303366696}": 0.0875146, 
                            "{\"ts\":1391416363368941}": 0.0958493, 
                            "{\"ts\":1391416423371611}": 0.0875, 
                            "{\"ts\":1391416483374533}": 0.0875146, 
                            "{\"ts\":1391416543376781}": 0.0958493, 
                            "{\"ts\":1391416603378982}": 0.0958333, 
                            "{\"ts\":1391416663380497}": 0.0916819, 
                            "{\"ts\":1391416723382957}": 0.0833472, 
                            "{\"ts\":1391416783385283}": 0.1, 
                            "{\"ts\":1391416843387456}": 0.0875146
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:15:43.326": 0.104167, 
                            "2014 Feb 03 08:25:43.352": 0.0958493, 
                            "2014 Feb 03 08:32:43.368": 0.0958493, 
                            "2014 Feb 03 08:35:43.376": 0.0958493, 
                            "2014 Feb 03 08:39:43.385": 0.1
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "40", 
                            "b0.2": "1", 
                            "sum": "3.733741"
                        }
                    }
                ], 
                "collector_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416303366696}": 352176, 
                            "{\"ts\":1391416363368941}": 352176, 
                            "{\"ts\":1391416423371611}": 352176, 
                            "{\"ts\":1391416483374533}": 352176, 
                            "{\"ts\":1391416543376781}": 352176, 
                            "{\"ts\":1391416603378982}": 352176, 
                            "{\"ts\":1391416663380497}": 352176, 
                            "{\"ts\":1391416723382957}": 352176, 
                            "{\"ts\":1391416783385283}": 352176, 
                            "{\"ts\":1391416843387456}": 352176
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:43.378": 352176, 
                            "2014 Feb 03 08:37:43.380": 352176, 
                            "2014 Feb 03 08:38:43.382": 352176, 
                            "2014 Feb 03 08:39:43.385": 352176, 
                            "2014 Feb 03 08:40:43.387": 352176
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "41", 
                            "sum": "14439216"
                        }
                    }
                ], 
                "module_cpu_info": [
                    {
                        "cpu_info": {
                            "cpu_share": 0, 
                            "meminfo": {
                                "peakvirt": 241248, 
                                "res": 24428, 
                                "virt": 241248
                            }
                        }, 
                        "instance_id": "0", 
                        "module_id": "OpServer"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.0875146, 
                            "meminfo": {
                                "peakvirt": 417420, 
                                "res": 24956, 
                                "virt": 352176
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "Collector"
                    }, 
                    {
                        "cpu_info": {
                            "cpu_share": 0.00416736, 
                            "meminfo": {
                                "peakvirt": 412612, 
                                "res": 47052, 
                                "virt": 347632
                            }, 
                            "num_cpu": 4
                        }, 
                        "instance_id": "0", 
                        "module_id": "QueryEngine"
                    }
                ], 
                "opserver_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416318941005}": 0, 
                            "{\"ts\":1391416379043031}": 0, 
                            "{\"ts\":1391416439145590}": 0, 
                            "{\"ts\":1391416499247054}": 0, 
                            "{\"ts\":1391416559348934}": 0, 
                            "{\"ts\":1391416619451230}": 0, 
                            "{\"ts\":1391416679553057}": 0, 
                            "{\"ts\":1391416739655431}": 0, 
                            "{\"ts\":1391416799757815}": 0, 
                            "{\"ts\":1391416859860604}": 0
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:59.451": 0, 
                            "2014 Feb 03 08:37:59.553": 0, 
                            "2014 Feb 03 08:38:59.655": 0, 
                            "2014 Feb 03 08:39:59.757": 0, 
                            "2014 Feb 03 08:40:59.860": 0
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "41", 
                            "sum": "0"
                        }
                    }
                ], 
                "opserver_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416318941005}": 240964, 
                            "{\"ts\":1391416379043031}": 240964, 
                            "{\"ts\":1391416439145590}": 240964, 
                            "{\"ts\":1391416499247054}": 240964, 
                            "{\"ts\":1391416559348934}": 240964, 
                            "{\"ts\":1391416619451230}": 240964, 
                            "{\"ts\":1391416679553057}": 240964, 
                            "{\"ts\":1391416739655431}": 240964, 
                            "{\"ts\":1391416799757815}": 240964, 
                            "{\"ts\":1391416859860604}": 241248
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:59.451": 240964, 
                            "2014 Feb 03 08:37:59.553": 240964, 
                            "2014 Feb 03 08:38:59.655": 240964, 
                            "2014 Feb 03 08:39:59.757": 240964, 
                            "2014 Feb 03 08:40:59.860": 241248
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b300000": "41", 
                            "sum": "9879808"
                        }
                    }
                ], 
                "process_state_list": [
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403656967110", 
                        "last_stop_time": null, 
                        "process_name": "redis-query", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403662980923", 
                        "last_stop_time": null, 
                        "process_name": "contrail-query-engine", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403660976870", 
                        "last_stop_time": null, 
                        "process_name": "contrail-collector", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403652958413", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-nodemgr", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403658972007", 
                        "last_stop_time": null, 
                        "process_name": "redis-uve", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403664984650", 
                        "last_stop_time": null, 
                        "process_name": "contrail-analytics-api", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }, 
                    {
                        "core_file_list": [], 
                        "exit_count": 0, 
                        "last_exit_time": null, 
                        "last_start_time": "1391403654963138", 
                        "last_stop_time": null, 
                        "process_name": "redis-sentinel", 
                        "process_state": "PROCESS_STATE_RUNNING", 
                        "start_count": 1, 
                        "stop_count": 0
                    }
                ], 
                "queryengine_cpu_share": [
                    {
                        "history-10": {
                            "{\"ts\":1391416310745474}": 0.00416736, 
                            "{\"ts\":1391416370745766}": 0.00416736, 
                            "{\"ts\":1391416430746062}": 0.00416736, 
                            "{\"ts\":1391416490746346}": 0, 
                            "{\"ts\":1391416550746643}": 0.00416736, 
                            "{\"ts\":1391416610746942}": 0.00416736, 
                            "{\"ts\":1391416670747241}": 0, 
                            "{\"ts\":1391416730747545}": 0.00416736, 
                            "{\"ts\":1391416790747822}": 0.00416736, 
                            "{\"ts\":1391416850748065}": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:07:50.738": 0.00833472, 
                            "2014 Feb 03 08:22:50.742": 0.00833472, 
                            "2014 Feb 03 08:38:50.747": 0.00416736, 
                            "2014 Feb 03 08:39:50.747": 0.00416736, 
                            "2014 Feb 03 08:40:50.748": 0.00416736
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b0.1": "41", 
                            "sum": "0.13335345"
                        }
                    }
                ], 
                "queryengine_mem_virt": [
                    {
                        "history-10": {
                            "{\"ts\":1391416310745474}": 347632, 
                            "{\"ts\":1391416370745766}": 347632, 
                            "{\"ts\":1391416430746062}": 347632, 
                            "{\"ts\":1391416490746346}": 347632, 
                            "{\"ts\":1391416550746643}": 347632, 
                            "{\"ts\":1391416610746942}": 347632, 
                            "{\"ts\":1391416670747241}": 347632, 
                            "{\"ts\":1391416730747545}": 347632, 
                            "{\"ts\":1391416790747822}": 347632, 
                            "{\"ts\":1391416850748065}": 347632
                        }
                    }, 
                    {
                        "s-3600-topvals": {
                            "2014 Feb 03 08:36:50.746": 347632, 
                            "2014 Feb 03 08:37:50.747": 347632, 
                            "2014 Feb 03 08:38:50.747": 347632, 
                            "2014 Feb 03 08:39:50.747": 347632, 
                            "2014 Feb 03 08:40:50.748": 347632
                        }
                    }, 
                    {
                        "s-3600-summary": {
                            "b400000": "41", 
                            "sum": "14252912"
                        }
                    }
                ]
            }
        }
    }
];

exports.configSummWGenData = configSummWGenData;
exports.configSummWOGenData = configSummWOGenData;
exports.configSummWGenData_OP = configSummWGenData_OP;
exports.configSummWOGenData_OP = configSummWOGenData_OP;
exports.configDetailsData = configDetailsData;
exports.configDetailsData_OP = configDetailsData_OP;
exports.analyticsSummWOGenData = analyticsSummWOGenData;
exports.analyticsSummWGenData = analyticsSummWGenData;
exports.analyticsSummWOGenData_OP = analyticsSummWOGenData_OP;
exports.analyticsGenData = analyticsGenData;
exports.analyticsSummWGenData_OP = analyticsSummWGenData_OP;

