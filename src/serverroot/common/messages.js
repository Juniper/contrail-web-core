/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */


var messages = {};

messages.error = {};
messages.warn = {};
messages.info = {};

// Warnings
messages.warn.invalid_mod_call = 'You can not call %s directly.';

// Errors
messages.error.unexpected = 'An unexpected error occurred!';
messages.error.create_bgpr = 'Error while creating BGP Router.';
messages.error.update_bgpr = 'Error while updating BGP Router.';
messages.error.delete_bgpr = 'Error while deleting BGP Router.';
messages.error.api_conn = 'Connection to %s failed.';
messages.error.broken_link = 'Encountered broken link: %s';
messages.error.invalid_json = 'Invalid JSON returned by url: %s';
messages.error.invalid_json_xml = 'url: %s returned Invalid JSON/XML: %s';
messages.error.invalid_user_pass = 'Invalid username or password.';
messages.error.unauthorized_to_project = 'User is not authorized to any project.';
messages.error.unauthenticate_to_project = 'User is not authenticated to available projects.';
messages.error.delete_mirror = 'Delete Mirror Failed.';
messages.error.add_mirror = 'Add Mirror Failed.';
messages.error.delete_analyzer = 'Delete Analyzer Failed.';
messages.error.add_analyzer = 'Add Analyzer Failed.';
messages.error.nodes = {};
messages.error.nodes.invalid_control_node_ip = 'HostName not found in DB for Control Node IP: %s';
messages.error.monitoring = {};
messages.error.monitoring.invalid_type_provided = 'Invalid type provided: %s';

messages.qe = {};
messages.qe.qe_execution = 'Calling QE to get the data for ';
module.exports = messages;
