/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module("config_global.js");

test("getSetCookie", function() {
    //Negative cases
    equal(getCookie(),false, "No arguments");
    equal(getCookie(u.getNull()),false, "Null check");
    equal(getCookie(u.getEmptyString()),false, "Empty String");
    var randomCookieName = u.getRandomString(6);
    equal(getCookie(randomCookieName),false, "Random cookie name");
    
    //Positive cases
    setCookie("project", randomCookieName);
    equal(getCookie("project"), randomCookieName, "Valid value for cookie 'project'");
});

test("isSet", function() {
    //Negative cases
    equal(isSet(),false, "No arguments");
    equal(isSet(u.getNull()),false, "Null check");
    equal(isSet(u.getEmptyString()),false, "Empty String");
    
    //Positive cases
    equal(isSet(u.getEmptyObject()),true, "Object");
    equal(isSet(u.getRandomString(6)),true, "String");
    equal(isSet(1), true, "Number");
    equal(isSet(u.getEmptyArray()),true, "Array");
});

test("doAjaxCall", function() {
    //Negative cases
    equal(doAjaxCall(),false, "No arguments");
    equal(doAjaxCall(u.getNull()),false, "Null check");
    equal(doAjaxCall(u.getEmptyString()),false, "Empty String");    
});

test("getFormatVNName", function() {
    //Negative cases
    equal(getFormatVNName(),u.getEmptyString(), "No arguments");
    equal(getFormatVNName(u.getNull()),u.getEmptyString(), "Null check");
    equal(getFormatVNName(u.getEmptyString()),u.getEmptyString(), "Empty String");
    var randomVName = u.getRandomString();
    equal(getFormatVNName(randomVName), randomVName, "If not 'automatic', returns same input string");
    
    //Positive cases
    equal(getFormatVNName("Automatic"), u.getEmptyString(), "If 'automatic', returns empty string");
});

test("removeRTString", function() {
    //Negative cases
    equal(removeRTString(),u.getNull(), "No arguments");
    equal(removeRTString(u.getNull()),u.getNull(), "Null check");
    equal(removeRTString(u.getEmptyString()),u.getEmptyString(), "Empty String");

    var randomRT = u.getRandomString(10);
    equal(removeRTString(randomRT),randomRT, "Given valid 'target:ASN:Value', returns 'ASN:Value'");
    
    //Positive cases
    equal(removeRTString("target:65412:123456"),"65412:123456", "String");
});

test("formatPolicyRule", function() {
    //Negative cases
    equal(formatPolicyRule(), u.getEmptyString(), "No arguments");
    equal(formatPolicyRule(u.getNull()), u.getEmptyString(), "Null check");
    equal(formatPolicyRule(u.getEmptyString()), u.getEmptyString(), "Empty String");
    equal(formatPolicyRule(u.getEmptyArray()), u.getEmptyString(), "Empty Array");
    equal(formatPolicyRule(u.getEmptyObject()), u.getEmptyString(), "Empty Object");
    
    //Positive cases
    equal(formatPolicyRule(cg.getPolicyRule()), cg.getValidPolicyRuleString(), "Valid Rule");
});

test("checkValidSourceNetwork", function() {
    //Negative cases
    equal(checkValidSourceNetwork(),"any", "No arguments");
    equal(checkValidSourceNetwork(u.getNull()),"any", "Null check");
    equal(checkValidSourceNetwork(u.getEmptyString()),"any", "Empty string");
    
    //Positive cases
    equal(checkValidSourceNetwork("default-domain:admin:vn1"), "default-domain:admin:vn1","Valid FQN as input");
    equal(checkValidSourceNetwork("vn1"), "vn1","Valid input");
});

test("checkValidDestinationNetwork", function() {
    //Negative cases
    equal(checkValidDestinationNetwork(),"any", "No arguments");
    equal(checkValidDestinationNetwork(u.getNull()),"any", "Null check");
    equal(checkValidDestinationNetwork(u.getEmptyString()),"any", "Empty string");
    
    //Positive cases
    equal(checkValidDestinationNetwork("default-domain:admin:vn1"), "default-domain:admin:vn1","Valid FQN as input");
    equal(checkValidDestinationNetwork("vn1"), "vn1","Valid input");
});

test("getProtocol", function() {
    //Negative cases
    equal(getProtocol(),"any", "No arguments");
    equal(getProtocol(u.getNull()),"any", "Null check");
    equal(getProtocol(u.getEmptyString()),"any", "Empty string");
    
    //Positive cases
    var protocol = u.getRandomString();
    equal(getProtocol(protocol), protocol.toLowerCase(),"Valid input");
});

