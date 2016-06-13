/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    const clusterSchema = {
      "type": "object",
      "properties": {
        "parameters": {
          "type": "object",
          "properties": {
            "storage_virsh_uuid": {
              "type": "string",
              "format": "uuid",
              "default": ""
            },
            "provision": {
              "type": "object",
              "properties": {
                "contrail": {
                  "type": "object",
                  "properties": {
                    "control": {
                      "type": "object",
                      "properties": {
                        "encapsulation_priority": {
                          "type": "string",
                          "default": "VXLAN,MPLSoUDP,MPLSoGRE"
                        },
                        "router_asn": {
                          "type": "integer",
                          "default": 64512
                        },
                        "external_bgp": {
                          "type": "string",
                          "default": ""
                        }
                      },
                      "required": [
                        "encapsulation_priority",
                        "router_asn",
                        "external_bgp"
                      ]
                    },
                    "kernel_upgrade": {
                      "type": "boolean",
                      "default": false
                    },
                    "xmpp_auth_enable": {
                      "type": "boolean",
                      "default": false
                    },
                    "webui": {
                      "type": "object",
                      "properties": {},
                      "default": {}
                    },
                    "analytics": {
                      "type": "object",
                      "properties": {
                        "flow_ttl": {
                          "type": "integer",
                          "default": 2
                        },
                        "snmp_fast_scan_frequency": {
                          "type": "integer",
                          "default": 60
                        },
                        "topology_scan_frequency": {
                          "type": "integer",
                          "default": 60
                        },
                        "snmp_scan_frequency": {
                          "type": "integer",
                          "default": 600
                        },
                        "statistics_ttl": {
                          "type": "integer",
                          "default": 168
                        },
                        "syslog_port": {
                          "type": "integer",
                          "default": -1
                        },
                        "ssd_data_directory": {
                          "type": "string",
                          "default": ""
                        },
                        "data_ttl": {
                          "type": "integer",
                          "default": 48
                        },
                        "config_audit_ttl": {
                          "type": "integer",
                          "default": 2160
                        },
                        "data_directory": {
                          "type": "string",
                          "default": ""
                        },
                        "redis_password": {
                          "type": "string",
                          "default": ""
                        }
                      },
                      "required": [
                        "flow_ttl",
                        "snmp_fast_scan_frequency",
                        "topology_scan_frequency",
                        "snmp_scan_frequency",
                        "statistics_ttl",
                        "syslog_port",
                        "ssd_data_directory",
                        "data_ttl",
                        "config_audit_ttl",
                        "data_directory"
                      ]
                    },
                    "ha": {
                      "type": "object",
                      "properties": {
                        "haproxy_enable": {
                          "type": "boolean",
                          "default": true
                        },
                        "contrail_internal_virtual_router_id": {
                          "type": "integer",
                          "default": 103
                        },
                        "contrail_internal_vip": {
                          "type": "string",
                          "default": ""
                        },
                        "contrail_external_vip": {
                          "type": "string",
                          "default": ""
                        },
                        "contrail_external_virtual_router_id": {
                          "type": "integer",
                          "default": 104
                        }
                      },
                      "required": [
                        "haproxy_enable",
                        "contrail_internal_virtual_router_id",
                        "contrail_internal_vip",
                        "contrail_external_vip",
                        "contrail_external_virtual_router_id"
                      ]
                    },
                    "vmware": {
                      "type": "object",
                      "properties": {
                        "username": {
                          "type": "string",
                          "default": ""
                        },
                        "ip": {
                          "type": "string",
                          "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
                          "default": ""
                        },
                        "password": {
                          "type": "string",
                          "default": ""
                        },
                        "vswitch": {
                          "type": "string",
                          "default": ""
                        }
                      },
                      "required": [
                        "username",
                        "ip",
                        "password",
                        "vswitch"
                      ]
                    },
                    "compute": {
                      "type": "object",
                      "properties": {
                        "core_mask": {
                          "type": "string",
                          "default": ""
                        },
                        "huge_pages": {
                          "type": "string",
                          "default": ""
                        },
                        "sriov": {
                          "type": "object",
                          "properties": {
                            "enable": {
                              "type": "boolean",
                              "default": false
                            }
                          },
                          "required": [
                            "enable"
                          ]
                        }
                      },
                      "required": [
                        "core_mask",
                        "huge_pages",
                        "sriov"
                      ]
                    },
                    "enable_lbass": {
                      "type": "boolean",
                      "default": false
                    },
                    "xmpp_dns_auth_enable": {
                      "type": "boolean",
                      "default": false
                    },
                    "database": {
                      "type": "object",
                      "properties": {
                        "ip_port": {
                          "type": "integer",
                          "default": 9160
                        },
                        "directory": {
                          "type": "string",
                          "default": "/var/lib/cassandra"
                        },
                        "minimum_diskGB": {
                          "type": "integer",
                          "default": 32
                        }
                      },
                      "required": [
                        "ip_port",
                        "directory",
                        "minimum_diskGB"
                      ]
                    },
                    "storage": {
                      "type": "object",
                      "properties": {
                        "storage_admin_key": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_cluster_network": {
                          "type": "string",
                          "default": ""
                        },
                        "osd_bootstrap_key": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_enabled": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_num_hosts": {
                          "type": "string",
                          "default": ""
                        },
                        "live_migration_host": {
                          "type": "string",
                          "default": ""
                        },
                        "live_migration_storage_scope": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_fsid": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_virsh_uuid": {
                          "type": "string",
                          "default": ""
                        },
                        "live_migration_ip": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_monitor_secret": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_num_osd": {
                          "type": "string",
                          "default": ""
                        },
                        "storage_chassis_config": {
                          "type": "array",
                          "default": []
                        }
                      }
                    },
                    "toragent": {
                      "type": "string",
                      "default": ""
                    },
                    "tsn": {
                      "type": "string",
                      "default": ""
                    },
                    "kernel_version": {
                      "type": "string",
                      "default": ""
                    },
                    "vgw": {
                      "type": "object",
                      "properties": {
                        "interface": {
                          "type": "string",
                          "default": ""
                        },
                        "public_subnet": {
                          "type": "string",
                          "default": ""
                        },
                        "gateway_routes": {
                          "type": "string",
                          "default": ""
                        },
                        "public_vn_name": {
                          "type": "string",
                          "default": ""
                        }
                      }
                    },
                    "config": {
                      "type": "object",
                      "properties": {
                        "zookeeper_ip_port": {
                          "type": "integer",
                          "default": 2181
                        },
                        "healthcheck_interval": {
                          "type": "integer",
                          "default": 5
                        },
                        "manage_neutron": {
                          "type": "boolean",
                          "default": true
                        }
                      },
                      "required": [
                        "zookeeper_ip_port",
                        "healthcheck_interval",
                        "manage_neutron"
                      ]
                    }
                  },
                  "required": [
                    "control",
                    "kernel_upgrade",
                    "xmpp_auth_enable",
                    "analytics",
                    "ha",
                    "vmware",
                    "compute",
                    "enable_lbass",
                    "xmpp_dns_auth_enable",
                    "database",
                    "storage",
                    "kernel_version",
                    "vgw",
                    "config"
                  ]
                },
                "openstack": {
                  "type": "object",
                  "properties": {
                    "multi_tenancy": {
                      "type": "boolean",
                      "default": true
                    },
                    "keystone": {
                      "type": "object",
                      "properties": {
                        "ip": {
                          "type": "string",
                          "default": ""
                        },
                        "service_tenant": {
                          "type": "string",
                          "default": "services"
                        },
                        "admin_user": {
                          "type": "string",
                          "default": "admin"
                        },
                        "admin_tenant": {
                          "type": "string",
                          "default": "admin"
                        },
                        "admin_password": {
                          "type": "string",
                          "default": "contrail123"
                        },
                        "auth_port": {
                          "type": "integer",
                          "default": 35357
                        },
                        "auth_protocol": {
                          "type": "string",
                          "default": "http"
                        }
                      },
                      "required": [
                        "ip",
                        "service_tenant",
                        "admin_user",
                        "admin_tenant",
                        "admin_password"
                      ]
                    },
                    "openstack_manage_amqp": {
                      "type": "boolean",
                      "default": false
                    },
                    "keystone_region_name": {
                      "type": "string",
                      "default": "RegionOne"
                    },
                    "enable_ceilometer": {
                      "type": "boolean",
                      "default": false
                    },
                    "ha": {
                      "type": "object",
                      "properties": {
                        "external_virtual_router_id": {
                          "type": "integer",
                          "default": 101
                        },
                        "internal_vip": {
                          "type": "string",
                          "default": ""
                        },
                        "internal_virtual_router_id": {
                          "type": "integer",
                          "default": 102
                        },
                        "nfs_glance_path": {
                          "type": "string",
                          "default": ""
                        },
                        "external_vip": {
                          "type": "string",
                          "default": ""
                        },
                        "nfs_server": {
                          "type": "string",
                          "default": ""
                        }
                      },
                      "required": [
                        "external_virtual_router_id",
                        "internal_vip",
                        "internal_virtual_router_id",
                        "nfs_glance_path",
                        "external_vip",
                        "nfs_server"
                      ]
                    },
                    "mysql": {
                      "type": "object",
                      "properties": {
                        "root_password": {
                          "type": "string",
                          "default": "c0ntrail123"
                        }
                      },
                      "required": [
                        "root_password"
                      ]
                    },
                    "neutron": {
                      "type": "object",
                      "properties": {
                        "service_protocol": {
                          "type": "string",
                          "default": "http"
                        },
                        "port": {
                          "type": "integer",
                          "default": 9697
                        }
                      },
                      "required": [
                        "service_protocol",
                        "port"
                      ]
                    },
                    "amqp": {
                      "type": "object",
                      "properties": {
                        "server_ip": {
                          "type": "string",
                          "default": ""
                        }
                      },
                      "required": [
                        "server_ip"
                      ]
                    }
                  },
                  "required": [
                    "multi_tenancy",
                    "keystone",
                    "openstack_manage_amqp",
                    "keystone_region_name",
                    "enable_ceilometer",
                    "ha",
                    "mysql",
                    "neutron",
                    "amqp"
                  ]
                }
              },
              "required": [
                "contrail",
                "openstack"
              ]
            },
            "storage_fsid": {
              "type": "string",
              "default": ""
            },
            "uuid": {
              "type": "string",
              "default": ""
            },
            "subnet_mask": {
              "type": "string",
              "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
              "default": "255.255.255.0"
            }
          },
          "required": [
            "storage_virsh_uuid",
            "storage_fsid",
            "uuid",
            "subnet_mask"
          ]
        },
        "provision_role_sequence": {
          "type": "string",
          "default": "{'completed': [('a7s12', 'haproxy', '2016_05_18__15_56_14'), ('a7s12', 'database', '2016_05_18__15_57_44'), ('a7s12', 'openstack', '2016_05_18__16_12_02'), ('a7s12', 'config', '2016_05_19__14_50_18'), ('a7s12', 'control', '2016_05_19__14_51_31'), ('a7s12', 'collector', '2016_05_19__14_52_31'), ('a7s12', 'webui', '2016_05_19__14_53_14'), ('a7s12', 'compute', '2016_05_19__14_59_44'), ('a7s12', 'post_provision', '2016_05_19__14_59_45')], 'steps': []}"
        },
        "email": {
          "type": "string",
          "default": ""
        },
        "id": {
          "type": "string",
          "default": "test-sm-params-cluster"
        },
        "ui_added_parameters": {
          "type": "object",
          "properties": {
            "servers_status": {
              "type": "object",
              "properties": {
                "provision_completed": {
                  "type": "integer",
                  "default": 1
                },
                "total_servers": {
                  "type": "integer",
                  "default": 1
                },
                "new_servers": {
                  "type": "integer",
                  "default": 0
                },
                "configured_servers": {
                  "type": "integer",
                  "default": 0
                },
                "provisioned_servers": {
                  "type": "integer",
                  "default": 1
                },
                "inreimage_servers": {
                  "type": "integer",
                  "default": 0
                },
                "reimaged_servers": {
                  "type": "integer",
                  "default": 0
                },
                "inprovision_servers": {
                  "type": "integer",
                  "default": 0
                }
              },
              "required": [
                "total_servers",
                "new_servers",
                "configured_servers",
                "provisioned_servers",
                "inreimage_servers",
                "reimaged_servers",
                "inprovision_servers"
              ]
            }
          },
          "required": [
            "servers_status"
          ]
        },
        "cgrid": {
          "type": "string",
          "default": "id_8"
        },
        "total_disk_rw_bytes": {
          "type": "integer",
          "default": 0
        },
        "interface_rt_bytes": {
          "type": "integer",
          "default": 1716525
        },
        "max_cpu_usage_percentage": {
          "type": "number",
          "default": 32.76
        },
        "max_mem_usage_percentage": {
          "type": "number",
          "default": 74.89
        }
      },
      "required": [
        "parameters",
        "provision_role_sequence",
        "email",
        "id",
        "ui_added_parameters",
        "cgrid",
        "total_disk_rw_bytes",
        "interface_rt_bytes",
        "max_cpu_usage_percentage",
        "max_mem_usage_percentage"
      ]
    };
    return clusterSchema;
});