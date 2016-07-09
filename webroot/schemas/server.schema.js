/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    const serverSchema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
            "base_image_id": {
                "type": "string"
            },
            "cluster_id": {
                "type": "string"
            },
            "domain": {
                "type": "string"
            },
            "email": {
                "type": "string"
            },
            "id": {
                "type": "string"
            },
            "ipmi_address": {
                "type": "string"
            },
            "ipmi_username": {
                "type": "string"
            },
            "ipmi_password": {
                "type": "string"
            },
            "ipmi_interface": {
                "type": "string"
            },
            "password": {
                "type": "string"
            },
            "package_image_id": {
                "type": "string"
            },
            "roles": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "parameters": {
                "type": "object",
                "properties": {
                    "provision": {
                        "type": "object",
                        "properties": {
                            "contrail": {
                                "type": "object",
                                "properties": {
                                    "storage": {
                                        "type": "object",
                                        "properties": {
                                            "storage_repo_id": {
                                                "type": "string"
                                            },
                                            "storage_osd_disks": {
                                                "type": "array",
                                                "items": {}
                                            },
                                            "storage_chassis_id": {
                                                "type": "string"
                                            },
                                            "storage_chassis_id_input": {
                                                "type": "string"
                                            },
                                            "partition": {
                                                "type": "string"
                                            }
                                        }/*,
                                        "required": [
                                            "storage_repo_id",
                                            "storage_osd_disks",
                                            "storage_chassis_id",
                                            "storage_chassis_id_input",
                                            "partition"
                                        ]*/
                                    }
                                }/*,
                                "required": [
                                    "storage"
                                ]*/
                            }
                        }/*,
                        "required": [
                            "contrail"
                        ]*/
                    }
                }/*,
                "required": [
                    "provision"
                ]*/
            },
            "tag": {
                "type": "object",
                "properties": {}
            },
            "network": {
                "type": "object",
                "properties": {
                    "interfaces": {
                        "type": "array",
                        "items": {}
                    },
                    "management_interface": {
                        "type": "string"
                    },
                    "provisioning": {
                        "type": "string"
                    }
                }/*,
                "required": [
                    "interfaces",
                    "management_interface",
                    "provisioning"
                ]*/
            },
            "top_of_rack": {
                "type": "object",
                "properties": {
                    "switches": {
                        "type": "array",
                        "items": {}
                    }
                }/*,
                "required": [
                    "switches"
                ]*/
            }
        }/*,
        "required": [
            "base_image_id",
            "cluster_id",
            "domain",
            "email",
            "id",
            "ipmi_address",
            "ipmi_username",
            "ipmi_password",
            "ipmi_interface",
            "password",
            "package_image_id",
            "roles",
            "parameters",
            "tag",
            "network",
            "top_of_rack"
        ]*/
    };
    return serverSchema;
});