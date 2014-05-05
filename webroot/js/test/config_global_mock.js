function ConfigGlobalUtils() {
	var mockData = {
		"validRule" : {
			"input" : {"direction": "<>", "protocol": "any", "dst_addresses": [ { "security_group": null, "subnet": null, "virtual_network": "default-domain:admin:inet2" } ], "action_list": { "simple_action": "pass", "gateway_name": null, "apply_service": null, "mirror_to": null }, "dst_ports": [ { "end_port": -1, "start_port": -1 } ], "application": [], "src_addresses": [ { "security_group": null, "subnet": null, "virtual_network": "default-domain:admin:inet1" } ], "rule_sequence": { "major": 1, "minor": 0 }, "src_ports": [ { "end_port": -1, "start_port": -1 } ] },
			"output" : "pass protocol any network default-domain:admin:inet1 port any <> network default-domain:admin:inet2 port any"
		}
	};

	this.getPolicyRule = function() {
    	return mockData["validRule"]["input"];
    }
    
    this.getValidPolicyRuleString = function() {
    	return mockData["validRule"]["output"];
    }
}

var cg = new ConfigGlobalUtils();