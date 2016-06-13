/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    const serverSchema = {
      "type": "object",
      "properties": {
        "domain": {
          "type": "string",
          "default": ""
        },
        "ipmi_type": {
          "type": "string",
          "default": ""
        },
        "ipmi_username": {
          "type": "string",
          "default": "ADMIN"
        },
        "discovered": {
          "type": "string",
          "default": ""
        },
        "tag": {
          "type": "object",
          "properties": {
            "datacenter": {
              "type": "string",
              "default": ""
            }
          }
        },
        "cluster_id": {
          "type": "string",
          "default": ""
        },
        "id": {
          "type": "string",
          "default": ""
        },
        "gateway": {
          "type": "string",
          "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
          "default": ""
        },
        "network": {
          "type": "object",
          "properties": {
            "management_interface": {
              "type": "string",
              "default": ""
            },
            "interfaces": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "default": ""
                  },
                  "member_interfaces": {
                    "type": "array",
                    "items": {}
                  },
                  "name": {
                    "type": "string",
                    "default": ""
                  },
                  "parent": {
                    "type": "string",
                    "default": ""
                  },
                  "default_gateway": {
                    "type": "string",
                    "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
                    "default": ""
                  },
                  "tor": {
                    "type": "string",
                    "default": ""
                  },
                  "dhcp": {
                    "type": "boolean",
                    "default": ""
                  },
                  "mac_address": {
                    "type": "string",
                    "default": ""
                  },
                  "ip_address": {
                    "type": "string",
                    "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
                    "default": ""
                  },
                  "tor_port": {
                    "type": "string",
                    "default": ""
                  }
                }
              }
            }
          },
          "required": [
            "management_interface"
          ]
        },
        "parameters": {
          "type": "object",
          "properties": {
            "disks": {
              "type": "array",
              "items": {}
            },
            "kernel_upgrade": {
              "type": "string",
              "default": ""
            },
            "storage_repo_id": {
              "type": "string",
              "default": ""
            },
            "kernel_version": {
              "type": "string",
              "default": ""
            },
            "storage_chassis_id": {
              "type": "string",
              "default": ""
            },
            "storage_chassis_id_input": {
              "type": "string",
              "default": ""
            },
            "interface_name": {
              "type": "string",
              "default": ""
            },
            "partition": {
              "type": "string",
              "default": ""
            }
          }
        },
        "last_update": {
          "type": "string",
          "default": ""
        },
        "ssh_public_key": {
          "type": "string",
          "default": ""
        },
        "mac_address": {
          "type": "string",
          "default": ""
        },
        "provisioned_id": {
          "type": "string",
          "default": ""
        },
        "email": {
          "type": "string",
          "default": ""
        },
        "status": {
          "type": "string",
          "default": ""
        },
        "reimaged_id": {
          "type": "string",
          "default": ""
        },
        "top_of_rack": {
          "type": "object",
          "properties": {
            "switches": {
              "type": "array",
              "items": {}
            }
          }
        },
        "package_image_id": {
          "type": "string",
          "default": ""
        },
        "static_ip": {
          "type": "string",
          "default": ""
        },
        "subnet_mask": {
          "type": "string",
          "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
          "default": ""
        },
        "base_image_id": {
          "type": "string",
          "default": ""
        },
        "ipmi_password": {
          "type": "string",
          "default": "ADMIN"
        },

        "password": {
          "type": "string",
          "default": ""
        },
        "ip_address": {
          "type": "string",
          "pattern": "^$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/[0-9][0-9])?$",
          "default": ""
        },
        "roles": {
          "type": "array",
          "items": {
            "type": "string",
            "default": "compute"
          }
        },
        "contrail": {
          "type": "object",
          "properties": {
            "control_data_interface": {
              "type": "string",
              "default": ""
            }
          }
        },
        "ipmi_address": {
          "type": "string",
          "default": ""
        },
        "host_name": {
          "type": "string",
          "default": ""
        },
        "roleCount": {
          "type": "integer",
          "default": 0
        },
        "name": {
          "type": "string",
          "default": ""
        },
        "cgrid": {
          "type": "string",
          "default": ""
        },
        "x": {
          "type": "number",
          "default": 0
        },
        "y": {
          "type": "number",
          "default": 0
        },
        "size": {
          "type": "integer",
          "default": 0
        },
        "cpu_usage_percentage": {
          "type": "number",
          "default": 0
        },
        "mem_usage_mb": {
          "type": "integer",
          "default": 0
        },
        "mem_usage_percentage": {
          "type": "number",
          "default": 0
        },
        "total_disk_read_bytes": {
          "type": "integer",
          "default": 0
        },
        "total_disk_write_bytes": {
          "type": "integer",
          "default": 0
        },
        "total_disk_rw_bytes": {
          "type": "integer",
          "default": 0
        },
        "interface_rx_bytes": {
          "type": "integer",
          "default": 0
        },
        "interface_rx_packets": {
          "type": "integer",
          "default": 0
        },
        "interface_tx_bytes": {
          "type": "integer",
          "default": 0
        },
        "interface_tx_packets": {
          "type": "integer",
          "default": 0
        },
        "interface_rt_bytes": {
          "type": "integer",
          "default": 0
        },
        "rawMonitoringData": {
          "type": "object",
          "properties": {
            "ServerMonitoringInfo": {
              "type": "object",
              "properties": {
                "deleted": {
                  "type": "boolean",
                  "default": false
                },
                "resource_info_stats": {
                  "type": "object",
                  "properties": {
                    "mem_usage_percent": {
                      "type": "number",
                      "default": 0
                    },
                    "cpu_usage_percentage": {
                      "type": "number",
                      "default": 0
                    },
                    "mem_usage_mb": {
                      "type": "integer",
                      "default": 0
                    }
                  }
                },
                "network_info_stats": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "tx_bytes": {
                        "type": "integer",
                        "default": 0
                      },
                      "rx_packets": {
                        "type": "integer",
                        "default": 0
                      },
                      "interface_name": {
                        "type": "string",
                        "default": "p4p1"
                      },
                      "tx_packets": {
                        "type": "integer",
                        "default": 0
                      },
                      "rx_bytes": {
                        "type": "integer",
                        "default": 0
                      }
                    }
                  }
                },
                "name": {
                  "type": "string",
                  "default": ""
                }
              }
            },
            "cluster_id": {
              "type": "string",
              "default": ""
            },
            "name": {
              "type": "string",
              "default": ""
            },
            "cgrid": {
              "type": "string",
              "default": ""
            }
          }
        }
      },
      "required": [
        "base_image_id",
        "package_image_id",
        "id",
        "ipmi_address",
        "password"
      ]
    };
    return serverSchema;
});