test("getFQNofVN", function() {
    //Negative cases
    equal(getFQNofVN(),null, "No arguments");
    equal(getFQNofVN(u.getDefaultDomain()),null, "Null check");
    equal(getFQNofVN(u.getDefaultDomain(), u.getProjectAdmin()),null, "Empty string");
    
    //Positive cases
	configObj = {"domains":[{"href":"http://10.204.217.67:9100/domain/3c227b0a-65ae-4eb0-901a-5d726a948df0","fq_name":["default-domain"],"uuid":"3c227b0a-65ae-4eb0-901a-5d726a948df0"}],"projects":[{"fq_name":["default-domain","admin"],"uuid":"7d7383d5-c407-40f8-8c25-7b75a7bb69b5"},{"fq_name":["default-domain","demo"],"uuid":"2584371a-482b-41dd-8c98-1079c691c49a"}],"virtual-networks":[{"virtual_network_properties":{"network_id":4,"vxlan_network_identifier":null,"forwarding_mode":"l2_l3","extend_to_external_routers":null},"fq_name":["default-domain","demo","vnet0"],"uuid":"43fe9797-e477-4137-869b-1748e6e698fd","parent_uuid":"2584371a-482b-41dd-8c98-1079c691c49a","parent_href":"http://10.204.217.67:9100/project/2584371a-482b-41dd-8c98-1079c691c49a","parent_type":"project","name":"vnet0","network_ipam_refs":[]}],"data":[{"virtual-network":{"virtual_network_properties":{"network_id":4,"vxlan_network_identifier":null,"forwarding_mode":"l2_l3","extend_to_external_routers":null},"fq_name":["default-domain","demo","vnet0"],"uuid":"43fe9797-e477-4137-869b-1748e6e698fd","parent_uuid":"2584371a-482b-41dd-8c98-1079c691c49a","parent_href":"http://10.204.217.67:9100/project/2584371a-482b-41dd-8c98-1079c691c49a","parent_type":"project","name":"vnet0","network_ipam_refs":[]}}],"lastKey":null,"more":false};
    equal(getFQNofVN(u.getDefaultDomain(), u.getProjectDemo(), "vnet0"), (u.getDefaultDomain() + ":" + u.getProjectDemo() + ":" + "vnet0"), "Given DOMAIN, PROJECT, VN_NAME, returns fqn DOMAIN:PROJECT:VN_NAME");
});

test("getEndPort", function() {
    //Negative cases
    equal(getEndPort(), -1, "No arguments");
    equal(getEndPort("any"), -1, "Null check");
    equal(getEndPort("-12"), "12", "Undefined/Null Start Port, end port is 12");
    equal(getEndPort("10-"), "10", "Undefined/Null End Port, end port is 10");

    //Positive cases
    equal(getEndPort("12"), "12", "Valid End Port");
    equal(getEndPort("10-12"), "12", "Valid End Port of a Port Range");
    equal(getEndPort("12-15, 20-24"), "15,24", "Valid End Port of a Port Range List");
});

test("getStartPort", function() {
    //Negative cases
    equal(getStartPort(), -1, "No arguments");
    equal(getStartPort("any"), -1, "Null check");
    equal(getStartPort("-12"), -1, "Undefined/Null Start Port, Start port is -1");
    equal(getStartPort("10-"), "10", "Undefined/Null End Port, Start port is 10");

    //Positive cases
    equal(getStartPort("12"), "12", "Valid Start Port");
    equal(getStartPort("10-12"), "10", "Valid Start Port of a Port Range");
    equal(getStartPort("12-15, 20-24"), "12, 20", "Valid Start Port of a Port Range List");
});

test("validip", function() {
    //Negative cases
    equal(validip(), false, "No arguments");
    equal(validip(u.getNull()), false, "Null check");
    equal(validip(u.getEmptyString()), false, "Empty String");
    equal(validip(u.getEmptyArray()), false, "Empty Array");
    equal(validip("121"), false, "Invalid IP");
    equal(validip("121.121"), false, "Invalid IP");
    equal(validip("121.121.121"), false, "Invalid IP");
    equal(validip("455.12.12.2"), false, "Invalid IP");
    equal(validip("12.12.12.2/59"), false, "Invalid IP");
    equal(validip("12.12.12.2/-"), false, "Invalid IP");
    equal(validip("-/-"), false, "Invalid IP");

    //Positive cases
    equal(validip("12.12.12.2"), true, "Valid IP");
    equal(validip("12.12.12.2/24"), true, "Valid IP");
});

test("checkSystemProject", function() {
    //Negative cases
    equal(checkSystemProject(), false, "No arguments");
    equal(checkSystemProject(u.getNull()), false, "Null check");
    equal(checkSystemProject(u.getEmptyString()), false, "Empty String");
    equal(checkSystemProject(u.getEmptyArray()), false, "Empty Array");
    equal(checkSystemProject(u.getRandomString(6)), false, "Random String, Invalid Project");

    //Positive cases
    equal(checkSystemProject("service"), true, "Valid Project");
});